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
   ---------------------------------------------------------
   Semua angka dari input dipaksa menjadi angka valid.
   Ini bagian penting untuk mencegah NaN.
========================================================= */

function safeNumber(value, fallback = 0) {

  const n = Number(value);

  if (
    Number.isFinite(n)
  ) {

    return n;

  }

  return fallback;

}


/* =========================================================
   GET NUMBER
========================================================= */

function number(id, fallback = 0) {

  const node = el(id);

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

function round(value, digits = 1) {

  const n =
    safeNumber(
      value,
      0
    );


  const factor =
    Math.pow(
      10,
      digits
    );


  return (
    Math.round(
      n * factor
    ) / factor
  );

}


/* =========================================================
   FORMAT CM
========================================================= */

function formatCm(value) {

  const n =
    safeNumber(
      value,
      0
    );


  return round(
    n,
    1
  ) + " cm";

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
    "Unknown"
  );

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
        safeNumber(
          measurements.fabricWidth,
          0
        ),

      length:
        safeNumber(
          measurements.fabricLength,
          0
        ),

      selvedgeLeft:
        safeNumber(
          measurements.selvedgeLeft,
          0
        ),

      selvedgeRight:
        safeNumber(
          measurements.selvedgeRight,
          0
        )

    });


  lastFabric =
    fabric;


  /* =======================================================
     MATERIAL
  ======================================================= */

  if (
    el("materialName")
  ) {

    el("materialName").textContent =
      fabric.materialName;

  }


  /* =======================================================
     WIDTH
  ======================================================= */

  if (
    el("displayFabricWidth")
  ) {

    el("displayFabricWidth").textContent =
      round(
        fabric.width,
        1
      );

  }


  /* =======================================================
     EFFECTIVE WIDTH
  ======================================================= */

  if (
    el("effectiveWidth")
  ) {

    el("effectiveWidth").textContent =
      round(
        fabric.effectiveWidth,
        1
      );

  }


  /* =======================================================
     LENGTH
  ======================================================= */

  if (
    el("displayFabricLength")
  ) {

    el("displayFabricLength").textContent =
      round(
        fabric.length,
        1
      );

  }


  /* =======================================================
     STRETCH
  ======================================================= */

  if (
    el("fabricStretch")
  ) {

    el("fabricStretch").textContent =
      fabric.stretch;

  }


  /* =======================================================
     STRETCH DIRECTION
  ======================================================= */

  if (
    el("stretchDirection")
  ) {

    el("stretchDirection").textContent =
      fabric.stretchDirection;

  }


  /* =======================================================
     ROTATION
  ======================================================= */

  if (
    el("allowedRotation")
  ) {

    el("allowedRotation").textContent =

      (
        fabric.allowedRotation ||
        []
      )

        .map(
          value => value + "°"
        )

        .join(", ");

  }


  return fabric;

}


/* =========================================================
   VALIDATE MEASUREMENTS
========================================================= */

function validateMeasurements(
  measurements
) {

  const required = {

    bust:
      "Lingkar dada",

    waist:
      "Lingkar pinggang",

    shoulder:
      "Lebar bahu",

    bodyLength:
      "Panjang badan",

    neck:
      "Lingkar leher",

    upperArm:
      "Lingkar lengan atas",

    sleeveLength:
      "Panjang lengan",

    wrist:
      "Lingkar pergelangan"

  };


  const errors = [];


  for (
    const key in required
  ) {

    const value =
      safeNumber(
        measurements[key],
        0
      );


    if (
      value <= 0
    ) {

      errors.push(
        required[key]
      );

    }

  }


  return errors;

}


/* =========================================================
   VALIDATE FABRIC
========================================================= */

function validateFabric(
  fabric
) {

  const errors = [];


  if (
    !fabric
  ) {

    errors.push(
      "Data kain tidak tersedia"
    );

    return errors;

  }


  if (
    safeNumber(
      fabric.width,
      0
    ) <= 0
  ) {

    errors.push(
      "Lebar kain"
    );

  }


  if (
    safeNumber(
      fabric.length,
      0
    ) <= 0
  ) {

    errors.push(
      "Panjang kain"
    );

  }


  if (
    safeNumber(
      fabric.effectiveWidth,
      0
    ) <= 0
  ) {

    errors.push(
      "Lebar efektif kain"
    );

  }


  return errors;

}


/* =========================================================
   GENERATE PATTERN
========================================================= */

function generatePattern() {

  try {


    /* =====================================================
       GET MEASUREMENTS
    ===================================================== */

    const measurements =
      getMeasurements();


    lastMeasurements =
      measurements;


    /* =====================================================
       VALIDATE BODY
    ===================================================== */

    const measurementErrors =
      validateMeasurements(
        measurements
      );


    if (
      measurementErrors.length
    ) {

      setStatus(

        "Ukuran belum lengkap: " +
        measurementErrors.join(", ")

      );

      return;

    }


    /* =====================================================
       CREATE FABRIC
    ===================================================== */

    const fabric =
      updateFabricInformation();


    lastFabric =
      fabric;


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

    if (
      el("canvasWrap")
    ) {

      el("canvasWrap").innerHTML =
        svg;

    }


    /* =====================================================
       STATUS
    ===================================================== */

    setStatus(

      "Pola berhasil dibuat • " +

      "Usia " +

      safeNumber(
        measurements.age,
        0
      ) +

      " tahun • " +

      fabric.materialName +

      " • Kain " +

      formatCm(
        fabric.width
      )

    );


    /* =====================================================
       RESET OPTIMIZER
    ===================================================== */

    resetOptimization();


    /* =====================================================
       SCROLL
    ===================================================== */

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
   RESET OPTIMIZATION
========================================================= */

function resetOptimization() {

  lastOptimization =
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

}


/* =========================================================
   GET PIECE BOUNDS
========================================================= */

function getBounds(
  points
) {

  if (
    !Array.isArray(points) ||
    !points.length
  ) {

    return {

      width:
        0,

      height:
        0

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
    !validPoints.length
  ) {

    return {

      width:
        0,

      height:
        0

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
    Math.min(
      ...xs
    );


  const maxX =
    Math.max(
      ...xs
    );


  const minY =
    Math.min(
      ...ys
    );


  const maxY =
    Math.max(
      ...ys
    );


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


  if (
    frontBounds.width > 0 &&
    frontBounds.height > 0
  ) {

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

  }


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


  if (
    backBounds.width > 0 &&
    backBounds.height > 0
  ) {

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

  }


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


  if (
    sleeveBounds.width > 0 &&
    sleeveBounds.height > 0
  ) {

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

  }


  return pieces;

}


/* =========================================================
   CREATE INSTANCES
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
    let garment = 0;

    garment <
    garmentQuantity;

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

        i <
        pieceQuantity;

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

          garment:
            garment + 1,

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
        safeNumber(
          a.width,
          0
        ) *
        safeNumber(
          a.height,
          0
        );


      const areaB =
        safeNumber(
          b.width,
          0
        ) *
        safeNumber(
          b.height,
          0
        );


      return (
        areaB -
        areaA
      );

    }

  );

}


/* =========================================================
   TRY ROTATION
========================================================= */

function getBestOrientation(
  piece,
  usableWidth,
  allowedRotation
) {

  const originalWidth =
    safeNumber(
      piece.width,
      0
    );


  const originalHeight =
    safeNumber(
      piece.height,
      0
    );


  const candidates = [];


  /* =====================================================
     ORIGINAL
  ===================================================== */

  if (
    originalWidth <=
    usableWidth
  ) {

    candidates.push({

      width:
        originalWidth,

      height:
        originalHeight,

      rotation:
        0

    });

  }


  /* =====================================================
     ROTATED 90
  ===================================================== */

  if (
    allowedRotation.includes(90) &&

    originalHeight <=
    usableWidth
  ) {

    candidates.push({

      width:
        originalHeight,

      height:
        originalWidth,

      rotation:
        90

    });

  }


  /* =====================================================
     ROTATED 270
  ===================================================== */

  if (
    allowedRotation.includes(270) &&

    originalHeight <=
    usableWidth
  ) {

    candidates.push({

      width:
        originalHeight,

      height:
        originalWidth,

      rotation:
        270

    });

  }


  /* =====================================================
     180 DEGREE
     Dimensi tetap sama.
  ===================================================== */

  if (
    allowedRotation.includes(180) &&

    originalWidth <=
    usableWidth
  ) {

    candidates.push({

      width:
        originalWidth,

      height:
        originalHeight,

      rotation:
        180

    });

  }


  if (
    !candidates.length
  ) {

    return null;

  }


  /*
    Pilih orientasi dengan
    tinggi terkecil.
  */

  candidates.sort(

    (a, b) => {

      return (
        a.height -
        b.height
      );

    }

  );


  return candidates[0];

}


/* =========================================================
   FABRIC OPTIMIZER
========================================================= */

function optimizeFabric() {

  try {


    /* =====================================================
       PASTIKAN POLA TERSEDIA
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
       GET MEASUREMENTS
    ===================================================== */

    const measurements =
      lastMeasurements ||
      getMeasurements();


    /* =====================================================
       UPDATE FABRIC
    ===================================================== */

    const fabric =
      updateFabricInformation();


    lastFabric =
      fabric;


    /* =====================================================
       VALIDATE FABRIC
    ===================================================== */

    const fabricErrors =
      validateFabric(
        fabric
      );


    if (
      fabricErrors.length
    ) {

      resetOptimization();


      setStatus(

        "Data kain belum lengkap: " +

        fabricErrors.join(", ")

      );

      return;

    }


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
       TAMBAHKAN SEAM
    ===================================================== */

    pieces =
      pieces.map(

        piece => ({

          ...piece,

          width:

            safeNumber(
              piece.width,
              0
            ) +

            seam * 2,

          height:

            safeNumber(
              piece.height,
              0
            ) +

            seam * 2

        })

      );


    /* =====================================================
       CREATE INSTANCES
    ===================================================== */

    let instances =
      createInstances(

        pieces,

        quantity

      );


    /* =====================================================
       REMOVE INVALID PIECES
    ===================================================== */

    instances =
      instances.filter(

        piece =>

          piece.width > 0 &&

          piece.height > 0 &&

          Number.isFinite(
            piece.width
          ) &&

          Number.isFinite(
            piece.height
          )

      );


    if (
      !instances.length
    ) {

      setStatus(
        "Ukuran pola tidak valid."
      );

      return;

    }


    /* =====================================================
       SORT
    ===================================================== */

    instances =
      sortPieces(
        instances
      );


    /* =====================================================
       FABRIC WIDTH
    ===================================================== */

    const usableWidth =
      safeNumber(
        fabric.effectiveWidth,
        0
      );


    const availableLength =
      safeNumber(
        fabric.length,
        0
      );


    if (
      usableWidth <= 0
    ) {

      setStatus(
        "Lebar efektif kain tidak valid."
      );

      return;

    }


    if (
      availableLength <= 0
    ) {

      setStatus(
        "Panjang kain belum diisi."
      );

      return;

    }


    /* =====================================================
       ALLOWED ROTATION
    ===================================================== */

    const allowedRotation =

      Array.isArray(
        fabric.allowedRotation
      )

        ? fabric.allowedRotation

        : [0];


    /* =====================================================
       NESTING
    ===================================================== */

    let cursorX =
      0;


    let cursorY =
      0;


    let rowHeight =
      0;


    let usedLength =
      0;


    const placements = [];


    for (
      const piece of instances
    ) {


      /* ===================================================
         ORIENTATION
      =================================================== */

      const orientation =
        getBestOrientation(

          piece,

          usableWidth,

          allowedRotation

        );


      if (
        !orientation
      ) {

        throw new Error(

          `${piece.name} terlalu lebar ` +

          `untuk kain efektif ` +

          `${round(
            usableWidth,
            1
          )} cm`

        );

      }


      let width =
        safeNumber(
          orientation.width,
          0
        );


      let height =
        safeNumber(
          orientation.height,
          0
        );


      const rotation =
        orientation.rotation;


      /* ===================================================
         NEW ROW
      =================================================== */

      if (

        cursorX > 0 &&

        (
          cursorX +
          width
        ) >

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
         SECOND CHECK
      =================================================== */

      if (
        width >
        usableWidth
      ) {

        throw new Error(

          `${piece.name} tidak dapat ` +

          `dimasukkan ke kain.`

        );

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

        width:
          width,

        height:
          height,

        rotation:
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


    /* =====================================================
       FINAL SAFE LENGTH
    ===================================================== */

    usedLength =
      safeNumber(
        usedLength,
        0
      );


    /* =====================================================
       CHECK FABRIC LENGTH
    ===================================================== */

    const fits =
      usedLength <=
      availableLength;


    /* =====================================================
       USED AREA
    ===================================================== */

    const usedArea =
      placements.reduce(

        (
          sum,
          piece
        ) => {

          const width =
            safeNumber(
              piece.width,
              0
            );


          const height =
            safeNumber(
              piece.height,
              0
            );


          return (

            sum +

            width *
            height

          );

        },

        0

      );


    /* =====================================================
       TOTAL AREA
    ===================================================== */

    const totalArea =

      usableWidth *
      usedLength;


    /* =====================================================
       EFFICIENCY
    ===================================================== */

    const efficiency =

      totalArea > 0

        ? (

            usedArea /
            totalArea

          ) * 100

        : 0;


    /* =====================================================
       REMAINING
    ===================================================== */

    const remainingLength =

      Math.max(

        0,

        availableLength -
        usedLength

      );


    /* =====================================================
       RESULT OBJECT
    ===================================================== */

    lastOptimization = {

      width:
        usableWidth,

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
       UI WIDTH
    ===================================================== */

    if (
      el("resultWidth")
    ) {

      el("resultWidth").textContent =

        round(
          usableWidth,
          1
        );

    }


    /* =====================================================
       UI LENGTH
    ===================================================== */

    if (
      el("resultLength")
    ) {

      el("resultLength").textContent =

        round(
          usedLength,
          1
        );

    }


    /* =====================================================
       UI MATERIAL
    ===================================================== */

    if (
      el("resultMaterial")
    ) {

      el("resultMaterial").textContent =

        fabric.materialName;

    }


    /* =====================================================
       UI QUANTITY
    ===================================================== */

    if (
      el("resultQuantity")
    ) {

      el("resultQuantity").textContent =
        quantity;

    }


    /* =====================================================
       UI STATUS
    ===================================================== */

    if (
      el("resultStatus")
    ) {

      if (
        fits
      ) {

        el("resultStatus").textContent =

          "Optimal • Efisiensi " +

          round(
            efficiency,
            1
          ) +

          "%";

      }

      else {

        el("resultStatus").textContent =

          "Tidak cukup panjang kain";

      }

    }


    /* =====================================================
       MAIN STATUS
    ===================================================== */

    setStatus(

      "Optimasi selesai • " +

      "Kebutuhan ± " +

      round(
        usedLength,
        1
      ) +

      " cm • Sisa ± " +

      round(
        remainingLength,
        1
      ) +

      " cm"

    );


  }

  catch (error) {

    console.error(

      "Fabric optimizer error:",

      error

    );


    resetOptimization();


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

        [
          lastSvg
        ],

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

      "Download error:",

      error

    );

    setStatus(
      "SVG gagal di-download."
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

          resetOptimization();

        }

      );


      node.addEventListener(

        "change",

        () => {

          updateFabricInformation();

          resetOptimization();

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

        lastOptimization =
          null;


        if (
          el("resultStatus")
        ) {

          el("resultStatus").textContent =
            "Belum dioptimasi";

        }

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
