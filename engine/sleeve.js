/* =========================================
   PatternMaker
   SLEEVE ENGINE
   ---------------------------------------------------------
   Pola lengan mengikuti:
   - Lingkar lengan atas
   - Panjang lengan
   - Lingkar pergelangan tangan
   - Kerung lengan bodice
   - Negative ease
   - Jenis bahan
========================================= */


/* =========================================
   JARAK 2 TITIK
========================================= */

function distance(pointA, pointB) {

  return Math.hypot(
    pointB[0] - pointA[0],
    pointB[1] - pointA[1]
  );

}


/* =========================================
   PANJANG KURVA BEZIER
========================================= */

function bezierLength(
  p0,
  p1,
  p2,
  p3,
  steps = 30
) {

  let length = 0;

  let previous = p0;

  for (
    let i = 1;
    i <= steps;
    i++
  ) {

    const t =
      i / steps;

    const mt =
      1 - t;

    const current = [

      mt * mt * mt * p0[0] +
      3 * mt * mt * t * p1[0] +
      3 * mt * t * t * p2[0] +
      t * t * t * p3[0],

      mt * mt * mt * p0[1] +
      3 * mt * mt * t * p1[1] +
      3 * mt * t * t * p2[1] +
      t * t * t * p3[1]

    ];

    length +=
      distance(
        previous,
        current
      );

    previous =
      current;

  }

  return length;

}


/* =========================================
   PANJANG KERUNG DARI BODICE
========================================= */

function getArmholeLength(bodice) {

  if (
    !bodice ||
    !bodice.frontArmhole ||
    !bodice.backArmhole
  ) {

    return 0;

  }


  const front =
    bodice.frontArmhole;

  const back =
    bodice.backArmhole;


  const frontLength =
    bezierLength(
      front[0],
      front[1],
      front[2],
      front[3]
    );


  const backLength =
    bezierLength(
      back[0],
      back[1],
      back[2],
      back[3]
    );


  return (
    frontLength +
    backLength
  );

}


/* =========================================
   EASE KEPALA LENGAN
========================================= */

function getSleeveCapEase(
  fabric
) {

  /*
    Sublime Jersey dan Rib Knit
    membutuhkan ease yang sangat kecil.

    Woven memiliki sedikit ease.
  */

  if (
    fabric === "rib_knit"
  ) {

    return 0;

  }


  if (
    fabric === "sublime_jersey"
  ) {

    return 0.3;

  }


  return 1.0;

}


/* =========================================
   SLEEVE ENGINE
========================================= */

export function makeSleeve(
  m,
  bodice
) {


  /* =======================================
     UKURAN DASAR
  ======================================= */

  const negativeEase =
    Number(m.negativeEase) || 0;


  const easeFactor =
    1 -
    negativeEase / 100;


  /* =======================================
     LINGKAR LENGAN ATAS
  ======================================= */

  const upperArm =
    Number(m.upperArm) *
    easeFactor;


  /* =======================================
     SETENGAH LINGKAR LENGAN ATAS
  ======================================= */

  const upperArmHalf =
    upperArm / 2;


  /* =======================================
     LINGKAR PERGELANGAN
  ======================================= */

  const wrist =
    Number(m.wrist) *
    easeFactor;


  /* =======================================
     SETENGAH LINGKAR PERGELANGAN
  ======================================= */

  const wristHalf =
    wrist / 2;


  /* =======================================
     PANJANG LENGAN
  ======================================= */

  const sleeveLength =
    Number(m.sleeveLength) || 0;


  /* =======================================
     PANJANG KERUNG BODICE
  ======================================= */

  const armholeLength =
    getArmholeLength(
      bodice
    );


  /* =======================================
     EASE KEPALA LENGAN
  ======================================= */

  const capEase =
    getSleeveCapEase(
      m.fabric
    );


  /* =======================================
     TARGET PANJANG KEPALA LENGAN
  ======================================= */

  const targetCapLength =
    armholeLength +
    capEase;


  /* =======================================
     TINGGI KEPALA LENGAN
     
     Berdasarkan ukuran lingkar lengan
     dan kerung bodice.

     Nilai minimum mencegah bentuk
     kepala lengan terlalu datar.
  ======================================= */

  const capHeight =
    Math.max(
      7,
      Math.min(
        14,
        armholeLength * 0.35
      )
    );


  /* =======================================
     POSISI POLA LENGAN
  ======================================= */

  const x =
    105;

  const y =
    12;


  /* =======================================
     TITIK ATAS
  ======================================= */

  const centerX =
    x +
    upperArmHalf +
    2;


  const top = [
    centerX,
    y
  ];


  /* =======================================
     TITIK KIRI
  ======================================= */

  const left = [
    x,
    y + sleeveLength
  ];


  /* =======================================
     TITIK KANAN
  ======================================= */

  const right = [
    x +
    upperArm +
    4,
    y + sleeveLength
  ];


  /* =======================================
     TITIK KEPALA KIRI
  ======================================= */

  const leftCap = [
    x,
    y + capHeight
  ];


  /* =======================================
     TITIK KEPALA KANAN
  ======================================= */

  const rightCap = [
    x +
    upperArm +
    4,
    y + capHeight
  ];


  /* =======================================
     UJUNG LENGAN
  ======================================= */

  const bottomLeft = [

    centerX -
    wristHalf,

    y +
    sleeveLength

  ];


  const bottomRight = [

    centerX +
    wristHalf,

    y +
    sleeveLength

  ];


  /* =======================================
     KURVA KEPALA LENGAN KIRI
  ======================================= */

  const leftControl1 = [

    leftCap[0] + 3,

    leftCap[1] - capHeight * 0.55

  ];


  const leftControl2 = [

    top[0] - upperArmHalf * 0.55,

    top[1]

  ];


  /* =======================================
     KURVA KEPALA LENGAN KANAN
  ======================================= */

  const rightControl1 = [

    top[0] + upperArmHalf * 0.55,

    top[1]

  ];


  const rightControl2 = [

    rightCap[0] - 3,

    rightCap[1] - capHeight * 0.55

  ];


  /* =======================================
     PANJANG KURVA KIRI
  ======================================= */

  const leftCapLength =
    bezierLength(

      leftCap,

      leftControl1,

      leftControl2,

      top

    );


  /* =======================================
     PANJANG KURVA KANAN
  ======================================= */

  const rightCapLength =
    bezierLength(

      top,

      rightControl1,

      rightControl2,

      rightCap

    );


  /* =======================================
     TOTAL PANJANG KEPALA LENGAN
  ======================================= */

  const capLength =
    leftCapLength +
    rightCapLength;


  /* =======================================
     SELISIH CAP
     
     Positif:
     cap lebih panjang dari kerung.

     Negatif:
     cap lebih pendek.
  ======================================= */

  const actualCapEase =
    capLength -
    armholeLength;


  /* =======================================
     RETURN
  ======================================= */

  return {

    /* ===============================
       TITIK POLA
    =============================== */

    left,

    leftCap,

    top,

    rightCap,

    right,

    bottomLeft,

    bottomRight,


    /* ===============================
       KURVA
    =============================== */

    leftControl1,

    leftControl2,

    rightControl1,

    rightControl2,


    /* ===============================
       UKURAN
    =============================== */

    upperArm,

    upperArmHalf,

    wrist,

    wristHalf,

    sleeveLength,

    capHeight,


    /* ===============================
       KERUNG
    =============================== */

    armholeLength,

    targetCapLength,

    capLength,

    capEase:
      actualCapEase,


    /* ===============================
       EASE
    =============================== */

    ease:
      capEase,

    negativeEase

  };

}
