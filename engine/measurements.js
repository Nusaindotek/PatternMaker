export function getMeasurements(){
  const n=id=>Number(document.getElementById(id).value)||0;
  return {
    age:n('age'), bust:n('bust'), waist:n('waist'), shoulder:n('shoulder'),
    bodyLength:n('bodyLength'), neck:n('neck'),
    fabric:document.getElementById('fabric').value,
    stretch:n('stretch'), negativeEase:n('negativeEase')
  };
}
