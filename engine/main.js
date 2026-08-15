/* =========================================================
   PatternMaker V1.5
   MAIN APPLICATION
   ---------------------------------------------------------
   Menghubungkan:
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
   SAFE NUMBER
========================================================= */

function safeNumber(value, fallback = 0) {

  const numberValue =
    Number(value);

  if (
    !Number.isFinite(numberValue)
  ) {

    return fallback;

  }

  return numberValue;

}


/* =========================================================
   GET NUMBER FROM INPUT
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


  return safeNumber(
    node.value,
    fallback
  );

}


/* =========================================================
   ROUND
========================================================= */

function round(
  value,
  digits = 1
) {

  const safe =
    safeNumber(
      value,
      0
    );


  const factor =
    Math.pow(
      10,
      digits
    );


  return Math.round(
    safe * factor
  ) / factor;

}


/* =========================================================
   FORMAT CM
========================================================= */

function formatCm(value) {

  return `${round(value, 1)} cm`;

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
    key ||
    "-"
  );

}


/* =========================================================
   STATUS
========================================================= */

function setStatus(message) {

  const node =
    el("status");


  if (node) {

    node.textContent =
      message;

  }

}


/* =========================================================
   UPDATE FABRIC INFORMATION
========================================================= */

function updateFabricInformation() {

  const measurements =
    getMeasurements();


  /*
    Pastikan semua nilai numerik valid.
  */

  const width =
    Math.max(
      0,
      safeNumber(
        measurements.fabricWidth,
        0
      )
    );


  const length =
    Math.max(
      0,
      safeNumber(
        measurements.fabricLength,
        0
      )
    );


  const selvedgeLeft =
    Math.max(
      0,
      safeNumber(
        measurements.selvedgeLeft,
        0
      )
    );


  const selvedgeRight =
    Math.max(
      0,
      safeNumber(
        measurements.selvedgeRight,
        0
      )
    );


  const fabric =
    createFabric({

      material:
        measurements.fabric,

      width,

      length,

      selvedgeLeft,

      selvedgeRight

    });


  lastFabric =
    fabric;


  /* =====================================================
     MATERIAL
  ===================================================== */

  if (el("materialName")) {

    el("materialName").textContent =
      fabric.materialName;

  }


  if (el("resultMaterial")) {

    /*
      Jangan langsung kosong ketika
      optimizer belum dijalankan.
    */

    if (!lastOptimization) {

      el("resultMaterial").textContent =
        fabric.materialName;

    }

  }


  /* =====================================================
     WIDTH
  ===================================================== */

  if (el("displayFabricWidth")) {

    el("displayFabricWidth").textContent =
      round(
        fabric.width,
        1
      );

  }


  if (el("resultWidth")) {

    /*
      resultWidth = lebar kain,
      bukan kebutuhan panjang.
    */

    if (!lastOptimization) {

      el("resultWidth").textContent =
        round(
          fabric.effectiveWidth,
          1
        );

    }

  }


  /* =====================================================
     EFFECTIVE WIDTH
  ===================================================== */

  if (el("effectiveWidth")) {

    el("effectiveWidth").textContent =
      round(
        fabric.effectiveWidth,
        1
      );

  }


  /* =====================================================
     LENGTH
  ===================================================== */

  if (el("displayFabricLength")) {

    el("displayFabricLength").textContent =
      round(
        fabric.length,
        1
      );

  }


  /*
    Penting:
    resultLength tidak diisi di sini.

    resultLength hanya diisi oleh optimizer
    sebagai KEBUTUHAN kain.
  */


  /* =====================================================
     STRETCH
  ===================================================== */

  if (el("fabricStretch")) {

    el("fabricStretch").textContent =
      fabric.stretch;

  }


  /* =====================================================
     STRETCH DIRECTION
  ===================================================== */

  if (el("stretchDirection")) {

    el("stretchDirection").textContent =
      fabric.stretchDirection;

  }


  /* =====================================================
     ROTATION
  ===================================================== */

  if (el("allowedRotation")) {

    el("allowedRotation").textContent =
      fabric.allowedRotation
        .map(
          value =>
            `${value}°`
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

    /* =====================================================
       MEASUREMENTS
    ===================================================== */

    const measurements =
      getMeasurements();


    lastMeasurements =
      measurements;


    /* =====================================================
       FABRIC
    ===================================================== */

    const fabric =
      updateFabricInformation();


    lastFabric =
      fabric;


    /* =====================================================
       VALIDATION BODY
    ===================================================== */

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


    /* =====================================================
       VALIDATION NECK
    ===================================================== */

    if (
      measurements.neck <= 0
    ) {

      setStatus(
        "Masukkan ukuran lingkar leher."
      );

      return;

    }


    /* =====================================================
       VALIDATION SLEEVE
    ===================================================== */

    if (
      measurements.upperArm <= 0 ||
      measurements.sleeveLength <= 0 ||
      measurements.wrist <= 0
    ) {

      setStatus(
        "Periksa ukuran lengan."
      );

      return;

    }


    /* =====================================================
       BODICE
    ===================================================== */

    const bodice =
      makeBodice(
        measurements
      );


    lastBodice =
      bodice;


    /* =====================================================
       SLEEVE
    ===================================================== */

    const sleeve =
      makeSleeve(
        measurements,
        bodice
      );


    lastSleeve =
      sleeve;


    /* =====================================================
       SVG
    ===================================================== */

    const svg =
      renderPattern(
        bodice,
        sleeve,
        measurements
      );


    lastSvg =
      svg;


    /* =====================================================
       PREVIEW
    ===================================================== */

    if (el("canvasWrap")) {

      el("canvasWrap").innerHTML =
        svg;

    }


    /* =====================================================
       RESET OPTIMIZER
    ===================================================== */

    resetOptimization();


    /* =====================================================
       STATUS
    ===================================================== */

    setStatus(

      `Pola berhasil dibuat • ` +
      `Usia ${measurements.age} tahun • ` +
      `${fabric.materialName} • ` +
      `Kain ${formatCm(fabric.width)}`

    );


    /* =====================================================
       SCROLL
    ===================================================== */

    if (el("canvasWrap")) {

      el("canvasWrap").scrollIntoView({

        behavior:
          "smooth",

        block:
          "center"

      });

    }

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
   RESET OPTIMIZER
========================================================= */

function resetOptimization() {

  lastOptimization =
    null;


  if (el("resultWidth")) {

    el("resultWidth").textContent =
      lastFabric
        ? round(
            lastFabric.effectiveWidth,
            1
          )
        : "-";

  }


  if (el("resultLength")) {

    el("resultLength").textContent =
      "-";

  }


  if (el("resultMaterial")) {

    el("resultMaterial").textContent =
      lastFabric
        ? lastFabric.materialName
        : "-";

  }


  if (el("resultQuantity")) {

    el("resultQuantity").textContent =
      "-";

  }


  if (el("resultStatus")) {

    el("resultStatus").textContent =
      "Belum dioptimasi";

  }

}


/* =========================================================
   GET BOUNDS
========================================================= */

function getBounds(points) {

  if (
    !Array.isArray(points) ||
    points.length === 0
  ) {

    return {

      width: 0,

      height: 0

    };

  }


  const validPoints =
    points.filter(
      point =>

        Array.isArray(point) &&

        point.length >= 2 &&

        Number.isFinite(
          Number(point[0])
        ) &&

        Number.isFinite(
          Number(point[1])
        )

    );


  if (
    validPoints.length === 0
  ) {

    return {

      width: 0,

      height: 0

    };

  }


  const xs =
    validPoints.map(
      point =>
        Number(point[0])
    );


  const ys =
    validPoints.map(
      point =>
        Number(point[1])
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
      Math.max(
        0,
        maxX - minX
      ),

    height:
      Math.max(
        0,
        maxY - minY
      )

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


  /* =====================================================
     FRONT
  ===================================================== */

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


  /* =====================================================
     BACK
  ===================================================== */

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


  /* =====================================================
     SLEEVE
  ===================================================== */

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
   APPLY SEAM
========================================================= */

function addSeamAllowance(
  pieces,
  seam
) {

  const safeSeam =
    Math.max(
      0,
      safeNumber(
        seam,
        0
      )
    );


  return pieces.map(
    piece => ({

      ...piece,

      width:
        piece.width +
        safeSeam * 2,

      height:
        piece.height +
        safeSeam * 2

    })
  );

}


/* =========================================================
   CREATE PIECE INSTANCES
========================================================= */

function createInstances(
  pieces,
  quantity
) {

  const instances = [];


  const garmentQuantity =
    Math.max(
      1,
      Math.floor(
        safeNumber(
          quantity,
          1
        )
      )
    );


  for (
    let garment = 1;
    garment <= garmentQuantity;
    garment++
  ) {

    for (
      const piece of pieces
    ) {

      const pieceQuantity =
        Math.max(
          1,
          Math.floor(
            safeNumber(
              piece.quantity,
              1
            )
          )
        );


      for (
        let i = 0;
        i < pieceQuantity;
        i++
      ) {

        instances.push({

          name:
            piece.name,

          width:
            safeNumber(
              piece.width,
              0
            ),

          height:
            safeNumber(
              piece.height,
              0
            ),

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
   SORT PIECES
========================================================= */

function sortPieces(
  instances
) {

  return instances.sort(

    (a, b) => {

      const areaA =
        a.width *
        a.height;


      const areaB =
        b.width *
        b.height;


      return (
        areaB -
        areaA
      );

    }

  );

}


/* =========================================================
   NESTING
========================================================= */

function nestPieces(
  instances,
  fabric
) {

  const usableWidth =
    Math.max(
      0,
      safeNumber(
        fabric.effectiveWidth,
        0
      )
    );


  if (
    usableWidth <= 0
  ) {

    throw new Error(
      "Lebar efektif kain tidak valid."
    );

  }


  const placements = [];


  let cursorX = 0;

  let cursorY = 0;

  let rowHeight = 0;


  let usedLength = 0;


  for (
    const piece of instances
  ) {

    let width =
      safeNumber(
        piece.width,
        0
      );


    let height =
      safeNumber(
        piece.height,
        0
      );


    let rotation =
      0;


    /* ===================================================
       ROTASI
    =================================================== */

    const allowed =
      Array.isArray(
        fabric.allowedRotation
      )

        ? fabric.allowedRotation

        : [0];


    /*
      Jika tidak muat secara horizontal,
      coba rotasi 90° hanya jika material
      mengizinkannya.
    */

    if (
      width > usableWidth
    ) {

      const canRotate90 =
        allowed.includes(90) ||
        allowed.includes(270);


      if (canRotate90) {

        const temp =
          width;

        width =
          height;

        height =
          temp;

        rotation =
          90;

      }

    }


    /* ===================================================
       PIECE TERLALU LEBAR
    =================================================== */

    if (
      width > usableWidth
    ) {

      throw new Error(

        `${piece.name} terlalu lebar ` +
        `(${round(width, 1)} cm) ` +
        `untuk lebar efektif kain ` +
        `${round(usableWidth, 1)} cm.`

      );

    }


    /* ===================================================
       PINDAH BARIS
    =================================================== */

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


    /* ===================================================
       PLACE
    =================================================== */

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


    /* ===================================================
       UPDATE CURSOR
    =================================================== */

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


  return {

    placements,

    usedLength:
      Math.max(
        0,
        usedLength
      )

  };

}


/* =========================================================
   CALCULATE EFFICIENCY
========================================================= */

function calculateEfficiency(
  placements,
  width,
  usedLength
) {

  const safeWidth =
    Math.max(
      0,
      safeNumber(
        width,
        0
      )
    );


  const safeLength =
    Math.max(
      0,
      safeNumber(
        usedLength,
        0
      )
    );


  if (
    safeWidth <= 0 ||
    safeLength <= 0
  ) {

    return 0;

  }


  const usedArea =
    placements.reduce(

      (
        total,
        piece
      ) => {

        return (
          total +
          (
            safeNumber(
              piece.width,
              0
            ) *
            safeNumber(
              piece.height,
              0
            )
          )
        );

      },

      0

    );


  const totalArea =
    safeWidth *
    safeLength;


  if (
    totalArea <= 0
  ) {

    return 0;

  }


  return (
    usedArea /
    totalArea
  ) * 100;

}


/* =========================================================
   OPTIMIZE FABRIC
========================================================= */

function optimizeFabric() {

  try {

    /* =====================================================
       PASTIKAN POLA ADA
    ===================================================== */

    if (
      !lastBodice ||
      !lastSleeve
    ) {

      generatePattern();

    }


    if (
      !lastBodice ||
      !lastSleeve
    ) {

      setStatus(
        "Buat pola terlebih dahulu."
      );

      return;

    }


    /* =====================================================
       UPDATE FABRIC
    ===================================================== */

    const fabric =
      updateFabricInformation();


    lastFabric =
      fabric;


    /* =====================================================
       MEASUREMENTS
    ===================================================== */

    const measurements =
      lastMeasurements ||
      getMeasurements();


    lastMeasurements =
      measurements;


    /* =====================================================
       FABRIC WIDTH
    ===================================================== */

    const fabricWidth =
      safeNumber(
        fabric.effectiveWidth,
        0
      );


    /* =====================================================
       FABRIC LENGTH
    ===================================================== */

    const availableLength =
      Math.max(
        0,
        safeNumber(
          fabric.length,
          0
        )
      );


    /* =====================================================
       SEAM
    ===================================================== */

    const seam =
      Math.max(
        0,
        safeNumber(
          measurements.seam,
          1
        )
      );


    /* =====================================================
       QUANTITY
    ===================================================== */

    const quantity =
      Math.max(
        1,
        Math.floor(
          safeNumber(
            measurements.garmentQuantity,
            1
          )
        )
      );


    /* =====================================================
       CHECK WIDTH
    ===================================================== */

    if (
      fabricWidth <= 0
    ) {

      setStatus(
        "Lebar kain belum diisi."
      );

      return;

    }


    /* =====================================================
       PIECES
    ===================================================== */

    let pieces =
      getPatternPieces();


    if (
      !pieces.length
    ) {

      setStatus(
        "Pola belum tersedia."
      );

      return;

    }


    /* =====================================================
       SEAM
    ===================================================== */

    pieces =
      addSeamAllowance(
        pieces,
        seam
      );


    /* =====================================================
       INSTANCES
    ===================================================== */

    let instances =
      createInstances(
        pieces,
        quantity
      );


    /* =====================================================
       SORT
    ===================================================== */

    instances =
      sortPieces(
        instances
      );


    /* =====================================================
       NESTING
    ===================================================== */

    const nesting =
      nestPieces(
        instances,
        fabric
      );


    const placements =
      nesting.placements;


    const usedLength =
      nesting.usedLength;


    /* =====================================================
       CHECK FABRIC LENGTH
    ===================================================== */

    const fits =
      availableLength > 0
        ? usedLength <= availableLength
        : false;


    /* =====================================================
       REMAINING
    ===================================================== */

    const remainingLength =
      availableLength > 0

        ? Math.max(
            0,
            availableLength -
            usedLength
          )

        : 0;


    /* =====================================================
       EFFICIENCY
    ===================================================== */

    const efficiency =
      calculateEfficiency(

        placements,

        fabricWidth,

        usedLength

      );


    /* =====================================================
       RESULT
    ===================================================== */

    lastOptimization = {

      width:
        fabricWidth,

      usedLength:
        usedLength,

      availableLength:
        availableLength,

      remainingLength:
        remainingLength,

      quantity:
        quantity,

      efficiency:
        efficiency,

      fits:
        fits,

      placements:
        placements

    };


    /* =====================================================
       RESULT WIDTH
    ===================================================== */

    if (el("resultWidth")) {

      el("resultWidth").textContent =
        round(
          fabricWidth,
          1
        );

    }


    /* =====================================================
       RESULT LENGTH
    ===================================================== */

    if (el("resultLength")) {

      el("resultLength").textContent =
        round(
          usedLength,
          1
        );

    }


    /* =====================================================
       RESULT MATERIAL
    ===================================================== */

    if (el("resultMaterial")) {

      el("resultMaterial").textContent =
        fabric.materialName;

    }


    /* =====================================================
       RESULT QUANTITY
    ===================================================== */

    if (el("resultQuantity")) {

      el("resultQuantity").textContent =
        quantity;

    }


    /* =====================================================
       RESULT STATUS
    ===================================================== */

    if (el("resultStatus")) {

      if (
        availableLength <= 0
      ) {

        el("resultStatus").textContent =

          `Kebutuhan ± ${round(
            usedLength,
            1
          )} cm`;

      }

      else if (fits) {

        el("resultStatus").textContent =

          `Optimal • Efisiensi ${round(
            efficiency,
            1
          )}%`;

      }

      else {

        const shortage =
          Math.max(
            0,
            usedLength -
            availableLength
          );


        el("resultStatus").textContent =

          `Tidak cukup panjang kain • ` +
          `Kurang ${round(
            shortage,
            1
          )} cm`;

      }

    }


    /* =====================================================
       STATUS UTAMA
    ===================================================== */

    if (
      availableLength <= 0
    ) {

      setStatus(

        `Optimasi selesai • ` +
        `Kebutuhan kain ± ${round(
          usedLength,
          1
        )} cm`

      );

    }

    else if (fits) {

      setStatus(

        `Optimasi selesai • ` +
        `Kebutuhan kain ± ${round(
          usedLength,
          1
        )} cm • ` +
        `Sisa ± ${round(
          remainingLength,
          1
        )} cm`

      );

    }

    else {

      const shortage =
        Math.max(
          0,
          usedLength -
          availableLength
        );


      setStatus(

        `Kain tidak cukup • ` +
        `Kebutuhan ± ${round(
          usedLength,
          1
        )} cm • ` +
        `Kurang ± ${round(
          shortage,
          1
        )} cm`

      );

    }


    /* =====================================================
       OPTIONAL NESTING PREVIEW
       Jika geometry.js versi berikutnya memiliki
       renderer layout, data tersedia di:
       
       lastOptimization.placements
    ===================================================== */

    console.log(
      "Fabric Optimization:",
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

    if (
      !lastSvg
    ) {

      generatePattern();

    }


    if (
      !lastSvg
    ) {

      setStatus(
        "Pola SVG belum tersedia."
      );

      return;

    }


    const blob =
      new Blob(

        [lastSvg],

        {
          type:
            "image/svg+xml;charset=utf-8"
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
      "PatternMaker-V1.5-pattern.svg";


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


    setStatus(
      "SVG berhasil disiapkan untuk diunduh."
    );

  }

  catch (error) {

    console.error(
      "Download SVG error:",
      error
    );


    setStatus(
      "Gagal mengunduh SVG."
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

        () => {

          updateFabricInformation();

          lastOptimization =
            null;

        }

      );


      node.addEventListener(

        "change",

        () => {

          updateFabricInformation();

          lastOptimization =
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

        /*
          Ukuran berubah.
          SVG lama tidak boleh dipakai.
        */

        lastSvg =
          "";


        lastBodice =
          null;


        lastSleeve =
          null;


        lastMeasurements =
          null;


        lastOptimization =
          null;


        resetOptimization();

      }

    );

  }

);


/* =========================================================
   START APPLICATION
========================================================= */

bindFabricInputs();


updateFabricInformation();


resetOptimization();


setStatus(

  "Masukkan ukuran kemudian tekan GENERATE PATTERN."

);
