/* =========================================================
   PatternMaker V1.5
   NESTING ENGINE
   ---------------------------------------------------------
   Fungsi:
   - membuat layout pola di atas kain
   - menggunakan ukuran piece aktual
   - mengikuti effective fabric width
   - mengikuti aturan rotasi material
   - menghitung kebutuhan panjang kain
   - menghitung efisiensi
   - menghasilkan data placement untuk SVG
========================================================= */


/* =========================================================
   GET BOUNDS
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


  return {

    minX: Math.min(...xs),

    maxX: Math.max(...xs),

    minY: Math.min(...ys),

    maxY: Math.max(...ys),

    width:
      Math.max(...xs) -
      Math.min(...xs),

    height:
      Math.max(...ys) -
      Math.min(...ys)

  };

}


/* =========================================================
   CREATE PIECES
========================================================= */

export function createPatternPieces(
  bodice,
  sleeve
) {

  if (
    !bodice ||
    !sleeve
  ) {

    return [];

  }


  const pieces = [];


  /* =======================================================
     FRONT
  ======================================================= */

  const frontPoints = [

    bodice.front.A,
    bodice.front.B,
    bodice.front.C,
    bodice.front.D,
    bodice.front.E,
    bodice.front.F

  ];


  const frontBounds =
    getBounds(frontPoints);


  pieces.push({

    name:
      "FRONT",

    quantity:
      1,

    width:
      frontBounds.width,

    height:
      frontBounds.height,

    grain:
      "vertical",

    fold:
      true

  });


  /* =======================================================
     BACK
  ======================================================= */

  const backPoints = [

    bodice.back.A,
    bodice.back.B,
    bodice.back.C,
    bodice.back.D,
    bodice.back.E,
    bodice.back.F

  ];


  const backBounds =
    getBounds(backPoints);


  pieces.push({

    name:
      "BACK",

    quantity:
      1,

    width:
      backBounds.width,

    height:
      backBounds.height,

    grain:
      "vertical",

    fold:
      true

  });


  /* =======================================================
     SLEEVE
  ======================================================= */

  const sleevePoints = [

    sleeve.left,
    sleeve.leftCap,
    sleeve.top,
    sleeve.rightCap,
    sleeve.right,
    sleeve.bottomLeft,
    sleeve.bottomRight

  ];


  const sleeveBounds =
    getBounds(sleevePoints);


  pieces.push({

    name:
      "SLEEVE",

    quantity:
      2,

    width:
      sleeveBounds.width,

    height:
      sleeveBounds.height,

    grain:
      "vertical",

    fold:
      false

  });


  return pieces;

}


/* =========================================================
   CREATE INSTANCES
========================================================= */

function createInstances(
  pieces,
  garmentQuantity,
  seam
) {

  const instances = [];


  for (
    let garment = 1;
    garment <= garmentQuantity;
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

          garment,

          width:
            piece.width +
            seam * 2,

          height:
            piece.height +
            seam * 2,

          originalWidth:
            piece.width,

          originalHeight:
            piece.height,

          rotation:
            0,

          fold:
            piece.fold,

          grain:
            piece.grain

        });

      }

    }

  }


  return instances;

}


/* =========================================================
   ROTATE PIECE
========================================================= */

function rotatePiece(
  piece
) {

  return {

    ...piece,

    width:
      piece.height,

    height:
      piece.width,

    rotation:
      piece.rotation === 0
        ? 90
        : 0

  };

}


/* =========================================================
   CHECK FIT
========================================================= */

function fitsWidth(
  piece,
  fabricWidth
) {

  return (
    piece.width <=
    fabricWidth
  );

}


/* =========================================================
   NESTING
========================================================= */

export function optimizeNesting({

  fabric,

  bodice,

  sleeve,

  garmentQuantity = 1,

  seam = 1

}) {


  if (!fabric) {

    throw new Error(
      "Fabric belum tersedia."
    );

  }


  if (
    !bodice ||
    !sleeve
  ) {

    throw new Error(
      "Pola belum tersedia."
    );

  }


  const pieces =
    createPatternPieces(
      bodice,
      sleeve
    );


  let instances =
    createInstances(
      pieces,
      Math.max(
        1,
        garmentQuantity
      ),
      seam
    );


  const fabricWidth =
    fabric.effectiveWidth;


  if (
    fabricWidth <= 0
  ) {

    throw new Error(
      "Lebar efektif kain tidak valid."
    );

  }


  /* =======================================================
     SORT PIECES
     Besar ke kecil
  ======================================================= */

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


  /* =======================================================
     PLACEMENTS
  ======================================================= */

  const placements = [];


  let cursorX = 0;

  let cursorY = 0;

  let rowHeight = 0;


  const allowedRotation =
    fabric.allowedRotation ||
    [0];


  /* =======================================================
     PLACE EACH PIECE
  ======================================================= */

  for (
    const originalPiece of instances
  ) {


    let piece =
      originalPiece;


    /* -----------------------------------------------------
       Coba posisi normal
    ----------------------------------------------------- */

    let rotation =
      0;


    /* -----------------------------------------------------
       Jika tidak muat, coba rotasi
    ----------------------------------------------------- */

    if (
      !fitsWidth(
        piece,
        fabricWidth
      )
    ) {


      if (
        allowedRotation.includes(90)
      ) {

        const rotated =
          rotatePiece(
            piece
          );


        if (
          fitsWidth(
            rotated,
            fabricWidth
          )
        ) {

          piece =
            rotated;

          rotation =
            90;

        }

      }

    }


    /* -----------------------------------------------------
       Piece tetap terlalu lebar
    ----------------------------------------------------- */

    if (
      !fitsWidth(
        piece,
        fabricWidth
      )
    ) {

      throw new Error(

        `${piece.name} terlalu lebar ` +
        `untuk kain efektif ${fabricWidth} cm`

      );

    }


    /* =====================================================
       PINDAH BARIS
    ===================================================== */

    if (
      cursorX > 0 &&
      cursorX + piece.width >
      fabricWidth
    ) {

      cursorX =
        0;

      cursorY +=
        rowHeight;

      rowHeight =
        0;

    }


    /* =====================================================
       PLACE
    ===================================================== */

    placements.push({

      name:
        piece.name,

      garment:
        piece.garment,

      x:
        cursorX,

      y:
        cursorY,

      width:
        piece.width,

      height:
        piece.height,

      rotation,

      fold:
        piece.fold,

      grain:
        piece.grain

    });


    cursorX +=
      piece.width;


    rowHeight =
      Math.max(
        rowHeight,
        piece.height
      );

  }


  /* =======================================================
     USED LENGTH
  ======================================================= */

  const usedLength =
    cursorY +
    rowHeight;


  /* =======================================================
     AREA
  ======================================================= */

  const usedArea =
    placements.reduce(

      (
        total,
        piece
      ) =>

        total +
        piece.width *
        piece.height,

      0

    );


  const layoutArea =
    fabricWidth *
    usedLength;


  const efficiency =
    layoutArea > 0

      ? (
          usedArea /
          layoutArea
        ) * 100

      : 0;


  /* =======================================================
     AVAILABLE FABRIC
  ======================================================= */

  const availableLength =
    fabric.length;


  const fits =
    availableLength <= 0
      ? true
      : usedLength <=
        availableLength;


  const remainingLength =
    availableLength > 0

      ? Math.max(
          0,
          availableLength -
          usedLength
        )

      : 0;


  /* =======================================================
     RESULT
  ======================================================= */

  return {

    fabricWidth,

    availableLength,

    usedLength,

    remainingLength,

    garmentQuantity,

    efficiency,

    fits,

    placements,

    pieceCount:
      placements.length

  };

}