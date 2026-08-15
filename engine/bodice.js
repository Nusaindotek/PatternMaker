/* =========================================================
   PatternMaker
   BODICE ENGINE V1.5
   ---------------------------------------------------------
   UNIVERSAL BASIC BODICE

   Input:
   - bust          = Lingkar dada
   - waist         = Lingkar pinggang
   - shoulder      = Lebar bahu
   - bodyLength    = Panjang badan
   - neck          = Lingkar leher
   - negativeEase  = Pengurangan ukuran (%)

   Output:
   - FRONT
   - BACK
   - armDepth
   - armholeLength

   Sistem:
   - Pola seperempat badan
   - Garis tengah = FOLD
   - Semua ukuran dalam cm
   - Bisa digunakan untuk berbagai ukuran tubuh
========================================================= */


/* =========================================================
   HELPER
========================================================= */

function positive(value, fallback = 0) {

  const number =
    Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {

    return fallback;

  }

  return number;

}


/* =========================================================
   ROUND
========================================================= */

function round(
  value,
  digits = 2
) {

  const factor =
    Math.pow(
      10,
      digits
    );

  return (
    Math.round(
      value * factor
    ) / factor
  );

}


/* =========================================================
   NEGATIVE EASE
========================================================= */

function applyNegativeEase(
  measurement,
  negativeEase
) {

  const ease =
    Math.max(
      0,
      Number(negativeEase) || 0
    );


  return (
    measurement *
    (
      1 -
      ease / 100
    )
  );

}


/* =========================================================
   NECK WIDTH
   ---------------------------------------------------------
   Dasar drafting:
   Lingkar leher / 6
========================================================= */

function getNeckWidth(
  neck
) {

  return (
    neck / 6
  );

}


/* =========================================================
   ARM DEPTH
   ---------------------------------------------------------
   Basic universal drafting formula.

   Lingkar dada / 6 + 7

   Nilai minimum menjaga pola tetap
   memiliki bentuk yang masuk akal
   untuk ukuran sangat kecil.
========================================================= */

function getArmDepth(
  bust
) {

  const depth =
    (
      bust / 6
    ) + 7;


  return Math.max(
    10,
    depth
  );

}


/* =========================================================
   SHOULDER SLOPE
========================================================= */

function getShoulderSlope(
  bust
) {

  /*
    Sedikit lebih kecil untuk
    ukuran kecil dan meningkat
    secara bertahap.

    Dibatasi agar universal.
  */

  const slope =
    bust < 70
      ? 1.5
      : 2;


  return slope;

}


/* =========================================================
   ARMHOLE WIDTH
   ---------------------------------------------------------
   Karena pola adalah seperempat badan,
   lebar dada dibagi 4.

   Shoulder menentukan posisi
   ujung bahu.

   Armhole tidak boleh lebih kecil
   dari kebutuhan lebar dada.
========================================================= */

function getArmholeWidth(
  bustQuarter,
  shoulderHalf
) {

  /*
    Untuk pola seperempat badan,
    posisi underarm mengikuti
    seperempat lingkar dada.

    Bahu menjadi batas atas.
  */

  return Math.max(
    bustQuarter,
    shoulderHalf
  );

}


/* =========================================================
   CREATE FRONT
========================================================= */

function createFront(
  data
) {

  const {

    bustQuarter,

    waistQuarter,

    shoulderHalf,

    neckWidth,

    neckDepth,

    armDepth,

    bodyLength,

    shoulderSlope

  } = data;


  /* -----------------------------------------
     A
     Tengah leher
  ----------------------------------------- */

  const A = [

    0,

    0

  ];


  /* -----------------------------------------
     B
     Ujung bahu
  ----------------------------------------- */

  const B = [

    shoulderHalf,

    shoulderSlope

  ];


  /* -----------------------------------------
     C
     Titik atas armhole
  ----------------------------------------- */

  const C = [

    bustQuarter,

    armDepth * 0.48

  ];


  /* -----------------------------------------
     D
     Titik underarm
  ----------------------------------------- */

  const D = [

    bustQuarter,

    armDepth

  ];


  /* -----------------------------------------
     E
     Titik pinggang samping
  ----------------------------------------- */

  const E = [

    waistQuarter,

    bodyLength

  ];


  /* -----------------------------------------
     F
     Tengah bawah
  ----------------------------------------- */

  const F = [

    0,

    bodyLength

  ];


  return {

    A,

    B,

    C,

    D,

    E,

    F,

    neckWidth,

    neckDepth

  };

}


/* =========================================================
   CREATE BACK
========================================================= */

function createBack(
  data
) {

  const {

    bustQuarter,

    waistQuarter,

    shoulderHalf,

    neckWidth,

    neckDepth,

    armDepth,

    bodyLength,

    shoulderSlope

  } = data;


  /* -----------------------------------------
     A
     Tengah leher belakang
  ----------------------------------------- */

  const A = [

    48,

    0

  ];


  /* -----------------------------------------
     B
     Ujung bahu
  ----------------------------------------- */

  const B = [

    48 + shoulderHalf,

    shoulderSlope

  ];


  /* -----------------------------------------
     C
     Titik atas armhole
  ----------------------------------------- */

  const C = [

    48 + bustQuarter,

    armDepth * 0.48

  ];


  /* -----------------------------------------
     D
     Titik underarm
  ----------------------------------------- */

  const D = [

    48 + bustQuarter,

    armDepth

  ];


  /* -----------------------------------------
     E
     Titik pinggang samping
  ----------------------------------------- */

  const E = [

    48 + waistQuarter,

    bodyLength

  ];


  /* -----------------------------------------
     F
     Tengah bawah
  ----------------------------------------- */

  const F = [

    48,

    bodyLength

  ];


  return {

    A,

    B,

    C,

    D,

    E,

    F,

    neckWidth,

    neckDepth

  };

}


/* =========================================================
   APPROXIMATE ARMHOLE LENGTH
   ---------------------------------------------------------
   Menggunakan polyline untuk mendapatkan
   estimasi panjang armhole.

   Dipakai oleh Sleeve Engine.
========================================================= */

function calculateArmholeLength(
  points
) {

  const {

    B,

    C,

    D

  } = points;


  const distance =
    (
      p1,
      p2
    ) => {

      const dx =
        p2[0] - p1[0];

      const dy =
        p2[1] - p1[1];

      return Math.sqrt(
        dx * dx +
        dy * dy
      );

    };


  /*
    Bahu -> C
  */

  const shoulderToC =
    distance(
      B,
      C
    );


  /*
    C -> D
  */

  const CtoD =
    distance(
      C,
      D
    );


  /*
    Kurva armhole sebenarnya
    sedikit lebih panjang dari
    garis lurus.

    Faktor 1.08 memberi
    pendekatan yang lebih realistis.
  */

  return round(

    (
      shoulderToC +
      CtoD
    ) * 1.08,

    2

  );

}


/* =========================================================
   CREATE BODICE
========================================================= */

export function makeBodice(
  measurements
) {

  if (!measurements) {

    throw new Error(
      "Data ukuran tidak tersedia."
    );

  }


  /* =======================================================
     BACA UKURAN
  ======================================================= */

  const bust =
    positive(
      measurements.bust
    );


  const waist =
    positive(
      measurements.waist
    );


  const shoulder =
    positive(
      measurements.shoulder
    );


  const bodyLength =
    positive(
      measurements.bodyLength
    );


  const neck =
    positive(
      measurements.neck
    );


  const negativeEase =
    Math.max(
      0,
      Number(
        measurements.negativeEase
      ) || 0
    );


  /* =======================================================
     VALIDASI DASAR
  ======================================================= */

  if (bust <= 0) {

    throw new Error(
      "Lingkar dada harus lebih dari 0 cm."
    );

  }


  if (waist <= 0) {

    throw new Error(
      "Lingkar pinggang harus lebih dari 0 cm."
    );

  }


  if (shoulder <= 0) {

    throw new Error(
      "Lebar bahu harus lebih dari 0 cm."
    );

  }


  if (bodyLength <= 0) {

    throw new Error(
      "Panjang badan harus lebih dari 0 cm."
    );

  }


  if (neck <= 0) {

    throw new Error(
      "Lingkar leher harus lebih dari 0 cm."
    );

  }


  /* =======================================================
     UKURAN SETELAH NEGATIVE EASE
  ======================================================= */

  const adjustedBust =
    applyNegativeEase(
      bust,
      negativeEase
    );


  const adjustedWaist =
    applyNegativeEase(
      waist,
      negativeEase
    );


  /* =======================================================
     SEPEREMPAT LINGKAR BADAN
  ======================================================= */

  const bustQuarter =
    adjustedBust / 4;


  const waistQuarter =
    adjustedWaist / 4;


  /* =======================================================
     LEBAR BAHU
     -------------------------------------------------------
     Input Lebar bahu adalah ukuran
     bahu penuh kiri ke kanan.

     Karena pola hanya setengah badan
     dari garis fold:

       Lebar bahu / 2
  ======================================================= */

  const shoulderHalf =
    shoulder / 2;


  /* =======================================================
     LEHER
  ======================================================= */

  const neckWidth =
    getNeckWidth(
      neck
    );


  /* =======================================================
     KEDALAMAN LEHER
  ======================================================= */

  const frontNeckDepth =
    neckWidth;


  const backNeckDepth =
    neckWidth * 0.40;


  /* =======================================================
     ARM DEPTH
  ======================================================= */

  const armDepth =
    getArmDepth(
      adjustedBust
    );


  /* =======================================================
     SHOULDER SLOPE
  ======================================================= */

  const shoulderSlope =
    getShoulderSlope(
      adjustedBust
    );


  /* =======================================================
     ARMHOLE WIDTH
  ======================================================= */

  const armholeWidth =
    getArmholeWidth(
      bustQuarter,
      shoulderHalf
    );


  /* =======================================================
     DATA DRAFTING
  ======================================================= */

  const draftingData = {

    bustQuarter,

    waistQuarter,

    shoulderHalf,

    neckWidth,

    neckDepth:
      frontNeckDepth,

    armDepth,

    bodyLength,

    shoulderSlope,

    armholeWidth

  };


  /* =======================================================
     FRONT
  ======================================================= */

  const front =
    createFront(
      draftingData
    );


  /*
    Front menggunakan neckline
    lebih dalam.
  */

  front.neckDepth =
    frontNeckDepth;


  /* =======================================================
     BACK
  ======================================================= */

  const back =
    createBack(
      draftingData
    );


  /*
    Back menggunakan neckline
    lebih dangkal.
  */

  back.neckDepth =
    backNeckDepth;


  /* =======================================================
     ARMHOLE LENGTH
  ======================================================= */

  const frontArmholeLength =
    calculateArmholeLength(
      front
    );


  const backArmholeLength =
    calculateArmholeLength(
      back
    );


  const armholeLength =
    (
      frontArmholeLength +
      backArmholeLength
    ) / 2;


  /* =======================================================
     RETURN
  ======================================================= */

  return {

    /* -----------------------------------
       FRONT
    ----------------------------------- */

    front,


    /* -----------------------------------
       BACK
    ----------------------------------- */

    back,


    /* -----------------------------------
       DRAFTING DATA
    ----------------------------------- */

    armDepth:

      round(
        armDepth,
        2
      ),


    armholeWidth:

      round(
        armholeWidth,
        2
      ),


    armholeLength:

      round(
        armholeLength,
        2
      ),


    frontArmholeLength:

      round(
        frontArmholeLength,
        2
      ),


    backArmholeLength:

      round(
        backArmholeLength,
        2
      ),


    /* -----------------------------------
       NECK
    ----------------------------------- */

    neckWidth:

      round(
        neckWidth,
        2
      ),


    frontNeckDepth:

      round(
        frontNeckDepth,
        2
      ),


    backNeckDepth:

      round(
        backNeckDepth,
        2
      ),


    /* -----------------------------------
       MEASUREMENTS
    ----------------------------------- */

    bust:

      round(
        bust,
        2
      ),


    waist:

      round(
        waist,
        2
      ),


    adjustedBust:

      round(
        adjustedBust,
        2
      ),


    adjustedWaist:

      round(
        adjustedWaist,
        2
      ),


    shoulder:

      round(
        shoulder,
        2
      ),


    bodyLength:

      round(
        bodyLength,
        2
      ),


    negativeEase:

      round(
        negativeEase,
        2
      )

  };

}
