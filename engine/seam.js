/* =========================================================
   PatternMaker V1.7
   SEAM ENGINE (Full & Fold Support)
   ---------------------------------------------------------
   Mengatur kampuh pola berdasarkan bagian pakaian,
   jenis bahan, dan mode potong (Lipat vs Full).

   Satuan: cm
========================================================= */


/* =========================================================
   DEFAULT SEAM
========================================================= */

const DEFAULT_SEAM = {
  neckline: 0.7,
  shoulder: 1.0,
  armhole: 1.0,
  side: 1.0,
  bottom: 2.0,
  sleeveCap: 1.0,
  sleeveSide: 1.0,
  sleeveBottom: 2.0,
  fold: 0
};


/* =========================================================
   MATERIAL SEAM
========================================================= */

const MATERIAL_SEAM = {
  sublime_jersey: {
    neckline: 0.7,
    shoulder: 1.0,
    armhole: 1.0,
    side: 1.0,
    bottom: 2.0,
    sleeveCap: 1.0,
    sleeveSide: 1.0,
    sleeveBottom: 2.0
  },
  rib_knit: {
    neckline: 0.7,
    shoulder: 1.0,
    armhole: 1.0,
    side: 1.0,
    bottom: 2.0,
    sleeveCap: 1.0,
    sleeveSide: 1.0,
    sleeveBottom: 2.0
  },
  cotton: {
    neckline: 0.7,
    shoulder: 1.0,
    armhole: 1.0,
    side: 1.0,
    bottom: 2.0,
    sleeveCap: 1.0,
    sleeveSide: 1.0,
    sleeveBottom: 2.0
  },
  woven: {
    neckline: 0.7,
    shoulder: 1.0,
    armhole: 1.0,
    side: 1.0,
    bottom: 2.0,
    sleeveCap: 1.0,
    sleeveSide: 1.0,
    sleeveBottom: 2.0
  }
};


/* =========================================================
   HELPERS
========================================================= */

function normalizeMaterial(material) {
  if (!material) return "sublime_jersey";
  return String(material).toLowerCase().trim().replace(/\s+/g, "_");
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}


/* =========================================================
   CREATE SEAM
========================================================= */

export function createSeam(options = {}) {
  const material = normalizeMaterial(options.material);
  const materialSeam = MATERIAL_SEAM[material] || MATERIAL_SEAM.sublime_jersey;
  const custom = options.seam || {};
  const isFull = Boolean(options.fullPattern);

  return {
    neckline: safeNumber(custom.neckline, materialSeam.neckline),
    shoulder: safeNumber(custom.shoulder, materialSeam.shoulder),
    armhole: safeNumber(custom.armhole, materialSeam.armhole),
    side: safeNumber(custom.side, materialSeam.side),
    bottom: safeNumber(custom.bottom, materialSeam.bottom),
    sleeveCap: safeNumber(custom.sleeveCap, materialSeam.sleeveCap),
    sleeveSide: safeNumber(custom.sleeveSide, materialSeam.sleeveSide),
    sleeveBottom: safeNumber(custom.sleeveBottom, materialSeam.sleeveBottom),

    // Pada pola Full/Terbuka, garis tengah tidak lagi memerlukan alokasi kampuh lipatan
    fold: isFull ? 0 : safeNumber(custom.fold, DEFAULT_SEAM.fold)
  };
}


/* =========================================================
   CREATE UNIFORM SEAM
========================================================= */

export function createUniformSeam(value = 1, options = {}) {
  const seam = safeNumber(value, 1);
  const isFull = Boolean(options.fullPattern);

  return {
    neckline: seam,
    shoulder: seam,
    armhole: seam,
    side: seam,
    bottom: seam,
    sleeveCap: seam,
    sleeveSide: seam,
    sleeveBottom: seam,
    fold: isFull ? 0 : 0
  };
}


/* =========================================================
   GET MATERIAL SEAM
========================================================= */

export function getMaterialSeam(material) {
  const key = normalizeMaterial(material);
  const seam = MATERIAL_SEAM[key] || MATERIAL_SEAM.sublime_jersey;

  return { ...seam };
}


/* =========================================================
   GET SEAM VALUE
========================================================= */

export function getSeamValue(seam, part) {
  if (!seam) return 0;

  if (Object.prototype.hasOwnProperty.call(seam, part)) {
    return safeNumber(seam[part]);
  }

  return 0;
}


/* =========================================================
   MAX SEAM
========================================================= */

export function getMaximumSeam(seam) {
  if (!seam) return 0;

  const values = [
    seam.neckline,
    seam.shoulder,
    seam.armhole,
    seam.side,
    seam.bottom,
    seam.sleeveCap,
    seam.sleeveSide,
    seam.sleeveBottom
  ];

  return Math.max(...values.map((value) => safeNumber(value)));
}


/* =========================================================
   SEAM SUMMARY
========================================================= */

export function getSeamSummary(seam) {
  if (!seam) return null;

  return {
    neckline: seam.neckline,
    shoulder: seam.shoulder,
    armhole: seam.armhole,
    side: seam.side,
    bottom: seam.bottom,
    sleeveCap: seam.sleeveCap,
    sleeveSide: seam.sleeveSide,
    sleeveBottom: seam.sleeveBottom,
    fold: seam.fold
  };
}


/* =========================================================
   VALIDATE SEAM
========================================================= */

export function validateSeam(seam) {
  if (!seam) {
    return {
      valid: false,
      errors: ["Data kampuh tidak tersedia."]
    };
  }

  const errors = [];
  const fields = [
    "neckline",
    "shoulder",
    "armhole",
    "side",
    "bottom",
    "sleeveCap",
    "sleeveSide",
    "sleeveBottom"
  ];

  fields.forEach((field) => {
    const value = Number(seam[field]);

    if (!Number.isFinite(value) || value < 0) {
      errors.push(`${field} tidak valid.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}


/* =========================================================
   MATERIAL LIST
========================================================= */

export function getSeamMaterialList() {
  return Object.keys(MATERIAL_SEAM).map((key) => ({
    key,
    name: key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  }));
}
