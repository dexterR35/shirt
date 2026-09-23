import { PNG_BASE, PNG_PREVIEW, renderColorArtwork, compositePixels } from './png-shirt.js';

const images = new Map();
const surfaces = new Map();
// Finished kits stay in memory until reload, so revisiting one does not repaint it.
const renders = new Map(), RENDER_LIMIT = 8;
/** Load and decode off the main thread, so a large image never freezes the page. */
async function loadImage(url) {
  const image = new Image();
  image.decoding = 'async';
  image.src = url;
  try { await image.decode(); }
  catch { throw Error('The high-resolution PNG base could not be loaded. Retry the preview.'); }
  return image;
}
function canvas(size) {
  const result=document.createElement('canvas');
  result.width=result.height=size;
  return result;
}
/** Screen sizes use the 2048 copy; only larger renders load the full master. */
function baseSource(size) {
  return size <= PNG_PREVIEW.size
    ? {path: PNG_PREVIEW.path, width: PNG_PREVIEW.size, height: PNG_PREVIEW.size, x: PNG_PREVIEW.x, y: PNG_PREVIEW.y, span: PNG_PREVIEW.span}
    : {path: PNG_BASE.path, width: PNG_BASE.width, height: PNG_BASE.height, x: PNG_BASE.x, y: PNG_BASE.y, span: PNG_BASE.scale*200};
}
async function basePixels(size) {
  if(surfaces.has(size))return surfaces.get(size);
  const src=baseSource(size);
  if(!images.has(src.path))images.set(src.path, loadImage(src.path).catch(error=>{images.delete(src.path);throw error;}));
  const image=await images.get(src.path);
  if(image.naturalWidth!==src.width || image.naturalHeight!==src.height)throw Error('The PNG base dimensions do not match the saved master.');
  const target=canvas(size),ctx=target.getContext('2d',{willReadFrequently:true});
  const margin=size/16,span=size*7/8;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(image,src.x,src.y,src.span,src.span,margin,margin,span,span);
  const pixels=ctx.getImageData(0,0,size,size);
  // Cache a small number of display resolutions, never copies per team.
  if(surfaces.size>=2)surfaces.delete(surfaces.keys().next().value);
  surfaces.set(size,pixels);
  return pixels;
}

/** Compose from the original PNG on demand. Display size never alters the source. */
export async function renderPngPreview(config,size=1024,{cache=true}={}) {
  if(!Number.isInteger(size)||size<256||size>4096)throw Error('Invalid preview size');
  const source=await basePixels(size);
  if(!config)return source;
  const key=size+':'+JSON.stringify(config);
  if(cache&&renders.has(key)){
    const hit=renders.get(key);
    renders.delete(key);renders.set(key,hit);
    return hit;
  }
  const url=URL.createObjectURL(new Blob([renderColorArtwork(config)],{type:'image/svg+xml'}));
  try {
    const image=await loadImage(url),target=canvas(size),ctx=target.getContext('2d',{willReadFrequently:true});
    ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,size,size);
    const margin=size/16,span=size*7/8;
    ctx.drawImage(image,margin,margin,span,span);
    const result=new ImageData(compositePixels(source.data,ctx.getImageData(0,0,size,size).data),size,size);
    if(cache){
      if(renders.size>=RENDER_LIMIT)renders.delete(renders.keys().next().value);
      renders.set(key,result);
    }
    return result;
  } finally {URL.revokeObjectURL(url);}
}
