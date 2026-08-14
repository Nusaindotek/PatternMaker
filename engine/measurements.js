/* =========================================
   PatternMaker
   MEASUREMENTS ENGINE V1.3
========================================= */


/* =========================================
   GET NUMBER
========================================= */

function getNumber(id) {

  const element =
    document.getElementById(id);

  if (!element) {
    return 0;
  }

  return Number(element.value) || 0;

}


/* =========================================
   GET VALUE
========================================= */

function getValue(id) {

  const element =
    document.getElementById(id);

  if (!element) {
    return "";
  }

  return element.value;

}


/* =========================================
   GET USER MEASUREMENTS
========================================= */

export function getMeasurements() {


  /* ===============================
     BODY
  =============================== */

  const measurements = {

    age:
      getNumber("age"),

    bust:
      getNumber("bust"),

    waist:
      getNumber("waist"),

    shoulder:
      getNumber("shoulder"),

    bodyLength:
      getNumber("bodyLength"),

    neck:
      getNumber("neck"),


    /* ===============================
       SLEEVE
    =============================== */

    upperArm:
      getNumber("upperArm"),

    sleeveLength:
      getNumber("sleeveLength"),

    wrist:
      getNumber("wrist"),


    /* ===============================
       MATERIAL
    =============================== */

    fabric:
      getValue("fabricMaterial"),


    /* ===============================
       NEGATIVE EASE
    =============================== */

    negativeEase:
      getNumber("negativeEase"),


    /* ===============================
       SEAM
    =============================== */

    seam:
      getNumber("seam") || 1,


    /* ===============================
       FABRIC DATA
    =============================== */

    fabricWidth:
      getNumber("fabricWidth"),

    fabricLength:
      getNumber("fabricLength"),

    selvedgeLeft:
      getNumber("selvedgeLeft"),

    selvedgeRight:
      getNumber("selvedgeRight"),


    /* ===============================
       PRINT
    =============================== */

    printDirection:
      getValue("printDirection"),


    /* ===============================
       QUANTITY
    =============================== */

    garmentQuantity:
      Math.max(
        1,
        getNumber("garmentQuantity")
      )

  };


  return measurements;

}
