/* =========================================================
   PatternMaker V1.5
   SLEEVE ENGINE
   ---------------------------------------------------------
   Basic sleeve untuk anak
   Dioptimalkan untuk knit / jersey / rib knit
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
   BEZIER LENGTH
========================================================= */

function bezierLength(
  p0,
  p1,
  p2,
  p3,
  steps = 30
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
   SLEEVE ENGINE
========================================================= */

export function makeSleeve(
  m,
  bodice
) {

  /* =======================================================
     EASE
  ======================================================= */

  const fabric =
    String(
      m.fabric || ""
    ).toLowerCase();


  let sleeveEase = 1;


  if (
    fabric === "rib" ||
    fabric === "rib_knit"
  ) {

    sleeveEase =
      0;

  }

  else if (
    fabric === "sublime_jersey"
  ) {

    sleeveEase =
      0.5;

  }

  else {

    sleeveEase =
      1.5;

  }


  /* =======================================================
     ARM MEASUREMENT
  ======================================================= */

  const negativeEase =
    Number(
      m.negativeEase
    ) || 0;


  const easeFactor =
    Math.max(
      0.5,
      1 -
      negativeEase / 100
    );


  const upperArm =
    Number(
      m.upperArm
    ) *
    easeFactor;


  const wrist =
    Number(
      m.wrist
    ) *
    easeFactor;


  /* =======================================================
     WIDTH
  ======================================================= */

  const upperArmWidth =
    Math.max(
      8,
      upperArm +
      sleeveEase * 2
    );


  const wristWidth =
    Math.max(
      6,
      wrist +
      sleeveEase * 2
    );


  const upperArmHalf =
    upperArmWidth / 2;


  const wristHalf =
    wristWidth / 2;


  /* =======================================================
     POSITION
  ======================================================= */

  const x =
    95;


  const y =
    12;


  /* =======================================================
     SLEEVE LENGTH
  ======================================================= */

  const sleeveLength =
    Math.max(
      5,
      Number(
        m.sleeveLength
      )
    );


  /* =======================================================
     SLEEVE CAP HEIGHT
     -------------------------------------------------------
     Mengikuti armhole bodice.
  ======================================================= */

  const capHeight =
    Math.max(

      7,

      Math.min(
        15,
        bodice.armDepth *
        0.55
      )

    );


  /* =======================================================
     CENTER TOP
  ======================================================= */

  const centerX =
    x +
    upperArmHalf;


  const top = [

    centerX,

    y

  ];


  /* =======================================================
     LEFT / RIGHT CAP
  ======================================================= */

  const leftCap = [

    x,

    y +
    capHeight

  ];


  const rightCap = [

    x +
    upperArmWidth,

    y +
    capHeight

  ];


  /* =======================================================
     HEM
  ======================================================= */

  const left = [

    x,

    y +
    sleeveLength

  ];


  const right = [

    x +
    upperArmWidth,

    y +
    sleeveLength

  ];


  /* =======================================================
     WRIST
  ======================================================= */

  const bottomLeft = [

    centerX -
    wristHalf,

    y +
    sleeveLength

  ];


  const bottomRight = [

    centerX +
    wristHalf,

    y +
    sleeveLength

  ];


  /* =======================================================
     SLEEVE CAP CURVES
  ======================================================= */

  const leftControl1 = [

    leftCap[0] +
    upperArmWidth * 0.10,

    leftCap[1] -
    capHeight * 0.35

  ];


  const leftControl2 = [

    centerX -
    upperArmWidth * 0.25,

    top[1] +
    1

  ];


  const rightControl1 = [

    centerX +
    upperArmWidth * 0.25,

    top[1] +
    1

  ];


  const rightControl2 = [

    rightCap[0] -
    upperArmWidth * 0.10,

    rightCap[1] -
    capHeight * 0.35

  ];


  /* =======================================================
     CALCULATE CAP LENGTH
  ======================================================= */

  const leftCapLength =
    bezierLength(

      leftCap,

      leftControl1,
      leftControl2,
      top

    );


  const rightCapLength =
    bezierLength(

      top,

      rightControl1,
      rightControl2,
      rightCap

    );


  const capLength =
    leftCapLength +
    rightCapLength;


  /* =======================================================
     ARMHOLE TARGET
  ======================================================= */

  const armholeTarget =
    Number(
      bodice.armholeLength
    ) || 0;


  /* =======================================================
     CAP EASE
  ======================================================= */

  const capEase =
    capLength -
    armholeTarget;


  /* =======================================================
     RETURN
  ======================================================= */

  return {

    left,

    leftCap,

    top,

    rightCap,

    right,

    bottomLeft,

    bottomRight,

    leftControl1,

    leftControl2,

    rightControl1,

    rightControl2,

    capHeight,

    capLength,

    capEase,

    armholeTarget,

    upperArmWidth,

    wristWidth,

    ease:
      sleeveEase

  };

}