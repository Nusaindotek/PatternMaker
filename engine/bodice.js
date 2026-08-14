/* =========================================================
   PatternMaker V1.5
   BODICE ENGINE
   ---------------------------------------------------------
   Basic bodice untuk anak
   Cocok untuk knit / jersey / rib knit
   Unit: centimeter
========================================================= */


/* =========================================================
   DISTANCE
========================================================= */

function distance(a, b) {

  return Math.hypot(
    b[0] - a[0],
    b[1] - a[1]
  );

}


/* =========================================================
   CUBIC BEZIER APPROXIMATION
   ---------------------------------------------------------
   Digunakan untuk memperkirakan panjang kurva armhole.
========================================================= */

function bezierLength(
  p0,
  p1,
  p2,
  p3,
  steps = 20
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

    const current = [
      x,
      y
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


/* =========================================================
   SAFE NEGATIVE EASE
========================================================= */

function getEaseFactor(m) {

  const negativeEase =
    Number(m.negativeEase) || 0;

  return Math.max(
    0.5,
    1 - negativeEase / 100
  );

}


/* =========================================================
   BODICE ENGINE
========================================================= */

export function makeBodice(m) {

  /* =======================================================
     BASIC MEASUREMENTS
  ======================================================= */

  const easeFactor =
    getEaseFactor(m);


  const bust =
    Number(m.bust) *
    easeFactor;


  const waist =
    Number(m.waist) *
    easeFactor;


  const shoulder =
    Number(m.shoulder);


  const bodyLength =
    Number(m.bodyLength);


  const neck =
    Number(m.neck);


  /* =======================================================
     QUARTER BODY
  ======================================================= */

  const bustQuarter =
    bust / 4;


  const waistQuarter =
    waist / 4;


  /* =======================================================
     SHOULDER
     -------------------------------------------------------
     Input shoulder diasumsikan lebar bahu total.
  ======================================================= */

  const shoulderHalf =
    shoulder / 2;


  /* =======================================================
     NECKLINE
  ======================================================= */

  const neckWidth =
    Math.max(
      3.5,
      neck / 6
    );


  const frontNeckDepth =
    Math.max(
      4,
      neck / 6
    );


  const backNeckDepth =
    Math.max(
      1.5,
      neck / 18
    );


  /* =======================================================
     ARMHOLE DEPTH
     -------------------------------------------------------
     Formula dasar anak + penyesuaian bust.
  ======================================================= */

  const armDepth =
    Math.max(
      11,
      (Number(m.bust) / 6) + 4
    );


  /* =======================================================
     BODY HEIGHT
  ======================================================= */

  const waistY =
    bodyLength;


  /* =======================================================
     FRONT
     -------------------------------------------------------
     Front diletakkan mulai x = 10.
     Center front = A/F.
  ======================================================= */

  const frontX =
    10;


  const front = {

    A: [
      frontX,
      10
    ],

    B: [
      frontX + neckWidth,
      10
    ],

    C: [
      frontX + shoulderHalf,
      10 + 2
    ],

    D: [
      frontX + bustQuarter,
      10 + armDepth
    ],

    E: [
      frontX + waistQuarter,
      10 + waistY
    ],

    F: [
      frontX,
      10 + waistY
    ]

  };


  /* =======================================================
     BACK
  ======================================================= */

  const backX =
    55;


  const back = {

    A: [
      backX,
      10
    ],

    B: [
      backX + neckWidth,
      10
    ],

    C: [
      backX + shoulderHalf,
      10 + 2
    ],

    D: [
      backX + bustQuarter,
      10 + armDepth
    ],

    E: [
      backX + waistQuarter,
      10 + waistY
    ],

    F: [
      backX,
      10 + waistY
    ]

  };


  /* =======================================================
     FRONT ARMHOLE
     -------------------------------------------------------
     Lebih dalam daripada back.
  ======================================================= */

  const frontArm = [

    front.C,

    [
      front.C[0] +
      (front.D[0] - front.C[0]) * 0.25,

      front.C[1] +
      (front.D[1] - front.C[1]) * 0.20
    ],

    [
      front.D[0] -
      1.5,

      front.D[1] -
      2.5
    ],

    front.D

  ];


  /* =======================================================
     BACK ARMHOLE
  ======================================================= */

  const backArm = [

    back.C,

    [
      back.C[0] +
      (back.D[0] - back.C[0]) * 0.30,

      back.C[1] +
      (back.D[1] - back.C[1]) * 0.20
    ],

    [
      back.D[0] -
      1.2,

      back.D[1] -
      2.8
    ],

    back.D

  ];


  /* =======================================================
     ARMHOLE LENGTH
  ======================================================= */

  const frontArmholeLength =
    bezierLength(
      frontArm[0],
      frontArm[1],
      frontArm[2],
      frontArm[3]
    );


  const backArmholeLength =
    bezierLength(
      backArm[0],
      backArm[1],
      backArm[2],
      backArm[3]
    );


  const armholeLength =
    frontArmholeLength +
    backArmholeLength;


  /* =======================================================
     WAIST SHAPE
     -------------------------------------------------------
     Untuk knit, jangan terlalu tajam.
  ======================================================= */

  const frontWaistReduction =
    Math.max(
      0,
      bustQuarter - waistQuarter
    );


  const backWaistReduction =
    frontWaistReduction;


  /* =======================================================
     RETURN
  ======================================================= */

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

    frontArm,

    backArm,

    frontArmholeLength,

    backArmholeLength,

    armholeLength,

    frontWaistReduction,

    backWaistReduction

  };

}