/* =========================================================
   PatternMaker
   SEAM ALLOWANCE ENGINE V1.0
   ---------------------------------------------------------
   Fungsi:
   - menentukan kampuh
   - membuat offset pola
   - membedakan garis jahit dan garis potong
   - mendukung kampuh berbeda per sisi
========================================================= */


/* =========================================================
   DEFAULT SEAM
========================================================= */

const DEFAULT_SEAM = {

  top: 1.0,

  bottom: 1.0,

  side: 1.0,

  armhole: 1.0,

  shoulder: 1.0,

  neckline: 1.0,

  sleeve: 1.0

};


/* =========================================================
   NORMALIZE SEAM
========================================================= */

export function normalizeSeam(
  seam = {}
) {

  return {

    top:
      Number.isFinite(Number(seam.top))
        ? Number(seam.top)
        : DEFAULT_SEAM.top,

    bottom:
      Number.isFinite(Number(seam.bottom))
        ? Number(seam.bottom)
        : DEFAULT_SEAM.bottom,

    side:
      Number.isFinite(Number(seam.side))
        ? Number(seam.side)
        : DEFAULT_SEAM.side,

    armhole:
      Number.isFinite(Number(seam.armhole))
        ? Number(seam.armhole)
        : DEFAULT_SEAM.armhole,

    shoulder:
      Number.isFinite(Number(seam.shoulder))
        ? Number(seam.shoulder)
        : DEFAULT_SEAM.shoulder,

    neckline:
      Number.isFinite(Number(seam.neckline))
        ? Number(seam.neckline)
        : DEFAULT_SEAM.neckline,

    sleeve:
      Number.isFinite(Number(seam.sleeve))
        ? Number(seam.sleeve)
        : DEFAULT_SEAM.sleeve

  };

}


/* =========================================================
   CREATE SEAM CONFIG
========================================================= */

export function createSeam(
  options = {}
) {

  const seam =
    normalizeSeam(
      options
    );


  return {

    enabled:
      options.enabled !== false,

    ...seam

  };

}


/* =========================================================
   GET UNIFORM SEAM
   ---------------------------------------------------------
   Untuk kain seperti jersey/rib knit
   kita bisa menggunakan satu ukuran kampuh.
========================================================= */

export function createUniformSeam(
  value = 1
) {

  const amount =
    Number(value);


  const safeAmount =
    Number.isFinite(amount) &&
    amount >= 0

      ? amount

      : 1;


  return {

    enabled: true,

    top: safeAmount,

    bottom: safeAmount,

    side: safeAmount,

    armhole: safeAmount,

    shoulder: safeAmount,

    neckline: safeAmount,

    sleeve: safeAmount

  };

}


/* =========================================================
   GET SEAM VALUE
========================================================= */

export function getSeamValue(
  seam,
  side
) {

  if (!seam) {

    return 1;

  }


  const value =
    Number(
      seam[side]
    );


  if (
    !Number.isFinite(value)
  ) {

    return 1;

  }


  return Math.max(
    0,
    value
  );

}


/* =========================================================
   APPLY SEAM TO RECTANGLE
   ---------------------------------------------------------
   Digunakan oleh Fabric Optimizer.

   Ini bukan bentuk pola final.
   Fungsi ini menghitung bounding box
   setelah kampuh ditambahkan.
========================================================= */

export function expandBounds(
  bounds,
  seam = 1
) {

  if (
    !bounds
  ) {

    return {

      width: 0,

      height: 0

    };

  }


  const amount =
    Math.max(
      0,
      Number(seam) || 0
    );


  return {

    width:
      Number(bounds.width || 0)
      +
      amount * 2,

    height:
      Number(bounds.height || 0)
      +
      amount * 2

  };

}


/* =========================================================
   APPLY SEAM TO PIECE
========================================================= */

export function applySeamToPiece(
  piece,
  seam = 1
) {

  if (!piece) {

    return null;

  }


  const expanded =
    expandBounds(
      piece,
      seam
    );


  return {

    ...piece,

    originalWidth:
      piece.width,

    originalHeight:
      piece.height,

    width:
      expanded.width,

    height:
      expanded.height,

    seam:

      Math.max(
        0,
        Number(seam) || 0
      )

  };

}


/* =========================================================
   APPLY SEAM TO PIECES
========================================================= */

export function applySeamToPieces(
  pieces,
  seam = 1
) {

  if (
    !Array.isArray(pieces)
  ) {

    return [];

  }


  return pieces.map(
    piece =>
      applySeamToPiece(
        piece,
        seam
      )
  );

}


/* =========================================================
   SEAM SUMMARY
========================================================= */

export function getSeamSummary(
  seam
) {

  if (!seam) {

    return null;

  }


  return {

    enabled:
      seam.enabled !== false,

    top:
      getSeamValue(
        seam,
        "top"
      ),

    bottom:
      getSeamValue(
        seam,
        "bottom"
      ),

    side:
      getSeamValue(
        seam,
        "side"
      ),

    armhole:
      getSeamValue(
        seam,
        "armhole"
      ),

    shoulder:
      getSeamValue(
        seam,
        "shoulder"
      ),

    neckline:
      getSeamValue(
        seam,
        "neckline"
      ),

    sleeve:
      getSeamValue(
        seam,
        "sleeve"
      )

  };

}


/* =========================================================
   CALCULATE SEAM AREA
   ---------------------------------------------------------
   Estimasi tambahan area bounding box.
========================================================= */

export function calculateSeamArea(
  piece,
  seam = 1
) {

  if (!piece) {

    return 0;

  }


  const originalArea =
    Number(piece.width || 0) *
    Number(piece.height || 0);


  const expanded =
    expandBounds(
      piece,
      seam
    );


  const expandedArea =
    expanded.width *
    expanded.height;


  return Math.max(
    0,
    expandedArea -
    originalArea
  );

}


/* =========================================================
   DEFAULT EXPORT DATA
========================================================= */

export const DEFAULT_SEAM_VALUES =
  DEFAULT_SEAM;
