/* =========================================================
   PatternMaker V1.5.1
   MAIN APPLICATION
   ---------------------------------------------------------
   Menghubungkan:
   - Measurement Engine
   - Bodice Engine
   - Sleeve Engine
   - Geometry Engine
   - Fabric Engine
   - Fabric Optimizer
   - Number Safety / Validation

   Fokus V1.5.1:
   - Mencegah NaN
   - Validasi ukuran
   - Validasi pattern pieces
   - Validasi fabric
   - Optimizer lebih stabil
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


/* =========================================================
   SAFE NUMBER
   ---------------------------------------------------------
   Semua angka dari UI melewati fungsi ini.
   Tujuannya mencegah NaN masuk ke engine.
========================================================= */

function safeNumber(
  value,
  fallback = 0
) {

  const number =
    Number(value);


  return Number.isFinite(number)
    ? number
    : fallback;

}


/* =========================================================
   NUMBER INPUT
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

  const number =
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
      number * factor
    ) / factor
  );

}


/* =========================================================
   MATERIAL NAME
========================================================= */

function materialName(
  key
) {

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


  /* -----------------------------------------
     NORMALIZE FABRIC VALUES
  ----------------------------------------- */

  const fabricWidth =
    safeNumber(
      measurements.fabricWidth,
      0
    );


  const fabricLength =
    safeNumber(
      measurements.fabricLength,
      0
    );


  const selvedgeLeft =
    safeNumber(
      measurements.selvedgeLeft,
      0
    );


  const selvedgeRight =
    safeNumber(
      measurements.selvedgeRight,
      0
    );


  /* -----------------------------------------
     CREATE FABRIC
  ----------------------------------------- */

  const fabric =
    createFabric({

      material:
        measurements.fabric,

      width:
        fabricWidth,

      length:
        fabricLength,

      selvedgeLeft:
        selvedgeLeft,

      selvedgeRight:
        selvedgeRight

    });


  /* -----------------------------------------
     NORMALIZE FABRIC OBJECT
  ----------------------------------------- */

  fabric.width =
    safeNumber(
      fabric.width,
      0
    );


  fabric.length =
    safeNumber(
      fabric.length,
      0
    );


  fabric.effectiveWidth =
    safeNumber(
      fabric.effectiveWidth,
      0
    );


  lastFabric =
    fabric;


  /* -----------------------------------------
     MATERIAL
  ----------------------------------------- */

  if (
    el("materialName")
  ) {

    el("materialName")
      .textContent =
        fabric.materialName ||
        materialName(
          measurements.fabric
        );

  }


  /* -----------------------------------------
     WIDTH
  ----------------------------------------- */

  if (
    el("displayFabricWidth")
  ) {

    el("displayFabricWidth")
      .textContent =
        round(
          fabric.width,
          1
        );

  }


  /* -----------------------------------------
     EFFECTIVE WIDTH
  ----------------------------------------- */

  if (
    el("effectiveWidth")
  ) {

    el("effectiveWidth")
      .textContent =
        round(
          fabric.effectiveWidth,
          1
        );

  }


  /* -----------------------------------------
     LENGTH
  ----------------------------------------- */

  if (
    el("displayFabricLength")
  ) {

    el("displayFabricLength")
      .textContent =
        round(
          fabric.length,
          1
        );

  }


  /* -----------------------------------------
     STRETCH
  ----------------------------------------- */

  if (
    el("fabricStretch")
  ) {

    el("fabricStretch")
      .textContent =
        fabric.stretch ||
        "-";

  }


  /* -----------------------------------------
     STRETCH DIRECTION
  ----------------------------------------- */

  if (
    el("stretchDirection")
  ) {

    el("stretchDirection")
      .textContent =
        fabric.stretchDirection ||
        "-";

  }


  /* -----------------------------------------
     ROTATION
  ----------------------------------------- */

  if (
    el("allowedRotation")
  ) {

    const rotations =
      Array.isArray(
        fabric.allowedRotation
      )
        ? fabric.allowedRotation
        : [0];


    el("allowedRotation")
      .textContent =
        rotations
          .map(
            value =>
              safeNumber(
                value,
                0
              ) + "°"
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

  const required = [

    {
      key: "bust",
      label: "Lingkar dada"
    },

    {
      key: "waist",
      label: "Lingkar pinggang"
    },

    {
      key: "shoulder",
      label: "Lebar bahu"
    },

    {
      key: "bodyLength",
      label: "Panjang badan"
    },

    {
      key: "neck",
      label: "Lingkar leher"
    },

    {
      key: "upperArm",
      label: "Lingkar lengan atas"
    },

    {
      key: "sleeveLength",
      label: "Panjang lengan"
    },

    {
      key: "wrist",
      label: "Lingkar ujung lengan"
    }

  ];


  for (
    const item of required
  ) {

    const value =
      safeNumber(
        measurements[item.key],
        0
      );


    if (
      value <= 0
    ) {

      return {

        valid: false,

        message:
          `${item.label} harus lebih dari 0 cm.`

      };

    }

  }


  /* -----------------------------------------
     FABRIC WIDTH
  ----------------------------------------- */

  const fabricWidth =
    safeNumber(
      measurements.fabricWidth,
      0
    );


  if (
    fabricWidth <= 0
  ) {

    return {

      valid: false,

      message:
        "Lebar kain harus lebih dari 0 cm."

    };

  }


  /* -----------------------------------------
     FABRIC LENGTH
  ----------------------------------------- */

  const fabricLength =
    safeNumber(
      measurements.fabricLength,
      0
    );


  /*
     Panjang kain boleh 0 ketika hanya
     generate pattern.

     Tetapi optimizer akan memeriksa
     kembali sebelum menghitung.
  */


  return {

    valid: true,

    message: "OK"

  };

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
       VALIDATE
    --------------------------------------- */

    const validation =
      validateMeasurements(
        measurements
      );


    if (
      !validation.valid
    ) {

      setStatus(
        validation.message
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
       VALIDATE BODICE
    --------------------------------------- */

    if (
      !validateBodice(
        bodice
      )
    ) {

      setStatus(
        "Geometri bodice tidak valid."
      );

      return;

    }


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
       VALIDATE SLEEVE
    --------------------------------------- */

    if (
      !validateSleeve(
        sleeve
      )
    ) {

      setStatus(
        "Geometri lengan tidak valid."
      );

      return;

    }


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

    if (
      el("canvasWrap")
    ) {

      el("canvasWrap")
        .innerHTML =
          svg;

    }


    /* ---------------------------------------
       STATUS
    --------------------------------------- */

    setStatus(

      `Pola berhasil dibuat • ` +
      `Usia ${safeNumber(
        measurements.age,
        0
      )} tahun • ` +
      `${fabric.materialName} • ` +
      `Kain ${round(
        fabric.width,
        1
      )} cm`

    );


    /* ---------------------------------------
       RESET OPTIMIZER
    --------------------------------------- */

    resetOptimization();


    /* ---------------------------------------
       SCROLL
    --------------------------------------- */

    if (
      el("canvasWrap")
    ) {

      el("canvasWrap")
        .scrollIntoView({

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
      error.message ||
      "Terjadi kesalahan saat membuat pola."
    );

  }

}


/* =========================================================
   VALIDATE BODICE
========================================================= */

function validateBodice(
  bodice
) {

  if (!bodice) {

    return false;

  }


  const sections = [

    bodice.front,

    bodice.back

  ];


  for (
    const section of sections
  ) {

    if (!section) {

      return false;

    }


    const keys = [

      "A",
      "B",
      "C",
      "D",
      "E",
      "F"

    ];


    for (
      const key of keys
    ) {

      const point =
        section[key];


      if (
        !Array.isArray(point) ||
        point.length < 2
      ) {

        return false;

      }


      if (
        !Number.isFinite(
          Number(point[0])
        ) ||
        !Number.isFinite(
          Number(point[1])
        )
      ) {

        return false;

      }

    }

  }


  return true;

}


/* =========================================================
   VALIDATE SLEEVE
========================================================= */

function validateSleeve(
  sleeve
) {

  if (!sleeve) {

    return false;

  }


  const points = [

    sleeve.left,
    sleeve.leftCap,
    sleeve.top,
    sleeve.rightCap,
    sleeve.right,
    sleeve.bottomLeft,
    sleeve.bottomRight

  ];


  for (
    const point of points
  ) {

    if (
      !Array.isArray(point) ||
      point.length < 2
    ) {

      return false;

    }


    if (
      !Number.isFinite(
        Number(point[0])
      ) ||
      !Number.isFinite(
        Number(point[1])
      )
    ) {

      return false;

    }

  }


  return true;

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

    el("status")
      .textContent =
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

    el("resultWidth")
      .textContent =
        "-";

  }


  if (
    el("resultLength")
  ) {

    el("resultLength")
      .textContent =
        "-";

  }


  if (
    el("resultMaterial")
  ) {

    el("resultMaterial")
      .textContent =
        "-";

  }


  if (
    el("resultQuantity")
  ) {

    el("resultQuantity")
      .textContent =
        "-";

  }


  if (
    el("resultStatus")
  ) {

    el("resultStatus")
      .textContent =
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
    points.length === 0
  ) {

    return {

      width: 0,

      height: 0

    };

  }


  /* -----------------------------------------
     ONLY VALID POINTS
  ----------------------------------------- */

  const validPoints =
    points.filter(
      point => {

        return (

          Array.isArray(point) &&

          point.length >= 2 &&

          Number.isFinite(
            Number(point[0])
          ) &&

          Number.isFinite(
            Number(point[1])
          )

        );

      }
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


  const width =
    maxX - minX;


  const height =
    maxY - minY;


  return {

    width:
      Number.isFinite(width)
        ? width
        : 0,

    height:
      Number.isFinite(height)
        ? height
        : 0

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


  /* =======================================================
     FRONT
  ======================================================= */

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


  /* =======================================================
     BACK
  ======================================================= */

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


  /* =======================================================
     SLEEVE
  ======================================================= */

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
   VALIDATE PIECES
========================================================= */

function validatePatternPieces(
  pieces
) {

  if (
    !Array.isArray(pieces) ||
    pieces.length === 0
  ) {

    return {

      valid: false,

      message:
        "Pola belum tersedia."

    };

  }


  for (
    const piece of pieces
  ) {

    if (
      !piece ||
      !piece.name
    ) {

      return {

        valid: false,

        message:
          "Ada bagian pola yang tidak valid."

      };

    }


    if (
      !Number.isFinite(
        Number(piece.width)
      ) ||
      !Number.isFinite(
        Number(piece.height)
      )
    ) {

      console.error(
        "Invalid pattern piece:",
        piece
      );


      return {

        valid: false,

        message:
          `Ukuran pola ${piece.name} menghasilkan angka tidak valid.`

      };

    }


    if (
      Number(piece.width) <= 0 ||
      Number(piece.height) <= 0
    ) {

      console.error(
        "Zero-size pattern piece:",
        piece
      );


      return {

        valid: false,

        message:
          `Ukuran pola ${piece.name} tidak valid.`

      };

    }

  }


  return {

    valid: true,

    message: "OK"

  };

}


/* =========================================================
   SIMPLE FABRIC NESTING
========================================================= */

function optimizeFabric() {

  try {

    /* ---------------------------------------
       PASTIKAN POLA SUDAH ADA
    --------------------------------------- */

    if (
      !lastBodice ||
      !lastSleeve
    ) {

      generatePattern();

    }


    /* ---------------------------------------
       CHECK AGAIN
    --------------------------------------- */

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
       NORMALIZE FABRIC NUMBERS
    --------------------------------------- */

    const fabricWidth =
      safeNumber(
        fabric.width,
        0
      );


    const fabricLength =
      safeNumber(
        fabric.length,
        0
      );


    const effectiveWidth =
      safeNumber(
        fabric.effectiveWidth,
        0
      );


    /* ---------------------------------------
       FABRIC VALIDATION
    --------------------------------------- */

    if (
      fabricWidth <= 0
    ) {

      setStatus(
        "Lebar kain tidak valid."
      );

      return;

    }


    if (
      effectiveWidth <= 0
    ) {

      setStatus(
        "Lebar efektif kain tidak valid."
      );

      return;

    }


    if (
      fabricLength <= 0
    ) {

      setStatus(
        "Panjang kain harus lebih dari 0 cm."
      );

      return;

    }


    /* ---------------------------------------
       SEAM
    --------------------------------------- */

    const seam =
      Math.max(
        0,
        safeNumber(
          measurements.seam,
          1
        )
      );


    /* ---------------------------------------
       QUANTITY
    --------------------------------------- */

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


    /* ---------------------------------------
       PIECES
    --------------------------------------- */

    let pieces =
      getPatternPieces();


    /* ---------------------------------------
       VALIDATE PIECES
    --------------------------------------- */

    const piecesValidation =
      validatePatternPieces(
        pieces
      );


    if (
      !piecesValidation.valid
    ) {

      setStatus(
        piecesValidation.message
      );

      return;

    }


    /* ---------------------------------------
       TAMBAHKAN SEAM
    --------------------------------------- */

    pieces =
      pieces.map(
        piece => {

          const width =
            safeNumber(
              piece.width,
              0
            ) +
            seam * 2;


          const height =
            safeNumber(
              piece.height,
              0
            ) +
            seam * 2;


          return {

            ...piece,

            width,

            height

          };

        }
      );


    /* ---------------------------------------
       VALIDATE AFTER SEAM
    --------------------------------------- */

    const seamInvalidPiece =
      pieces.find(
        piece => {

          return (

            !Number.isFinite(
              piece.width
            ) ||

            !Number.isFinite(
              piece.height
            ) ||

            piece.width <= 0 ||

            piece.height <= 0

          );

        }
      );


    if (
      seamInvalidPiece
    ) {

      console.error(
        "Invalid piece after seam:",
        seamInvalidPiece
      );


      setStatus(
        `Ukuran ${seamInvalidPiece.name} tidak valid setelah kampuh.`
      );

      return;

    }


    /* ---------------------------------------
       BUAT INSTANCE
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
       VALIDATE INSTANCES
    --------------------------------------- */

    const invalidInstance =
      instances.find(
        piece => {

          return (

            !Number.isFinite(
              piece.width
            ) ||

            !Number.isFinite(
              piece.height
            )

          );

        }
      );


    if (
      invalidInstance
    ) {

      console.error(
        "Invalid nesting instance:",
        invalidInstance
      );


      setStatus(
        "Data nesting tidak valid."
      );

      return;

    }


    /* ---------------------------------------
       SORT BY AREA
    --------------------------------------- */

    instances.sort(

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


    /* ---------------------------------------
       USABLE WIDTH
    --------------------------------------- */

    const usableWidth =
      effectiveWidth;


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

    let cursorX = 0;

    let cursorY = 0;

    let rowHeight = 0;

    let usedLength = 0;


    const placements = [];


    /* ---------------------------------------
       ROTATION RULES
    --------------------------------------- */

    const allowed =
      Array.isArray(
        fabric.allowedRotation
      )

        ? fabric.allowedRotation

        : [0];


    /* ---------------------------------------
       PLACE PIECES
    --------------------------------------- */

    for (
      const piece of instances
    ) {

      let pieceWidth =
        safeNumber(
          piece.width,
          0
        );


      let pieceHeight =
        safeNumber(
          piece.height,
          0
        );


      let rotation =
        0;


      /* -------------------------------------
         TRY ROTATION
      ------------------------------------- */

      if (
        pieceWidth >
        usableWidth
      ) {

        const canRotate90 =
          allowed.includes(90);


        const canRotate270 =
          allowed.includes(270);


        if (
          canRotate90 ||
          canRotate270
        ) {

          if (
            pieceHeight <=
            usableWidth
          ) {

            const temp =
              pieceWidth;


            pieceWidth =
              pieceHeight;


            pieceHeight =
              temp;


            rotation =
              canRotate90
                ? 90
                : 270;

          }

        }

      }


      /* -------------------------------------
         STILL TOO WIDE
      ------------------------------------- */

      if (
        pieceWidth >
        usableWidth
      ) {

        throw new Error(

          `${piece.name} terlalu lebar ` +
          `untuk kain ${round(
            usableWidth,
            1
          )} cm`

        );

      }


      /* -------------------------------------
         NEW ROW
      ------------------------------------- */

      if (
        cursorX > 0 &&
        cursorX + pieceWidth >
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

      const placement = {

        ...piece,

        x:
          cursorX,

        y:
          cursorY,

        width:
          pieceWidth,

        height:
          pieceHeight,

        rotation

      };


      placements.push(
        placement
      );


      /* -------------------------------------
         MOVE CURSOR
      ------------------------------------- */

      cursorX +=
        pieceWidth;


      rowHeight =
        Math.max(
          rowHeight,
          pieceHeight
        );


      usedLength =
        Math.max(
          usedLength,
          cursorY +
          rowHeight
        );

    }


    /* ---------------------------------------
       VALIDATE USED LENGTH
    --------------------------------------- */

    if (
      !Number.isFinite(
        usedLength
      )
    ) {

      console.error(
        "Invalid usedLength:",
        usedLength,
        placements
      );


      setStatus(
        "Perhitungan kebutuhan kain menghasilkan angka tidak valid."
      );

      return;

    }


    /* ---------------------------------------
       AVAILABLE LENGTH
    --------------------------------------- */

    const availableLength =
      fabricLength;


    /* ---------------------------------------
       FIT
    --------------------------------------- */

    const fits =
      usedLength <=
      availableLength;


    /* ---------------------------------------
       USED AREA
    --------------------------------------- */

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


    /* ---------------------------------------
       TOTAL AREA
    --------------------------------------- */

    const totalArea =
      effectiveWidth *
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


    const safeEfficiency =
      Number.isFinite(
        efficiency
      )

        ? efficiency

        : 0;


    /* ---------------------------------------
       REMAINING LENGTH
    --------------------------------------- */

    const remainingLength =
      Math.max(

        0,

        availableLength -
        usedLength

      );


    /* ---------------------------------------
       FINAL RESULT
    --------------------------------------- */

    lastOptimization = {

      width:
        effectiveWidth,

      usedLength:
        usedLength,

      availableLength:
        availableLength,

      remainingLength:
        remainingLength,

      quantity:
        quantity,

      efficiency:
        safeEfficiency,

      fits:
        fits,

      usedArea:
        usedArea,

      placements:
        placements

    };


    /* ---------------------------------------
       RESULT WIDTH
    --------------------------------------- */

    if (
      el("resultWidth")
    ) {

      el("resultWidth")
        .textContent =
          round(
            effectiveWidth,
            1
          );

    }


    /* ---------------------------------------
       RESULT LENGTH
    --------------------------------------- */

    if (
      el("resultLength")
    ) {

      el("resultLength")
        .textContent =
          round(
            usedLength,
            1
          );

    }


    /* ---------------------------------------
       RESULT MATERIAL
    --------------------------------------- */

    if (
      el("resultMaterial")
    ) {

      el("resultMaterial")
        .textContent =
          fabric.materialName ||
          materialName(
            measurements.fabric
          );

    }


    /* ---------------------------------------
       RESULT QUANTITY
    --------------------------------------- */

    if (
      el("resultQuantity")
    ) {

      el("resultQuantity")
        .textContent =
          quantity;

    }


    /* ---------------------------------------
       RESULT STATUS
    --------------------------------------- */

    if (
      el("resultStatus")
    ) {

      el("resultStatus")
        .textContent =

          fits

            ? `Optimal • Efisiensi ${round(
                safeEfficiency,
                1
              )}%`

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


    setStatus(
      "Download SVG gagal."
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

      }

    );

  }

);


/* =========================================================
   START APPLICATION
========================================================= */

bindFabricInputs();

updateFabricInformation();


/* =========================================================
   INITIAL STATUS
========================================================= */

setStatus(
  "Masukkan ukuran kemudian tekan GENERATE PATTERN."
);
