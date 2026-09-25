import {useContext,useEffect,useRef,useState} from 'react';
import {renderPngPreview} from './lib/png-preview.js';
import {LightingContext} from './LightingControl.jsx';

export default function PngShirtPreview({config,label,cache=true,style,view='front',facing='right'}) {
  const lighting=useContext(LightingContext);
  const ref=useRef(null), [render,setRender]=useState({config:null,cache:null,status:'loading'}),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  // A new label/config can render before its effect runs. Never expose the
  // previous configuration's ready state as proof that the new pixels exist.
  const state=render.config===config&&render.cache===cache&&render.lighting===lighting&&render.view===view&&render.facing===facing?render.status:'loading';
  useEffect(()=>{
    let alive=true;
    setRender({config,cache,lighting,view,facing,status:'loading'});setError('');
    const size=Math.min(2048,Math.max(1024,Math.ceil((ref.current?.clientWidth||512)*(window.devicePixelRatio||1))));
    const timer=setTimeout(()=>renderPngPreview(config,size,{cache,lighting,view,facing}).then(pixels=>{
      if(!alive)return;
      const element=ref.current;
      element.width=element.height=size;
      element.getContext('2d').putImageData(pixels,0,0);
      setRender({config,cache,lighting,view,facing,status:'ready'});
    }).catch(e=>{if(alive){setError(e.message);setRender({config,cache,lighting,view,facing,status:'error'});}}),75);
    return ()=>{alive=false;clearTimeout(timer);};
  },[config,cache,lighting,view,facing,retry]);
  return <>
    <canvas ref={ref} className="shirt-image" style={style} role="img" aria-label={label} aria-busy={state==='loading'} data-view={view} data-facing={facing} data-render-state={state}/>
    {error && <div className="preview-error" role="alert">{error}<button className="secondary" onClick={()=>setRetry(n=>n+1)}>Retry preview</button></div>}
  </>;
}
