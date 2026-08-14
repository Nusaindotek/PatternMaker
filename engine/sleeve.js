/* =========================================
   PatternMaker V1.2
   SLEEVE ENGINE
========================================= */


/* =========================================
   SLEEVE ENGINE
========================================= */

export function makeSleeve(m, bodice) {


  /* =======================================
     SLEEVE EASE

     Rib knit:
     lebih kecil karena kain stretch.

     Woven:
     diberi sedikit ruang.
  ======================================= */

  const sleeveEase =
    m.fabric === "rib"
      ? 0.5
      : 1.5;


  /* =======================================
     SETENGAH LINGKAR LENGAN ATAS
  ======================================= */

  const upperArm =
    m.upperArm *
    (1 - m.negativeEase / 100);


  const upperArmHalf =
    upperArm / 2;


  /* =======================================
     SETENGAH LINGKAR UJUNG LENGAN
  ======================================= */

  const wrist =
    m.wrist *
    (1 - m.negativeEase / 100);


  const wristHalf =
    wrist / 2;


  /* =======================================
     POSISI POLA LENGAN

     Diletakkan di sebelah kanan
     bodice pada preview SVG.
  ======================================= */

  const x =
    95;

  const y =
    12;


  /* =======================================
     PANJANG LENGAN
  ======================================= */

  const sleeveLength =
    m.sleeveLength;


  /* =======================================
     TINGGI KEPALA LENGAN

     Prototype awal.

     Nanti akan kita kalibrasi
     berdasarkan sistem drafting.
  ======================================= */

  const capHeight =
    Math.max(
      7,
      bodice.armDepth * 0.55
    );


  /* =======================================
     TITIK POLA LENGAN
  ======================================= */

  const left = [
    x,
    y + sleeveLength
  ];


  const leftCap = [
    x,
    y + capHeight
  ];


  const top = [
    x + upperArmHalf + 2,
    y
  ];


  const rightCap = [
    x + (upperArmHalf * 2) + 4,
    y + capHeight
  ];


  const right = [
    x + (upperArmHalf * 2) + 4,
    y + sleeveLength
  ];


  /* =======================================
     UJUNG LENGAN KIRI
  ======================================= */

  const bottomLeft = [
    x + upperArmHalf + 2 - wristHalf,
    y + sleeveLength
  ];


  /* =======================================
     UJUNG LENGAN KANAN
  ======================================= */

  const bottomRight = [
    x + upperArmHalf + 2 + wristHalf,
    y + sleeveLength
  ];


  /* =======================================
     PANJANG CAP

     V1.2 masih menggunakan
     pendekatan sederhana.
  ======================================= */

  const capHalf =
    bodice.armholeLength / 2;


  const capLength =
    capHalf + capHalf;


  /* =======================================
     CAP EASE

     Perbedaan antara panjang cap
     dan armhole bodice.
  ======================================= */

  const capEase =
    Math.max(
      0,
      capLength -
      bodice.armholeLength
    );


  /* =======================================
     RETURN DATA
  ======================================= */

  return {

    left,

    leftCap,

    top,

    rightCap,

    right,

    bottomLeft,

    bottomRight,

    capHeight,

    capLength,

    capEase,

    ease:
      sleeveEase

  };

}
