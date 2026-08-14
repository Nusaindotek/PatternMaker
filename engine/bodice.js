export function makeBodice(m){
  // Prototype drafting engine. This is a transparent starting point,
  // not a certified production pattern system.
  const easeFactor=m.fabric==='rib' ? (1-m.negativeEase/100) : 1;
  const bust=m.bust*easeFactor;
  const waist=m.waist*easeFactor;
  const w=bust/4;
  const ww=waist/4;
  const shoulder=m.shoulder/2;
  const neckW=m.neck/6;
  const neckD=m.neck/18;
  const armDepth=bust/6+5;
  const x0=30,y0=20;
  const front=[
    [x0,y0],[x0+neckW,y0],[x0+shoulder,y0+2],
    [x0+w,y0+armDepth],[x0+ww,y0+m.bodyLength],
    [x0,y0+m.bodyLength]
  ];
  const back=front.map(([x,y])=>[x+45,y]);
  return {front,back,width:w,height:m.bodyLength,armDepth,neckW,neckD};
}
