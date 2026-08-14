const getNumber = (id) => {
  const element = document.getElementById(id);

  if (!element) {
    return 0;
  }

  return Number(element.value) || 0;
};


/* =========================
   GET USER MEASUREMENTS
========================= */

export function getMeasurements() {

  const fabric =
    document.getElementById("fabric").value;


  const measurements = {

    /* =====================
       BODY
    ===================== */

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


    /* =====================
       SLEEVE
    ===================== */

    upperArm:
      getNumber("upperArm"),

    sleeveLength:
      getNumber("sleeveLength"),

    wrist:
      getNumber("wrist"),


    /* =====================
       MATERIAL
    ===================== */

    fabric:
      fabric,


    /* =====================
       NEGATIVE EASE
    ===================== */

    negativeEase:
      fabric === "rib"
        ? getNumber("negativeEase")
        : 0,


    /* =====================
       SEAM ALLOWANCE
    ===================== */

    seam:
      getNumber("seam")

  };


  return measurements;
}
