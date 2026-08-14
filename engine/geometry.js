/* =========================================================
   PatternMaker V1.5
   SVG GEOMETRY ENGINE
   ---------------------------------------------------------
   Fungsi:
   - Render pola depan
   - Render pola belakang
   - Render lengan
   - Grainline
   - Label
   - Seam allowance preview
   - Layout lebih aman untuk mobile
   - Memperbaiki label SLEEVE — CUT 2 yang terpotong

   Satuan:
   cm
========================================================= */


/* =========================================================
   SVG ESCAPE
========================================================= */

function escapeText(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

}


/* =========================================================
   GRID
========================================================= */

function createGrid(
  width,
  height
) {

  let output = "";


  /* -----------------------------------------
     VERTICAL
  ----------------------------------------- */

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


  /* -----------------------------------------
     HORIZONTAL
  ----------------------------------------- */

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
   POINT LIST
========================================================= */

function getPointBounds(
  points = []
) {

  if (!points.length) {

    return {

      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      width: 0,
      height: 0

    };

  }


  const xs =
    points.map(
      point => point[0]
    );


  const ys =
    points.map(
      point => point[1]
    );


  const minX =
    Math.min(...xs);


  const maxX =
    Math.max(...xs);


  const minY =
    Math.min(...ys);


  const maxY =
    Math.max(...ys);


  return {

    minX,
    maxX,
    minY,
    maxY,

    width:
      maxX - minX,

    height:
      maxY - minY

  };

}


/* =========================================================
   BODICE PATH
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


  /* -----------------------------------------
     NECK DEPTH
  ----------------------------------------- */

  const neckDepth =
    front
      ? 4.5
      : 2.5;


  /* -----------------------------------------
     PATH
  ----------------------------------------- */

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
    ${D[1] - 2.4}

    ${C[0] + 1.1}
    ${C[1] + 0.5}

    ${C[0]}
    ${C[1]}

    L
    ${B[0]}
    ${B[1]}

    L
    ${A[0]}
    ${A[1]}

    Q
    ${A[0] + neckDepth * 0.85}
    ${A[1]}

    ${A[0]}
    ${A[1] + neckDepth}

    Z

  `;

}


/* =========================================================
   SLEEVE PATH
========================================================= */

function createSleevePath(
  sleeve
) {

  return `

    M
    ${sleeve.left[0]}
    ${sleeve.left[1]}

    L
    ${sleeve.leftCap[0]}
    ${sleeve.leftCap[1]}

    C
    ${sleeve.leftCap[0] + 3}
    ${sleeve.leftCap[1] - 3}

    ${sleeve.top[0] - 2}
    ${sleeve.top[1] + 1}

    ${sleeve.top[0]}
    ${sleeve.top[1]}

    C
    ${sleeve.top[0] + 2}
    ${sleeve.top[1] + 1}

    ${sleeve.rightCap[0] - 3}
    ${sleeve.rightCap[1] - 3}

    ${sleeve.rightCap[0]}
    ${sleeve.rightCap[1]}

    L
    ${sleeve.right[0]}
    ${sleeve.right[1]}

    L
    ${sleeve.bottomRight[0]}
    ${sleeve.bottomRight[1]}

    L
    ${sleeve.bottomLeft[0]}
    ${sleeve.bottomLeft[1]}

    Z

  `;

}


/* =========================================================
   SEAM PREVIEW
   ---------------------------------------------------------
   V1.5:
   Belum melakukan geometric offset sebenarnya.

   Kita menggunakan stroke dashed sebagai
   visualisasi kampuh.

   Pada V2 nanti kita akan membuat offset
   geometris yang sebenarnya.
========================================================= */

function createSeamPreview(
  path,
  seam = 1
) {

  if (!path) {

    return "";

  }


  const safeSeam =
    Math.max(
      0,
      Number(seam) || 0
    );


  if (safeSeam <= 0) {

    return "";

  }


  return `

    <path
      class="seam-line"
      d="${path}"
      data-seam="${safeSeam}"
      vector-effect="non-scaling-stroke"
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

  const centerY =
    (y1 + y2) / 2;


  return `

    <line
      class="grain"
      x1="${x}"
      y1="${y1}"
      x2="${x}"
      y2="${y2}"
    />

    <polygon
      class="grain-arrow"
      points="
        ${x},${y1}
        ${x - 1.2},${y1 + 3}
        ${x + 1.2},${y1 + 3}
      "
    />

    <polygon
      class="grain-arrow"
      points="
        ${x},${y2}
        ${x - 1.2},${y2 - 3}
        ${x + 1.2},${y2 - 3}
      "
    />

    <text
      class="small grain-text"
      x="${x + 1.5}"
      y="${centerY}"
    >
      GRAIN
    </text>

  `;

}


/* =========================================================
   FOLD LINE
========================================================= */

function createFoldLine(
  x,
  y1,
  y2
) {

  return `

    <line
      class="fold-line"
      x1="${x}"
      y1="${y1}"
      x2="${x}"
      y2="${y2}"
    />

    <text
      class="small"
      x="${x + 1.5}"
      y="${(y1 + y2) / 2}"
    >
      FOLD
    </text>

  `;

}


/* =========================================================
   NOTCH
========================================================= */

function createNotch(
  x,
  y,
  size = 0.8
) {

  return `

    <path
      class="notch"
      d="
        M ${x - size} ${y - size}
        L ${x} ${y}
        L ${x + size} ${y - size}
      "
    />

  `;

}


/* =========================================================
   LABEL
========================================================= */

function createLabel(
  text,
  x,
  y,
  options = {}
) {

  const anchor =
    options.anchor ||
    "start";


  const fontSize =
    options.fontSize ||
    2.2;


  return `

    <text
      class="label"
      x="${x}"
      y="${y}"
      text-anchor="${anchor}"
      font-size="${fontSize}"
    >
      ${escapeText(text)}
    </text>

  `;

}


/* =========================================================
   PIECE INFORMATION
========================================================= */

function createPieceInfo(
  title,
  x,
  y,
  seam
) {

  return `

    ${createLabel(
      title,
      x,
      y,
      {
        fontSize: 2.4
      }
    )}

    <text
      class="small"
      x="${x}"
      y="${y + 3}"
    >
      SEAM ${Number(seam || 0).toFixed(1)} cm
    </text>

  `;

}


/* =========================================================
   STYLE
   ---------------------------------------------------------
   CSS ditanamkan ke SVG agar file SVG hasil download
   tetap mempunyai tampilan dasar yang benar.
========================================================= */

function createSvgStyle() {

  return `

    <style>

      .grid {

        stroke:
          #d8d8d8;

        stroke-width:
          0.08;

        fill:
          none;

      }


      .pattern {

        fill:
          rgba(70, 130, 180, 0.08);

        stroke:
          #111;

        stroke-width:
          0.35;

        vector-effect:
          non-scaling-stroke;

      }


      .seam-line {

        fill:
          none;

        stroke:
          #777;

        stroke-width:
          0.22;

        stroke-dasharray:
          1.5 1;

        vector-effect:
          non-scaling-stroke;

        pointer-events:
          none;

      }


      .grain {

        stroke:
          #222;

        stroke-width:
          0.22;

        vector-effect:
          non-scaling-stroke;

      }


      .grain-arrow {

        fill:
          #222;

      }


      .fold-line {

        stroke:
          #555;

        stroke-width:
          0.2;

        stroke-dasharray:
          2 1;

        vector-effect:
          non-scaling-stroke;

      }


      .notch {

        stroke:
          #111;

        stroke-width:
          0.3;

        fill:
          none;

        vector-effect:
          non-scaling-stroke;

      }


      .label {

        font-family:
          Arial,
          sans-serif;

        font-size:
          2.2px;

        font-weight:
          600;

        fill:
          #111;

      }


      .small {

        font-family:
          Arial,
          sans-serif;

        font-size:
          1.5px;

        fill:
          #444;

      }


      .note {

        font-family:
          Arial,
          sans-serif;

        font-size:
          1.6px;

        fill:
          #333;

      }

    </style>

  `;

}


/* =========================================================
   CALCULATE VIEWBOX
   ---------------------------------------------------------
   Membuat area SVG sedikit lebih besar supaya label
   tidak terpotong.
========================================================= */

function calculateCanvasSize(
  bodice,
  sleeve
) {

  const points = [];


  /* -----------------------------------------
     BODICE FRONT
  ----------------------------------------- */

  if (
    bodice &&
    bodice.front
  ) {

    points.push(

      bodice.front.A,
      bodice.front.B,
      bodice.front.C,
      bodice.front.D,
      bodice.front.E,
      bodice.front.F

    );

  }


  /* -----------------------------------------
     BODICE BACK
  ----------------------------------------- */

  if (
    bodice &&
    bodice.back
  ) {

    points.push(

      bodice.back.A,
      bodice.back.B,
      bodice.back.C,
      bodice.back.D,
      bodice.back.E,
      bodice.back.F

    );

  }


  /* -----------------------------------------
     SLEEVE
  ----------------------------------------- */

  if (sleeve) {

    points.push(

      sleeve.left,
      sleeve.leftCap,
      sleeve.top,
      sleeve.rightCap,
      sleeve.right,
      sleeve.bottomLeft,
      sleeve.bottomRight

    );

  }


  const bounds =
    getPointBounds(points);


  /* -----------------------------------------
     Minimum canvas
  ----------------------------------------- */

  const width =
    Math.max(
      150,
      bounds.maxX + 15
    );


  const height =
    Math.max(
      75,
      bounds.maxY + 15
    );


  return {

    width,
    height

  };

}


/* =========================================================
   MAIN SVG RENDERER
========================================================= */

export function renderPattern(
  bodice,
  sleeve,
  measurements = {}
) {


  /* -----------------------------------------
     CANVAS
  ----------------------------------------- */

  const canvas =
    calculateCanvasSize(
      bodice,
      sleeve
    );


  const width =
    canvas.width;


  const height =
    canvas.height;


  /* -----------------------------------------
     GRID
  ----------------------------------------- */

  const grid =
    createGrid(
      width,
      height
    );


  /* -----------------------------------------
     SEAM
  ----------------------------------------- */

  const seam =
    Number(
      measurements.seam
    ) || 1;


  /* -----------------------------------------
     BODICE FRONT
  ----------------------------------------- */

  const frontPath =
    createBodicePath(
      bodice.front,
      true
    );


  /* -----------------------------------------
     BODICE BACK
  ----------------------------------------- */

  const backPath =
    createBodicePath(
      bodice.back,
      false
    );


  /* -----------------------------------------
     SLEEVE
  ----------------------------------------- */

  const sleevePath =
    createSleevePath(
      sleeve
    );


  /* -----------------------------------------
     SEAM PREVIEW
  ----------------------------------------- */

  const frontSeam =
    createSeamPreview(
      frontPath,
      seam
    );


  const backSeam =
    createSeamPreview(
      backPath,
      seam
    );


  const sleeveSeam =
    createSeamPreview(
      sleevePath,
      seam
    );


  /* -----------------------------------------
     GRAINLINES
  ----------------------------------------- */

  const frontGrain =
    createGrainline(
      14,
      18,
      35
    );


  const backGrain =
    createGrainline(
      59,
      18,
      35
    );


  const sleeveGrain =
    createGrainline(
      108,
      19,
      45
    );


  /* -----------------------------------------
     FOLD
  ----------------------------------------- */

  const frontFold =
    createFoldLine(
      10,
      15,
      45
    );


  const backFold =
    createFoldLine(
      55,
      15,
      45
    );


  /* -----------------------------------------
     NOTCHES
  ----------------------------------------- */

  const frontNotch =
    createNotch(
      bodice.front.D[0],
      bodice.front.D[1]
    );


  const backNotch =
    createNotch(
      bodice.back.D[0],
      bodice.back.D[1]
    );


  /* -----------------------------------------
     LABEL POSITIONS

     SLEEVE CUT 2 dibuat lebih ke kiri
     dan canvas diperlebar agar tidak
     terpotong.
  ----------------------------------------- */

  const frontLabel =
    createPieceInfo(
      "FRONT — FOLD",
      10,
      50,
      seam
    );


  const backLabel =
    createPieceInfo(
      "BACK — FOLD",
      55,
      50,
      seam
    );


  const sleeveLabel =
    createPieceInfo(
      "SLEEVE — CUT 2",
      94,
      53,
      seam
    );


  /* -----------------------------------------
     INFORMATION
  ----------------------------------------- */

  const information = `

    <text
      class="small"
      x="5"
      y="5"
    >
      PatternMaker V1.5
      • Units: cm
    </text>

  `;


  /* -----------------------------------------
     CAP EASE
  ----------------------------------------- */

  const capEase =
    Number(
      sleeve.capEase
    ) || 0;


  const note = `

    <text
      class="note"
      x="94"
      y="59"
    >
      Cap ease:
      ${capEase.toFixed(1)}
      cm
    </text>

  `;


  /* -----------------------------------------
     SVG
  ----------------------------------------- */

  return `

    <svg

      xmlns="http://www.w3.org/2000/svg"

      viewBox="
        0
        0
        ${width}
        ${height}
      "

      width="100%"

      height="auto"

      preserveAspectRatio="
        xMidYMid meet
      "

      role="img"

      aria-label="PatternMaker pattern preview"

    >

      ${createSvgStyle()}


      <!-- ===================================
           GRID
      ==================================== -->

      ${grid}


      <!-- ===================================
           FRONT
      ==================================== -->

      <path
        class="pattern"
        d="${frontPath}"
      />

      ${frontSeam}

      ${frontGrain}

      ${frontFold}

      ${frontNotch}

      ${frontLabel}


      <!-- ===================================
           BACK
      ==================================== -->

      <path
        class="pattern"
        d="${backPath}"
      />

      ${backSeam}

      ${backGrain}

      ${backFold}

      ${backNotch}

      ${backLabel}


      <!-- ===================================
           SLEEVE
      ==================================== -->

      <path
        class="pattern"
        d="${sleevePath}"
      />

      ${sleeveSeam}

      ${sleeveGrain}

      ${sleeveLabel}

      ${note}


      <!-- ===================================
           INFORMATION
      ==================================== -->

      ${information}

    </svg>

  `;

}


/* =========================================================
   EXPORT HELPER
========================================================= */

export function getPatternBounds(
  points
) {

  return getPointBounds(
    points
  );

}


/* =========================================================
   EXPORT PATH HELPERS
========================================================= */

export {

  createBodicePath,

  createSleevePath,

  createGrainline,

  createLabel

};
