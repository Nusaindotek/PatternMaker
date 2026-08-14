/* =========================================================
   PatternMaker V1.5
   SVG GEOMETRY ENGINE

   Fungsi:
   - membuat grid
   - membuat garis pola / sewing line
   - membuat garis kampuh / cutting line
   - membuat sleeve
   - grainline
   - label
   - ukuran pola
========================================================= */


/* =========================================================
   GRID
========================================================= */

function createGrid(width, height) {

  let output = "";

  for (
    let x = 0;
    x <= width;
    x += 5
  ) {

    output += `
      <line
        class="grid"
        x1="${x}"
        y1="0"
        x2="${x}"
        y2="${height}"
      />
    `;

  }


  for (
    let y = 0;
    y <= height;
    y += 5
  ) {

    output += `
      <line
        class="grid"
        x1="0"
        y1="${y}"
        x2="${width}"
        y2="${y}"
      />
    `;

  }


  return output;

}


/* =========================================================
   BODICE SEWING PATH
========================================================= */

function createBodicePath(
  points,
  front = true
) {

  const {
    A,
    B,
    C,
    D,
    E,
    F
  } = points;


  const neckDepth =
    front
      ? 4.5
      : 2.5;


  return `
    M
    ${A[0]}
    ${A[1] + neckDepth}

    L
    ${A[0]}
    ${F[1]}

    L
    ${E[0]}
    ${E[1]}

    L
    ${D[0]}
    ${D[1]}

    C
    ${D[0]}
    ${D[1] - 2.4},

    ${C[0] + 1.1}
    ${C[1] + 0.5},

    ${C[0]}
    ${C[1]}

    L
    ${B[0]}
    ${B[1]}

    Q
    ${A[0] + neckDepth * 0.85}
    ${A[1]},

    ${A[0]}
    ${A[1] + neckDepth}

    Z
  `;

}


/* =========================================================
   SLEEVE SEWING PATH
========================================================= */

function createSleevePath(s) {

  return `
    M
    ${s.left[0]}
    ${s.left[1]}

    L
    ${s.leftCap[0]}
    ${s.leftCap[1]}

    C
    ${s.leftCap[0] + 3}
    ${s.leftCap[1] - 3},

    ${s.top[0] - 2}
    ${s.top[1] + 1},

    ${s.top[0]}
    ${s.top[1]}

    C
    ${s.top[0] + 2}
    ${s.top[1] + 1},

    ${s.rightCap[0] - 3}
    ${s.rightCap[1] - 3},

    ${s.rightCap[0]}
    ${s.rightCap[1]}

    L
    ${s.right[0]}
    ${s.right[1]}

    L
    ${s.bottomRight[0]}
    ${s.bottomRight[1]}

    L
    ${s.bottomLeft[0]}
    ${s.bottomLeft[1]}

    L
    ${s.left[0]}
    ${s.left[1]}

    Z
  `;

}


/* =========================================================
   APPROXIMATE OFFSET PATH

   V1.5

   Ini adalah prototype kampuh.

   Kita belum menggunakan true geometric
   offset seperti pada CAD engine.

   Untuk tahap awal kita memperbesar
   bounding visual secara sederhana.

========================================================= */

function createSeamPath(
  path,
  seam = 1
) {

  /*
    SVG tidak menyediakan offset path
    secara native.

    Karena itu pada V1.5 kita menggunakan
    stroke tambahan sebagai visual kampuh.

    Garis utama:
      sewing line

    Garis luar:
      seam allowance
  */

  return `
    <path
      class="seam"
      d="${path}"
      stroke-width="${seam * 2}"
    />
  `;

}


/* =========================================================
   GRAINLINE
========================================================= */

function createGrainline(
  x,
  y1,
  y2
) {

  return `
    <line
      class="grain"
      x1="${x}"
      y1="${y1}"
      x2="${x}"
      y2="${y2}"
    />

    <polygon
      class="grainArrow"
      points="
        ${x},${y1}
        ${x - 1},${y1 + 3}
        ${x},${y1 + 2}
        ${x + 1},${y1 + 3}
      "
    />

    <polygon
      class="grainArrow"
      points="
        ${x},${y2}
        ${x - 1},${y2 - 3}
        ${x},${y2 - 2}
        ${x + 1},${y2 - 3}
      "
    />

    <text
      class="small"
      x="${x + 1.5}"
      y="${(y1 + y2) / 2}"
    >
      GRAIN
    </text>
  `;

}


/* =========================================================
   LABEL
========================================================= */

function createLabel(
  text,
  x,
  y
) {

  return `
    <text
      class="label"
      x="${x}"
      y="${y}"
    >
      ${text}
    </text>
  `;

}


/* =========================================================
   DIMENSION LINE
========================================================= */

function createDimension(
  x1,
  y1,
  x2,
  y2,
  text
) {

  const midX =
    (x1 + x2) / 2;


  const midY =
    (y1 + y2) / 2;


  return `

    <line
      class="dimension"
      x1="${x1}"
      y1="${y1}"
      x2="${x2}"
      y2="${y2}"
    />

    <text
      class="dimensionText"
      x="${midX}"
      y="${midY - 1}"
    >
      ${text}
    </text>

  `;

}


/* =========================================================
   MAIN SVG RENDERER
========================================================= */

export function renderPattern(
  bodice,
  sleeve,
  measurements
) {


  /* =======================================================
     CANVAS SIZE

     Kita beri ruang lebih besar agar
     pola tidak langsung terpotong.

  ======================================================= */

  const width =
    150;


  const height =
    Math.max(

      100,

      measurements.bodyLength + 40

    );


  /* =======================================================
     SEAM

     Jika input seam kosong,
     gunakan 1 cm.

  ======================================================= */

  const seam =
    Number(
      measurements.seam
    ) || 1;


  /* =======================================================
     GRID
  ======================================================= */

  const grid =
    createGrid(
      width,
      height
    );


  /* =======================================================
     BODICE FRONT
  ======================================================= */

  const frontPath =
    createBodicePath(

      bodice.front,

      true

    );


  /* =======================================================
     BODICE BACK
  ======================================================= */

  const backPath =
    createBodicePath(

      bodice.back,

      false

    );


  /* =======================================================
     SLEEVE
  ======================================================= */

  const sleevePath =
    createSleevePath(
      sleeve
    );


  /* =======================================================
     SEAM VISUAL
  ======================================================= */

  const frontSeam =
    createSeamPath(

      frontPath,

      seam

    );


  const backSeam =
    createSeamPath(

      backPath,

      seam

    );


  const sleeveSeam =
    createSeamPath(

      sleevePath,

      seam

    );


  /* =======================================================
     DIMENSIONS
  ======================================================= */

  const frontWidth =
    Math.abs(

      bodice.front.D[0] -
      bodice.front.A[0]

    );


  const bodyLength =
    Math.abs(

      bodice.front.F[1] -
      bodice.front.A[1]

    );


  /* =======================================================
     SVG
  ======================================================= */

  return `

  <svg

    xmlns="http://www.w3.org/2000/svg"

    viewBox="
      0
      0
      ${width}
      ${height}
    "

    preserveAspectRatio="xMidYMid meet"

    width="100%"

    style="
      max-width:100%;
      height:auto;
      display:block;
    "

  >

    <defs>

      <style>

        .grid {

          stroke:
            #e5e5e5;

          stroke-width:
            0.15;

        }


        .pattern {

          fill:
            rgba(255,255,255,0.35);

          stroke:
            #111;

          stroke-width:
            0.45;

          vector-effect:
            non-scaling-stroke;

        }


        .seam {

          fill:
            none;

          stroke:
            #777;

          stroke-width:
            0.35;

          stroke-dasharray:
            1.2 0.8;

          vector-effect:
            non-scaling-stroke;

        }


        .grain {

          stroke:
            #222;

          stroke-width:
            0.35;

          vector-effect:
            non-scaling-stroke;

        }


        .grainArrow {

          fill:
            #222;

        }


        .label {

          font-family:
            Arial,
            sans-serif;

          font-size:
            2.5px;

          font-weight:
            bold;

          fill:
            #111;

        }


        .small {

          font-family:
            Arial,
            sans-serif;

          font-size:
            1.7px;

          fill:
            #444;

        }


        .note {

          font-family:
            Arial,
            sans-serif;

          font-size:
            1.8px;

          fill:
            #555;

        }


        .dimension {

          stroke:
            #555;

          stroke-width:
            0.25;

          stroke-dasharray:
            0.8 0.8;

          vector-effect:
            non-scaling-stroke;

        }


        .dimensionText {

          font-family:
            Arial,
            sans-serif;

          font-size:
            1.7px;

          text-anchor:
            middle;

          fill:
            #444;

        }

      </style>

    </defs>


    <!-- =================================================
         GRID
    ================================================= -->

    ${grid}


    <!-- =================================================
         FRONT SEAM ALLOWANCE
    ================================================= -->

    ${frontSeam}


    <!-- =================================================
         FRONT SEWING LINE
    ================================================= -->

    <path
      class="pattern"
      d="${frontPath}"
    />


    <!-- =================================================
         BACK SEAM ALLOWANCE
    ================================================= -->

    ${backSeam}


    <!-- =================================================
         BACK SEWING LINE
    ================================================= -->

    <path
      class="pattern"
      d="${backPath}"
    />


    <!-- =================================================
         SLEEVE SEAM ALLOWANCE
    ================================================= -->

    ${sleeveSeam}


    <!-- =================================================
         SLEEVE SEWING LINE
    ================================================= -->

    <path
      class="pattern"
      d="${sleevePath}"
    />


    <!-- =================================================
         FRONT GRAIN
    ================================================= -->

    ${createGrainline(

      14,

      18,

      Math.min(
        height - 10,
        18 + bodyLength * 0.65
      )

    )}


    <!-- =================================================
         BACK GRAIN
    ================================================= -->

    ${createGrainline(

      59,

      18,

      Math.min(
        height - 10,
        18 + bodyLength * 0.65
      )

    )}


    <!-- =================================================
         SLEEVE GRAIN
    ================================================= -->

    ${createGrainline(

      108,

      19,

      Math.min(
        height - 10,
        45
      )

    )}


    <!-- =================================================
         LABEL FRONT
    ================================================= -->

    ${createLabel(

      "FRONT — FOLD",

      10,

      Math.min(
        height - 15,
        50
      )

    )}


    <!-- =================================================
         LABEL BACK
    ================================================= -->

    ${createLabel(

      "BACK — FOLD",

      55,

      Math.min(
        height - 15,
        50
      )

    )}


    <!-- =================================================
         LABEL SLEEVE
    ================================================= -->

    ${createLabel(

      "SLEEVE — CUT 2",

      95,

      Math.min(
        height - 13,
        52
      )

    )}


    <!-- =================================================
         DIMENSION BODY
    ================================================= -->

    ${createDimension(

      bodice.front.A[0] - 3,

      bodice.front.A[1],

      bodice.front.A[0] - 3,

      bodice.front.F[1],

      `${bodyLength.toFixed(1)} cm`

    )}


    <!-- =================================================
         DIMENSION WIDTH
    ================================================= -->

    ${createDimension(

      bodice.front.A[0],

      bodice.front.F[1] + 4,

      bodice.front.D[0],

      bodice.front.F[1] + 4,

      `${frontWidth.toFixed(1)} cm`

    )}


    <!-- =================================================
         INFORMATION
    ================================================= -->

    <text
      class="small"
      x="5"
      y="5"
    >
      PatternMaker V1.5
    </text>


    <text
      class="small"
      x="5"
      y="8"
    >
      Units: cm
    </text>


    <text
      class="note"
      x="95"
      y="57"
    >
      Seam:
      ${seam.toFixed(1)}
      cm
    </text>


    <text
      class="note"
      x="95"
      y="60"
    >
      Cap ease:
      ${Number(
        sleeve.capEase || 0
      ).toFixed(1)}
      cm
    </text>


  </svg>

  `;

}
