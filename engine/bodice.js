/* =========================================
   PatternMaker V1.2
   BODICE ENGINE
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
   BODICE ENGINE
========================================= */

export function makeBodice(m) {


  /* =======================================
     NEGATIVE EASE
  ======================================= */

  const easeFactor =
    1 - (m.negativeEase / 100);


  const bust =
    m.bust * easeFactor;


  const waist =
    m.waist * easeFactor;


  /* =======================================
     SEPEREMPAT BADAN
  ======================================= */

  const bustQuarter =
    bust / 4;


  const waistQuarter =
    waist / 4;


  /* =======================================
     BAHU
  ======================================= */

  const shoulder =
    m.shoulder / 2;


  /* =======================================
     LEHER
  ======================================= */

  const neckWidth =
    m.neck / 6;


  const frontNeckDepth =
    m.neck / 6;


  const backNeckDepth =
    m.neck / 18;


  /* =======================================
     KEDALAMAN KERUNG LENGAN
     
     INI MASIH FORMULA PROTOTYPE.
  ======================================= */

  const armDepth =
    (m.bust / 6) + 5;


  /* =======================================
     POSISI PANJANG BADAN
  ======================================= */

  const waistY =
    m.bodyLength;


  /* =======================================
     BODICE DEPAN
  ======================================= */

  const front = {

    A: [
      10,
      10
    ],

    B: [
      10 + neckWidth,
      10
    ],

    C: [
      10 + shoulder,
      12
    ],

    D: [
      10 + bustQuarter,
      10 + armDepth
    ],

    E: [
      10 + waistQuarter,
      10 + waistY
    ],

    F: [
      10,
      10 + waistY
    ]

  };


  /* =======================================
     BODICE BELAKANG
  ======================================= */

  const back = {

    A: [
      55,
      10
    ],

    B: [
      55 + neckWidth,
      10
    ],

    C: [
      55 + shoulder,
      12
    ],

    D: [
      55 + bustQuarter,
      10 + armDepth
    ],

    E: [
      55 + waistQuarter,
      10 + waistY
    ],

    F: [
      55,
      10 + waistY
    ]

  };


  /* =======================================
     KURVA KERUNG LENGAN DEPAN
  ======================================= */

  const frontArmhole = [

    front.C,

    [
      front.C[0] + 1.0,
      front.C[1] + 1.5
    ],

    [
      front.D[0] + 0.8,
      front.D[1] - 2.5
    ],

    front.D

  ];


  /* =======================================
     KURVA KERUNG LENGAN BELAKANG
  ======================================= */

  const backArmhole = [

    back.C,

    [
      back.C[0] + 1.2,
      back.C[1] + 1.3
    ],

    [
      back.D[0] + 1.0,
      back.D[1] - 2.5
    ],

    back.D

  ];


  /* =======================================
     PERKIRAAN PANJANG ARMHOLE
  ======================================= */

  const frontArmholeLength =

    distance(
      frontArmhole[0],
      frontArmhole[1]
    )

    +

    distance(
      frontArmhole[1],
      frontArmhole[2]
    )

    +

    distance(
      frontArmhole[2],
      frontArmhole[3]
    );


  const backArmholeLength =

    distance(
      backArmhole[0],
      backArmhole[1]
    )

    +

    distance(
      backArmhole[1],
      backArmhole[2]
    )

    +

    distance(
      backArmhole[2],
      backArmhole[3]
    );


  const armholeLength =
    frontArmholeLength +
    backArmholeLength;


  /* =======================================
     RETURN DATA
  ======================================= */

  return {

    front,

    back,

    bustQ:
      bustQuarter,

    waistQ:
      waistQuarter,

    armDepth,

    neckW:
      neckWidth,

    frontNeckD:
      frontNeckDepth,

    backNeckD:
      backNeckDepth,

    frontArm:
      frontArmhole,

    backArm:
      backArmhole,

    armholeLength

  };

}
