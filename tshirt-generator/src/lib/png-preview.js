import { PNG_BASE, renderColorArtwork, compositePixels } from './png-shirt.js';

let basePromise;
const surfaces = new Map();
function loadImage(url) {
  return new Promise((resolve,reject)=>{
    const image = new Image();
    image.onload=()=>resolve(image);
    image.onerror=()=>reject(Error('The high-resolution PNG base could not be loaded. Retry the preview.'));
    image.src=url;
  });
}
function canvas(size) {
  const result=document.createElement('canvas');
  result.width=result.height=size;
  return result;
}
async function basePixels(size) {
  if(surfaces.has(size))return surfaces.get(size);
  basePromise ??= loadImage(PNG_BASE.path).catch(error=>{basePromise=undefined;throw error;});
  const image=await basePromise;
  if(image.naturalWidth!==PNG_BASE.width || image.naturalHeight!==PNG_BASE.height)throw Error('The PNG base dimensions do not match the saved master.');
  const target=canvas(size),ctx=target.getContext('2d',{willReadFrequently:true});
  const margin=size/16,span=size*7/8;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(image,PNG_BASE.x,PNG_BASE.y,PNG_BASE.scale*200,PNG_BASE.scale*200,margin,margin,span,span);
  const pixels=ctx.getImageData(0,0,size,size);
  // Cache a small number of display resolutions, never copies per team.
  if(surfaces.size>=2)surfaces.delete(surfaces.keys().next().value);
  surfaces.set(size,pixels);
  return pixels;
}

/** Compose from the original PNG on demand. Display size never alters the source. */
export async function renderPngPreview(config,size=1024) {
  if(!Number.isInteger(size)||size<256||size>4096)throw Error('Invalid preview size');
  const source=await basePixels(size);
  if(!config)return source;
  const url=URL.createObjectURL(new Blob([renderColorArtwork(config)],{type:'image/svg+xml'}));
  try {
    const image=await loadImage(url),target=canvas(size),ctx=target.getContext('2d',{willReadFrequently:true});
    ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,size,size);
    const margin=size/16,span=size*7/8;
    ctx.drawImage(image,margin,margin,span,span);
    return new ImageData(compositePixels(source.data,ctx.getImageData(0,0,size,size).data),size,size);
  } finally {URL.revokeObjectURL(url);}
}
