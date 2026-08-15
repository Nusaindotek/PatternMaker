/* =========================================================
   PatternMaker
   SLEEVE ENGINE V1.5
   ---------------------------------------------------------
   UNIVERSAL BASIC SLEEVE

   Input:
   - Lingkar lengan atas
   - Panjang lengan
   - Lingkar pergelangan tangan
   - Pengurangan ukuran
   - Bahan

   Dari Bodice:
   - armDepth
   - armholeLength
   - frontArmholeLength
   - backArmholeLength

   Output:
   - titik pola lengan
   - tinggi kepala lengan
   - panjang kepala lengan
   - kelonggaran kepala lengan
   - lebar lengan atas
   - lebar ujung lengan

   Semua ukuran dalam cm.
========================================================= */


/* =========================================================
   HELPER
========================================================= */

function positive(
  value,
  fallback = 0
) {

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
      Number(
        negativeEase
      ) || 0
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
   FABRIC EASE
   ---------------------------------------------------------
   Rib Knit / stretch:
   sedikit lebih kecil.

   Woven:
   sedikit lebih longgar.

   Nilai ini hanya digunakan sebagai
   tambahan kenyamanan konstruksi,
   bukan menggantikan negative ease.
========================================================= */

function getSleeveEase(
  fabric
) {

  const material =
    String(
      fabric || ""
    )
    .toLowerCase()
    .replace(/\s+/g, "_");


  if (
    material === "rib_knit"
  ) {

    return 0.5;

  }


  if (
    material === "sublime_jersey"
  ) {

    return 0.5;

  }


  return 1.5;

}


/* =========================================================
   SLEEVE CAP HEIGHT
   ---------------------------------------------------------
   Kepala lengan tidak lagi dibuat sebagai
   setengah lingkaran.

   Tingginya mengikuti armhole bodice.

   Rumus dasar:
   armhole length / 6

   Kemudian dibatasi terhadap armDepth
   agar tetap proporsional.
========================================================= */

function calculateCapHeight(
  armholeLength,
  armDepth
) {

  const base =
    armholeLength / 6;


  const maximum =
    armDepth * 0.75;


  const minimum =
    5;


  return Math.max(

    minimum,

    Math.min(
      base,
      maximum
    )

  );

}


/* =========================================================
   SLEEVE WIDTH
========================================================= */

function calculateUpperWidth(
  upperArm,
  negativeEase,
  sleeveEase
) {

  const adjusted =
    applyNegativeEase(
      upperArm,
      negativeEase
    );


  /*
    Sleeve ease ditambahkan
    setelah negative ease.
  */

  return (
    adjusted +
    sleeveEase
  );

}


/* =========================================================
   WRIST WIDTH
========================================================= */

function calculateWristWidth(
  wrist,
  negativeEase,
  sleeveEase
) {

  const adjusted =
    applyNegativeEase(
      wrist,
      negativeEase
    );


  /*
    Sedikit ruang agar ujung lengan
    tidak terlalu ketat.
  */

  return (
    adjusted +
    sleeveEase
  );

}


/* =========================================================
   CAP CONTROL POINT
========================================================= */

function calculateCapPoint(
  left,
  top,
  right,
  capHeight
) {

  const width =
    right[0] -
    left[0];


  /*
    Titik puncak sedikit digeser
    mengikuti bentuk natural sleeve cap.
  */

  const topX =
    left[0] +
    width / 2;


  return [

    topX,

    top[1]

  ];

}


/* =========================================================
   CREATE SLEEVE
========================================================= */

export function makeSleeve(
  measurements,
  bodice
) {

  if (!measurements) {

    throw new Error(
      "Data ukuran lengan tidak tersedia."
    );

  }


  if (!bodice) {

    throw new Error(
      "Data badan tidak tersedia untuk membuat lengan."
    );

  }


  /* =======================================================
     INPUT UKURAN
  ======================================================= */

  const upperArm =
    positive(
      measurements.upperArm
    );


  const sleeveLength =
    positive(
      measurements.sleeveLength
    );


  const wrist =
    positive(
      measurements.wrist
    );


  const negativeEase =
    Math.max(

      0,

      Number(
        measurements.negativeEase
      ) || 0

    );


  /* =======================================================
     VALIDASI
  ======================================================= */

  if (
    upperArm <= 0
  ) {

    throw new Error(
      "Lingkar lengan atas harus lebih dari 0 cm."
    );

  }


  if (
    sleeveLength <= 0
  ) {

    throw new Error(
      "Panjang lengan harus lebih dari 0 cm."
    );

  }


  if (
    wrist <= 0
  ) {

    throw new Error(
      "Lingkar pergelangan tangan harus lebih dari 0 cm."
    );

  }


  /* =======================================================
     ARMHOLE BODICE
  ======================================================= */

  const armholeLength =
    positive(
      bodice.armholeLength
    );


  const frontArmholeLength =
    positive(
      bodice.frontArmholeLength
    );


  const backArmholeLength =
    positive(
      bodice.backArmholeLength
    );


  const armDepth =
    positive(
      bodice.armDepth
    );


  if (
    armholeLength <= 0
  ) {

    throw new Error(
      "Panjang kerung lengan badan tidak tersedia."
    );

  }


  /* =======================================================
     MATERIAL
  ======================================================= */

  const sleeveEase =
    getSleeveEase(
      measurements.fabric
    );


  /* =======================================================
     LEBAR LENGAN ATAS
  ======================================================= */

  const upperWidth =
    calculateUpperWidth(

      upperArm,

      negativeEase,

      sleeveEase

    );


  /* =======================================================
     LEBAR UJUNG LENGAN
  ======================================================= */

  const wristWidth =
    calculateWristWidth(

      wrist,

      negativeEase,

      sleeveEase

    );


  /* =======================================================
     SETENGAH LEBAR
  ======================================================= */

  const upperHalf =
    upperWidth / 2;


  const wristHalf =
    wristWidth / 2;


  /* =======================================================
     POSISI POLA
     -------------------------------------------------------
     Diletakkan di sebelah kanan
     bodice pada preview.
  ======================================================= */

  const x =
    95;


  const y =
    8;


  /* =======================================================
     KEPALA LENGAN
  ======================================================= */

  const capHeight =
    calculateCapHeight(

      armholeLength,

      armDepth

    );


  /* =======================================================
     TITIK UTAMA
  ======================================================= */

  /*
    Titik kiri bawah.
  */

  const left = [

    x,

    y + sleeveLength

  ];


  /*
    Titik kiri atas kerung.
  */

  const leftCap = [

    x,

    y + capHeight

  ];


  /*
    Titik tengah atas kepala lengan.
  */

  const top = [

    x + upperHalf,

    y

  ];


  /*
    Titik kanan atas kerung.
  */

  const rightCap = [

    x + upperWidth,

    y + capHeight

  ];


  /*
    Titik kanan bawah.
  */

  const right = [

    x + upperWidth,

    y + sleeveLength

  ];


  /* =======================================================
     UJUNG LENGAN
  ======================================================= */

  const bottomLeft = [

    x +
    upperHalf -
    wristHalf,

    y +
    sleeveLength

  ];


  const bottomRight = [

    x +
    upperHalf +
    wristHalf,

    y +
    sleeveLength

  ];


  /* =======================================================
     CONTROL POINT KEPALA LENGAN
  ======================================================= */

  const capTop =

    calculateCapPoint(

      leftCap,

      top,

      rightCap,

      capHeight

    );


  /* =======================================================
     PANJANG KEPALA LENGAN
     -------------------------------------------------------
     Perkiraan kurva kiri + kanan.

     Menggunakan faktor kurva agar
     lebih dekat dengan panjang aktual.
  ======================================================= */

  const capHalfLength =

    Math.sqrt(

      Math.pow(
        upperHalf,
        2
      ) +

      Math.pow(
        capHeight,
        2
      )

    );


  const estimatedCapLength =

    capHalfLength *
    2 *
    1.08;


  /* =======================================================
     TARGET ARMHOLE
  ======================================================= */

  const targetArmholeLength =
    armholeLength;


  /* =======================================================
     CAP EASE
  ======================================================= */

  const capEase =

    estimatedCapLength -
    targetArmholeLength;


  /* =======================================================
     RETURN
  ======================================================= */

  return {

    /* -----------------------------------
       POINTS
    ----------------------------------- */

    left,

    leftCap,

    top,

    rightCap,

    right,

    bottomLeft,

    bottomRight,

    capTop,


    /* -----------------------------------
       LENGTH
    ----------------------------------- */

    sleeveLength:

      round(
        sleeveLength,
        2
      ),


    /* -----------------------------------
       WIDTH
    ----------------------------------- */

    upperWidth:

      round(
        upperWidth,
        2
      ),


    upperHalf:

      round(
        upperHalf,
        2
      ),


    wristWidth:

      round(
        wristWidth,
        2
      ),


    wristHalf:

      round(
        wristHalf,
        2
      ),


    /* -----------------------------------
       CAP
    ----------------------------------- */

    capHeight:

      round(
        capHeight,
        2
      ),


    capLength:

      round(
        estimatedCapLength,
        2
      ),


    /* -----------------------------------
       ARMHOLE
    ----------------------------------- */

    armholeLength:

      round(
        targetArmholeLength,
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
       EASE
    ----------------------------------- */

    capEase:

      round(
        capEase,
        2
      ),


    ease:

      round(
        sleeveEase,
        2
      ),


    negativeEase:

      round(
        negativeEase,
        2
      )

  };

}
