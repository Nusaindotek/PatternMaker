```javascript
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 3 — engine/measurement-schema.js
 * ============================================================
 *
 * Fungsi:
 * - Satu sumber definisi semua ukuran tubuh.
 * - Menentukan ukuran berdasarkan jenis garment.
 * - Mendukung cm dan inch.
 * - Tidak bergantung pada DOM.
 * - Tidak menggantikan measurements.js lama.
 *
 * File ini adalah DATA/SCHEMA LAYER.
 * Perhitungan drafting akan berada di engine lain.
 * ============================================================
 */

const MEASUREMENT_SCHEMA = {

    /* ========================================================
       UKURAN BADAN UTAMA
       ======================================================== */

    bust: {
        id: "bust",
        label: "Lingkar Dada",
        shortLabel: "Dada",
        unit: "cm",
        type: "circumference",
        category: "upper-body",
        requiredFor: [
            "tshirt",
            "blouse",
            "shirt",
            "sweater",
            "dress",
            "outer"
        ],
        min: 20,
        max: 250
    },

    waist: {
        id: "waist",
        label: "Lingkar Pinggang",
        shortLabel: "Pinggang",
        unit: "cm",
        type: "circumference",
        category: "body",
        requiredFor: [
            "tshirt",
            "blouse",
            "shirt",
            "sweater",
            "dress",
            "skirt",
            "pants",
            "shorts",
            "outer"
        ],
        min: 20,
        max: 250
    },

    hip: {
        id: "hip",
        label: "Lingkar Pinggul",
        shortLabel: "Pinggul",
        unit: "cm",
        type: "circumference",
        category: "lower-body",
        requiredFor: [
            "blouse",
            "shirt",
            "sweater",
            "dress",
            "skirt",
            "pants",
            "shorts",
            "outer"
        ],
        min: 20,
        max: 300
    },


    /* ========================================================
       BAHU / BADAN ATAS
       ======================================================== */

    shoulder: {
        id: "shoulder",
        label: "Lebar Bahu",
        shortLabel: "Bahu",
        unit: "cm",
        type: "width",
        category: "upper-body",
        requiredFor: [
            "tshirt",
            "blouse",
            "shirt",
            "sweater",
            "dress",
            "outer"
        ],
        min: 5,
        max: 100
    },

    neck: {
        id: "neck",
        label: "Lingkar Leher",
        shortLabel: "Leher",
        unit: "cm",
        type: "circumference",
        category: "upper-body",
        requiredFor: [
            "shirt",
            "sweater",
            "dress",
            "blouse",
            "outer"
        ],
        min: 10,
        max: 100
    },

    shoulderToShoulder: {
        id: "shoulderToShoulder",
        label: "Bahu ke Bahu",
        shortLabel: "Bahu-Bahu",
        unit: "cm",
        type: "width",
        category: "upper-body",
        requiredFor: [],
        min: 5,
        max: 100
    },


    /* ========================================================
       PANJANG BADAN
       ======================================================== */

    bodyLength: {
        id: "bodyLength",
        label: "Panjang Badan",
        shortLabel: "Panjang Badan",
        unit: "cm",
        type: "length",
        category: "upper-body",
        requiredFor: [
            "tshirt",
            "blouse",
            "shirt",
            "sweater",
            "outer"
        ],
        min: 10,
        max: 200
    },

    dressLength: {
        id: "dressLength",
        label: "Panjang Dress",
        shortLabel: "Panjang Dress",
        unit: "cm",
        type: "length",
        category: "dress",
        requiredFor: [
            "dress"
        ],
        min: 20,
        max: 250
    },

    skirtLength: {
        id: "skirtLength",
        label: "Panjang Rok",
        shortLabel: "Panjang Rok",
        unit: "cm",
        type: "length",
        category: "lower-body",
        requiredFor: [
            "skirt"
        ],
        min: 10,
        max: 200
    },


    /* ========================================================
       LENGAN
       ======================================================== */

    armhole: {
        id: "armhole",
        label: "Kerung Lengan",
        shortLabel: "Kerung",
        unit: "cm",
        type: "circumference",
        category: "sleeve",
        requiredFor: [],
        min: 10,
        max: 150
    },

    upperArm: {
        id: "upperArm",
        label: "Lingkar Lengan Atas",
        shortLabel: "Lengan Atas",
        unit: "cm",
        type: "circumference",
        category: "sleeve",
        requiredFor: [
            "tshirt",
            "blouse",
            "shirt",
            "sweater",
            "outer"
        ],
        min: 8,
        max: 150
    },

    elbow: {
        id: "elbow",
        label: "Lingkar Siku",
        shortLabel: "Siku",
        unit: "cm",
        type: "circumference",
        category: "sleeve",
        requiredFor: [],
        min: 8,
        max: 150
    },

    wrist: {
        id: "wrist",
        label: "Lingkar Pergelangan",
        shortLabel: "Pergelangan",
        unit: "cm",
        type: "circumference",
        category: "sleeve",
        requiredFor: [
            "shirt",
            "sweater",
            "outer"
        ],
        min: 5,
        max: 100
    },

    sleeveLength: {
        id: "sleeveLength",
        label: "Panjang Lengan",
        shortLabel: "Panjang Lengan",
        unit: "cm",
        type: "length",
        category: "sleeve",
        requiredFor: [
            "tshirt",
            "blouse",
            "shirt",
            "sweater",
            "outer"
        ],
        min: 5,
        max: 150
    },


    /* ========================================================
       CELANA
       ======================================================== */

    rise: {
        id: "rise",
        label: "Tinggi Duduk / Rise",
        shortLabel: "Rise",
        unit: "cm",
        type: "length",
        category: "pants",
        requiredFor: [
            "pants",
            "shorts"
        ],
        min: 10,
        max: 100
    },

    pantsLength: {
        id: "pantsLength",
        label: "Panjang Celana",
        shortLabel: "Panjang Celana",
        unit: "cm",
        type: "length",
        category: "pants",
        requiredFor: [
            "pants"
        ],
        min: 20,
        max: 200
    },

    shortsLength: {
        id: "shortsLength",
        label: "Panjang Shorts",
        shortLabel: "Panjang Shorts",
        unit: "cm",
        type: "length",
        category: "pants",
        requiredFor: [
            "shorts"
        ],
        min: 10,
        max: 150
    },

    thigh: {
        id: "thigh",
        label: "Lingkar Paha",
        shortLabel: "Paha",
        unit: "cm",
        type: "circumference",
        category: "pants",
        requiredFor: [
            "pants",
            "shorts"
        ],
        min: 10,
        max: 150
    },

    knee: {
        id: "knee",
        label: "Lingkar Lutut",
        shortLabel: "Lutut",
        unit: "cm",
        type: "circumference",
        category: "pants",
        requiredFor: [
            "pants"
        ],
        min: 8,
        max: 150
    },

    hem: {
        id: "hem",
        label: "Lingkar Kaki / Hem",
        shortLabel: "Hem",
        unit: "cm",
        type: "circumference",
        category: "pants",
        requiredFor: [
            "pants",
            "shorts"
        ],
        min: 5,
        max: 150
    },


    /* ========================================================
       PROFIL TAMBAHAN
       ======================================================== */

    height: {
        id: "height",
        label: "Tinggi Badan",
        shortLabel: "Tinggi",
        unit: "cm",
        type: "height",
        category: "profile",
        requiredFor: [],
        min: 30,
        max: 250
    },

    age: {
        id: "age",
        label: "Umur",
        shortLabel: "Umur",
        unit: "year",
        type: "age",
        category: "profile",
        requiredFor: [],
        min: 0,
        max: 120
    }

};


/* ============================================================
   GARMENT MEASUREMENT MAP
   ============================================================ */

const GARMENT_MEASUREMENTS = {

    tshirt: [
        "bust",
        "shoulder",
        "bodyLength",
        "upperArm",
        "sleeveLength"
    ],

    blouse: [
        "bust",
        "waist",
        "hip",
        "shoulder",
        "neck",
        "bodyLength",
        "upperArm",
        "sleeveLength"
    ],

    shirt: [
        "bust",
        "waist",
        "hip",
        "shoulder",
        "neck",
        "bodyLength",
        "upperArm",
        "wrist",
        "sleeveLength"
    ],

    sweater: [
        "bust",
        "waist",
        "hip",
        "shoulder",
        "neck",
        "bodyLength",
        "upperArm",
        "wrist",
        "sleeveLength"
    ],

    dress: [
        "bust",
        "waist",
        "hip",
        "shoulder",
        "neck",
        "dressLength",
        "upperArm",
        "sleeveLength"
    ],

    skirt: [
        "waist",
        "hip",
        "skirtLength"
    ],

    pants: [
        "waist",
        "hip",
        "rise",
        "pantsLength",
        "thigh",
        "knee",
        "hem"
    ],

    shorts: [
        "waist",
        "hip",
        "rise",
        "shortsLength",
        "thigh",
        "hem"
    ],

    outer: [
        "bust",
        "waist",
        "hip",
        "shoulder",
        "neck",
        "bodyLength",
        "upperArm",
        "wrist",
        "sleeveLength"
    ],

    custom: [
        "bust",
        "waist",
        "hip",
        "shoulder",
        "bodyLength"
    ]

};


/* ============================================================
   CATEGORY
   ============================================================ */

const USER_CATEGORIES = {

    child: {
        id: "child",
        label: "Anak"
    },

    teen: {
        id: "teen",
        label: "Remaja"
    },

    women: {
        id: "women",
        label: "Wanita"
    },

    men: {
        id: "men",
        label: "Pria"
    },

    custom: {
        id: "custom",
        label: "Custom"
    }

};


/* ============================================================
   UNIT CONVERSION
   ============================================================ */

const MEASUREMENT_UNITS = {

    cm: {
        id: "cm",
        label: "Centimeter",
        symbol: "cm",

        toCm(value) {
            return Number(value);
        },

        fromCm(value) {
            return Number(value);
        }
    },


    inch: {
        id: "inch",
        label: "Inch",
        symbol: "in",

        toCm(value) {
            return Number(value) * 2.54;
        },

        fromCm(value) {
            return Number(value) / 2.54;
        }
    }

};


/* ============================================================
   HELPER: GET MEASUREMENT DEFINITION
   ============================================================ */

function getMeasurementDefinition(id) {

    return MEASUREMENT_SCHEMA[id] || null;

}


/* ============================================================
   HELPER: GET REQUIRED MEASUREMENTS
   ============================================================ */

function getRequiredMeasurements(garmentType) {

    return GARMENT_MEASUREMENTS[garmentType]
        ? [...GARMENT_MEASUREMENTS[garmentType]]
        : [];

}


/* ============================================================
   HELPER: GET CATEGORY LABEL
   ============================================================ */

function getCategoryLabel(category) {

    return USER_CATEGORIES[category]
        ? USER_CATEGORIES[category].label
        : "Custom";

}


/* ============================================================
   HELPER: CONVERT VALUE TO CM
   ============================================================ */

function measurementToCm(value, unit = "cm") {

    if (!MEASUREMENT_UNITS[unit]) {
        throw new Error(`Unit ukuran tidak dikenal: ${unit}`);
    }

    return MEASUREMENT_UNITS[unit].toCm(value);

}


/* ============================================================
   HELPER: CONVERT CM TO DISPLAY UNIT
   ============================================================ */

function measurementFromCm(value, unit = "cm") {

    if (!MEASUREMENT_UNITS[unit]) {
        throw new Error(`Unit ukuran tidak dikenal: ${unit}`);
    }

    return MEASUREMENT_UNITS[unit].fromCm(value);

}


/* ============================================================
   VALIDASI SATU UKURAN
   ============================================================ */

function validateMeasurementValue(id, value) {

    const definition = getMeasurementDefinition(id);

    if (!definition) {

        return {
            valid: false,
            message: `Measurement "${id}" tidak terdaftar.`
        };

    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {

        return {
            valid: false,
            message: `${definition.label} harus berupa angka.`
        };

    }

    if (
        numericValue < definition.min ||
        numericValue > definition.max
    ) {

        return {
            valid: false,
            message:
                `${definition.label} harus berada antara ` +
                `${definition.min}–${definition.max} ${definition.unit}.`
        };

    }

    return {
        valid: true,
        value: numericValue
    };

}


/* ============================================================
   EXPORT GLOBAL
   ============================================================ */

window.PatternMakerMeasurementSchema = {

    MEASUREMENT_SCHEMA,

    GARMENT_MEASUREMENTS,

    USER_CATEGORIES,

    MEASUREMENT_UNITS,

    getMeasurementDefinition,

    getRequiredMeasurements,

    getCategoryLabel,

    measurementToCm,

    measurementFromCm,

    validateMeasurementValue

};
```
