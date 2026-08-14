/* =========================================
   PatternMaker V1.3
   SVG GEOMETRY ENGINE
========================================= */


/* =========================================
   GRID
========================================= */

function createGrid(width, height) {

  let output = "";

  for (let x = 0; x <= width; x += 5) {

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

  for (let y = 0; y <= height; y += 5) {

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

function createBodicePath(points, front = true) {

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
    M ${A[0]} ${A[1] + neckDepth}

    L ${A[0]} ${F[1]}

    L ${E[0]} ${E[1]}

    L ${D[0]} ${D[1]}

    C
      ${D[0]} ${D[1] - 2.4}
      ${C[0] + 1.1} ${C[1] + 0.5}
      ${C[0]} ${C[1]}

    L ${B[0]} ${B[1]}

    Q
      ${A[0] + neckDepth * 0.85} ${A[1]}
      ${A[0]} ${A[1] + neckDepth}

    Z
  `;

}


/* =========================================
   SLEEVE PATH
========================================= */

function createSleevePath(s) {

  return `
    M ${s.left[0]} ${s.left[1]}

    L ${s.leftCap[0]} ${s.leftCap[1]}

    C
      ${s.leftCap[0] + 3} ${s.leftCap[1] - 3}
      ${s.top[0] - 2} ${s.top[1] + 1}
      ${s.top[0]} ${s.top[1]}

    C
      ${s.top[0] + 2} ${s.top[1] + 1}
      ${s.rightCap[0] - 3} ${s.rightCap[1] - 3}
      ${s.rightCap[0]} ${s.rightCap[1]}

    L ${s.right[0]} ${s.right[1]}

    L ${s.bottomRight[0]} ${s.bottomRight[1]}

    L ${s.bottomLeft[0]} ${s.bottomLeft[1]}

    L ${s.left[0]} ${s.left[1]}

    Z
  `;

}


/* =========================================
   GRAINLINE
========================================= */

function createGrainline(x, y1, y2) {

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

function createLabel(text, x, y) {

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


  /* =======================================
     HITUNG UKURAN SVG
  ======================================= */

  const width = 140;

  const height = Math.max(
    65,
    measurements.bodyLength + 25,
    measurements.sleeveLength + 25
  );


  /* =======================================
     GRID
  ======================================= */

  const grid =
    createGrid(
      width,
      height
    );


  /* =======================================
     BODICE FRONT
  ======================================= */

  const frontPath =
    createBodicePath(
      bodice.front,
      true
    );


  /* =======================================
     BODICE BACK
  ======================================= */

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
     SVG
  ======================================= */

  return `

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${width} ${height}"
      width="100%"
      height="auto"
      preserveAspectRatio="xMidYMid meet"
    >

      ${grid}


      <!-- FRONT -->

      <path
        class="pattern"
        d="${frontPath}"
      />


      <!-- BACK -->

      <path
        class="pattern"
        d="${backPath}"
      />


      <!-- SLEEVE -->

      <path
        class="pattern"
        d="${sleevePath}"
      />


      <!-- FRONT GRAIN -->

      ${createGrainline(
        14,
        18,
        35
      )}


      <!-- BACK GRAIN -->

      ${createGrainline(
        59,
        18,
        35
      )}


      <!-- SLEEVE GRAIN -->

      ${createGrainline(
        108,
        19,
        45
      )}


      <!-- LABELS -->

      ${createLabel(
        "FRONT - FOLD",
        10,
        50
      )}


      ${createLabel(
        "BACK - FOLD",
        55,
        50
      )}


      ${createLabel(
        "SLEEVE - CUT 2",
        95,
        52
      )}


      <!-- TITLE -->

      <text
        class="small"
        x="5"
        y="5"
      >
        PatternMaker V1.3 - Units: cm
      </text>


      <!-- CAP EASE -->

      <text
        class="note"
        x="95"
        y="57"
      >
        Cap ease:
        ${Number(sleeve.capEase || 0).toFixed(1)}
        cm
      </text>

    </svg>

  `;

}