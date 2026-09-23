import {useEffect,useRef,useState} from 'react';
import {renderPngPreview} from './lib/png-preview.js';

export default function PngShirtPreview({config,label}) {
  const ref=useRef(null), [state,setState]=useState('loading'),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{
    let alive=true;
    setState('loading');setError('');
    const size=Math.min(2048,Math.max(1024,Math.ceil((ref.current?.clientWidth||512)*(window.devicePixelRatio||1))));
    renderPngPreview(config,size).then(pixels=>{
      if(!alive)return;
      const element=ref.current;
      element.width=element.height=size;
      element.getContext('2d').putImageData(pixels,0,0);
      setState('ready');
    }).catch(e=>{if(alive){setError(e.message);setState('error');}});
    return ()=>{alive=false;};
  },[config,retry]);
  return <>
    <canvas ref={ref} className="shirt-image" role="img" aria-label={label} aria-busy={state==='loading'} data-render-state={state}/>
    {error && <div className="preview-error" role="alert">{error}<button className="secondary" onClick={()=>setRetry(n=>n+1)}>Retry preview</button></div>}
  </>;
}
