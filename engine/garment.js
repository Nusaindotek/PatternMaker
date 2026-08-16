/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 48
 *
 * FILE:
 *   engine/garment.js
 * ============================================================
 *
 * RESPONSIBILITY:
 *
 *   GARMENT CATALOG + ROUTING CONTRACT
 *
 * Tidak membuat geometry.
 * Tidak membuat seam.
 * Tidak melakukan nesting.
 *
 * Tanggung jawab:
 *
 *   Category
 *      ↓
 *   Garment
 *      ↓
 *   Required Measurements
 *      ↓
 *   Pattern Engine
 *      ↓
 *   Feature Contract
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    const Schema =
        window.PatternMakerMeasurementSchema;

    const Mapper =
        window.PatternMakerMeasurementMapper;


    if (
        !Schema
    ) {

        throw new Error(
            "measurement-schema.js harus dimuat sebelum garment.js."
        );

    }


    if (
        !Mapper
    ) {

        throw new Error(
            "measurement-mapper.js harus dimuat sebelum garment.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       CATEGORY IDS
       ======================================================== */

    const CATEGORIES = Object.freeze({

        CHILD:
            "child",

        TEEN:
            "teen",

        WOMEN:
            "women",

        MEN:
            "men",

        CUSTOM:
            "custom"

    });


    /* ========================================================
       GARMENT FAMILY
       ======================================================== */

    const FAMILIES = Object.freeze({

        TOP:
            "top",

        SHIRT:
            "shirt",

        DRESS:
            "dress",

        SKIRT:
            "skirt",

        PANTS:
            "pants",

        SHORTS:
            "shorts",

        BODICE:
            "bodice",

        CUSTOM:
            "custom"

    });


    /* ========================================================
       HELPERS
       ======================================================== */

    function clone(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        if (
            typeof structuredClone ===
            "function"
        ) {

            return structuredClone(
                value
            );

        }


        return JSON.parse(
            JSON.stringify(
                value
            )
        );

    }


    function unique(
        values
    ) {

        return [

            ...new Set(
                (
                    values ||
                    []
                )
                .filter(
                    Boolean
                )
            )

        ];

    }


    /* ========================================================
       GARMENT CATALOG
       ========================================================
       IMPORTANT:
       These are routing definitions.
       Drafting formulas remain in the pattern engines.
       ======================================================== */

    const GARMENT_CATALOG = {

        tshirt: {

            id:
                "tshirt",

            label:
                "T-Shirt",

            family:
                FAMILIES.TOP,

            patternEngine:
                "bodice",

            categories: [

                CATEGORIES.CHILD,
                CATEGORIES.TEEN,
                CATEGORIES.WOMEN,
                CATEGORIES.MEN,
                CATEGORIES.CUSTOM

            ],

            requiredMeasurements: [

                "chest",

                "shoulder",

                "garmentLength"

            ],

            optionalMeasurements: [

                "neck",

                "armhole",

                "bicep",

                "sleeveLength",

                "sleeveOpening",

                "waist"

            ],

            features: {

                sleeve:
                    true,

                neckline:
                    true,

                seam:
                    true,

                grainline:
                    true,

                notches:
                    true,

                drillPoints:
                    true

            },

            production: {

                defaultSeamAllowance:
                    1,

                allowStretch:
                    true,

                allowWoven:
                    true,

                requiresGrainline:
                    true

            },

            modes: [

                "newbie",
                "tailor",
                "expert"

            ]

        },


        shirt: {

            id:
                "shirt",

            label:
                "Shirt",

            family:
                FAMILIES.SHIRT,

            patternEngine:
                "shirt",

            categories: [

                CATEGORIES.CHILD,
                CATEGORIES.TEEN,
                CATEGORIES.WOMEN,
                CATEGORIES.MEN,
                CATEGORIES.CUSTOM

            ],

            requiredMeasurements: [

                "chest",

                "shoulder",

                "backLength",

                "garmentLength"

            ],

            optionalMeasurements: [

                "neck",

                "armhole",

                "bicep",

                "wrist",

                "sleeveLength",

                "waist",

                "hip",

                "frontLength"

            ],

            features: {

                sleeve:
                    true,

                collar:
                    true,

                placket:
                    true,

                cuff:
                    true,

                pocket:
                    true,

                seam:
                    true,

                grainline:
                    true,

                notches:
                    true,

                drillPoints:
                    true

            },

            production: {

                defaultSeamAllowance:
                    1,

                allowStretch:
                    true,

                allowWoven:
                    true,

                requiresGrainline:
                    true

            },

            modes: [

                "newbie",
                "tailor",
                "expert"

            ]

        },


        dress: {

            id:
                "dress",

            label:
                "Dress",

            family:
                FAMILIES.DRESS,

            patternEngine:
                "dress",

            categories: [

                CATEGORIES.CHILD,
                CATEGORIES.TEEN,
                CATEGORIES.WOMEN,
                CATEGORIES.CUSTOM

            ],

            requiredMeasurements: [

                "chest",

                "waist",

                "hip",

                "shoulder",

                "garmentLength"

            ],

            optionalMeasurements: [

                "bust",

                "neck",

                "armhole",

                "backLength",

                "frontLength",

                "bicep",

                "sleeveLength",

                "sleeveOpening"

            ],

            features: {

                sleeve:
                    true,

                neckline:
                    true,

                waistline:
                    true,

                skirt:
                    true,

                seam:
                    true,

                grainline:
                    true,

                notches:
                    true,

                drillPoints:
                    true

            },

            production: {

                defaultSeamAllowance:
                    1,

                allowStretch:
                    true,

                allowWoven:
                    true,

                requiresGrainline:
                    true

            },

            modes: [

                "newbie",
                "tailor",
                "expert"

            ]

        },


        skirt: {

            id:
                "skirt",

            label:
                "Skirt",

            family:
                FAMILIES.SKIRT,

            patternEngine:
                "skirt",

            categories: [

                CATEGORIES.CHILD,
                CATEGORIES.TEEN,
                CATEGORIES.WOMEN,
                CATEGORIES.CUSTOM

            ],

            requiredMeasurements: [

                "waist",

                "hip",

                "garmentLength"

            ],

            optionalMeasurements: [

                "thigh"

            ],

            features: {

                waistband:
                    true,

                pocket:
                    true,

                zipper:
                    true,

                seam:
                    true,

                grainline:
                    true,

                notches:
                    true,

                drillPoints:
                    true

            },

            production: {

                defaultSeamAllowance:
                    1,

                allowStretch:
                    true,

                allowWoven:
                    true,

                requiresGrainline:
                    true

            },

            modes: [

                "newbie",
                "tailor",
                "expert"

            ]

        },


        pants: {

            id:
                "pants",

            label:
                "Pants",

            family:
                FAMILIES.PANTS,

            patternEngine:
                "pants",

            categories: [

                CATEGORIES.CHILD,
                CATEGORIES.TEEN,
                CATEGORIES.WOMEN,
                CATEGORIES.MEN,
                CATEGORIES.CUSTOM

            ],

            requiredMeasurements: [

                "waist",

                "hip",

                "inseam",

                "outseam"

            ],

            optionalMeasurements: [

                "thigh",

                "knee",

                "calf",

                "ankle",

                "crotchDepth",

                "garmentLength"

            ],

            features: {

                waistband:
                    true,

                pocket:
                    true,

                zipper:
                    true,

                fly:
                    true,

                seam:
                    true,

                grainline:
                    true,

                notches:
                    true,

                drillPoints:
                    true

            },

            production: {

                defaultSeamAllowance:
                    1,

                allowStretch:
                    true,

                allowWoven:
                    true,

                requiresGrainline:
                    true

            },

            modes: [

                "tailor",
                "expert"

            ]

        },


        shorts: {

            id:
                "shorts",

            label:
                "Shorts",

            family:
                FAMILIES.SHORTS,

            patternEngine:
                "pants",

            categories: [

                CATEGORIES.CHILD,
                CATEGORIES.TEEN,
                CATEGORIES.WOMEN,
                CATEGORIES.MEN,
                CATEGORIES.CUSTOM

            ],

            requiredMeasurements: [

                "waist",

                "hip",

                "outseam"

            ],

            optionalMeasurements: [

                "thigh",

                "inseam",

                "crotchDepth",

                "knee"

            ],

            features: {

                waistband:
                    true,

                pocket:
                    true,

                zipper:
                    true,

                seam:
                    true,

                grainline:
                    true,

                notches:
                    true,

                drillPoints:
                    true

            },

            production: {

                defaultSeamAllowance:
                    1,

                allowStretch:
                    true,

                allowWoven:
                    true,

                requiresGrainline:
                    true

            },

            modes: [

                "newbie",
                "tailor",
                "expert"

            ]

        }

    };


    /* ========================================================
       GARMENT REGISTRY
       ======================================================== */

    const CUSTOM_GARMENTS =
        new Map();


    /* ========================================================
       GET GARMENT
       ======================================================== */

    function getGarment(
        garmentId
    ) {

        const source =

            GARMENT_CATALOG[
                garmentId
            ]

            ||

            CUSTOM_GARMENTS.get(
                garmentId
            );


        return source
            ? clone(
                source
            )
            : null;

    }


    /* ========================================================
       GET ALL GARMENTS
       ======================================================== */

    function getAllGarments() {

        return [

            ...Object.values(
                GARMENT_CATALOG
            ),

            ...CUSTOM_GARMENTS.values()

        ]
        .map(
            clone
        );

    }


    /* ========================================================
       GARMENT CATALOG
       ======================================================== */

    function getGarmentCatalog() {

        const catalog = {};


        getAllGarments()
            .forEach(
                garment => {

                    catalog[
                        garment.id
                    ] =
                        garment;

                }
            );


        return catalog;

    }


    /* ========================================================
       GARMENT IDS
       ======================================================== */

    function getGarmentIds() {

        return getAllGarments()
            .map(
                garment =>
                    garment.id
            );

    }


    /* ========================================================
       BY CATEGORY
       ======================================================== */

    function getGarmentsByCategory(
        category
    ) {

        return getAllGarments()
            .filter(
                garment =>

                    (
                        garment.categories ||
                        []
                    )
                    .includes(
                        category
                    )

            );

    }


    /* ========================================================
       BY FAMILY
       ======================================================== */

    function getGarmentsByFamily(
        family
    ) {

        return getAllGarments()
            .filter(
                garment =>

                    garment.family ===
                    family

            );

    }


    /* ========================================================
       BY ENGINE
       ======================================================== */

    function getGarmentsByEngine(
        engineId
    ) {

        return getAllGarments()
            .filter(
                garment =>

                    garment.patternEngine ===
                    engineId

            );

    }


    /* ========================================================
       CATEGORY SUPPORT
       ======================================================== */

    function supportsCategory(
        garment,
        category
    ) {

        if (
            !garment
        ) {

            return false;

        }


        return (

            garment.categories ||
            []
        )
        .includes(
            category
        );

    }


    /* ========================================================
       MODE SUPPORT
       ======================================================== */

    function supportsMode(
        garment,
        mode
    ) {

        if (
            !garment
        ) {

            return false;

        }


        return (

            garment.modes ||
            []
        )
        .includes(
            mode
        );

    }


    /* ========================================================
       REQUIRED MEASUREMENTS
       ======================================================== */

    function getRequiredMeasurements(
        garment
    ) {

        if (
            !garment
        ) {

            return [];

        }


        return Mapper
            .canonicalizeRequiredIds(
                garment.requiredMeasurements ||
                []
            );

    }


    /*
     * Mapper v1 does not expose
     * canonicalizeRequiredIds().
     *
     * Keep this helper internal and resolve
     * through Mapper.resolve().
     */

    function getCanonicalMeasurementIds(
        ids
    ) {

        return unique(

            (
                ids ||
                []
            )
            .map(
                id =>
                    Mapper.resolve(
                        id
                    )
            )

        );

    }


    /* ========================================================
       PUBLIC REQUIRED API
       ======================================================== */

    function getRequiredMeasurementIds(
        garment
    ) {

        if (
            !garment
        ) {

            return [];

        }


        return getCanonicalMeasurementIds(

            garment.requiredMeasurements

        );

    }


    function getOptionalMeasurementIds(
        garment
    ) {

        if (
            !garment
        ) {

            return [];

        }


        return getCanonicalMeasurementIds(

            garment.optionalMeasurements

        );

    }


    /* ========================================================
       GARMENT MEASUREMENT CONTRACT
       ======================================================== */

    function getMeasurementContract(
        garment
    ) {

        if (
            !garment
        ) {

            return {

                required: [],

                optional: []

            };

        }


        const required =
            getRequiredMeasurementIds(
                garment
            );


        const optional =
            getOptionalMeasurementIds(
                garment
            );


        return {

            required,

            optional:

                optional.filter(
                    id =>
                        !required.includes(
                            id
                        )
                )

        };

    }


    /* ========================================================
       PROFILE VALIDATION
       ======================================================== */

    function validateProfileForGarment(
        profile,
        garmentId
    ) {

        const garment =
            typeof garmentId ===
                "string"

                ? getGarment(
                    garmentId
                )

                : garmentId;


        const errors = [];

        const warnings = [];


        if (
            !garment
        ) {

            errors.push(
                "Garment tidak ditemukan."
            );


            return {

                valid:
                    false,

                garment:
                    null,

                missing:
                    [],

                errors,

                warnings

            };

        }


        if (
            !profile
        ) {

            errors.push(
                "Body profile belum tersedia."
            );


            return {

                valid:
                    false,

                garment,

                missing:
                    getRequiredMeasurementIds(
                        garment
                    ),

                errors,

                warnings

            };

        }


        const measurements =
            profile.measurements ||
            profile.getCanonicalMeasurements?.() ||
            {};


        const missing = [];


        getRequiredMeasurementIds(
            garment
        )
        .forEach(
            id => {

                const value =
                    measurements[
                        id
                    ];


                if (
                    value ===
                    undefined ||
                    value ===
                    null
                ) {

                    missing.push(
                        id
                    );

                }

            }
        );


        const labels =
            missing.map(
                id => {

                    const definition =
                        Schema.getMeasurementDefinition(
                            id
                        );


                    return definition
                        ? definition.label
                        : id;

                }
            );


        if (
            missing.length
        ) {

            errors.push(

                "Measurement wajib belum lengkap: " +
                labels.join(", ")

            );

        }


        /*
         * Category compatibility.
         */

        if (
            profile.category &&
            !supportsCategory(
                garment,
                profile.category
            )
        ) {

            errors.push(

                `Garment "${garment.label}" tidak ` +
                `mendukung kategori "${profile.category}".`

            );

        }


        /*
         * Age warning.
         */

        if (
            profile.age !==
            null &&
            profile.age !==
            undefined
        ) {

            const category =
                profile.category;


            const definition =
                Schema.getCategoryDefinition(
                    category
                );


            if (
                definition
            ) {

                if (
                    definition.ageMin !==
                    null &&
                    profile.age <
                    definition.ageMin
                ) {

                    warnings.push(

                        `Umur ${profile.age} berada ` +
                        `di bawah rentang umum kategori ${category}.`

                    );

                }


                if (
                    definition.ageMax !==
                    null &&
                    profile.age >
                    definition.ageMax
                ) {

                    warnings.push(

                        `Umur ${profile.age} berada ` +
                        `di atas rentang umum kategori ${category}.`

                    );

                }

            }

        }


        /*
         * Validate actual measurements.
         */

        const schemaValidation =
            Schema.validateMeasurementObject(
                measurements
            );


        if (
            !schemaValidation.valid
        ) {

            errors.push(
                ...schemaValidation.errors
            );

        }


        warnings.push(
            ...schemaValidation.warnings
        );


        return {

            valid:
                errors.length === 0,

            garment,

            missing,

            labels,

            errors,

            warnings

        };

    }


    /* ========================================================
       FABRIC VALIDATION
       ======================================================== */

    function validateFabricForGarment(
        garmentId,
        fabric = {}
    ) {

        const garment =
            getGarment(
                garmentId
            );


        const errors = [];

        const warnings = [];


        if (
            !garment
        ) {

            errors.push(
                "Garment tidak ditemukan."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        const stretch =
            String(
                fabric.stretch ||
                "unknown"
            )
            .toLowerCase();


        const material =
            String(
                fabric.material ||
                ""
            )
            .toLowerCase();


        if (
            stretch ===
            "high" &&
            garment.production?.allowStretch ===
                false
        ) {

            warnings.push(

                `${garment.label} tidak ditandai ` +
                "sebagai garment stretch."

            );

        }


        if (
            material &&
            !garment.production?.allowWoven &&
            stretch ===
            "none"
        ) {

            warnings.push(

                `${garment.label} belum memiliki ` +
                "aturan woven khusus."

            );

        }


        if (
            garment.production
                ?.requiresGrainline
        ) {

            if (
                fabric.grainline ===
                false
            ) {

                warnings.push(

                    `${garment.label} sebaiknya ` +
                    "menggunakan grainline."

                );

            }

        }


        return {

            valid:
                errors.length === 0,

            errors,

            warnings

        };

    }


    /* ========================================================
       PRODUCTION OPTIONS
       ======================================================== */

    function getProductionOptions(
        garmentId
    ) {

        const garment =
            getGarment(
                garmentId
            );


        if (
            !garment
        ) {

            return {};

        }


        return clone(
            garment.production ||
            {}
        );

    }


    /* ========================================================
       FEATURES
       ======================================================== */

    function getFeatures(
        garmentId
    ) {

        const garment =
            getGarment(
                garmentId
            );


        if (
            !garment
        ) {

            return {};

        }


        return clone(
            garment.features ||
            {}
        );

    }


    /* ========================================================
       VALIDATE GARMENT DEFINITION
       ======================================================== */

    function validateGarment(
        garment
    ) {

        const errors = [];

        const warnings = [];


        if (
            !garment ||
            typeof garment !==
                "object"
        ) {

            errors.push(
                "Garment definition tidak valid."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            !garment.id
        ) {

            errors.push(
                "Garment tidak memiliki id."
            );

        }


        if (
            !garment.label
        ) {

            errors.push(
                `Garment "${garment.id}" tidak memiliki label.`
            );

        }


        if (
            !garment.family
        ) {

            errors.push(
                `Garment "${garment.id}" tidak memiliki family.`
            );

        }


        if (
            !garment.patternEngine
        ) {

            errors.push(
                `Garment "${garment.id}" tidak memiliki patternEngine.`
            );

        }


        if (
            !Array.isArray(
                garment.categories
            ) ||
            garment.categories.length ===
            0
        ) {

            errors.push(

                `Garment "${garment.id}" tidak memiliki category mapping.`

            );

        }


        if (
            !Array.isArray(
                garment.requiredMeasurements
            )
        ) {

            errors.push(

                `Garment "${garment.id}" requiredMeasurements harus array.`

            );

        }


        if (
            !Array.isArray(
                garment.optionalMeasurements
            )
        ) {

            errors.push(

                `Garment "${garment.id}" optionalMeasurements harus array.`

            );

        }


        const required =
            getRequiredMeasurementIds(
                garment
            );


        const optional =
            getOptionalMeasurementIds(
                garment
            );


        if (
            required.length !==
            (
                garment.requiredMeasurements ||
                []
            ).length
        ) {

            errors.push(

                `Garment "${garment.id}" memiliki ` +
                "measurement ID yang tidak dikenal."

            );

        }


        const overlap =
            required.filter(
                id =>
                    optional.includes(
                        id
                    )
            );


        if (
            overlap.length
        ) {

            errors.push(

                `Garment "${garment.id}" memiliki ` +
                "measurement required dan optional yang tumpang tindih: " +
                overlap.join(", ")

            );

        }


        garment.categories
            ?.forEach(
                category => {

                    if (
                        !Schema.getCategoryDefinition(
                            category
                        )
                    ) {

                        errors.push(

                            `Garment "${garment.id}" memiliki ` +
                            `category "${category}" yang tidak dikenal.`

                        );

                    }

                }
            );


        /*
         * Expert should support production metadata.
         */

        if (
            !garment.production
        ) {

            warnings.push(

                `Garment "${garment.id}" belum memiliki production config.`

            );

        }


        return {

            valid:
                errors.length === 0,

            errors,

            warnings

        };

    }


    /* ========================================================
       VALIDATE CATALOG
       ======================================================== */

    function validateCatalog() {

        const result = {

            valid:
                true,

            errors:
                [],

            warnings:
                [],

            garments:
                {}

        };


        getAllGarments()
            .forEach(
                garment => {

                    const validation =
                        validateGarment(
                            garment
                        );


                    result.garments[
                        garment.id
                    ] =
                        validation;


                    if (
                        !validation.valid
                    ) {

                        result.valid =
                            false;


                        result.errors.push(
                            ...validation.errors
                        );

                    }


                    result.warnings.push(
                        ...validation.warnings
                    );

                }
            );


        return result;

    }


    /* ========================================================
       REGISTER CUSTOM GARMENT
       ======================================================== */

    function registerCustomGarment(
        garment
    ) {

        const validation =
            validateGarment(
                garment
            );


        if (
            !validation.valid
        ) {

            throw new Error(

                "Custom garment tidak valid: " +
                validation.errors.join(
                    " | "
                )

            );

        }


        CUSTOM_GARMENTS.set(

            garment.id,

            clone(
                garment
            )

        );


        return getGarment(
            garment.id
        );

    }


    /* ========================================================
       REMOVE CUSTOM GARMENT
       ======================================================== */

    function removeCustomGarment(
        garmentId
    ) {

        return CUSTOM_GARMENTS.delete(
            garmentId
        );

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug() {

        const validation =
            validateCatalog();


        console.group(
            "PatternMaker Garment Catalog"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Garments:",
            getGarmentIds()
        );


        console.log(
            "Validation:",
            validation
        );


        console.groupEnd();


        return validation;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerGarment = {

        VERSION,

        CATEGORIES,

        FAMILIES,

        GARMENT_CATALOG,

        getGarment,

        getAllGarments,

        getGarmentCatalog,

        getGarmentIds,

        getGarmentsByCategory,

        getGarmentsByFamily,

        getGarmentsByEngine,

        supportsCategory,

        supportsMode,

        getRequiredMeasurements,

        getRequiredMeasurementIds,

        getOptionalMeasurementIds,

        getMeasurementContract,

        validateProfileForGarment,

        validateFabricForGarment,

        getProductionOptions,

        getFeatures,

        validateGarment,

        validateCatalog,

        registerCustomGarment,

        removeCustomGarment,

        debug

    };


})();
