/* =========================================================
   PatternMaker
   FABRIC ENGINE V1.5
   ---------------------------------------------------------
   Fungsi:
   - membaca ukuran kain
   - mengenali material
   - menentukan stretch
   - menentukan arah motif
   - menentukan batas rotasi
   - menghitung lebar efektif
   - MENCEGAH NaN
========================================================= */


/* =========================================================
   MATERIAL DATABASE
========================================================= */

const MATERIALS = {

  sublime_jersey: {

    name: "Sublime Jersey",

    stretch: "high",

    stretchDirection: "crosswise",

    grainRequired: true,

    directionalPrint: true,

    allowedRotation: [0, 180],

    defaultSeam: 1.0

  },


  rib_knit: {

    name: "Rib Knit",

    stretch: "very-high",

    stretchDirection: "crosswise",

    grainRequired: true,

    directionalPrint: false,

    allowedRotation: [0, 180],

    defaultSeam: 1.0

  },


  cotton: {

    name: "Cotton",

    stretch: "none",

    stretchDirection: "none",

    grainRequired: true,

    directionalPrint: false,

    allowedRotation: [0, 90, 180, 270],

    defaultSeam: 1.0

  },


  woven: {

    name: "Woven / Non Stretch",

    stretch: "none",

    stretchDirection: "none",

    grainRequired: true,

    directionalPrint: false,

    allowedRotation: [0, 90, 180, 270],

    defaultSeam: 1.0

  }

};


/* =========================================================
   SAFE NUMBER
========================================================= */

function safeNumber(value, fallback = 0) {

  const number =
    Number(value);

  if (!Number.isFinite(number)) {

    return fallback;

  }

  return number;

}


/* =========================================================
   NORMALIZE MATERIAL
========================================================= */

function normalizeMaterial(material) {

  if (!material) {

    return "sublime_jersey";

  }


  return String(material)

    .trim()

    .toLowerCase()

    .replace(/\s+/g, "_");

}


/* =========================================================
   GET MATERIAL
========================================================= */

export function getMaterial(material) {

  const key =
    normalizeMaterial(material);


  return (

    MATERIALS[key] ||

    MATERIALS.sublime_jersey

  );

}


/* =========================================================
   CREATE FABRIC
========================================================= */

export function createFabric(options = {}) {


  /* -----------------------------------------
     MATERIAL
  ----------------------------------------- */

  const materialKey =

    normalizeMaterial(

      options.material ||

      "sublime_jersey"

    );


  const material =

    getMaterial(

      materialKey

    );


  /* -----------------------------------------
     FABRIC DIMENSIONS
  ----------------------------------------- */

  const width =

    Math.max(

      0,

      safeNumber(

        options.width,

        0

      )

    );


  const length =

    Math.max(

      0,

      safeNumber(

        options.length,

        0

      )

    );


  /* -----------------------------------------
     SELVEDGE
  ----------------------------------------- */

  const selvedgeLeft =

    Math.max(

      0,

      safeNumber(

        options.selvedgeLeft,

        0

      )

    );


  const selvedgeRight =

    Math.max(

      0,

      safeNumber(

        options.selvedgeRight,

        0

      )

    );


  /* -----------------------------------------
     EFFECTIVE WIDTH
  ----------------------------------------- */

  const effectiveWidth =

    Math.max(

      0,

      width -

      selvedgeLeft -

      selvedgeRight

    );


  /* -----------------------------------------
     RETURN
  ----------------------------------------- */

  return {

    material:
      materialKey,

    materialName:
      material.name,

    width,

    length,

    selvedgeLeft,

    selvedgeRight,

    effectiveWidth,

    stretch:
      material.stretch,

    stretchDirection:
      material.stretchDirection,

    grainRequired:
      material.grainRequired,

    directionalPrint:
      material.directionalPrint,

    allowedRotation:
      Array.isArray(
        material.allowedRotation
      )

        ? material.allowedRotation

        : [0],

    defaultSeam:
      safeNumber(

        material.defaultSeam,

        1

      )

  };

}


/* =========================================================
   CHECK ROTATION
========================================================= */

export function isRotationAllowed(

  fabric,

  rotation

) {

  if (!fabric) {

    return false;

  }


  if (

    !Array.isArray(

      fabric.allowedRotation

    )

  ) {

    return false;

  }


  return fabric.allowedRotation.includes(

    rotation

  );

}


/* =========================================================
   FABRIC SUMMARY
========================================================= */

export function getFabricSummary(

  fabric

) {

  if (!fabric) {

    return null;

  }


  return {

    material:
      fabric.materialName,

    width:
      safeNumber(fabric.width),

    length:
      safeNumber(fabric.length),

    effectiveWidth:
      safeNumber(fabric.effectiveWidth),

    stretch:
      fabric.stretch,

    stretchDirection:
      fabric.stretchDirection,

    directionalPrint:
      fabric.directionalPrint,

    allowedRotation:
      fabric.allowedRotation

  };

}


/* =========================================================
   FABRIC AREA
========================================================= */

export function calculateFabricArea(

  fabric

) {

  if (!fabric) {

    return 0;

  }


  const width =

    safeNumber(

      fabric.width,

      0

    );


  const length =

    safeNumber(

      fabric.length,

      0

    );


  return (

    width *

    length

  );

}


/* =========================================================
   EFFECTIVE AREA
========================================================= */

export function calculateEffectiveArea(

  fabric

) {

  if (!fabric) {

    return 0;

  }


  const width =

    safeNumber(

      fabric.effectiveWidth,

      0

    );


  const length =

    safeNumber(

      fabric.length,

      0

    );


  return (

    width *

    length

  );

}


/* =========================================================
   MATERIAL LIST
========================================================= */

export function getMaterialList() {

  return Object.keys(

    MATERIALS

  ).map(

    key => ({

      key,

      name:

        MATERIALS[key].name

    })

  );

}
