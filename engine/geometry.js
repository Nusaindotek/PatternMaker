/* =========================================
   PatternMaker V1.2
   SVG GEOMETRY ENGINE
========================================= */


/* =========================================
   GRID
========================================= */

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


/* =========================================
   BODICE PATH
========================================= */

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


  /*
    Kedalaman neckline.

    Front lebih dalam
    dibandingkan back.
  */

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

    /*
      Armhole curve
    */

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

    /*
      Shoulder / neckline
    */

    Q
    ${A[0] + neckDepth * 0.85}
    ${A[1]},

    ${A[0]}
    ${A[1] + neckDepth}
  `;

}


/* =========================================
   SLEEVE PATH
========================================= */

function createSleevePath(s) {

  return `
    M
    ${s.left[0]}
    ${s.left[1]}

    L
    ${s.leftCap[0]}
    ${s.leftCap[1]}

    /*
      Sleeve cap kiri
    */

    C
    ${s.leftCap[0] + 3}
    ${s.leftCap[1] - 3},

    ${s.top[0] - 2}
    ${s.top[1] + 1},

    ${s.top[0]}
    ${s.top[1]}

    /*
      Sleeve cap kanan
    */

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

    /*
      Ujung lengan
    */

    L
    ${s.bottomRight[0]}
    ${s.bottomRight[1]}

    L
    ${s.bottomLeft[0]}
    ${s.bottomLeft[1]}

    L
    ${s.left[0]}
    ${s.left[1]}
  `;

}


/* =========================================
   GRAINLINE
========================================= */

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

    <text
      class="small"
      x="${x + 1}"
      y="${(y1 + y2) / 2}"
    >
      GRAIN
    </text>
  `;

}


/* =========================================
   TEXT LABEL
========================================= */

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


/* =========================================
   MAIN SVG RENDERER
========================================= */

export function renderPattern(
  bodice,
  sleeve,
  measurements
) {

  const width =
    140;

  const height =
    65;


  /* =======================================
     GRID
  ======================================= */

  const grid =
    createGrid(
      width,
      height
    );


  /* =======================================
     BODICE
  ======================================= */

  const frontPath =
    createBodicePath(
      bodice.front,
      true
    );


  const backPath =
    createBodicePath(
      bodice.back,
      false
    );


  /* =======================================
     SLEEVE
  ======================================= */

  const sleevePath =
    createSleevePath(
      sleeve
    );


  /* =======================================
     RETURN SVG
  ======================================= */

  return `

    <svg

      xmlns="http://www.w3.org/2000/svg"

      viewBox="
        0
        0
        ${width}
        ${height}
      "

      width="${width}cm"

      height="${height}cm"

    >

      <!-- GRID -->

      ${grid}


      <!-- ================================
           BODICE FRONT
      ================================= -->

      <path
        class="pattern"
        d="${frontPath}"
      />


      <!-- ================================
           BODICE BACK
      ================================= -->

      <path
        class="pattern"
        d="${backPath}"
      />


      <!-- ================================
           SLEEVE
      ================================= -->

      <path
        class="pattern"
        d="${sleevePath}"
      />


      <!-- ================================
           GRAINLINES
      ================================= -->

      ${createGrainline(
        14,
        18,
        35
      )}

      ${createGrainline(
        59,
        18,
        35
      )}

      ${createGrainline(
        108,
        19,
        45
      )}


      <!-- ================================
           LABELS
      ================================= -->

      ${createLabel(
        "FRONT — FOLD",
        10,
        50
      )}

      ${createLabel(
        "BACK — FOLD",
        55,
        50
      )}

      ${createLabel(
        "SLEEVE — CUT 2",
        95,
        52
      )}


      <!-- ================================
           INFORMATION
      ================================= -->

      <text
        class="small"
        x="5"
        y="5"
      >
        PatternMaker V1.2
        • Prototype
        • Units: cm
      </text>


      <text
        class="note"
        x="95"
        y="57"
      >
        Cap ease:
        ${sleeve.capEase.toFixed(1)}
        cm
      </text>

    </svg>

  `;

}
