/* =========================================================
   PatternMaker V1.6
   MAIN APPLICATION
   ---------------------------------------------------------
   Menghubungkan:
   - Measurement Engine
   - Bodice Engine
   - Sleeve Engine
   - Geometry Engine
   - Fabric Engine
   - Nesting Engine V1.6
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


import {
  nestPieces,
  getNestingSummary,
  validateNesting
} from "./engine/nesting.js";


/* =========================================================
   GLOBAL STATE
========================================================= */

let lastSvg = "";

let lastMeasurements = null;

let lastBodice = null;

let lastSleeve = null;

let lastFabric = null;

let lastNesting = null;


/* =========================================================
   HELPER
========================================================= */

function el(id) {

  return document.getElementById(id);

}


/* =========================================================
   NUMBER
========================================================= */

function number(
  id,
  fallback = 0
) {

  const node =
    el(id);


  if (!node) {

    return fallback;

  }


  const value =
    Number(node.value);


  return Number.isFinite(value)

    ? value

    : fallback;

}


/* =========================================================
   ROUND
========================================================= */

function round(
  value,
  digits = 1
) {

  const factor =
    Math.pow(
      10,
      digits
    );


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


  return (
    names[key] ||
    key
  );

}


/* =========================================================
   STATUS
========================================================= */

function setStatus(
  message
) {

  if (
    el("status")
  ) {

    el("status").textContent =
      message;

  }

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

  if (
    el("materialName")
  ) {

    el("materialName").textContent =
      fabric.materialName;

  }


  /* -----------------------------------------
     WIDTH
  ----------------------------------------- */

  if (
    el("displayFabricWidth")
  ) {

    el("displayFabricWidth").textContent =
      fabric.width;

  }


  /* -----------------------------------------
     EFFECTIVE WIDTH
  ----------------------------------------- */

  if (
    el("effectiveWidth")
  ) {

    el("effectiveWidth").textContent =
      fabric.effectiveWidth;

  }


  /* -----------------------------------------
     LENGTH
  ----------------------------------------- */

  if (
    el("displayFabricLength")
  ) {

    el("displayFabricLength").textContent =
      fabric.length;

  }


  /* -----------------------------------------
     STRETCH
  ----------------------------------------- */

  if (
    el("fabricStretch")
  ) {

    el("fabricStretch").textContent =
      fabric.stretch;

  }


  /* -----------------------------------------
     STRETCH DIRECTION
  ----------------------------------------- */

  if (
    el("stretchDirection")
  ) {

    el("stretchDirection").textContent =
      fabric.stretchDirection;

  }


  /* -----------------------------------------
     ROTATION
  ----------------------------------------- */

  if (
    el("allowedRotation")
  ) {

    el("allowedRotation").textContent =

      fabric.allowedRotation
        .map(
          value =>
            value + "°"
        )
        .join(", ");

  }


  return fabric;

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
       FABRIC
    --------------------------------------- */

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
       SVG PATTERN
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

    if (
      el("canvasWrap")
    ) {

      el("canvasWrap").innerHTML =
        svg;

    }


    /* ---------------------------------------
       RESET NESTING
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


    /* ---------------------------------------
       SCROLL
    --------------------------------------- */

    if (
      el("canvasWrap")
    ) {

      el("canvasWrap").scrollIntoView({

        behavior:
          "smooth",

        block:
          "center"

      });

    }


  }

  catch (
    error
  ) {

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
   RESET OPTIMIZATION
========================================================= */

function resetOptimization() {

  lastNesting =
    null;


  if (
    el("resultWidth")
  ) {

    el("resultWidth").textContent =
      "-";

  }


  if (
    el("resultLength")
  ) {

    el("resultLength").textContent =
      "-";

  }


  if (
    el("resultMaterial")
  ) {

    el("resultMaterial").textContent =
      "-";

  }


  if (
    el("resultQuantity")
  ) {

    el("resultQuantity").textContent =
      "-";

  }


  if (
    el("resultStatus")
  ) {

    el("resultStatus").textContent =
      "Belum dioptimasi";

  }


  /*
    Jika nanti kita menambahkan
    visual nesting khusus, area ini
    akan dibersihkan juga.
  */

  if (
    el("nestingPreview")
  ) {

    el("nestingPreview").innerHTML =
      "";

  }

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


  /* =========================================
     FRONT
  ========================================= */

  const frontPoints = [

    lastBodice.front.A,

    lastBodice.front.B,

    lastBodice.front.C,

    lastBodice.front.D,

    lastBodice.front.E,

    lastBodice.front.F

  ];


  const frontXs =
    frontPoints.map(
      point =>
        point[0]
    );


  const frontYs =
    frontPoints.map(
      point =>
        point[1]
    );


  const frontWidth =

    Math.max(
      ...frontXs
    )

    -

    Math.min(
      ...frontXs
    );


  const frontHeight =

    Math.max(
      ...frontYs
    )

    -

    Math.min(
      ...frontYs
    );


  pieces.push({

    name:
      "Front",

    width:
      frontWidth,

    height:
      frontHeight,

    quantity:
      1,

    allowedRotation:
      lastFabric?.allowedRotation ||
      [0]

  });


  /* =========================================
     BACK
  ========================================= */

  const backPoints = [

    lastBodice.back.A,

    lastBodice.back.B,

    lastBodice.back.C,

    lastBodice.back.D,

    lastBodice.back.E,

    lastBodice.back.F

  ];


  const backXs =
    backPoints.map(
      point =>
        point[0]
    );


  const backYs =
    backPoints.map(
      point =>
        point[1]
    );


  const backWidth =

    Math.max(
      ...backXs
    )

    -

    Math.min(
      ...backXs
    );


  const backHeight =

    Math.max(
      ...backYs
    )

    -

    Math.min(
      ...backYs
    );


  pieces.push({

    name:
      "Back",

    width:
      backWidth,

    height:
      backHeight,

    quantity:
      1,

    allowedRotation:
      lastFabric?.allowedRotation ||
      [0]

  });


  /* =========================================
     SLEEVE
  ========================================= */

  const sleevePoints = [

    lastSleeve.left,

    lastSleeve.leftCap,

    lastSleeve.top,

    lastSleeve.rightCap,

    lastSleeve.right,

    lastSleeve.bottomLeft,

    lastSleeve.bottomRight

  ];


  const sleeveXs =
    sleevePoints.map(
      point =>
        point[0]
    );


  const sleeveYs =
    sleevePoints.map(
      point =>
        point[1]
    );


  const sleeveWidth =

    Math.max(
      ...sleeveXs
    )

    -

    Math.min(
      ...sleeveXs
    );


  const sleeveHeight =

    Math.max(
      ...sleeveYs
    )

    -

    Math.min(
      ...sleeveYs
    );


  pieces.push({

    name:
      "Sleeve",

    width:
      sleeveWidth,

    height:
      sleeveHeight,

    quantity:
      2,

    allowedRotation:
      lastFabric?.allowedRotation ||
      [0]

  });


  return pieces;

}


/* =========================================================
   OPTIMIZE FABRIC
   ---------------------------------------------------------
   V1.6
   Menggunakan nesting.js
========================================================= */

function optimizeFabric() {

  try {


    /* ---------------------------------------
       Pastikan pola tersedia
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


    /* ---------------------------------------
       MEASUREMENTS
    --------------------------------------- */

    const measurements =
      lastMeasurements ||
      getMeasurements();


    /* ---------------------------------------
       FABRIC
    --------------------------------------- */

    const fabric =
      lastFabric;


    /* ---------------------------------------
       PIECES
    --------------------------------------- */

    const pieces =
      getPatternPieces();


    if (
      !pieces.length
    ) {

      setStatus(
        "Pola belum tersedia."
      );

      return;

    }


    /* ---------------------------------------
       SEAM
    --------------------------------------- */

    const seam =
      Math.max(

        0,

        Number(
          measurements.seam
        ) || 1

      );


    /* ---------------------------------------
       QUANTITY
    --------------------------------------- */

    const quantity =
      Math.max(

        1,

        Number(
          measurements.garmentQuantity
        ) || 1

      );


    /* ---------------------------------------
       RUN NESTING ENGINE
    --------------------------------------- */

    const nesting =
      nestPieces(

        pieces,

        fabric,

        {

          seam,

          quantity,

          strategy:
            "area"

        }

      );


    /* ---------------------------------------
       VALIDATE
    --------------------------------------- */

    const validation =
      validateNesting(
        nesting
      );


    if (
      !validation.valid
    ) {

      console.warn(
        "Nesting validation:",
        validation.errors
      );

    }


    lastNesting =
      nesting;


    /* ---------------------------------------
       SUMMARY
    --------------------------------------- */

    const summary =
      getNestingSummary(
        nesting
      );


    /* ---------------------------------------
       RESULT WIDTH
    --------------------------------------- */

    if (
      el("resultWidth")
    ) {

      el("resultWidth").textContent =

        round(
          summary.fabricWidth,
          1
        );

    }


    /* ---------------------------------------
       RESULT LENGTH
    --------------------------------------- */

    if (
      el("resultLength")
    ) {

      el("resultLength").textContent =

        round(
          summary.usedLength,
          1
        );

    }


    /* ---------------------------------------
       MATERIAL
    --------------------------------------- */

    if (
      el("resultMaterial")
    ) {

      el("resultMaterial").textContent =
        fabric.materialName;

    }


    /* ---------------------------------------
       QUANTITY
    --------------------------------------- */

    if (
      el("resultQuantity")
    ) {

      el("resultQuantity").textContent =
        quantity;

    }


    /* ---------------------------------------
       STATUS RESULT
    --------------------------------------- */

    if (
      el("resultStatus")
    ) {

      if (
        summary.status ===
        "OPTIMAL"
      ) {

        el("resultStatus").textContent =

          `Optimal • ` +
          `${round(
            summary.efficiency,
            1
          )}% efisiensi`;

      }

      else if (
        summary.status ===
        "INSUFFICIENT_LENGTH"
      ) {

        el("resultStatus").textContent =

          `Kain kurang ` +
          `${round(
            summary.shortage,
            1
          )} cm`;

      }

      else if (
        summary.status ===
        "PIECE_TOO_LARGE"
      ) {

        el("resultStatus").textContent =
          "Pola tidak muat di lebar kain";

      }

      else {

        el("resultStatus").textContent =
          "Layout berhasil dihitung";

      }

    }


    /* ---------------------------------------
       STATUS UTAMA
    --------------------------------------- */

    if (
      summary.status ===
      "OPTIMAL"
    ) {

      setStatus(

        `Optimasi V1.6 selesai • ` +
        `Kebutuhan kain ± ` +
        `${round(
          summary.usedLength,
          1
        )} cm • ` +
        `Sisa ± ` +
        `${round(
          summary.remainingLength,
          1
        )} cm • ` +
        `Efisiensi ` +
        `${round(
          summary.efficiency,
          1
        )}%`

      );

    }

    else if (
      summary.status ===
      "INSUFFICIENT_LENGTH"
    ) {

      setStatus(

        `Kain tidak cukup panjang • ` +
        `Butuh ± ` +
        `${round(
          summary.usedLength,
          1
        )} cm`

      );

    }

    else if (
      summary.status ===
      "PIECE_TOO_LARGE"
    ) {

      setStatus(
        "Ada pola yang terlalu lebar untuk kain."
      );

    }

    else {

      setStatus(

        `Nesting selesai • ` +
        `Kebutuhan ± ` +
        `${round(
          summary.usedLength,
          1
        )} cm`

      );

    }


    /* ---------------------------------------
       CONSOLE DEBUG
    --------------------------------------- */

    console.log(
      "PatternMaker V1.6 Nesting:",
      nesting
    );


    console.log(
      "Nesting summary:",
      summary
    );


    console.log(
      "Nesting validation:",
      validation
    );


  }

  catch (
    error
  ) {

    console.error(
      "Fabric nesting error:",
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


    if (
      !lastSvg
    ) {

      generatePattern();

    }


    if (
      !lastSvg
    ) {

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
      "PatternMaker-V1.6-pattern.svg";


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

  catch (
    error
  ) {

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


      if (
        !node
      ) {

        return;

      }


      node.addEventListener(

        "input",

        () => {

          updateFabricInformation();

          lastNesting =
            null;

        }

      );


      node.addEventListener(

        "change",

        () => {

          updateFabricInformation();

          lastNesting =
            null;

        }

      );

    }

  );

}


/* =========================================================
   GENERATE BUTTON
========================================================= */

const generateButton =
  el("generateBtn");


if (
  generateButton
) {

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


if (
  optimizeButton
) {

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


if (
  downloadButton
) {

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


    if (
      !node
    ) {

      return;

    }


    node.addEventListener(

      "input",

      () => {

        lastSvg =
          "";

        lastNesting =
          null;

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
