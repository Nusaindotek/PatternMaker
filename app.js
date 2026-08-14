import { getMeasurements } from './engine/measurements.js';
import { makeBodice } from './engine/bodice.js';
import { svgDocument } from './engine/geometry.js';

let lastSvg = '';

function generate(){
  const m=getMeasurements();
  const pattern=makeBodice(m);
  lastSvg=svgDocument(pattern, m);
  document.getElementById('canvasWrap').innerHTML=lastSvg;
  document.getElementById('status').textContent =
    `Pola dibuat: ${m.fabric==='rib'?'rib knit':'woven'} • negative ease ${m.negativeEase}%`;
}
document.getElementById('generate').addEventListener('click',generate);
document.getElementById('download').addEventListener('click',()=>{
  if(!lastSvg){generate();}
  const blob=new Blob([lastSvg],{type:'image/svg+xml'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='patternmaker-bodice-v1.svg';
  a.click();
  URL.revokeObjectURL(a.href);
});
generate();
