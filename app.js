/* =========================================================
   PatternMaker V1.4
   MAIN APPLICATION
   ---------------------------------------------------------
   Menghubungkan:
   - Measurement Engine
   - Bodice Engine
   - Sleeve Engine
   - Geometry Engine
   - Fabric Engine
   - Fabric Optimizer prototype
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

  const value = Number(node.value);

  return Number.isFinite(value)
    ? value
    : fallback;

}


function round(value, digits = 1) {

  const factor = Math.pow(10, digits);

  return Math.round(value * factor) / factor;

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


  lastFabric = fabric;


  /* -----------------------------------------
     MATERIAL
  ----------------------------------------- */

  if (el("materialName")) {

    el("materialName").textContent =
      fabric.materialName;

  }


  /* -----------------------------------------
     WIDTH
  ----------------------------------------- */

  if (el("displayFabricWidth")) {

    el("displayFabricWidth").textContent =
      fabric.width;

  }


  /* -----------------------------------------
     EFFECTIVE WIDTH
  ----------------------------------------- */

  if (el("effectiveWidth")) {

    el("effectiveWidth").textContent =
      fabric.effectiveWidth;

  }


  /* -----------------------------------------
     LENGTH
  ----------------------------------------- */

  if (el("displayFabricLength")) {

    el("displayFabricLength").textContent =
      fabric.length;

  }


  /* -----------------------------------------
     STRETCH
  ----------------------------------------- */

  if (el("fabricStretch")) {

    el("fabricStretch").textContent =
      fabric.stretch;

  }


  /* -----------------------------------------
     STRETCH DIRECTION
  ----------------------------------------- */

  if (el("stretchDirection")) {

    el("stretchDirection").textContent =
      fabric.stretchDirection;

  }


  /* -----------------------------------------
     ROTATION
  ----------------------------------------- */

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


    /* ---------------------------------------
       GET MEASUREMENTS
    --------------------------------------- */

    const measurements =
      getMeasurements();


    lastMeasurements =
      measurements;


    /* ---------------------------------------
       CREATE FABRIC
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
       SVG
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
       SCROLL PREVIEW
    --------------------------------------- */

    if (el("canvasWrap")) {

      el("canvasWrap").scrollIntoView({

        behavior: "smooth",

        block: "center"

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

}


/* =========================================================
   GET PIECE BOUNDS
========================================================= */

function getBounds(points) {

  if (!points || !points.length) {

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
    getBounds(frontPoints);


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
    getBounds(backPoints);


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
    getBounds(sleevePoints);


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
   SIMPLE FABRIC NESTING
   ---------------------------------------------------------
   Prototype V1

   Tujuan:
   mencari susunan pola yang menggunakan
   lebar kain dan panjang kain secara efisien.
========================================================= */

function optimizeFabric() {


  try {


    /* ---------------------------------------
       Pastikan pola sudah ada
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
      measurements.seam || 1;


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
       TAMBAHKAN SEAM
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
       BUAT INSTANCE
       SESUAI JUMLAH PAKAIAN
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
       NESTING HEURISTIC
    ---------------------------------------

       Strategi sederhana:

       1. Piece terbesar diprioritaskan.
       2. Isi lebar kain dari kiri ke kanan.
       3. Jika tidak muat, turun ke baris berikutnya.

       Ini belum AI.

       Ini algoritma matematis prototype.
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


    let cursorX = 0;

    let cursorY = 0;

    let rowHeight = 0;


    let usedLength = 0;


    const placements = [];


    for (
      const piece of instances
    ) {


      let width =
        piece.width;


      let height =
        piece.height;


      /* -------------------------------------
         ROTASI
      ------------------------------------- */

      let rotation =
        0;


      const allowed =
        fabric.allowedRotation ||
        [0];


      /*
        Untuk Sublime Jersey:

        allowedRotation = [0,180]

        sehingga dimensi tetap sama.
      */


      if (
        width >
        usableWidth
      ) {

        if (
          allowed.includes(90) ||
          allowed.includes(270)
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

      }


      /* -------------------------------------
         TIDAK MUAT
      ------------------------------------- */

      if (
        width >
        usableWidth
      ) {

        throw new Error(

          `${piece.name} terlalu lebar ` +
          `untuk kain ${usableWidth} cm`

        );

      }


      /* -------------------------------------
         PINDAH BARIS
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
         PLACE
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
          cursorY + rowHeight
        );

    }


    /* ---------------------------------------
       FABRIC AVAILABLE
    --------------------------------------- */

    const availableLength =
      fabric.length;


    const fits =
      usedLength <=
      availableLength;


    /* ---------------------------------------
       EFFICIENCY
    --------------------------------------- */

    const usedArea =
      placements.reduce(

        (sum, piece) =>

          sum +
          piece.width *
          piece.height,

        0

      );


    const totalArea =
      fabric.effectiveWidth *
      usedLength;


    const efficiency =
      totalArea > 0

        ? (
            usedArea /
            totalArea
          ) * 100

        : 0;


    const remainingLength =
      Math.max(

        0,

        availableLength -
        usedLength

      );


    /* ---------------------------------------
       RESULT
    --------------------------------------- */

    lastOptimization = {

      width:
        fabric.effectiveWidth,

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

      el("resultStatus").textContent =

        fits

          ? `Optimal • Hemat ${round(
              efficiency,
              1
            )}% area`

          : `Tidak cukup panjang kain`;

    }


    /* ---------------------------------------
       STATUS
    --------------------------------------- */

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


    /*
      Untuk tahap berikutnya kita akan
      menggambar layout nesting ini
      sebagai SVG kain 150 cm.
    */


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

        lastSvg = "";

        lastOptimization =
          null;

      }

    );

  }

);


/* =========================================================
   START
========================================================= */

bindFabricInputs();

updateFabricInformation();


/*
  Jangan langsung membuat pola
  pada saat halaman dibuka.

  User dapat mengubah ukuran
  terlebih dahulu.
*/


setStatus(
  "Masukkan ukuran kemudian tekan GENERATE PATTERN."
);.