/* =========================================
   PatternMaker
   FABRIC ENGINE V1.3

   Fungsi:
   - membaca ukuran kain
   - mengenali material
   - menentukan stretch
   - menentukan arah motif
   - menentukan batas rotasi pola
   - menghitung lebar efektif kain
========================================= */


/* =========================================
   MATERIAL DATABASE
========================================= */

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


/* =========================================
   NORMALIZE MATERIAL
========================================= */

function normalizeMaterial(material) {

  if (!material) {
    return "sublime_jersey";
  }


  return material
    .toLowerCase()
    .replace(/\s+/g, "_");

}


/* =========================================
   GET MATERIAL DATA
========================================= */

export function getMaterial(material) {

  const key =
    normalizeMaterial(material);


  return (
    MATERIALS[key] ||
    MATERIALS.sublime_jersey
  );

}


/* =========================================
   CREATE FABRIC
========================================= */

export function createFabric(options = {}) {

  const materialKey =
    normalizeMaterial(
      options.material ||
      "sublime_jersey"
    );


  const material =
    getMaterial(materialKey);


  const width =
    Number(options.width) || 150;


  const length =
    Number(options.length) || 0;


  const selvedgeLeft =
    Number(options.selvedgeLeft) || 0;


  const selvedgeRight =
    Number(options.selvedgeRight) || 0;


  const effectiveWidth =
    Math.max(
      0,
      width -
      selvedgeLeft -
      selvedgeRight
    );


  return {

    /* ===============================
       BASIC FABRIC
    =============================== */

    material:
      materialKey,

    materialName:
      material.name,

    width,

    length,


    /* ===============================
       EFFECTIVE WIDTH
    =============================== */

    selvedgeLeft,

    selvedgeRight,

    effectiveWidth,


    /* ===============================
       MATERIAL PROPERTIES
    =============================== */

    stretch:
      material.stretch,

    stretchDirection:
      material.stretchDirection,

    grainRequired:
      material.grainRequired,

    directionalPrint:
      material.directionalPrint,


    /* ===============================
       NESTING RULES
    =============================== */

    allowedRotation:
      material.allowedRotation,


    /* ===============================
       SEAM
    =============================== */

    defaultSeam:
      material.defaultSeam

  };

}


/* =========================================
   CHECK ROTATION
========================================= */

export function isRotationAllowed(
  fabric,
  rotation
) {

  if (!fabric) {
    return false;
  }


  return fabric.allowedRotation.includes(
    rotation
  );

}


/* =========================================
   GET FABRIC SUMMARY
========================================= */

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
      fabric.width,

    length:
      fabric.length,

    effectiveWidth:
      fabric.effectiveWidth,

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


/* =========================================
   CALCULATE AREA
========================================= */

export function calculateFabricArea(
  fabric
) {

  if (!fabric) {
    return 0;
  }


  return (
    fabric.width *
    fabric.length
  );

}


/* =========================================
   CALCULATE EFFECTIVE AREA
========================================= */

export function calculateEffectiveArea(
  fabric
) {

  if (!fabric) {
    return 0;
  }


  return (
    fabric.effectiveWidth *
    fabric.length
  );

}


/* =========================================
   MATERIAL LIST
========================================= */

export function getMaterialList() {

  return Object.keys(
    MATERIALS
  ).map(key => {

    return {

      key,

      name:
        MATERIALS[key].name

    };

  });

}