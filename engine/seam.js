/* =========================================================
   PatternMaker V1.5
   SEAM ENGINE
   ---------------------------------------------------------
   Mengatur kampuh pola berdasarkan bagian pakaian
   dan jenis bahan.

   Satuan: cm
========================================================= */


/* =========================================================
   DEFAULT SEAM
========================================================= */

const DEFAULT_SEAM = {

  neckline: 0.7,

  shoulder: 1.0,

  armhole: 1.0,

  side: 1.0,

  bottom: 2.0,

  sleeveCap: 1.0,

  sleeveSide: 1.0,

  sleeveBottom: 2.0,

  fold: 0

};


/* =========================================================
   MATERIAL SEAM
========================================================= */

const MATERIAL_SEAM = {

  sublime_jersey: {

    neckline: 0.7,

    shoulder: 1.0,

    armhole: 1.0,

    side: 1.0,

    bottom: 2.0,

    sleeveCap: 1.0,

    sleeveSide: 1.0,

    sleeveBottom: 2.0

  },


  rib_knit: {

    neckline: 0.7,

    shoulder: 1.0,

    armhole: 1.0,

    side: 1.0,

    bottom: 2.0,

    sleeveCap: 1.0,

    sleeveSide: 1.0,

    sleeveBottom: 2.0

  },


  cotton: {

    neckline: 0.7,

    shoulder: 1.0,

    armhole: 1.0,

    side: 1.0,

    bottom: 2.0,

    sleeveCap: 1.0,

    sleeveSide: 1.0,

    sleeveBottom: 2.0

  },


  woven: {

    neckline: 0.7,

    shoulder: 1.0,

    armhole: 1.0,

    side: 1.0,

    bottom: 2.0,

    sleeveCap: 1.0,

    sleeveSide: 1.0,

    sleeveBottom: 2.0

  }

};


/* =========================================================
   NORMALIZE MATERIAL
========================================================= */

function normalizeMaterial(material) {

  if (!material) {

    return "sublime_jersey";

  }


  return String(material)

    .toLowerCase()

    .trim()

    .replace(/\s+/g, "_");

}


/* =========================================================
   NUMBER
========================================================= */

function safeNumber(
  value,
  fallback = 0
) {

  const number =
    Number(value);


  if (
    Number.isFinite(number)
  ) {

    return number;

  }


  return fallback;

}


/* =========================================================
   CREATE SEAM
========================================================= */

export function createSeam(
  options = {}
) {


  const material =
    normalizeMaterial(
      options.material
    );


  const materialSeam =
    MATERIAL_SEAM[material] ||
    MATERIAL_SEAM.sublime_jersey;


  const custom =
    options.seam || {};


  return {

    neckline:
      safeNumber(
        custom.neckline,
        materialSeam.neckline
      ),


    shoulder:
      safeNumber(
        custom.shoulder,
        materialSeam.shoulder
      ),


    armhole:
      safeNumber(
        custom.armhole,
        materialSeam.armhole
      ),


    side:
      safeNumber(
        custom.side,
        materialSeam.side
      ),


    bottom:
      safeNumber(
        custom.bottom,
        materialSeam.bottom
      ),


    sleeveCap:
      safeNumber(
        custom.sleeveCap,
        materialSeam.sleeveCap
      ),


    sleeveSide:
      safeNumber(
        custom.sleeveSide,
        materialSeam.sleeveSide
      ),


    sleeveBottom:
      safeNumber(
        custom.sleeveBottom,
        materialSeam.sleeveBottom
      ),


    fold:
      safeNumber(
        custom.fold,
        DEFAULT_SEAM.fold
      )

  };

}


/* =========================================================
   CREATE UNIFORM SEAM
   ---------------------------------------------------------
   Digunakan ketika user hanya memasukkan satu
   nilai kampuh umum pada form.

   Contoh:

   seam = 1

   maka seluruh bagian utama = 1 cm,
   kecuali bagian bawah yang tetap menggunakan
   nilai khusus 2 cm jika tidak ditentukan.
========================================================= */

export function createUniformSeam(
  value = 1
) {


  const seam =
    safeNumber(
      value,
      1
    );


  return {

    neckline:
      seam,

    shoulder:
      seam,

    armhole:
      seam,

    side:
      seam,

    bottom:
      seam,

    sleeveCap:
      seam,

    sleeveSide:
      seam,

    sleeveBottom:
      seam,

    fold:
      0

  };

}


/* =========================================================
   GET MATERIAL SEAM
========================================================= */

export function getMaterialSeam(
  material
) {


  const key =
    normalizeMaterial(
      material
    );


  const seam =
    MATERIAL_SEAM[key] ||
    MATERIAL_SEAM.sublime_jersey;


  return {

    ...seam

  };

}


/* =========================================================
   GET SEAM VALUE
========================================================= */

export function getSeamValue(
  seam,
  part
) {


  if (!seam) {

    return 0;

  }


  if (
    Object.prototype.hasOwnProperty.call(
      seam,
      part
    )
  ) {

    return safeNumber(
      seam[part]
    );

  }


  return 0;

}


/* =========================================================
   MAX SEAM
   ---------------------------------------------------------
   Digunakan oleh Fabric Optimizer sebagai buffer
   konservatif sebelum kita memiliki true geometric
   offset.
========================================================= */

export function getMaximumSeam(
  seam
) {


  if (!seam) {

    return 0;

  }


  const values = [

    seam.neckline,

    seam.shoulder,

    seam.armhole,

    seam.side,

    seam.bottom,

    seam.sleeveCap,

    seam.sleeveSide,

    seam.sleeveBottom

  ];


  return Math.max(
    ...values.map(
      value =>
        safeNumber(value)
    )
  );

}


/* =========================================================
   SEAM SUMMARY
========================================================= */

export function getSeamSummary(
  seam
) {


  if (!seam) {

    return null;

  }


  return {

    neckline:
      seam.neckline,

    shoulder:
      seam.shoulder,

    armhole:
      seam.armhole,

    side:
      seam.side,

    bottom:
      seam.bottom,

    sleeveCap:
      seam.sleeveCap,

    sleeveSide:
      seam.sleeveSide,

    sleeveBottom:
      seam.sleeveBottom,

    fold:
      seam.fold

  };

}


/* =========================================================
   VALIDATE SEAM
========================================================= */

export function validateSeam(
  seam
) {


  if (!seam) {

    return {

      valid:
        false,

      errors: [
        "Data kampuh tidak tersedia."
      ]

    };

  }


  const errors = [];


  const fields = [

    "neckline",

    "shoulder",

    "armhole",

    "side",

    "bottom",

    "sleeveCap",

    "sleeveSide",

    "sleeveBottom"

  ];


  fields.forEach(
    field => {

      const value =
        Number(
          seam[field]
        );


      if (
        !Number.isFinite(value) ||
        value < 0
      ) {

        errors.push(
          `${field} tidak valid.`
        );

      }

    }
  );


  return {

    valid:
      errors.length === 0,

    errors

  };

}


/* =========================================================
   MATERIAL LIST
========================================================= */

export function getSeamMaterialList() {

  return Object.keys(
    MATERIAL_SEAM
  ).map(
    key => ({

      key,

      name:
        key
          .replace(/_/g, " ")
          .replace(
            /\b\w/g,
            letter =>
              letter.toUpperCase()
          )

    })
  );

}
