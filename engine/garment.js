```javascript id="m0p7vz"
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 5 — engine/garment.js
 * ============================================================
 *
 * Fungsi:
 * - Mendefinisikan semua jenis garment.
 * - Menentukan measurement yang wajib.
 * - Menentukan engine pola yang digunakan.
 * - Menentukan apakah garment membutuhkan sleeve,
 *   seam, grainline, notch, dan nesting.
 *
 * Tidak bergantung pada DOM.
 * Tidak menggambar pola.
 * Tidak menghitung geometri.
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       VALIDASI DEPENDENCY
       ======================================================== */

    if (!window.PatternMakerMeasurementSchema) {

        throw new Error(
            "measurement-schema.js harus dimuat sebelum garment.js."
        );

    }


    const Schema =
        window.PatternMakerMeasurementSchema;


    /* ========================================================
       GARMENT DEFINITIONS
       ======================================================== */

    const GARMENT_DEFINITIONS = {

        tshirt: {

            id: "tshirt",

            label: "Kaos",

            category: "top",

            patternEngine: "bodice",

            requiredMeasurements: [
                "bust",
                "shoulder",
                "bodyLength",
                "upperArm",
                "sleeveLength"
            ],

            optionalMeasurements: [
                "waist",
                "hip",
                "neck"
            ],

            features: {

                front: true,

                back: true,

                sleeve: true,

                collar: true,

                dart: false,

                waistband: false,

                grainline: true,

                notch: true,

                seamAllowance: true,

                nesting: true,

                fullOpen: true

            }

        },


        blouse: {

            id: "blouse",

            label: "Blus",

            category: "top",

            patternEngine: "bodice",

            requiredMeasurements: [
                "bust",
                "waist",
                "hip",
                "shoulder",
                "neck",
                "bodyLength",
                "upperArm",
                "sleeveLength"
            ],

            optionalMeasurements: [],

            features: {

                front: true,

                back: true,

                sleeve: true,

                collar: true,

                dart: true,

                waistband: false,

                grainline: true,

                notch: true,

                seamAllowance: true,

                nesting: true,

                fullOpen: true

            }

        },


        shirt: {

            id: "shirt",

            label: "Kemeja",

            category: "top",

            patternEngine: "shirt",

            requiredMeasurements: [
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

            optionalMeasurements: [],

            features: {

                front: true,

                back: true,

                sleeve: true,

                collar: true,

                dart: true,

                waistband: false,

                placket: true,

                grainline: true,

                notch: true,

                seamAllowance: true,

                nesting: true,

                fullOpen: true

            }

        },


        sweater: {

            id: "sweater",

            label: "Sweater",

            category: "top",

            patternEngine: "bodice",

            requiredMeasurements: [
                "bust",
                "waist",
                "hip",
                "shoulder",
                "bodyLength",
                "upperArm",
                "wrist",
                "sleeveLength"
            ],

            optionalMeasurements: [
                "neck"
            ],

            features: {

                front: true,

                back: true,

                sleeve: true,

                collar: true,

                dart: false,

                waistband: true,

                grainline: true,

                notch: true,

                seamAllowance: true,

                nesting: true,

                fullOpen: true

            }

        },


        dress: {

            id: "dress",

            label: "Dress",

            category: "dress",

            patternEngine: "dress",

            requiredMeasurements: [
                "bust",
                "waist",
                "hip",
                "shoulder",
                "neck",
                "dressLength",
                "upperArm",
                "sleeveLength"
            ],

            optionalMeasurements: [
                "bodyLength"
            ],

            features: {

                front: true,

                back: true,

                sleeve: true,

                collar: true,

                dart: true,

                waistband: false,

                grainline: true,

                notch: true,

                seamAllowance: true,

                nesting: true,

                fullOpen: true

            }

        },


        skirt: {

            id: "skirt",

            label: "Rok",

            category: "bottom",

            patternEngine: "skirt",

            requiredMeasurements: [
                "waist",
                "hip",
                "skirtLength"
            ],

            optionalMeasurements: [],

            features: {

                front: true,

                back: true,

                sleeve: false,

                collar: false,

                dart: true,

                waistband: true,

                grainline: true,

                notch: true,

                seamAllowance: true,

                nesting: true,

                fullOpen: true

            }

        },


        pants: {

            id: "pants",

            label: "Celana",

            category: "bottom",

            patternEngine: "pants",

            requiredMeasurements: [
                "waist",
                "hip",
                "rise",
                "pantsLength",
                "thigh",
                "knee",
                "hem"
            ],

            optionalMeasurements: [],

            features: {

                front: true,

                back: true,

                sleeve: false,

                collar: false,

                dart: true,

                waistband: true,

                grainline: true,

                notch: true,

                seamAllowance: true,

                nesting: true,

                fullOpen: true

            }

        },


        shorts: {

            id: "shorts",

            label: "Shorts",

            category: "bottom",

            patternEngine: "pants",

            requiredMeasurements: [
                "waist",
                "hip",
                "rise",
                "shortsLength",
                "thigh",
                "hem"
            ],

            optionalMeasurements: [],

            features: {

                front: true,

                back: true,

                sleeve: false,

                collar: false,

                dart: true,

                waistband: true,

                grainline: true,

                notch: true,

                seamAllowance: true,

                nesting: true,

                fullOpen: true

            }

        },


        outer: {

            id: "outer",

            label: "Outer / Jaket",

            category: "outerwear",

            patternEngine: "outer",

            requiredMeasurements: [
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

            optionalMeasurements: [],

            features: {

                front: true,

                back: true,

                sleeve: true,

                collar: true,

                dart: false,

                waistband: false,

                grainline: true,

                notch: true,

                seamAllowance: true,

                nesting: true,

                fullOpen: true

            }

        },


        custom: {

            id: "custom",

            label: "Custom Pattern",

            category: "custom",

            patternEngine: "custom",

            requiredMeasurements: [
                "bust",
                "waist",
                "hip",
                "shoulder",
                "bodyLength"
            ],

            optionalMeasurements: [],

            features: {

                front: true,

                back: true,

                sleeve: false,

                collar: false,

                dart: false,

                waistband: false,

                grainline: true,

                notch: true,

                seamAllowance: true,

                nesting: true,

                fullOpen: true

            }

        }

    };


    /* ========================================================
       GARMENT CATEGORIES
       ======================================================== */

    const GARMENT_CATEGORIES = {

        top: {
            id: "top",
            label: "Atasan"
        },

        dress: {
            id: "dress",
            label: "Dress"
        },

        bottom: {
            id: "bottom",
            label: "Bawahan"
        },

        outerwear: {
            id: "outerwear",
            label: "Outerwear"
        },

        custom: {
            id: "custom",
            label: "Custom"
        }

    };


    /* ========================================================
       GET GARMENT
       ======================================================== */

    function getGarment(
        garmentId
    ) {

        return GARMENT_DEFINITIONS[
            garmentId
        ] || null;

    }


    /* ========================================================
       CHECK GARMENT
       ======================================================== */

    function hasGarment(
        garmentId
    ) {

        return Boolean(
            GARMENT_DEFINITIONS[
                garmentId
            ]
        );

    }


    /* ========================================================
       GET ALL GARMENTS
       ======================================================== */

    function getAllGarments() {

        return Object.values(
            GARMENT_DEFINITIONS
        );

    }


    /* ========================================================
       GET GARMENTS BY CATEGORY
       ======================================================== */

    function getGarmentsByCategory(
        category
    ) {

        return getAllGarments()
            .filter(
                garment =>
                    garment.category === category
            );

    }


    /* ========================================================
       GET REQUIRED MEASUREMENTS
       ======================================================== */

    function getGarmentMeasurements(
        garmentId
    ) {

        const garment =
            getGarment(
                garmentId
            );


        if (!garment) {

            return [];

        }


        return [
            ...garment.requiredMeasurements
        ];

    }


    /* ========================================================
       GET OPTIONAL MEASUREMENTS
       ======================================================== */

    function getOptionalMeasurements(
        garmentId
    ) {

        const garment =
            getGarment(
                garmentId
            );


        if (!garment) {

            return [];

        }


        return [
            ...garment.optionalMeasurements
        ];

    }


    /* ========================================================
       GET ALL MEASUREMENTS
       ======================================================== */

    function getAllGarmentMeasurements(
        garmentId
    ) {

        const garment =
            getGarment(
                garmentId
            );


        if (!garment) {

            return [];

        }


        return [
            ...new Set([
                ...garment.requiredMeasurements,
                ...garment.optionalMeasurements
            ])
        ];

    }


    /* ========================================================
       CHECK FEATURE
       ======================================================== */

    function garmentHasFeature(
        garmentId,
        feature
    ) {

        const garment =
            getGarment(
                garmentId
            );


        if (!garment) {

            return false;

        }


        return Boolean(
            garment.features &&
            garment.features[feature]
        );

    }


    /* ========================================================
       GET PATTERN ENGINE
       ======================================================== */

    function getPatternEngine(
        garmentId
    ) {

        const garment =
            getGarment(
                garmentId
            );


        if (!garment) {

            return null;

        }


        return garment.patternEngine;

    }


    /* ========================================================
       VALIDATE PROFILE FOR GARMENT
       ======================================================== */

    function validateProfileForGarment(
        profile,
        garmentId
    ) {

        if (!profile) {

            return {

                valid: false,

                missing: [],

                message:
                    "Body Profile belum tersedia."

            };

        }


        const garment =
            getGarment(
                garmentId
            );


        if (!garment) {

            return {

                valid: false,

                missing: [],

                message:
                    `Garment tidak ditemukan: ${garmentId}`

            };

        }


        const missing = [];


        garment.requiredMeasurements
            .forEach(
                measurementId => {

                    if (
                        !profile.hasMeasurement(
                            measurementId
                        )
                    ) {

                        const definition =
                            Schema.getMeasurementDefinition(
                                measurementId
                            );


                        missing.push({

                            id:
                                measurementId,

                            label:
                                definition
                                    ? definition.label
                                    : measurementId

                        });

                    }

                }
            );


        return {

            valid:
                missing.length === 0,

            missing,

            message:
                missing.length === 0
                    ? "Profile lengkap."
                    : "Profile belum lengkap."

        };

    }


    /* ========================================================
       GET GARMENT UI DATA
       ======================================================== */

    function getGarmentUIData(
        garmentId
    ) {

        const garment =
            getGarment(
                garmentId
            );


        if (!garment) {

            return null;

        }


        return {

            id:
                garment.id,

            label:
                garment.label,

            category:
                garment.category,

            patternEngine:
                garment.patternEngine,

            requiredMeasurements:
                getGarmentMeasurements(
                    garmentId
                ),

            optionalMeasurements:
                getOptionalMeasurements(
                    garmentId
                ),

            features:
                {
                    ...garment.features
                }

        };

    }


    /* ========================================================
       EXPORT GLOBAL
       ======================================================== */

    window.PatternMakerGarment = {

        GARMENT_DEFINITIONS,

        GARMENT_CATEGORIES,

        getGarment,

        hasGarment,

        getAllGarments,

        getGarmentsByCategory,

        getGarmentMeasurements,

        getOptionalMeasurements,

        getAllGarmentMeasurements,

        garmentHasFeature,

        getPatternEngine,

        validateProfileForGarment,

        getGarmentUIData

    };


})();
```
