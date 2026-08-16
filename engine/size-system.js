/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 45
 *
 * FILE:
 *   engine/size-system.js
 *
 * ============================================================
 *
 * SINGLE RESPONSIBILITY:
 *
 *   CATEGORY
 *      ↓
 *   SIZE TABLE
 *      ↓
 *   MEASUREMENT MAPPER
 *      ↓
 *   CANONICAL MEASUREMENTS
 *
 * ============================================================
 *
 * SIZE SYSTEM TIDAK BOLEH:
 *
 * - membuat formula pola
 * - mengubah cutting geometry
 * - melakukan grading geometry
 * - mengandung logic UI
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
            "measurement-schema.js harus dimuat sebelum size-system.js."
        );

    }


    if (
        !Mapper
    ) {

        throw new Error(
            "measurement-mapper.js harus dimuat sebelum size-system.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       UNIT
       ======================================================== */

    const INTERNAL_UNIT =
        "cm";


    /* ========================================================
       CATEGORY DEFINITIONS
       ======================================================== */

    const CATEGORY_DEFINITIONS = {

        child: {

            id:
                "child",

            label:
                "Anak",

            description:
                "Ukuran pakaian anak.",

            ageMin:
                1,

            ageMax:
                12

        },


        teen: {

            id:
                "teen",

            label:
                "Remaja",

            description:
                "Ukuran pakaian remaja.",

            ageMin:
                12,

            ageMax:
                19

        },


        women: {

            id:
                "women",

            label:
                "Wanita",

            description:
                "Ukuran pakaian wanita dewasa.",

            ageMin:
                13,

            ageMax:
                null

        },


        men: {

            id:
                "men",

            label:
                "Pria",

            description:
                "Ukuran pakaian pria dewasa.",

            ageMin:
                13,

            ageMax:
                null

        },


        custom: {

            id:
                "custom",

            label:
                "Custom",

            description:
                "Ukuran custom / manual.",

            ageMin:
                null,

            ageMax:
                null

        }

    };


    /* ========================================================
       RAW SIZE TABLES
       ========================================================
       IMPORTANT:
       Nilai berikut adalah contoh data sistem.
       Mereka bukan standar produksi universal.
       ======================================================== */

    const RAW_SIZE_TABLES = {

        child: [

            {
                id:
                    "C02",

                label:
                    "2",

                age:
                    2,

                measurements: {

                    chest:
                        54,

                    waist:
                        52,

                    hip:
                        56,

                    shoulder:
                        24,

                    backLength:
                        25,

                    sleeveLength:
                        28

                }

            },

            {
                id:
                    "C04",

                label:
                    "4",

                age:
                    4,

                measurements: {

                    chest:
                        58,

                    waist:
                        54,

                    hip:
                        60,

                    shoulder:
                        26,

                    backLength:
                        29,

                    sleeveLength:
                        34

                }

            },

            {
                id:
                    "C06",

                label:
                    "6",

                age:
                    6,

                measurements: {

                    chest:
                        62,

                    waist:
                        56,

                    hip:
                        64,

                    shoulder:
                        28,

                    backLength:
                        33,

                    sleeveLength:
                        39

                }

            },

            {
                id:
                    "C08",

                label:
                    "8",

                age:
                    8,

                measurements: {

                    chest:
                        66,

                    waist:
                        58,

                    hip:
                        68,

                    shoulder:
                        30,

                    backLength:
                        37,

                    sleeveLength:
                        44

                }

            },

            {
                id:
                    "C10",

                label:
                    "10",

                age:
                    10,

                measurements: {

                    chest:
                        70,

                    waist:
                        60,

                    hip:
                        72,

                    shoulder:
                        32,

                    backLength:
                        41,

                    sleeveLength:
                        49

                }

            },

            {
                id:
                    "C12",

                label:
                    "12",

                age:
                    12,

                measurements: {

                    chest:
                        74,

                    waist:
                        64,

                    hip:
                        76,

                    shoulder:
                        34,

                    backLength:
                        45,

                    sleeveLength:
                        54

                }

            }

        ],


        teen: [

            {
                id:
                    "TXS",

                label:
                    "XS",

                age:
                    12,

                measurements: {

                    chest:
                        76,

                    waist:
                        62,

                    hip:
                        80,

                    shoulder:
                        35,

                    backLength:
                        47,

                    sleeveLength:
                        55

                }

            },

            {
                id:
                    "TS",

                label:
                    "S",

                age:
                    14,

                measurements: {

                    chest:
                        80,

                    waist:
                        66,

                    hip:
                        84,

                    shoulder:
                        36,

                    backLength:
                        49,

                    sleeveLength:
                        57

                }

            },

            {
                id:
                    "TM",

                label:
                    "M",

                age:
                    16,

                measurements: {

                    chest:
                        84,

                    waist:
                        70,

                    hip:
                        88,

                    shoulder:
                        38,

                    backLength:
                        51,

                    sleeveLength:
                        59

                }

            },

            {
                id:
                    "TL",

                label:
                    "L",

                age:
                    18,

                measurements: {

                    chest:
                        88,

                    waist:
                        74,

                    hip:
                        92,

                    shoulder:
                        40,

                    backLength:
                        53,

                    sleeveLength:
                        61

                }

            }

        ],


        women: [

            {
                id:
                    "WXS",

                label:
                    "XS",

                measurements: {

                    bust:
                        80,

                    waist:
                        60,

                    hip:
                        86,

                    shoulder:
                        35,

                    backLength:
                        38,

                    sleeveLength:
                        57

                }

            },

            {
                id:
                    "WS",

                label:
                    "S",

                measurements: {

                    bust:
                        84,

                    waist:
                        64,

                    hip:
                        90,

                    shoulder:
                        36,

                    backLength:
                        39,

                    sleeveLength:
                        58

                }

            },

            {
                id:
                    "WM",

                label:
                    "M",

                measurements: {

                    bust:
                        88,

                    waist:
                        68,

                    hip:
                        94,

                    shoulder:
                        37,

                    backLength:
                        40,

                    sleeveLength:
                        59

                }

            },

            {
                id:
                    "WL",

                label:
                    "L",

                measurements: {

                    bust:
                        94,

                    waist:
                        74,

                    hip:
                        100,

                    shoulder:
                        38,

                    backLength:
                        41,

                    sleeveLength:
                        60

                }

            },

            {
                id:
                    "WXL",

                label:
                    "XL",

                measurements: {

                    bust:
                        100,

                    waist:
                        80,

                    hip:
                        106,

                    shoulder:
                        39,

                    backLength:
                        42,

                    sleeveLength:
                        61

                }

            }

        ],


        men: [

            {
                id:
                    "MS",

                label:
                    "S",

                measurements: {

                    chest:
                        88,

                    waist:
                        76,

                    hip:
                        90,

                    shoulder:
                        42,

                    backLength:
                        43,

                    sleeveLength:
                        60

                }

            },

            {
                id:
                    "MM",

                label:
                    "M",

                measurements: {

                    chest:
                        94,

                    waist:
                        82,

                    hip:
                        96,

                    shoulder:
                        44,

                    backLength:
                        45,

                    sleeveLength:
                        61

                }

            },

            {
                id:
                    "ML",

                label:
                    "L",

                measurements: {

                    chest:
                        100,

                    waist:
                        88,

                    hip:
                        102,

                    shoulder:
                        46,

                    backLength:
                        47,

                    sleeveLength:
                        62

                }

            },

            {
                id:
                    "MXL",

                label:
                    "XL",

                measurements: {

                    chest:
                        108,

                    waist:
                        96,

                    hip:
                        110,

                    shoulder:
                        48,

                    backLength:
                        49,

                    sleeveLength:
                        63

                }

            },

            {
                id:
                    "MXXL",

                label:
                    "XXL",

                measurements: {

                    chest:
                        116,

                    waist:
                        104,

                    hip:
                        118,

                    shoulder:
                        50,

                    backLength:
                        51,

                    sleeveLength:
                        64

                }

            }

        ],


        custom: []

    };


    /* ========================================================
       CLONE
       ======================================================== */

    function clone(
        value
    ) {

        if (
            value ===
            null ||
            value ===
            undefined
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


    /* ========================================================
       CATEGORY API
       ======================================================== */

    function getCategory(
        categoryId
    ) {

        const category =
            CATEGORY_DEFINITIONS[
                categoryId
            ];


        return category
            ? clone(
                category
            )
            : null;

    }


    function getCategories() {

        return Object.values(
            CATEGORY_DEFINITIONS
        )
        .map(
            clone
        );

    }


    function hasCategory(
        categoryId
    ) {

        return Boolean(

            CATEGORY_DEFINITIONS[
                categoryId
            ]

        );

    }


    /* ========================================================
       RAW TABLE ACCESS
       ======================================================== */

    function getRawTable(
        categoryId
    ) {

        if (
            !hasCategory(
                categoryId
            )
        ) {

            return [];

        }


        return clone(

            RAW_SIZE_TABLES[
                categoryId
            ] ||
            []

        );

    }


    /* ========================================================
       NORMALIZE SIZE
       ======================================================== */

    function normalizeSize(
        categoryId,
        rawSize
    ) {

        if (
            !rawSize
        ) {

            throw new Error(
                "Raw size kosong."
            );

        }


        /*
         * Canonicalize all measurements
         * through the mapper.
         */

        const mapped =
            Mapper.mapSizeProfile(

                rawSize,

                {

                    category:
                        categoryId,

                    unit:
                        rawSize.unit ||
                        INTERNAL_UNIT

                }

            );


        const measurements =
            mapped.measurements;


        return {

            id:
                rawSize.id,

            label:
                rawSize.label ||
                rawSize.id,

            age:
                rawSize.age ??
                null,

            measurements:
                measurements,

            unit:
                INTERNAL_UNIT,

            category:
                categoryId,

            source:
                "PatternMaker Size System",

            version:
                VERSION,

            mappingWarnings:
                mapped.warnings || [],

            mappingConflicts:
                mapped.conflicts || []

        };

    }


    /* ========================================================
       BUILD CATEGORY TABLE
       ======================================================== */

    function buildCategoryTable(
        categoryId
    ) {

        if (
            !hasCategory(
                categoryId
            )
        ) {

            return [];

        }


        return getRawTable(
            categoryId
        )
        .map(
            raw =>
                normalizeSize(
                    categoryId,
                    raw
                )
        );

    }


    /* ========================================================
       CACHE
       ======================================================== */

    const NORMALIZED_TABLES = {};


    function getSizeTable(
        categoryId
    ) {

        if (
            !hasCategory(
                categoryId
            )
        ) {

            return [];

        }


        if (
            !NORMALIZED_TABLES[
                categoryId
            ]
        ) {

            NORMALIZED_TABLES[
                categoryId
            ] =
                buildCategoryTable(
                    categoryId
                );

        }


        return clone(

            NORMALIZED_TABLES[
                categoryId
            ]

        );

    }


    /* ========================================================
       GET SIZE
       ======================================================== */

    function getSize(
        categoryId,
        sizeId
    ) {

        const table =
            getSizeTable(
                categoryId
            );


        const found =
            table.find(
                size =>
                    size.id ===
                    sizeId
            );


        return found
            ? clone(found)
            : null;

    }


    /* ========================================================
       GET SIZE BY LABEL
       ======================================================== */

    function getSizeByLabel(
        categoryId,
        label
    ) {

        const target =
            String(
                label || ""
            )
            .trim()
            .toLowerCase();


        const table =
            getSizeTable(
                categoryId
            );


        const found =
            table.find(
                size =>
                    String(
                        size.label
                    )
                    .trim()
                    .toLowerCase() ===
                    target
            );


        return found
            ? clone(found)
            : null;

    }


    /* ========================================================
       SIZE OPTIONS
       ======================================================== */

    function getSizeOptions(
        categoryId
    ) {

        return getSizeTable(
            categoryId
        )
        .map(
            size => ({

                id:
                    size.id,

                label:
                    size.label,

                age:
                    size.age

            })
        );

    }


    /* ========================================================
       CUSTOM SIZE
       ======================================================== */

    function createCustomSize(
        options = {}
    ) {

        const result = {

            id:
                options.id ||
                `CUSTOM-${Date.now()}`,

            label:
                options.label ||
                "Custom",

            age:
                options.age ??
                null,

            measurements:
                {},

            unit:
                options.unit ||
                INTERNAL_UNIT,

            category:
                options.category ||
                "custom",

            custom:
                true,

            source:
                "PatternMaker Custom Size",

            version:
                VERSION

        };


        /*
         * Map user supplied measurements
         * into canonical IDs.
         */

        const mapped =
            Mapper.mapObject(

                options.measurements ||
                {},

                {

                    unit:
                        options.unit ||
                        INTERNAL_UNIT

                }

            );


        /*
         * Convert to internal cm.
         */

        const canonical =
            Mapper.canonicalizeToCm(

            options.measurements ||
            {},

            {

                unit:
                    options.unit ||
                    INTERNAL_UNIT

            }

        );


        result.measurements =
            canonical.measurements;


        result.mappingWarnings =
            mapped.warnings || [];


        result.mappingConflicts =
            mapped.conflicts || [];


        return result;

    }


    /* ========================================================
       REGISTER CUSTOM SIZE
       ======================================================== */

    const CUSTOM_REGISTRY = [];


    function registerCustomSize(
        size
    ) {

        const custom =
            createCustomSize(
                size
            );


        const index =
            CUSTOM_REGISTRY.findIndex(
                item =>
                    item.id ===
                    custom.id
            );


        if (
            index >=
            0
        ) {

            CUSTOM_REGISTRY[
                index
            ] =
                custom;

        }
        else {

            CUSTOM_REGISTRY.push(
                custom
            );

        }


        return clone(
            custom
        );

    }


    function getCustomSizes() {

        return clone(
            CUSTOM_REGISTRY
        );

    }


    function getCustomSize(
        id
    ) {

        const found =
            CUSTOM_REGISTRY.find(
                size =>
                    size.id ===
                    id
            );


        return found
            ? clone(found)
            : null;

    }


    /* ========================================================
       PROFILE CONVERSION
       ======================================================== */

    function toMeasurementProfile(
        categoryId,
        sizeId
    ) {

        let size =
            getSize(
                categoryId,
                sizeId
            );


        /*
         * Custom registry fallback.
         */

        if (
            !size &&
            categoryId ===
                "custom"
        ) {

            size =
                getCustomSize(
                    sizeId
                );

        }


        if (
            !size
        ) {

            throw new Error(

                `Size "${sizeId}" tidak ditemukan ` +
                `untuk category "${categoryId}".`

            );

        }


        return {

            category:
                categoryId,

            sizeId:
                size.id,

            sizeLabel:
                size.label,

            age:
                size.age,

            measurements:
                clone(
                    size.measurements
                ),

            unit:
                INTERNAL_UNIT,

            source:
                size.source,

            version:
                VERSION

        };

    }


    /* ========================================================
       INTERPOLATION
       ======================================================== */

    function interpolate(
        a,
        b,
        ratio
    ) {

        return (

            Number(a) +

            (
                Number(b) -
                Number(a)
            ) *

            Number(ratio)

        );

    }


    function interpolateSizes(
        categoryId,
        firstSizeId,
        secondSizeId,
        ratio = 0.5
    ) {

        const first =
            getSize(
                categoryId,
                firstSizeId
            );


        const second =
            getSize(
                categoryId,
                secondSizeId
            );


        if (
            !first ||
            !second
        ) {

            throw new Error(

                "Size interpolasi tidak ditemukan."

            );

        }


        const measurements = {};


        const ids = [

            ...new Set([

                ...Object.keys(
                    first.measurements
                ),

                ...Object.keys(
                    second.measurements
                )

            ])

        ];


        ids.forEach(
            id => {

                const a =
                    first.measurements[
                        id
                    ];


                const b =
                    second.measurements[
                        id
                    ];


                if (
                    Number.isFinite(
                        Number(a)
                    ) &&
                    Number.isFinite(
                        Number(b)
                    )
                ) {

                    measurements[
                        id
                    ] =
                        interpolate(

                            a,

                            b,

                            ratio

                        );

                }
                else if (
                    Number.isFinite(
                        Number(a)
                    )
                ) {

                    measurements[
                        id
                    ] =
                        Number(a);

                }
                else if (
                    Number.isFinite(
                        Number(b)
                    )
                ) {

                    measurements[
                        id
                    ] =
                        Number(b);

                }

            }
        );


        return {

            id:
                `${first.id}-${second.id}-INTERPOLATED`,

            label:
                `${first.label}/${second.label}`,

            category:
                categoryId,

            age:
                null,

            measurements,

            unit:
                INTERNAL_UNIT,

            interpolated:
                true,

            ratio:
                ratio,

            source:
                "PatternMaker Size Interpolation",

            version:
                VERSION

        };

    }


    /* ========================================================
       SIZE SERIES
       ======================================================== */

    function createNumericSeries(
        start,
        end,
        step = 1
    ) {

        const output = [];


        const direction =
            end >= start
                ? 1
                : -1;


        const delta =
            Math.abs(
                Number(step)
            ) *
            direction;


        if (
            !delta
        ) {

            return [

                String(start)

            ];

        }


        let current =
            Number(start);


        while (

            (
                direction >
                0 &&

                current <=
                Number(end)

            )

            ||

            (
                direction <
                0 &&

                current >=
                Number(end)

            )

        ) {

            output.push(
                String(
                    current
                )
            );


            current +=
                delta;

        }


        return output;

    }


    /* ========================================================
       VALIDATION
       ======================================================== */

    function validateSize(
        categoryId,
        size
    ) {

        const errors = [];

        const warnings = [];


        if (
            !hasCategory(
                categoryId
            )
        ) {

            errors.push(

                `Category "${categoryId}" tidak dikenal.`

            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            !size
        ) {

            errors.push(
                "Size kosong."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            !size.id
        ) {

            errors.push(
                "Size tidak memiliki id."
            );

        }


        if (
            !size.label
        ) {

            errors.push(
                "Size tidak memiliki label."
            );

        }


        const mapped =
            Mapper.mapObject(
                size.measurements || {}
            );


        if (
            mapped.warnings?.length
        ) {

            warnings.push(
                ...mapped.warnings
            );

        }


        if (
            mapped.conflicts?.length
        ) {

            errors.push(

                `Measurement conflict pada size "${size.id}".`

            );

        }


        const validation =
            Schema.validateMeasurementObject(
                mapped.measurements
            );


        if (
            !validation.valid
        ) {

            errors.push(
                ...validation.errors
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
       VALIDATE TABLE
       ======================================================== */

    function validateTable(
        categoryId
    ) {

        const result = {

            valid:
                true,

            errors:
                [],

            warnings:
                [],

            sizes:
                []

        };


        const table =
            getSizeTable(
                categoryId
            );


        if (
            categoryId !==
            "custom" &&
            table.length === 0
        ) {

            result.valid =
                false;


            result.errors.push(

                `Size table "${categoryId}" kosong.`

            );


            return result;

        }


        const ids =
            new Set();


        table.forEach(
            size => {

                const validation =
                    validateSize(

                        categoryId,

                        size

                    );


                result.sizes.push({

                    id:
                        size.id,

                    label:
                        size.label,

                    valid:
                        validation.valid

                });


                if (
                    ids.has(
                        size.id
                    )
                ) {

                    result.valid =
                        false;


                    result.errors.push(

                        `Duplicate size ID "${size.id}".`

                    );

                }


                ids.add(
                    size.id
                );


                if (
                    !validation.valid
                ) {

                    result.valid =
                        false;


                    result.errors.push(
                        ...validation.errors
                    );

                }


                if (
                    validation.warnings.length
                ) {

                    result.warnings.push(
                        ...validation.warnings
                    );

                }

            }
        );


        return result;

    }


    /* ========================================================
       VALIDATE ALL
       ======================================================== */

    function validateAll() {

        const result = {

            valid:
                true,

            categories:
                {},

            errors:
                [],

            warnings:
                []

        };


        Object.keys(
            CATEGORY_DEFINITIONS
        )
        .forEach(
            categoryId => {

                const validation =
                    validateTable(
                        categoryId
                    );


                result.categories[
                    categoryId
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
       PUBLIC API
       ======================================================== */

    window.PatternMakerSizeSystem = {

        VERSION,

        INTERNAL_UNIT,

        CATEGORY_DEFINITIONS,

        RAW_SIZE_TABLES,

        getCategory,

        getCategories,

        hasCategory,

        getRawTable,

        getSizeTable,

        getSize,

        getSizeByLabel,

        getSizeOptions,

        createCustomSize,

        registerCustomSize,

        getCustomSizes,

        getCustomSize,

        toMeasurementProfile,

        interpolateSizes,

        createNumericSeries,

        validateSize,

        validateTable,

        validateAll

    };


})();
