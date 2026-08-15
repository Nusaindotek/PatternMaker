/* =========================================
   PatternMaker
   BODICE ENGINE

   Bahasa ukuran:
   bust       = Lingkar dada
   waist      = Lingkar pinggang
   shoulder   = Lebar bahu
   bodyLength = Panjang badan
   neck       = Lingkar leher

   Untuk bahan stretch:
   negativeEase diterapkan pada
   lingkar dada dan lingkar pinggang.
========================================= */


/* =========================================
   HITUNG JARAK 2 TITIK
========================================= */

function distance(pointA, pointB) {

  return Math.hypot(
    pointB[0] - pointA[0],
    pointB[1] - pointA[1]
  );

}


/* =========================================
   HITUNG PANJANG KURVA BEZIER
========================================= */

function bezierLength(
  p0,
  p1,
  p2,
  p3,
  steps = 20
) {

  let length = 0;

  let previous = p0;

  for (let i = 1; i <= steps; i++) {

    const t = i / steps;

    const mt = 1 - t;

    const x =
      mt * mt * mt * p0[0] +
      3 * mt * mt * t * p1[0] +
      3 * mt * t * t * p2[0] +
      t * t * t * p3[0];

    const y =
      mt * mt * mt * p0[1] +
      3 * mt * mt * t * p1[1] +
      3 * mt * t * t * p2[1] +
      t * t * t * p3[1];

    const current = [x, y];

    length +=
      distance(
        previous,
        current
      );

    previous = current;

  }

  return length;

}


/* =========================================
   BODICE ENGINE
========================================= */

export function makeBodice(m) {


  /* =======================================
     PENGURANGAN UKURAN
  ======================================= */

  const negativeEase =
    Math.max(
      0,
      Number(m.negativeEase) || 0
    );


  const easeFactor =
    1 -
    negativeEase / 100;


  /* =======================================
     LINGKAR DADA
  ======================================= */

  const bust =
    Number(m.bust) *
    easeFactor;


  /* =======================================
     LINGKAR PINGGANG
  ======================================= */

  const waist =
    Number(m.waist) *
    easeFactor;


  /* =======================================
     SEPEREMPAT LINGKAR DADA
  ======================================= */

  const bustQuarter =
    bust / 4;


  /* =======================================
     SEPEREMPAT LINGKAR PINGGANG
  ======================================= */

  const waistQuarter =
    waist / 4;


  /* =======================================
     LEBAR BAHU PER SISI
  ======================================= */

  const shoulderHalf =
    Number(m.shoulder) / 2;


  /* =======================================
     LEBAR LEHER

     Rumus dasar:
     Lingkar leher / 6
  ======================================= */

  const neckWidth =
    Number(m.neck) / 6;


  /* =======================================
     KEDALAMAN LEHER DEPAN
  ======================================= */

  const frontNeckDepth =
    Number(m.neck) / 6;


  /* =======================================
     KEDALAMAN LEHER BELAKANG
  ======================================= */

  const backNeckDepth =
    Number(m.neck) / 18;


  /* =======================================
     KEDALAMAN KERUNG LENGAN

     Rumus dasar untuk prototype
     bodice anak/stretch.

     Contoh LD 60:
     60 / 6 + 5 = 15 cm
  ======================================= */

  const armDepth =
    (Number(m.bust) / 6) + 5;


  /* =======================================
     PANJANG BADAN
  ======================================= */

  const bodyLength =
    Number(m.bodyLength);


  /* =======================================
     POSISI POLA
  ======================================= */

  const frontX = 10;

  const backX = 55;

  const topY = 10;


  /* =======================================
     POSISI GARIS PINGGANG
  ======================================= */

  const waistY =
    topY +
    bodyLength;


  /* =======================================
     POSISI GARIS DADA / KETIAK
  ======================================= */

  const armholeY =
    topY +
    armDepth;


  /* =======================================
     FRONT BODICE
  =======================================

     A = tengah depan / leher
     B = lebar leher
     C = ujung bahu
     D = sisi dada / kerung lengan
     E = sisi pinggang
     F = tengah depan bawah
  ======================================= */

  const front = {

    A: [
      frontX,
      topY
    ],

    B: [
      frontX + neckWidth,
      topY
    ],

    C: [
      frontX + shoulderHalf,
      topY + 2
    ],

    D: [
      frontX + bustQuarter,
      armholeY
    ],

    E: [
      frontX + waistQuarter,
      waistY
    ],

    F: [
      frontX,
      waistY
    ]

  };


  /* =======================================
     BACK BODICE
  ======================================= */

  const back = {

    A: [
      backX,
      topY
    ],

    B: [
      backX + neckWidth,
      topY
    ],

    C: [
      backX + shoulderHalf,
      topY + 2
    ],

    D: [
      backX + bustQuarter,
      armholeY
    ],

    E: [
      backX + waistQuarter,
      waistY
    ],

    F: [
      backX,
      waistY
    ]

  };


  /* =======================================
     FRONT ARMHOLE

     Kurva dari bahu menuju sisi dada.
  ======================================= */

  const frontArmhole = {

    start:
      front.C,

    control1: [
      front.C[0] + 0.8,
      front.C[1] + 2
    ],

    control2: [
      front.D[0] + 1.2,
      front.D[1] - 4
    ],

    end:
      front.D

  };


  /* =======================================
     BACK ARMHOLE
  ======================================= */

  const backArmhole = {

    start:
      back.C,

    control1: [
      back.C[0] + 1,
      back.C[1] + 1.5
    ],

    control2: [
      back.D[0] + 1.2,
      back.D[1] - 4
    ],

    end:
      back.D

  };


  /* =======================================
     PANJANG ARMHOLE DEPAN
  ======================================= */

  const frontArmholeLength =
    bezierLength(
      frontArmhole.start,
      frontArmhole.control1,
      frontArmhole.control2,
      frontArmhole.end
    );


  /* =======================================
     PANJANG ARMHOLE BELAKANG
  ======================================= */

  const backArmholeLength =
    bezierLength(
      backArmhole.start,
      backArmhole.control1,
      backArmhole.control2,
      backArmhole.end
    );


  /* =======================================
     TOTAL ARMHOLE
  ======================================= */

  const armholeLength =
    frontArmholeLength +
    backArmholeLength;


  /* =======================================
     RETURN DATA
  ======================================= */

  return {

    /* -------------------------------------
       POLA
    ------------------------------------- */

    front,

    back,


    /* -------------------------------------
       UKURAN HASIL
    ------------------------------------- */

    bust,

    waist,

    bustQ:
      bustQuarter,

    waistQ:
      waistQuarter,


    /* -------------------------------------
       BAHU
    ------------------------------------- */

    shoulder:
      Number(m.shoulder),

    shoulderHalf,


    /* -------------------------------------
       LEHER
    ------------------------------------- */

    neck:
      Number(m.neck),

    neckW:
      neckWidth,

    frontNeckD:
      frontNeckDepth,

    backNeckD:
      backNeckDepth,


    /* -------------------------------------
       BADAN
    ------------------------------------- */

    bodyLength,

    waistY,

    armDepth,

    armholeY,


    /* -------------------------------------
       ARMHOLE DEPAN
    ------------------------------------- */

    frontArm:
      [
        frontArmhole.start,
        frontArmhole.control1,
        frontArmhole.control2,
        frontArmhole.end
      ],


    /* -------------------------------------
       ARMHOLE BELAKANG
    ------------------------------------- */

    backArm:
      [
        backArmhole.start,
        backArmhole.control1,
        backArmhole.control2,
        backArmhole.end
      ],


    /* -------------------------------------
       PANJANG ARMHOLE
    ------------------------------------- */

    frontArmholeLength,

    backArmholeLength,

    armholeLength,


    /* -------------------------------------
       NEGATIVE EASE
    ------------------------------------- */

    negativeEase

  };

}
