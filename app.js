/* =========================================================
   PatternMaker V1.5
   MAIN APPLICATION
   ---------------------------------------------------------
   ENGINE:
   - Measurement Engine
   - Bodice Engine
   - Sleeve Engine
   - Geometry Engine
   - Fabric Engine
   - Fabric Optimizer
   - Fabric Nesting Preview
========================================================= */


/* =========================================================
   ENGINE IMPORT
========================================================= */

import {
  getMeasurements
} from "./engine/measurements.js";


import {
  makeBodice
} from "./engine/bodice.js";


import {
  makeSleeve
} from "./engine/sleeve.js";


import {
  renderPattern
} from "./engine/geometry.js";


import {
  createFabric
} from "./engine/fabric.js";


/* =========================================================
   GLOBAL STATE
========================================================= */

let lastSvg = "";

let lastMeasurements = null;

let lastBodice = null;

let lastSleeve = null;

let lastFabric = null;

let lastOptimization = null;


/* =========================================================
   HELPER
========================================================= */

function el(id) {

  return document.getElementById(id);

}


function number(id, fallback = 0) {

  const node = el(id);

  if (!node) {
    return fallback;
  }

  const value =
    Number(node.value);

  return Number.isFinite(value)
    ? value
    : fallback;

}


function round(value, digits = 1) {

  const factor =
    Math.pow(10, digits);

  return Math.round(
    value * factor
  ) / factor;

}


/* =========================================================
   MATERIAL NAME
========================================================= */

function materialName(key) {

  const names = {

    sublime_jersey:
      "Sublime Jersey",

    rib_knit:
      "Rib Knit",

    cotton:
      "Cotton",

    woven:
      "Woven / Non Stretch"

  };

  return names[key] || key;

}


/* =========================================================
   UPDATE FABRIC INFORMATION
========================================================= */

function updateFabricInformation() {

  const measurements =
    getMeasurements();


  const fabric =
    createFabric({

      material:
        measurements.fabric,

      width:
        measurements.fabricWidth,

      length:
        measurements.fabricLength,

      selvedgeLeft:
        measurements.selvedgeLeft,

      selvedgeRight:
        measurements.selvedgeRight

    });


  lastFabric =
    fabric;


  if (el("materialName")) {

    el("materialName").textContent =
      fabric.materialName;

  }


  if (el("displayFabricWidth")) {

    el("displayFabricWidth").textContent =
      fabric.width;

  }


  if (el("effectiveWidth")) {

    el("effectiveWidth").textContent =
      fabric.effectiveWidth;

  }


  if (el("displayFabricLength")) {

    el("displayFabricLength").textContent =
      fabric.length;

  }


  if (el("fabricStretch")) {

    el("fabricStretch").textContent =
      fabric.stretch;

  }


  if (el("stretchDirection")) {

    el("stretchDirection").textContent =
      fabric.stretchDirection;

  }


  if (el("allowedRotation")) {

    el("allowedRotation").textContent =
      fabric.allowedRotation
        .map(value => value + "°")
        .join(", ");

  }


  return fabric;

}


/* =========================================================
   GENERATE PATTERN
========================================================= */

function generatePattern() {

  try {

    const measurements =
      getMeasurements();


    lastMeasurements =
      measurements;


    const fabric =
      updateFabricInformation();


    lastFabric =
      fabric;


    /* ---------------------------------------
       VALIDATION
    --------------------------------------- */

    if (
      measurements.bust <= 0 ||
      measurements.waist <= 0 ||
      measurements.shoulder <= 0 ||
      measurements.bodyLength <= 0
    ) {

      setStatus(
        "Periksa kembali ukuran anak."
      );

      return;

    }


    /* ---------------------------------------
       BODICE
    --------------------------------------- */

    const bodice =
      makeBodice(
        measurements
      );


    lastBodice =
      bodice;


    /* ---------------------------------------
       SLEEVE
    --------------------------------------- */

    const sleeve =
      makeSleeve(
        measurements,
        bodice
      );


    lastSleeve =
      sleeve;


    /* ---------------------------------------
       SVG POLA
    --------------------------------------- */

    const svg =
      renderPattern(
        bodice,
        sleeve,
        measurements
      );


    lastSvg =
      svg;


    /* ---------------------------------------
       PREVIEW
    --------------------------------------- */

    if (el("canvasWrap")) {

      el("canvasWrap").innerHTML =
        svg;

    }


    /* ---------------------------------------
       STATUS
    --------------------------------------- */

    setStatus(

      `Pola berhasil dibuat • ` +
      `Usia ${measurements.age} tahun • ` +
      `${fabric.materialName} • ` +
      `Kain ${fabric.width} cm`

    );


    /* ---------------------------------------
       RESET OPTIMIZER
    --------------------------------------- */

    resetOptimization();


    /* ---------------------------------------
       REMOVE OLD NESTING
    --------------------------------------- */

    removeNestingPreview();


  }

  catch (error) {

    console.error(
      "PatternMaker error:",
      error
    );


    setStatus(
      "Terjadi kesalahan saat membuat pola."
    );

  }

}


/* =========================================================
   STATUS
========================================================= */

function setStatus(message) {

  if (el("status")) {

    el("status").textContent =
      message;

  }

}


/* =========================================================
   RESET OPTIMIZATION
========================================================= */

function resetOptimization() {

  lastOptimization =
    null;


  if (el("resultWidth")) {

    el("resultWidth").textContent =
      "-";

  }


  if (el("resultLength")) {

    el("resultLength").textContent =
      "-";

  }


  if (el("resultMaterial")) {

    el("resultMaterial").textContent =
      "-";

  }


  if (el("resultQuantity")) {

    el("resultQuantity").textContent =
      "-";

  }


  if (el("resultStatus")) {

    el("resultStatus").textContent =
      "Belum dioptimasi";

  }


  removeNestingPreview();

}


/* =========================================================
   GET BOUNDS
========================================================= */

function getBounds(points) {

  if (
    !points ||
    !points.length
  ) {

    return {

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
   BUILD PATTERN PIECES
========================================================= */

function getPatternPieces() {

  if (
    !lastBodice ||
    !lastSleeve
  ) {

    return [];

  }


  const pieces = [];


  /* -----------------------------------------
     FRONT
  ----------------------------------------- */

  const frontPoints = [

    lastBodice.front.A,
    lastBodice.front.B,
    lastBodice.front.C,
    lastBodice.front.D,
    lastBodice.front.E,
    lastBodice.front.F

  ];


  const frontBounds =
    getBounds(
      frontPoints
    );


  pieces.push({

    name:
      "Front",

    width:
      frontBounds.width,

    height:
      frontBounds.height,

    quantity:
      1,

    rotation:
      0

  });


  /* -----------------------------------------
     BACK
  ----------------------------------------- */

  const backPoints = [

    lastBodice.back.A,
    lastBodice.back.B,
    lastBodice.back.C,
    lastBodice.back.D,
    lastBodice.back.E,
    lastBodice.back.F

  ];


  const backBounds =
    getBounds(
      backPoints
    );


  pieces.push({

    name:
      "Back",

    width:
      backBounds.width,

    height:
      backBounds.height,

    quantity:
      1,

    rotation:
      0

  });


  /* -----------------------------------------
     SLEEVE
  ----------------------------------------- */

  const sleevePoints = [

    lastSleeve.left,
    lastSleeve.leftCap,
    lastSleeve.top,
    lastSleeve.rightCap,
    lastSleeve.right,
    lastSleeve.bottomLeft,
    lastSleeve.bottomRight

  ];


  const sleeveBounds =
    getBounds(
      sleevePoints
    );


  pieces.push({

    name:
      "Sleeve",

    width:
      sleeveBounds.width,

    height:
      sleeveBounds.height,

    quantity:
      2,

    rotation:
      0

  });


  return pieces;

}


/* =========================================================
   ROTATION CHECK
========================================================= */

function canRotate(
  fabric,
  rotation
) {

  if (!fabric) {
    return false;
  }


  return (
    fabric.allowedRotation &&
    fabric.allowedRotation.includes(
      rotation
    )
  );

}


/* =========================================================
   CREATE PIECE INSTANCE
========================================================= */

function createPieceInstances(
  pieces,
  quantity
) {

  const instances = [];


  for (
    let garment = 1;
    garment <= quantity;
    garment++
  ) {

    for (
      const piece of pieces
    ) {

      for (
        let i = 0;
        i < piece.quantity;
        i++
      ) {

        instances.push({

          name:
            piece.name,

          width:
            piece.width,

          height:
            piece.height,

          garment,

          pieceIndex:
            i + 1,

          rotation:
            0

        });

      }

    }

  }


  return instances;

}


/* =========================================================
   TEST PLACEMENT
========================================================= */

function placementFits(
  x,
  y,
  width,
  height,
  placements,
  fabricWidth
) {

  /* ---------------------------------------
     FABRIC WIDTH
  --------------------------------------- */

  if (
    x + width >
    fabricWidth
  ) {

    return false;

  }


  /* ---------------------------------------
     COLLISION
  --------------------------------------- */

  for (
    const item of placements
  ) {

    const overlapX =
      x < item.x + item.width &&
      x + width > item.x;


    const overlapY =
      y < item.y + item.height &&
      y + height > item.y;


    if (
      overlapX &&
      overlapY
    ) {

      return false;

    }

  }


  return true;

}


/* =========================================================
   FIND BEST POSITION
========================================================= */

function findPosition(
  piece,
  placements,
  fabric,
  rotations
) {

  const candidates = [];


  /* ---------------------------------------
     START POSITION
  --------------------------------------- */

  candidates.push({

    x: 0,
    y: 0

  });


  /* ---------------------------------------
     EDGE POSITIONS
  --------------------------------------- */

  for (
    const item of placements
  ) {

    candidates.push({

      x:
        item.x +
        item.width,

      y:
        item.y

    });


    candidates.push({

      x:
        item.x,

      y:
        item.y +
        item.height

    });

  }


  let best = null;


  for (
    const rotation of rotations
  ) {

    let width =
      piece.width;

    let height =
      piece.height;


    if (
      rotation === 90 ||
      rotation === 270
    ) {

      const temp =
        width;

      width =
        height;

      height =
        temp;

    }


    for (
      const candidate of candidates
    ) {

      const x =
        candidate.x;

      const y =
        candidate.y;


      if (
        !placementFits(
          x,
          y,
          width,
          height,
          placements,
          fabric.effectiveWidth
        )
      ) {

        continue;

      }


      const endY =
        y + height;


      const score =
        endY * 10000 +
        y * 100 +
        x;


      if (
        !best ||
        score < best.score
      ) {

        best = {

          x,
          y,

          width,
          height,

          rotation,

          score

        };

      }

    }

  }


  return best;

}


/* =========================================================
   FABRIC OPTIMIZER
========================================================= */

function optimizeFabric() {

  try {

    /* ---------------------------------------
       MAKE PATTERN IF NEEDED
    --------------------------------------- */

    if (
      !lastBodice ||
      !lastSleeve
    ) {

      generatePattern();

    }


    if (
      !lastFabric ||
      !lastBodice ||
      !lastSleeve
    ) {

      setStatus(
        "Buat pola terlebih dahulu."
      );

      return;

    }


    const measurements =
      lastMeasurements ||
      getMeasurements();


    const fabric =
      lastFabric;


    const seam =
      Math.max(
        0,
        measurements.seam || 1
      );


    const quantity =
      Math.max(
        1,
        measurements.garmentQuantity || 1
      );


    /* ---------------------------------------
       PIECES
    --------------------------------------- */

    let pieces =
      getPatternPieces();


    if (!pieces.length) {

      setStatus(
        "Pola belum tersedia."
      );

      return;

    }


    /* ---------------------------------------
       ADD SEAM
    --------------------------------------- */

    pieces =
      pieces.map(
        piece => ({

          ...piece,

          width:
            piece.width +
            seam * 2,

          height:
            piece.height +
            seam * 2

        })
      );


    /* ---------------------------------------
       CREATE INSTANCES
    --------------------------------------- */

    const instances =
      createPieceInstances(
        pieces,
        quantity
      );


    /* ---------------------------------------
       SORT BIGGEST FIRST
    --------------------------------------- */

    instances.sort(
      (a, b) => {

        const areaA =
          a.width *
          a.height;


        const areaB =
          b.width *
          b.height;


        return areaB - areaA;

      }
    );


    /* ---------------------------------------
       ROTATION RULES
    --------------------------------------- */

    const allowed =
      fabric.allowedRotation ||
      [0];


    const rotations =
      allowed.filter(
        rotation =>
          [0, 90, 180, 270]
            .includes(rotation)
      );


    /* ---------------------------------------
       PLACEMENTS
    --------------------------------------- */

    const placements = [];


    for (
      const piece of instances
    ) {

      const position =
        findPosition(
          piece,
          placements,
          fabric,
          rotations
        );


      if (!position) {

        throw new Error(

          `${piece.name} tidak dapat ` +
          `ditempatkan pada lebar kain ` +
          `${fabric.effectiveWidth} cm.`

        );

      }


      placements.push({

        ...piece,

        x:
          position.x,

        y:
          position.y,

        width:
          position.width,

        height:
          position.height,

        rotation:
          position.rotation

      });

    }


    /* ---------------------------------------
       USED LENGTH
    --------------------------------------- */

    let usedLength = 0;


    for (
      const placement of placements
    ) {

      usedLength =
        Math.max(

          usedLength,

          placement.y +
          placement.height

        );

    }


    usedLength =
      Math.ceil(
        usedLength * 10
      ) / 10;


    /* ---------------------------------------
       AVAILABLE LENGTH
    --------------------------------------- */

    const availableLength =
      fabric.length;


    const fits =
      availableLength > 0 &&
      usedLength <=
      availableLength;


    /* ---------------------------------------
       AREA
    --------------------------------------- */

    const usedArea =
      placements.reduce(

        (sum, piece) => {

          return (
            sum +
            piece.width *
            piece.height
          );

        },

        0

      );


    const layoutArea =
      fabric.effectiveWidth *
      usedLength;


    const efficiency =
      layoutArea > 0

        ? (
            usedArea /
            layoutArea
          ) * 100

        : 0;


    const remainingLength =
      Math.max(

        0,

        availableLength -
        usedLength

      );


    /* ---------------------------------------
       SAVE RESULT
    --------------------------------------- */

    lastOptimization = {

      width:
        fabric.effectiveWidth,

      availableWidth:
        fabric.effectiveWidth,

      usedLength,

      availableLength,

      remainingLength,

      quantity,

      efficiency,

      fits,

      placements

    };


    /* ---------------------------------------
       UI
    --------------------------------------- */

    if (el("resultWidth")) {

      el("resultWidth").textContent =
        round(
          fabric.effectiveWidth,
          1
        );

    }


    if (el("resultLength")) {

      el("resultLength").textContent =
        round(
          usedLength,
          1
        );

    }


    if (el("resultMaterial")) {

      el("resultMaterial").textContent =
        fabric.materialName;

    }


    if (el("resultQuantity")) {

      el("resultQuantity").textContent =
        quantity;

    }


    if (el("resultStatus")) {

      if (fits) {

        el("resultStatus").textContent =

          `Optimal • Efisiensi ` +
          `${round(
            efficiency,
            1
          )}%`;

      }

      else {

        el("resultStatus").textContent =

          `Kain tidak cukup • ` +
          `butuh ${round(
            usedLength,
            1
          )} cm`;

      }

    }


    /* ---------------------------------------
       STATUS
    --------------------------------------- */

    setStatus(

      fits

        ? `Optimasi selesai • ` +
          `Kebutuhan kain ± ${round(
            usedLength,
            1
          )} cm • ` +
          `Sisa ± ${round(
            remainingLength,
            1
          )} cm`

        : `Kain tidak cukup • ` +
          `Butuh ± ${round(
            usedLength,
            1
          )} cm, tersedia ${round(
            availableLength,
            1
          )} cm`

    );


    /* ---------------------------------------
       RENDER NESTING
    --------------------------------------- */

    renderNestingLayout(
      lastOptimization,
      fabric
    );


  }

  catch (error) {

    console.error(
      "Fabric optimizer error:",
      error
    );


    if (el("resultStatus")) {

      el("resultStatus").textContent =
        "Optimasi gagal";

    }


    setStatus(
      error.message ||
      "Optimasi kain gagal."
    );

  }

}


/* =========================================================
   NESTING SVG
========================================================= */

function createNestingSVG(
  optimization,
  fabric
) {

  const width =
    fabric.effectiveWidth;


  const height =
    Math.max(
      optimization.usedLength,
      1
    );


  const scale =
    Math.min(
      3,
      900 / width
    );


  const svgWidth =
    width * scale;


  const svgHeight =
    height * scale;


  let piecesSVG = "";


  optimization.placements.forEach(

    (piece, index) => {

      const x =
        piece.x * scale;


      const y =
        piece.y * scale;


      const w =
        piece.width * scale;


      const h =
        piece.height * scale;


      piecesSVG += `

        <rect
          x="${x}"
          y="${y}"
          width="${w}"
          height="${h}"
          fill="none"
          stroke="#222"
          stroke-width="1"
        />

        <text
          x="${x + w / 2}"
          y="${y + h / 2}"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="${Math.max(
            8,
            Math.min(16, w / 8)
          )}"
          fill="#222"
        >
          ${piece.name}
        </text>

        <text
          x="${x + 3}"
          y="${y + 12}"
          font-size="7"
          fill="#555"
        >
          ${piece.garment}
        </text>

      `;

    }

  );


  return `

    <svg

      xmlns="http://www.w3.org/2000/svg"

      viewBox="
        0
        0
        ${svgWidth}
        ${svgHeight}
      "

      width="100%"

      style="
        display:block;
        background:#fff;
      "

    >

      <!-- FABRIC -->

      <rect
        x="0"
        y="0"
        width="${svgWidth}"
        height="${svgHeight}"
        fill="none"
        stroke="#777"
        stroke-width="2"
      />


      <!-- PIECES -->

      ${piecesSVG}


      <!-- GRAIN DIRECTION -->

      <line
        x1="8"
        y1="10"
        x2="8"
        y2="${Math.min(
          80,
          svgHeight - 10
        )}"
        stroke="#333"
        stroke-width="1"
      />


      <text
        x="12"
        y="25"
        font-size="8"
        fill="#333"
      >
        GRAIN
      </text>


      <!-- LABEL -->

      <text
        x="${svgWidth - 5}"
        y="12"
        text-anchor="end"
        font-size="9"
        fill="#222"
      >
        FABRIC ${round(
          width,
          1
        )} cm
      </text>


      <text
        x="${svgWidth - 5}"
        y="24"
        text-anchor="end"
        font-size="9"
        fill="#222"
      >
        USED ${round(
          height,
          1
        )} cm
      </text>

    </svg>

  `;

}


/* =========================================================
   RENDER NESTING PREVIEW
========================================================= */

function renderNestingLayout(
  optimization,
  fabric
) {

  removeNestingPreview();


  const canvas =
    el("canvasWrap");


  if (!canvas) {
    return;
  }


  const wrapper =
    document.createElement(
      "div"
    );


  wrapper.id =
    "nestingPreview";


  wrapper.style.marginTop =
    "20px";


  wrapper.style.padding =
    "15px";


  wrapper.style.border =
    "1px solid #ddd";


  wrapper.style.borderRadius =
    "12px";


  wrapper.style.background =
    "#fff";


  const title =
    document.createElement(
      "h3"
    );


  title.textContent =
    "Fabric Nesting Layout";


  title.style.margin =
    "0 0 12px 0";


  wrapper.appendChild(
    title
  );


  const info =
    document.createElement(
      "div"
    );


  info.style.fontSize =
    "14px";


  info.style.marginBottom =
    "12px";


  info.innerHTML =

    `Lebar efektif: <b>${round(
      fabric.effectiveWidth,
      1
    )} cm</b><br>` +

    `Kebutuhan panjang: <b>${round(
      optimization.usedLength,
      1
    )} cm</b><br>` +

    `Efisiensi: <b>${round(
      optimization.efficiency,
      1
    )}%</b>`;


  wrapper.appendChild(
    info
  );


  const layout =
    document.createElement(
      "div"
    );


  layout.innerHTML =
    createNestingSVG(
      optimization,
      fabric
    );


  wrapper.appendChild(
    layout
  );


  canvas.parentNode.insertBefore(
    wrapper,
    canvas.nextSibling
  );

}


/* =========================================================
   REMOVE NESTING PREVIEW
========================================================= */

function removeNestingPreview() {

  const old =
    document.getElementById(
      "nestingPreview"
    );


  if (old) {

    old.remove();

  }

}


/* =========================================================
   DOWNLOAD SVG
========================================================= */

function downloadSVG() {

  try {

    if (!lastSvg) {

      generatePattern();

    }


    if (!lastSvg) {
      return;
    }


    const blob =
      new Blob(

        [lastSvg],

        {
          type:
            "image/svg+xml"
        }

      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      "PatternMaker-V1-pattern.svg";


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    setTimeout(

      () => {

        URL.revokeObjectURL(
          url
        );

      },

      500

    );

  }

  catch (error) {

    console.error(
      "Download error:",
      error
    );

  }

}


/* =========================================================
   LIVE FABRIC UPDATE
========================================================= */

function bindFabricInputs() {

  const ids = [

    "fabricMaterial",
    "fabricWidth",
    "fabricLength",
    "selvedgeLeft",
    "selvedgeRight"

  ];


  ids.forEach(

    id => {

      const node =
        el(id);


      if (!node) {
        return;
      }


      node.addEventListener(
        "input",
        updateFabricInformation
      );


      node.addEventListener(
        "change",
        updateFabricInformation
      );

    }

  );

}


/* =========================================================
   GENERATE BUTTON
========================================================= */

const generateButton =
  el("generateBtn");


if (generateButton) {

  generateButton.addEventListener(
    "click",
    generatePattern
  );

}


/* =========================================================
   OPTIMIZE BUTTON
========================================================= */

const optimizeButton =
  el("optimizeBtn");


if (optimizeButton) {

  optimizeButton.addEventListener(
    "click",
    optimizeFabric
  );

}


/* =========================================================
   DOWNLOAD BUTTON
========================================================= */

const downloadButton =
  el("downloadBtn");


if (downloadButton) {

  downloadButton.addEventListener(
    "click",
    downloadSVG
  );

}


/* =========================================================
   MEASUREMENT INPUTS
========================================================= */

const measurementIds = [

  "age",
  "bust",
  "waist",
  "shoulder",
  "bodyLength",
  "neck",

  "upperArm",
  "sleeveLength",
  "wrist",

  "negativeEase",
  "seam",

  "garmentQuantity"

];


measurementIds.forEach(

  id => {

    const node =
      el(id);


    if (!node) {
      return;
    }


    node.addEventListener(

      "input",

      () => {

        lastSvg =
          "";

        lastOptimization =
          null;

        removeNestingPreview();

      }

    );

  }

);


/* =========================================================
   START APPLICATION
========================================================= */

bindFabricInputs();

updateFabricInformation();


setStatus(
  "Masukkan ukuran kemudian tekan GENERATE PATTERN."
);