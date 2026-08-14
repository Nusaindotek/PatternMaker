/* =========================================================
   PatternMaker
   SVG GEOMETRY ENGINE V1.4
   ---------------------------------------------------------
   Fungsi:
   - menggambar bodice depan
   - menggambar bodice belakang
   - menggambar sleeve
   - neckline curve
   - armhole curve
   - grainline
   - label pola
   - grid
   - responsive SVG preview
========================================================= */


/* =========================================================
   FORMAT NUMBER
========================================================= */

function n(value, digits = 2) {

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Number(
    number.toFixed(digits)
  );

}


/* =========================================================
   GRID
========================================================= */

function createGrid(
  width,
  height,
  step = 5
) {

  let output = "";

  for (
    let x = 0;
    x <= width;
    x += step
  ) {

    output += `
      <line
        class="grid"
        x1="${n(x)}"
        y1="0"
        x2="${n(x)}"
        y2="${n(height)}"
      />
    `;

  }


  for (
    let y = 0;
    y <= height;
    y += step
  ) {

    output += `
      <line
        class="grid"
        x1="0"
        y1="${n(y)}"
        x2="${n(width)}"
        y2="${n(y)}"
      />
    `;

  }


  return output;

}


/* =========================================================
   CREATE BODICE PATH
   ---------------------------------------------------------
   Urutan:
   neckline
   shoulder
   armhole
   side seam
   waist
   center fold
========================================================= */

function createBodicePath(
  points,
  front = true
) {

  if (!points) {
    return "";
  }


  const {
    A,
    B,
    C,
    D,
    E,
    F
  } = points;


  if (
    !A ||
    !B ||
    !C ||
    !D ||
    !E ||
    !F
  ) {

    return "";

  }


  /*
    Front neckline lebih dalam.
    Back neckline lebih dangkal.
  */

  const neckDepth =
    front
      ? 4.5
      : 2.5;


  /*
    Titik neckline.
  */

  const neckStart = [
    A[0],
    A[1] + neckDepth
  ];


  /*
    Gunakan armhole dari Bodice Engine
    jika tersedia.
  */

  const armhole = front
    ? points.frontArm
    : points.backArm;


  /*
    Jika armhole tidak tersedia,
    gunakan fallback sederhana.
  */

  let armPath = "";


  if (
    armhole &&
    armhole.length >= 4
  ) {

    armPath = `

      C
      ${n(armhole[1][0])}
      ${n(armhole[1][1])},

      ${n(armhole[2][0])}
      ${n(armhole[2][1])},

      ${n(armhole[3][0])}
      ${n(armhole[3][1])}

    `;

  }

  else {

    armPath = `

      C
      ${n(C[0] + 1.2)}
      ${n(C[1] + 3)},

      ${n(D[0] + 1.2)}
      ${n(D[1] - 3)},

      ${n(D[0])}
      ${n(D[1])}

    `;

  }


  /*
    Neckline control point.
  */

  const neckControlX =
    A[0] +
    Math.max(
      1,
      (B[0] - A[0]) * 0.45
    );


  const neckControlY =
    A[1] +
    neckDepth;


  /*
    Main path.
  */

  return `

    M
    ${n(neckStart[0])}
    ${n(neckStart[1])}

    Q
    ${n(neckControlX)}
    ${n(neckControlY)},

    ${n(B[0])}
    ${n(B[1])}

    L
    ${n(C[0])}
    ${n(C[1])}

    ${armPath}

    L
    ${n(E[0])}
    ${n(E[1])}

    L
    ${n(F[0])}
    ${n(F[1])}

    L
    ${n(neckStart[0])}
    ${n(neckStart[1])}

    Z

  `;

}


/* =========================================================
   SLEEVE PATH
========================================================= */

function createSleevePath(
  sleeve
) {

  if (!sleeve) {
    return "";
  }


  const {
    left,
    leftCap,
    top,
    rightCap,
    right,
    bottomLeft,
    bottomRight
  } = sleeve;


  if (
    !left ||
    !leftCap ||
    !top ||
    !rightCap ||
    !right ||
    !bottomLeft ||
    !bottomRight
  ) {

    return "";

  }


  /*
    Sleeve cap kiri
  */

  const leftControl1 = [

    leftCap[0] + 3,
    leftCap[1] - 3

  ];


  const leftControl2 = [

    top[0] - 2,
    top[1] + 1

  ];


  /*
    Sleeve cap kanan
  */

  const rightControl1 = [

    top[0] + 2,
    top[1] + 1

  ];


  const rightControl2 = [

    rightCap[0] - 3,
    rightCap[1] - 3

  ];


  return `

    M
    ${n(left[0])}
    ${n(left[1])}

    L
    ${n(leftCap[0])}
    ${n(leftCap[1])}

    C
    ${n(leftControl1[0])}
    ${n(leftControl1[1])},

    ${n(leftControl2[0])}
    ${n(leftControl2[1])},

    ${n(top[0])}
    ${n(top[1])}

    C
    ${n(rightControl1[0])}
    ${n(rightControl1[1])},

    ${n(rightControl2[0])}
    ${n(rightControl2[1])},

    ${n(rightCap[0])}
    ${n(rightCap[1])}

    L
    ${n(right[0])}
    ${n(right[1])}

    L
    ${n(bottomRight[0])}
    ${n(bottomRight[1])}

    L
    ${n(bottomLeft[0])}
    ${n(bottomLeft[1])}

    L
    ${n(left[0])}
    ${n(left[1])}

    Z

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
      x1="${n(x)}"
      y1="${n(y1)}"
      x2="${n(x)}"
      y2="${n(y2)}"
    />

    <text
      class="small"
      x="${n(x + 1)}"
      y="${n((y1 + y2) / 2)}"
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
      x="${n(x)}"
      y="${n(y)}"
    >
      ${text}
    </text>

  `;

}


/* =========================================================
   PIECE TITLE
========================================================= */

function createPieceTitle(
  text,
  x,
  y
) {

  return `

    <text
      class="pieceTitle"
      x="${n(x)}"
      y="${n(y)}"
    >
      ${text}
    </text>

  `;

}


/* =========================================================
   FIND ALL POINTS
   ---------------------------------------------------------
   Digunakan untuk menentukan ukuran SVG otomatis.
========================================================= */

function collectPoints(
  bodice,
  sleeve
) {

  const points = [];


  /*
    Bodice Front
  */

  if (
    bodice &&
    bodice.front
  ) {

    Object.values(
      bodice.front
    ).forEach(point => {

      if (
        Array.isArray(point) &&
        point.length >= 2
      ) {

        points.push(point);

      }

    });

  }


  /*
    Bodice Back
  */

  if (
    bodice &&
    bodice.back
  ) {

    Object.values(
      bodice.back
    ).forEach(point => {

      if (
        Array.isArray(point) &&
        point.length >= 2
      ) {

        points.push(point);

      }

    });

  }


  /*
    Front armhole
  */

  if (
    bodice &&
    bodice.frontArm
  ) {

    bodice.frontArm.forEach(point => {

      if (
        Array.isArray(point) &&
        point.length >= 2
      ) {

        points.push(point);

      }

    });

  }


  /*
    Back armhole
  */

  if (
    bodice &&
    bodice.backArm
  ) {

    bodice.backArm.forEach(point => {

      if (
        Array.isArray(point) &&
        point.length >= 2
      ) {

        points.push(point);

      }

    });

  }


  /*
    Sleeve
  */

  if (sleeve) {

    Object.values(
      sleeve
    ).forEach(value => {

      if (
        Array.isArray(value) &&
        value.length >= 2
      ) {

        points.push(value);

      }

    });

  }


  return points;

}


/* =========================================================
   CALCULATE VIEWBOX
========================================================= */

function calculateViewBox(
  points
) {

  if (
    !points ||
    !points.length
  ) {

    return {

      minX: 0,
      minY: 0,
      width: 140,
      height: 65

    };

  }


  const xs =
    points.map(
      point => Number(point[0])
    );


  const ys =
    points.map(
      point => Number(point[1])
    );


  const minX =
    Math.min(...xs);


  const maxX =
    Math.max(...xs);


  const minY =
    Math.min(...ys);


  const maxY =
    Math.max(...ys);


  const padding =
    8;


  return {

    minX:
      minX - padding,

    minY:
      minY - padding,

    width:
      Math.max(
        40,
        maxX - minX + padding * 2
      ),

    height:
      Math.max(
        40,
        maxY - minY + padding * 2
      )

  };

}


/* =========================================================
   MAIN SVG RENDERER
========================================================= */

export function renderPattern(
  bodice,
  sleeve,
  measurements
) {


  /*
    Kumpulkan semua titik
    untuk menentukan viewBox.
  */

  const points =
    collectPoints(
      bodice,
      sleeve
    );


  const viewBox =
    calculateViewBox(
      points
    );


  const width =
    viewBox.width;


  const height =
    viewBox.height;


  /*
    Grid.
  */

  const grid =
    createGrid(
      width,
      height
    );


  /*
    Bodice Front.
  */

  const frontPath =
    createBodicePath(
      bodice.front,
      true
    );


  /*
    Bodice Back.
  */

  const backPath =
    createBodicePath(
      bodice.back,
      false
    );


  /*
    Sleeve.
  */

  const sleevePath =
    createSleevePath(
      sleeve
    );


  /*
    Posisi label.
  */

  const frontLabelX =
    bodice.front.A[0];


  const frontLabelY =
    bodice.front.F[1] + 6;


  const backLabelX =
    bodice.back.A[0];


  const backLabelY =
    bodice.back.F[1] + 6;


  const sleeveLabelX =
    sleeve.left[0];


  const sleeveLabelY =
    sleeve.left[1] + 6;


  /*
    Grainline Front.
  */

  const frontGrainX =
    bodice.front.A[0] +
    4;


  const frontGrainY1 =
    bodice.front.B[1] +
    7;


  const frontGrainY2 =
    bodice.front.F[1] -
    5;


  /*
    Grainline Back.
  */

  const backGrainX =
    bodice.back.A[0] +
    4;


  const backGrainY1 =
    bodice.back.B[1] +
    7;


  const backGrainY2 =
    bodice.back.F[1] -
    5;


  /*
    Grainline Sleeve.
  */

  const sleeveGrainX =
    sleeve.top[0];


  const sleeveGrainY1 =
    sleeve.top[1] +
    5;


  const sleeveGrainY2 =
    sleeve.left[1] -
    5;


  /*
    Cap ease.
  */

  const capEase =
    sleeve &&
    Number.isFinite(
      Number(sleeve.capEase)
    )

      ? Number(sleeve.capEase)

      : 0;


  /*
    Material.
  */

  const material =
    measurements &&
    measurements.fabric

      ? measurements.fabric

      : "";


  /*
    Age.
  */

  const age =
    measurements &&
    measurements.age

      ? measurements.age

      : "";


  /* =======================================================
     SVG
  ======================================================= */

  return `

    <svg

      xmlns="http://www.w3.org/2000/svg"

      viewBox="
        ${n(viewBox.minX)}
        ${n(viewBox.minY)}
        ${n(viewBox.width)}
        ${n(viewBox.height)}
      "

      width="100%"

      preserveAspectRatio="xMidYMid meet"

      role="img"

      aria-label="PatternMaker pattern preview"

    >

      <style>

        .grid {

          stroke:
            #e5e7eb;

          stroke-width:
            0.15;

          fill:
            none;

        }


        .pattern {

          fill:
            rgba(255,255,255,0.55);

          stroke:
            #111827;

          stroke-width:
            0.45;

          stroke-linejoin:
            round;

          stroke-linecap:
            round;

        }


        .grain {

          stroke:
            #374151;

          stroke-width:
            0.3;

          stroke-dasharray:
            1.5 1;

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
            #111827;

        }


        .pieceTitle {

          font-family:
            Arial,
            sans-serif;

          font-size:
            2.6px;

          font-weight:
            700;

          fill:
            #111827;

        }


        .small {

          font-family:
            Arial,
            sans-serif;

          font-size:
            1.5px;

          fill:
            #4b5563;

        }


        .note {

          font-family:
            Arial,
            sans-serif;

          font-size:
            1.7px;

          fill:
            #374151;

        }

      </style>


      <!-- =========================================
           GRID
      ========================================== -->

      <g>

        ${grid}

      </g>


      <!-- =========================================
           FRONT BODICE
      ========================================== -->

      <path
        class="pattern"
        d="${frontPath}"
      />


      ${createPieceTitle(
        "FRONT",
        frontLabelX,
        frontLabelY - 3
      )}


      ${createLabel(
        "FRONT — FOLD",
        frontLabelX,
        frontLabelY
      )}


      ${createGrainline(
        frontGrainX,
        frontGrainY1,
        frontGrainY2
      )}


      <!-- =========================================
           BACK BODICE
      ========================================== -->

      <path
        class="pattern"
        d="${backPath}"
      />


      ${createPieceTitle(
        "BACK",
        backLabelX,
        backLabelY - 3
      )}


      ${createLabel(
        "BACK — FOLD",
        backLabelX,
        backLabelY
      )}


      ${createGrainline(
        backGrainX,
        backGrainY1,
        backGrainY2
      )}


      <!-- =========================================
           SLEEVE
      ========================================== -->

      <path
        class="pattern"
        d="${sleevePath}"
      />


      ${createPieceTitle(
        "SLEEVE",
        sleeveLabelX,
        sleeveLabelY - 3
      )}


      ${createLabel(
        "SLEEVE — CUT 2",
        sleeveLabelX,
        sleeveLabelY
      )}


      ${createGrainline(
        sleeveGrainX,
        sleeveGrainY1,
        sleeveGrainY2
      )}


      <!-- =========================================
           HEADER INFORMATION
      ========================================== -->

      <text
        class="small"
        x="${n(viewBox.minX + 3)}"
        y="${n(viewBox.minY + 4)}"
      >
        PatternMaker V1.4
      </text>


      <text
        class="small"
        x="${n(viewBox.minX + 3)}"
        y="${n(viewBox.minY + 6)}"
      >
        ${age ? `Age: ${age} years` : ""}
        ${material ? ` • ${material}` : ""}
      </text>


      <!-- =========================================
           SLEEVE CAP INFO
      ========================================== -->

      <text
        class="note"
        x="${n(sleeveLabelX)}"
        y="${n(sleeveLabelY + 3)}"
      >
        Cap ease:
        ${n(capEase, 1)}
        cm
      </text>


    </svg>

  `;

}