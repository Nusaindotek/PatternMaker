/* =========================================
   PatternMaker V1.6
   SVG GEOMETRY ENGINE
   ---------------------------------------------------------
   Tugas:
   - menggambar bodice depan
   - menggambar bodice belakang
   - menggambar garis leher
   - menggambar kerung lengan
   - menggambar lengan
   - menampilkan grainline
   - menampilkan ukuran pola

   Semua ukuran menggunakan cm.
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
   SAFE POINT
========================================= */

function point(value) {

  if (
    !Array.isArray(value) ||
    value.length < 2
  ) {

    return [0, 0];

  }

  return value;

}


/* =========================================
   LINE
========================================= */

function line(
  p1,
  p2
) {

  p1 = point(p1);
  p2 = point(p2);

  return `
    L
    ${p2[0]}
    ${p2[1]}
  `;

}


/* =========================================
   CUBIC BEZIER
========================================= */

function cubic(
  p0,
  p1,
  p2,
  p3
) {

  p0 = point(p0);
  p1 = point(p1);
  p2 = point(p2);
  p3 = point(p3);

  return `
    M
    ${p0[0]}
    ${p0[1]}

    C
    ${p1[0]}
    ${p1[1]},

    ${p2[0]}
    ${p2[1]},

    ${p3[0]}
    ${p3[1]}
  `;

}


/* =========================================
   BODICE PATH
========================================= */

function createBodicePath(
  points,
  armhole,
  neckCurve,
  front = true
) {

  const A =
    point(points.A);

  const B =
    point(points.B);

  const C =
    point(points.C);

  const D =
    point(points.D);

  const E =
    point(points.E);

  const F =
    point(points.F);


  let path = `

    M
    ${A[0]}
    ${A[1]}

  `;


  /* =======================================
     GARIS TENGAH DEPAN / BELAKANG
  ======================================= */

  path += `

    L
    ${F[0]}
    ${F[1]}

    L
    ${E[0]}
    ${E[1]}

  `;


  /* =======================================
     GARIS SAMPING
     
     Dari pinggang menuju kerung lengan.
  ======================================= */

  path += `

    L
    ${D[0]}
    ${D[1]}

  `;


  /* =======================================
     KERUNG LENGAN
     
     Sekarang menggunakan data
     dari BODICE ENGINE.
  ======================================= */

  if (
    armhole &&
    armhole.length === 4
  ) {

    path += `

      C
      ${armhole[1][0]}
      ${armhole[1][1]},

      ${armhole[2][0]}
      ${armhole[2][1]},

      ${armhole[3][0]}
      ${armhole[3][1]}

    `;

  }

  else {

    path += `

      C
      ${D[0]}
      ${D[1] - 3},

      ${C[0] + 1}
      ${C[1] + 1},

      ${C[0]}
      ${C[1]}

    `;

  }


  /* =======================================
     BAHU
  ======================================= */

  path += `

    L
    ${B[0]}
    ${B[1]}

  `;


  /* =======================================
     LEHER
  ======================================= */

  if (
    neckCurve &&
    neckCurve.length === 4
  ) {

    /*
      Kurva leher bergerak
      dari B kembali ke A.

      Karena neckCurve dibuat
      dari A menuju B,
      kita gambar dengan urutan
      terbalik.
    */

    path += `

      C
      ${neckCurve[2][0]}
      ${neckCurve[2][1]},

      ${neckCurve[1][0]}
      ${neckCurve[1][1]},

      ${neckCurve[0][0]}
      ${neckCurve[0][1]}

    `;

  }

  else {

    path += `

      L
      ${A[0]}
      ${A[1]}

    `;

  }


  path += `

    Z

  `;


  return path;

}


/* =========================================
   SLEEVE PATH
========================================= */

function createSleevePath(s) {

  const left =
    point(s.left);

  const leftCap =
    point(s.leftCap);

  const top =
    point(s.top);

  const rightCap =
    point(s.rightCap);

  const right =
    point(s.right);

  const bottomLeft =
    point(s.bottomLeft);

  const bottomRight =
    point(s.bottomRight);


  return `

    M
    ${left[0]}
    ${left[1]}

    L
    ${leftCap[0]}
    ${leftCap[1]}

    C
    ${leftCap[0] + 3}
    ${leftCap[1] - 3},

    ${top[0] - 2}
    ${top[1] + 1},

    ${top[0]}
    ${top[1]}

    C
    ${top[0] + 2}
    ${top[1] + 1},

    ${rightCap[0] - 3}
    ${rightCap[1] - 3},

    ${rightCap[0]}
    ${rightCap[1]}

    L
    ${right[0]}
    ${right[1]}

    L
    ${bottomRight[0]}
    ${bottomRight[1]}

    L
    ${bottomLeft[0]}
    ${bottomLeft[1]}

    L
    ${left[0]}
    ${left[1]}

    Z

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
   LABEL
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
   DIMENSION LINE
========================================= */

function createDimension(
  x1,
  y1,
  x2,
  y2,
  text
) {

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
      x="${(x1 + x2) / 2}"
      y="${(y1 + y2) / 2 - 1}"
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
     UKURAN CANVAS
  ======================================= */

  const width =
    155;

  const height =
    Math.max(
      65,
      (measurements.bodyLength || 40) + 25
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
     BODICE DEPAN
  ======================================= */

  const frontPath =
    createBodicePath(

      bodice.front,

      bodice.frontArmhole,

      bodice.frontNeck,

      true

    );


  /* =======================================
     BODICE BELAKANG
  ======================================= */

  const backPath =
    createBodicePath(

      bodice.back,

      bodice.backArmhole,

      bodice.backNeck,

      false

    );


  /* =======================================
     LENGAN
  ======================================= */

  const sleevePath =
    createSleevePath(
      sleeve
    );


  /* =======================================
     POSISI LABEL
  ======================================= */

  const frontLabelX =
    bodice.front.F[0] + 2;


  const backLabelX =
    bodice.back.F[0] + 2;


  const sleeveLabelX =
    sleeve.left[0] + 2;


  /* =======================================
     DIMENSI DADA
  ======================================= */

  const bustDimension =

    createDimension(

      bodice.front.F[0],

      bodice.front.D[1] - 2,

      bodice.front.D[0],

      bodice.front.D[1] - 2,

      `1/4 dada ${bodice.bustQ.toFixed(1)} cm`

    );


  /* =======================================
     DIMENSI PINGGANG
  ======================================= */

  const waistDimension =

    createDimension(

      bodice.front.F[0],

      bodice.front.E[1] + 3,

      bodice.front.E[0],

      bodice.front.E[1] + 3,

      `1/4 pinggang ${bodice.waistQ.toFixed(1)} cm`

    );


  /* =======================================
     SVG
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

      width="100%"

      height="auto"

      preserveAspectRatio="xMidYMid meet"

    >

      <!-- =================================
           GRID
      ================================= -->

      ${grid}


      <!-- =================================
           BODICE DEPAN
      ================================= -->

      <path

        class="pattern"

        d="${frontPath}"

      />


      <!-- =================================
           BODICE BELAKANG
      ================================= -->

      <path

        class="pattern"

        d="${backPath}"

      />


      <!-- =================================
           LENGAN
      ================================= -->

      <path

        class="pattern"

        d="${sleevePath}"

      />


      <!-- =================================
           GRAINLINE
      ================================= -->

      ${createGrainline(

        bodice.front.F[0] + 3,

        bodice.front.A[1] + 8,

        bodice.front.F[1] - 5

      )}


      ${createGrainline(

        bodice.back.F[0] + 3,

        bodice.back.A[1] + 8,

        bodice.back.F[1] - 5

      )}


      ${createGrainline(

        sleeve.top[0],

        sleeve.top[1] + 5,

        sleeve.right[1] - 5

      )}


      <!-- =================================
           LABEL DEPAN
      ================================= -->

      ${createLabel(

        "DEPAN — POTONG 1x LIPATAN",

        frontLabelX,

        bodice.front.F[1] + 6

      )}


      <!-- =================================
           LABEL BELAKANG
      ================================= -->

      ${createLabel(

        "BELAKANG — POTONG 1x LIPATAN",

        backLabelX,

        bodice.back.F[1] + 6

      )}


      <!-- =================================
           LABEL LENGAN
      ================================= -->

      ${createLabel(

        "LENGAN — POTONG 2",

        sleeveLabelX,

        sleeve.right[1] + 6

      )}


      <!-- =================================
           DIMENSI
      ================================= -->

      ${bustDimension}

      ${waistDimension}


      <!-- =================================
           INFORMASI
      ================================= -->

      <text
        class="small"
        x="5"
        y="5"
      >
        PatternMaker
        • Pola Anak
        • Satuan cm
      </text>


      <!-- =================================
           INFORMASI UKURAN
      ================================= -->

      <text
        class="small"
        x="5"
        y="8"
      >
        Lingkar dada:
        ${Number(measurements.bust || 0).toFixed(1)}
        cm
      </text>


      <text
        class="small"
        x="45"
        y="8"
      >
        Lingkar pinggang:
        ${Number(measurements.waist || 0).toFixed(1)}
        cm
      </text>


      <text
        class="small"
        x="90"
        y="8"
      >
        Panjang badan:
        ${Number(measurements.bodyLength || 0).toFixed(1)}
        cm
      </text>


      <!-- =================================
           ARMHOLE INFORMATION
      ================================= -->

      <text
        class="note"
        x="5"
        y="${height - 4}"
      >
        Kerung lengan:
        ${Number(bodice.armholeLength || 0).toFixed(1)}
        cm
      </text>


      <!-- =================================
           NEGATIVE EASE
      ================================= -->

      <text
        class="note"
        x="50"
        y="${height - 4}"
      >
        Pengurangan ukuran:
        ${Number(measurements.negativeEase || 0).toFixed(1)}
        %
      </text>


      <!-- =================================
           BAHAN
      ================================= -->

      <text
        class="note"
        x="105"
        y="${height - 4}"
      >
        ${measurements.fabric === "sublime_jersey"
          ? "Sublime Jersey"
          : measurements.fabric}
      </text>

    </svg>

  `;

}
