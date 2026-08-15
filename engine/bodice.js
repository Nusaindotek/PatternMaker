/* =========================================
   PatternMaker V1.6
   BODICE ENGINE
   ---------------------------------------------------------
   Drafting dasar bodice anak

   Input:
   - Lingkar dada
   - Lingkar pinggang
   - Lebar bahu
   - Panjang badan
   - Lingkar leher
   - Negative ease

   Output:
   - Bodice depan
   - Bodice belakang
   - Kerung lengan
   - Garis leher
   - Garis bahu
   - Garis pinggang
   - Panjang kerung lengan
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
   HITUNG PANJANG BEZIER
   ---------------------------------------------------------
   Perkiraan panjang kurva cubic Bezier
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

  for (
    let i = 1;
    i <= steps;
    i++
  ) {

    const t =
      i / steps;

    const mt =
      1 - t;

    const point = [

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
        point
      );

    previous =
      point;

  }

  return length;

}


/* =========================================
   NEGATIVE EASE
========================================= */

function applyNegativeEase(
  value,
  negativeEase
) {

  const ease =
    Number(negativeEase) || 0;

  return (
    value *
    (1 - ease / 100)
  );

}


/* =========================================
   BODICE ENGINE
========================================= */

export function makeBodice(m) {


  /* =======================================
     UKURAN DASAR
  ======================================= */

  const bust =
    applyNegativeEase(
      m.bust,
      m.negativeEase
    );


  const waist =
    applyNegativeEase(
      m.waist,
      m.negativeEase
    );


  const shoulder =
    Number(m.shoulder) || 0;


  const bodyLength =
    Number(m.bodyLength) || 0;


  const neck =
    Number(m.neck) || 0;


  /* =======================================
     SEPEREMPAT LINGKAR BADAN
  ======================================= */

  const bustQuarter =
    bust / 4;


  const waistQuarter =
    waist / 4;


  /* =======================================
     GARIS LEHER
     
     Lingkar leher dibagi 6
     
     Ini digunakan sebagai dasar
     lebar garis leher.
  ======================================= */

  const neckWidth =
    neck / 6;


  /* =======================================
     KEDALAMAN LEHER
     
     DEPAN
     lebih dalam.
     
     BELAKANG
     lebih dangkal.
  ======================================= */

  const frontNeckDepth =
    neck / 6;


  const backNeckDepth =
    neck / 18;


  /* =======================================
     KEDALAMAN KERUNG LENGAN
     
     Untuk anak digunakan pendekatan
     proporsional terhadap lingkar dada.
     
     Negative ease sudah diterapkan
     pada lingkar dada.
  ======================================= */

  const armDepth =
    (bust / 6) + 4;


  /* =======================================
     POSISI
     
     Bodice depan dimulai pada X = 10.
     
     Bodice belakang dimulai pada X = 60.
  ======================================= */

  const frontX =
    10;


  const backX =
    60;


  const topY =
    10;


  const waistY =
    topY +
    bodyLength;


  const armholeY =
    topY +
    armDepth;


  /* =======================================
     LEBAR BAHU
     
     Lebar bahu dibagi dua karena
     pola menggunakan setengah badan.
  ======================================= */

  const shoulderHalf =
    shoulder / 2;


  /* =======================================
     TITIK BODICE DEPAN
     
     A = tengah depan / leher
     B = lebar leher
     C = ujung bahu
     D = titik kerung lengan
     E = pinggang samping
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
     TITIK BODICE BELAKANG
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
     GARIS LEHER DEPAN
     
     Dibuat sebagai cubic Bezier.
  ======================================= */

  const frontNeck = [

    front.A,

    [
      front.A[0] + 0.5,
      front.A[1] + frontNeckDepth * 0.55
    ],

    [
      front.B[0] - 0.5,
      front.A[1] + frontNeckDepth
    ],

    [
      front.B[0],
      front.A[1]
    ]

  ];


  /* =======================================
     GARIS LEHER BELAKANG
  ======================================= */

  const backNeck = [

    back.A,

    [
      back.A[0] + 0.5,
      back.A[1] + backNeckDepth * 0.45
    ],

    [
      back.B[0] - 0.5,
      back.A[1] + backNeckDepth
    ],

    [
      back.B[0],
      back.A[1]
    ]

  ];


  /* =======================================
     KERUNG LENGAN DEPAN
     
     P0 = bahu
     P3 = titik samping dada
  ======================================= */

  const frontArmhole = [

    front.C,

    [
      front.C[0] + 1.5,
      front.C[1] + armDepth * 0.15
    ],

    [
      front.D[0] - 2,
      front.D[1] - armDepth * 0.15
    ],

    front.D

  ];


  /* =======================================
     KERUNG LENGAN BELAKANG
  ======================================= */

  const backArmhole = [

    back.C,

    [
      back.C[0] + 1.5,
      back.C[1] + armDepth * 0.15
    ],

    [
      back.D[0] - 1.5,
      back.D[1] - armDepth * 0.18
    ],

    back.D

  ];


  /* =======================================
     PANJANG GARIS LEHER DEPAN
  ======================================= */

  const frontNeckLength =
    bezierLength(
      frontNeck[0],
      frontNeck[1],
      frontNeck[2],
      frontNeck[3]
    );


  /* =======================================
     PANJANG GARIS LEHER BELAKANG
  ======================================= */

  const backNeckLength =
    bezierLength(
      backNeck[0],
      backNeck[1],
      backNeck[2],
      backNeck[3]
    );


  /* =======================================
     PANJANG KERUNG LENGAN DEPAN
  ======================================= */

  const frontArmholeLength =
    bezierLength(
      frontArmhole[0],
      frontArmhole[1],
      frontArmhole[2],
      frontArmhole[3]
    );


  /* =======================================
     PANJANG KERUNG LENGAN BELAKANG
  ======================================= */

  const backArmholeLength =
    bezierLength(
      backArmhole[0],
      backArmhole[1],
      backArmhole[2],
      backArmhole[3]
    );


  /* =======================================
     TOTAL KERUNG LENGAN
  ======================================= */

  const armholeLength =
    frontArmholeLength +
    backArmholeLength;


  /* =======================================
     INFORMASI BADAN
  ======================================= */

  const bustEaseRemoved =
    Number(m.bust || 0) -
    bust;


  const waistEaseRemoved =
    Number(m.waist || 0) -
    waist;


  /* =======================================
     RETURN
  ======================================= */

  return {

    /* ===============================
       POLA
    =============================== */

    front,

    back,


    /* ===============================
       GARIS LEHER
    =============================== */

    frontNeck,

    backNeck,


    /* ===============================
       KERUNG LENGAN
    =============================== */

    frontArmhole,

    backArmhole,


    /* ===============================
       UKURAN
    =============================== */

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


    /* ===============================
       PANJANG KURVA
    =============================== */

    frontNeckLength,

    backNeckLength,

    frontArmholeLength,

    backArmholeLength,

    armholeLength,


    /* ===============================
       INFORMASI EASE
    =============================== */

    bust,

    waist,

    bustEaseRemoved,

    waistEaseRemoved,


    /* ===============================
       POSISI
    =============================== */

    waistY,

    armholeY,

    bodyLength

  };

}
