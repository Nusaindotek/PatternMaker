/* =========================================================
   PatternMaker V1.5
   MAIN APPLICATION
   ---------------------------------------------------------
   CONNECTS:
   - Measurement Engine
   - Bodice Engine
   - Sleeve Engine
   - Geometry Engine
   - Fabric Engine
   - Fabric Optimizer
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
   DOM HELPER
========================================================= */

function el(id) {

  return document.getElementById(id);

}


/* =========================================================
   STATUS
========================================================= */

function setStatus(message) {

  const node = el("status");

  if (node) {

    node.textContent = message;

  }

}


/* =========================================================
   ROUND
========================================================= */

function round(value, digits = 1) {

  const factor =
    Math.pow(10, digits);

  return Math.round(
    value * factor
  ) / factor;

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


  /* -----------------------------------------
     MATERIAL
  ----------------------------------------- */

  const materialNode =
    el("materialName");

  if (materialNode) {

    materialNode.textContent =
      fabric.materialName;

  }


  /* -----------------------------------------
     WIDTH
  ----------------------------------------- */

  const widthNode =
    el("displayFabricWidth");

  if (widthNode) {

    widthNode.textContent =
      fabric.width;

  }


  /* -----------------------------------------
     EFFECTIVE WIDTH
  ----------------------------------------- */

  const effectiveNode =
    el("effectiveWidth");

  if (effectiveNode) {

    effectiveNode.textContent =
      fabric.effectiveWidth;

  }


  /* -----------------------------------------
     LENGTH
  ----------------------------------------- */

  const lengthNode =
    el("displayFabricLength");

  if (lengthNode) {

    lengthNode.textContent =
      fabric.length;

  }


  /* -----------------------------------------
     STRETCH
  ----------------------------------------- */

  const stretchNode =
    el("fabricStretch");

  if (stretchNode) {

    stretchNode.textContent =
      fabric.stretch;

  }


  /* -----------------------------------------
     STRETCH DIRECTION
  ----------------------------------------- */

  const directionNode =
    el("stretchDirection");

  if (directionNode) {

    directionNode.textContent =
      fabric.stretchDirection;

  }


  /* -----------------------------------------
     ROTATION
  ----------------------------------------- */

  const rotationNode =
    el("allowedRotation");

  if (rotationNode) {

    rotationNode.textContent =
      fabric.allowedRotation
        .map(
          value => `${value}°`
        )
        .join(", ");

  }


  return fabric;

}


/* =========================================================
   RESET OPTIMIZATION
========================================================= */

function resetOptimization() {

  lastOptimization =
    null;


  const width =
    el("resultWidth");

  const length =
    el("resultLength");

  const material =
    el("resultMaterial");

  const quantity =
    el("resultQuantity");

  const status =
    el("resultStatus");


  if (width) {

    width.textContent =
      "-";

  }


  if (length) {

    length.textContent =
      "-";

  }


  if (material) {

    material.textContent =
      "-";

  }


  if (quantity) {

    quantity.textContent =
      "-";

  }


  if (status) {

    status.textContent =
      "Belum dioptimasi";

  }

}


/* =========================================================
   GENERATE PATTERN
========================================================= */

function generatePattern() {

  try {


    /* ---------------------------------------
       GET MEASUREMENTS
    --------------------------------------- */

    const measurements =
      getMeasurements();


    lastMeasurements =
      measurements;


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
       FABRIC
    --------------------------------------- */

    const fabric =
      updateFabricInformation();


    lastFabric =
      fabric;


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
       RENDER SVG
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

    const canvas =
      el("canvasWrap");


    if (canvas) {

      canvas.innerHTML =
        svg;

    }


    /* ---------------------------------------
       ARMHOLE INFORMATION
    --------------------------------------- */

    updatePatternInformation();


    /* ---------------------------------------
       RESET OPTIMIZER
    --------------------------------------- */

    resetOptimization();


    /* ---------------------------------------
       STATUS
    --------------------------------------- */

    setStatus(

      `Pola berhasil dibuat • ` +
      `Usia ${measurements.age} tahun • ` +
      `${fabric.materialName} • ` +
      `Kain ${fabric.width} cm`

    );


  }

  catch (error) {

    console.error(
      "PatternMaker error:",
      error
    );


    setStatus(

      "Error: " +
      (
        error.message ||
        "Gagal membuat pola."
      )

    );

  }

}


/* =========================================================
   PATTERN INFORMATION
========================================================= */

function updatePatternInformation() {

  /*
     Jika nanti kita menambahkan
     panel detail pola, fungsi ini
     akan mengisinya.

     Untuk sekarang kita simpan
     datanya di console agar mudah
     debugging.
  */

  if (
    !lastBodice ||
    !lastSleeve
  ) {

    return;

  }


  console.log(
    "PatternMaker pattern data:",
    {

      armhole:
        lastBodice.armholeLength,

      sleeveCap:
        lastSleeve.capLength,

      sleeveEase:
        lastSleeve.capEase

    }

  );

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

    width:
      maxX - minX,

    height:
      maxY - minY

  };

}


/* =========================================================
   GET PATTERN PIECES
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
      1

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
      1

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
      2

  });


  return pieces;

}


/* =========================================================
   OPTIMIZE FABRIC
========================================================= */

function optimizeFabric() {

  try {


    /* ---------------------------------------
       GENERATE PATTERN FIRST
    --------------------------------------- */

    if (
      !lastBodice ||
      !lastSleeve
    ) {

      generatePattern();

    }


    if (
      !lastBodice ||
      !lastSleeve ||
      !lastFabric
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
      measurements.seam || 1;


    const quantity =
      Math.max(

        1,

        measurements.garmentQuantity || 1

      );


    /* ---------------------------------------
       GET PIECES
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
       SEAM ALLOWANCE
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

    const instances = [];


    for (
      let garment = 0;
      garment < quantity;
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

            garment:
              garment + 1,

            rotation:
              0

          });

        }

      }

    }


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
       FABRIC WIDTH
    --------------------------------------- */

    const usableWidth =
      fabric.effectiveWidth;


    if (
      usableWidth <= 0
    ) {

      setStatus(
        "Lebar efektif kain tidak valid."
      );

      return;

    }


    /* ---------------------------------------
       CURSOR
    --------------------------------------- */

    let cursorX =
      0;

    let cursorY =
      0;

    let rowHeight =
      0;

    let usedLength =
      0;


    const placements = [];


    /* ---------------------------------------
       NESTING
    --------------------------------------- */

    for (
      const piece of instances
    ) {


      let width =
        piece.width;


      let height =
        piece.height;


      let rotation =
        0;


      /*
        Untuk Sublime Jersey:

        0° / 180°

        Dimensi geometrinya sama.

        Untuk material yang mengizinkan
        90° / 270°, kita boleh menukar
        width dan height jika perlu.
      */

      const allowed =
        fabric.allowedRotation ||
        [0];


      if (
        width > usableWidth &&
        (
          allowed.includes(90) ||
          allowed.includes(270)
        )
      ) {

        const temp =
          width;

        width =
          height;

        height =
          temp;

        rotation =
          90;

      }


      /* -------------------------------------
         TERLALU LEBAR
      ------------------------------------- */

      if (
        width > usableWidth
      ) {

        throw new Error(

          `${piece.name} terlalu lebar ` +
          `untuk kain efektif ` +
          `${usableWidth} cm`

        );

      }


      /* -------------------------------------
         BARIS BARU
      ------------------------------------- */

      if (
        cursorX > 0 &&
        cursorX + width >
        usableWidth
      ) {

        cursorX =
          0;

        cursorY +=
          rowHeight;

        rowHeight =
          0;

      }


      /* -------------------------------------
         PLACE PIECE
      ------------------------------------- */

      placements.push({

        ...piece,

        x:
          cursorX,

        y:
          cursorY,

        width,

        height,

        rotation

      });


      cursorX +=
        width;


      rowHeight =
        Math.max(
          rowHeight,
          height
        );


      usedLength =
        Math.max(

          usedLength,

          cursorY +
          rowHeight

        );

    }


    /* ---------------------------------------
       AVAILABLE FABRIC
    --------------------------------------- */

    const availableLength =
      fabric.length;


    const fits =
      usedLength <=
      availableLength;


    /* ---------------------------------------
       USED AREA
    --------------------------------------- */

    const usedArea =
      placements.reduce(

        (sum, piece) =>

          sum +
          (
            piece.width *
            piece.height
          ),

        0

      );


    /* ---------------------------------------
       FABRIC AREA
    --------------------------------------- */

    const totalArea =
      fabric.effectiveWidth *
      usedLength;


    /* ---------------------------------------
       EFFICIENCY
    --------------------------------------- */

    const efficiency =

      totalArea > 0

        ? (
            usedArea /
            totalArea
          ) * 100

        : 0;


    /* ---------------------------------------
       REMAINING
    --------------------------------------- */

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

      usedLength,

      availableLength,

      remainingLength,

      quantity,

      efficiency,

      fits,

      placements

    };


    /* ---------------------------------------
       UPDATE UI
    --------------------------------------- */

    const resultWidth =
      el("resultWidth");

    const resultLength =
      el("resultLength");

    const resultMaterial =
      el("resultMaterial");

    const resultQuantity =
      el("resultQuantity");

    const resultStatus =
      el("resultStatus");


    if (resultWidth) {

      resultWidth.textContent =
        round(
          fabric.effectiveWidth,
          1
        );

    }


    if (resultLength) {

      resultLength.textContent =
        round(
          usedLength,
          1
        );

    }


    if (resultMaterial) {

      resultMaterial.textContent =
        fabric.materialName;

    }


    if (resultQuantity) {

      resultQuantity.textContent =
        quantity;

    }


    if (resultStatus) {

      resultStatus.textContent =

        fits

          ? `Optimal • Efisiensi ${round(
              efficiency,
              1
            )}%`

          : "Tidak cukup panjang kain";

    }


    /* ---------------------------------------
       STATUS
    --------------------------------------- */

    setStatus(

      `Optimasi selesai • ` +
      `Kebutuhan ± ${round(
        usedLength,
        1
      )} cm • ` +
      `Sisa ± ${round(
        remainingLength,
        1
      )} cm`

    );


    console.log(
      "Fabric optimization:",
      lastOptimization
    );


  }

  catch (error) {

    console.error(
      "Fabric optimizer error:",
      error
    );


    setStatus(

      error.message ||
      "Optimasi kain gagal."

    );

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
      "PatternMaker-pattern.svg";


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
      "Download SVG error:",
      error
    );

  }

}


/* =========================================================
   BIND FABRIC INPUTS
========================================================= */

function bindFabricInputs() {

  const ids = [

    "fabricMaterial",

    "fabricWidth",

    "fabricLength",

    "selvedgeLeft",

    "selvedgeRight",

    "printDirection"

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

        () => {

          updateFabricInformation();

        }

      );


      node.addEventListener(

        "change",

        () => {

          updateFabricInformation();

        }

      );

    }

  );

}


/* =========================================================
   BIND MEASUREMENT INPUTS
========================================================= */

function bindMeasurementInputs() {

  const ids = [

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


  ids.forEach(

    id => {

      const node =
        el(id);


      if (!node) {

        return;

      }


      node.addEventListener(

        "input",

        () => {

          lastSvg = "";

          lastBodice = null;

          lastSleeve = null;

          lastOptimization = null;

        }

      );

    }

  );

}


/* =========================================================
   BUTTONS
========================================================= */

function bindButtons() {


  /* -----------------------------------------
     GENERATE
  ----------------------------------------- */

  const generateButton =
    el("generateBtn");


  if (generateButton) {

    generateButton.addEventListener(

      "click",

      generatePattern

    );

  }


  /* -----------------------------------------
     OPTIMIZE
  ----------------------------------------- */

  const optimizeButton =
    el("optimizeBtn");


  if (optimizeButton) {

    optimizeButton.addEventListener(

      "click",

      optimizeFabric

    );

  }


  /* -----------------------------------------
     DOWNLOAD
  ----------------------------------------- */

  const downloadButton =
    el("downloadBtn");


  if (downloadButton) {

    downloadButton.addEventListener(

      "click",

      downloadSVG

    );

  }

}


/* =========================================================
   START APPLICATION
========================================================= */

function init() {


  console.log(
    "PatternMaker V1.5 starting..."
  );


  bindButtons();


  bindFabricInputs();


  bindMeasurementInputs();


  /*
     Tampilkan informasi kain
     tanpa membuat pola otomatis.
  */

  try {

    updateFabricInformation();

  }

  catch (error) {

    console.error(
      "Fabric initialization error:",
      error
    );

  }


  setStatus(
    "Masukkan ukuran kemudian tekan GENERATE PATTERN."
  );


  console.log(
    "PatternMaker V1.5 ready."
  );

}


/* =========================================================
   RUN
========================================================= */

init();