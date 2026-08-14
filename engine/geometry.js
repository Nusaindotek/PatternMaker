function pts(a){return a.map(p=>p.join(',')).join(' ')}
function poly(a, cls='pattern-line'){return `<polygon class="${cls}" points="${pts(a)}"/>`}
function notch(x,y,dir=1){return `<line class="notch" x1="${x}" y1="${y}" x2="${x}" y2="${y+dir*1}"/>`}
export function svgDocument(p,m){
  const W=150,H=70;
  const f=p.front,b=p.back;
  const labels=`<text class="label" x="${f[0][0]}" y="${f[5][1]+3}">FRONT • ${m.age} th</text>
  <text class="label" x="${b[0][0]}" y="${b[5][1]+3}">BACK</text>
  <text class="label" x="8" y="8">PatternMaker V1 — cm</text>`;
  const grid=[];
  for(let x=0;x<=W;x+=5)grid.push(`<line class="grid" x1="${x}" y1="0" x2="${x}" y2="${H}"/>`);
  for(let y=0;y<=H;y+=5)grid.push(`<line class="grid" x1="0" y1="${y}" x2="${W}" y2="${y}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}cm" height="${H}cm">
  ${grid.join('')}
  ${poly(f)}${poly(b)}
  <line class="grain" x1="${f[0][0]+5}" y1="${f[0][1]+5}" x2="${f[0][0]+5}" y2="${f[5][1]-5}"/>
  <line class="grain" x1="${b[0][0]+5}" y1="${b[0][1]+5}" x2="${b[0][0]+5}" y2="${b[5][1]-5}"/>
  ${notch(f[3][0],f[3][1],1)}${notch(b[3][0],b[3][1],1)}
  ${labels}
  </svg>`;
}
