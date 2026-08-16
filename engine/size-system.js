/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 42 — engine/size-system.js
 * ============================================================
 *
 * UNIVERSAL SIZE SYSTEM
 *
 * Memisahkan:
 *
 * CATEGORY
 *    ↓
 * SIZE SYSTEM
 *    ↓
 * SIZE CHART
 *    ↓
 * MEASUREMENTS
 *
 * ============================================================
 *
 * CATEGORY:
 *
 *   child
 *   teen
 *   women
 *   men
 *   custom
 *
 * ============================================================
 *
 * CATATAN:
 *
 * Nilai contoh di file ini adalah DATA DEMO / DEFAULT
 * untuk arsitektur sistem.
 *
 * Untuk production garment, size chart harus diganti
 * dengan tabel ukuran yang benar-benar digunakan oleh
 * brand / pattern department / standar perusahaan.
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "1.0";


    /* ========================================================
       CATEGORY DEFINITIONS
       ======================================================== */

    const CATEGORIES = {

        child: {

            id:
                "child",

            label:
                "Anak",

            description:
                "Size system anak.",

            ageRange: {

                min:
                    1,

                max:
                    12

            }

        },


        teen: {

            id:
                "teen",

            label:
                "Remaja",

            description:
                "Size system remaja.",

            ageRange: {

                min:
                    12,

                max:
                    19

            }

        },


        women: {

            id:
                "women",

            label:
                "Wanita",

            description:
                "Size system wanita dewasa.",

            ageRange: {

                min:
                    13,

                max:
                    null

            }

        },


        men: {

            id:
                "men",

            label:
                "Pria",

            description:
                "Size system pria dewasa.",

            ageRange: {

                min:
                    13,

                max:
                    null

            }

        },


        custom: {

            id:
                "custom",

            label:
                "Custom",

            description:
                "Size system bebas.",

            ageRange: {

                min:
                    null,

                max:
                    null

            }

        }

    };


    /* ========================================================
       CHILD SIZE CHART
       ========================================================
       UNIT:
           cm

       measurement values are body measurements,
       not finished garment measurements.
       ======================================================== */

    const CHILD_SIZES = [

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

    ];


    /* ========================================================
       TEEN SIZE CHART
       ======================================================== */

    const TEEN_SIZES = [

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

    ];


    /* ========================================================
       WOMEN SIZE CHART
       ======================================================== */

    const WOMEN_SIZES = [

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

    ];


    /* ========================================================
       MEN SIZE CHART
       ======================================================== */

    const MEN_SIZES = [

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

    ];


    /* ========================================================
       SIZE TABLE REGISTRY
       ======================================================== */

    const SIZE_TABLES = {

        child:
            CHILD_SIZES,

        teen:
            TEEN_SIZES,

        women:
            WOMEN_SIZES,

        men:
            MEN_SIZES,

        custom:
            []

    };


    /* ========================================================
       CLONE
       ======================================================== */

    function clone(
        value
    ) {

        if (
            value ===
            undefined ||
            value ===
            null
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
       CATEGORY
       ======================================================== */

    function getCategory(
        categoryId
    ) {

        return (
            CATEGORIES[
                categoryId
            ] ||
            null
        );

    }


    function getCategories() {

        return Object.values(
            CATEGORIES
        )
        .map(
            clone
        );

    }


    /* ========================================================
       SIZE TABLE
       ======================================================== */

    function getSizeTable(
        categoryId
    ) {

        const table =
            SIZE_TABLES[
                categoryId
            ];


        if (
            !table
        ) {

            return [];

        }


        return clone(
            table
        );

    }


    /* ========================================================
       SIZE
       ======================================================== */

    function getSize(
        categoryId,
        sizeId
    ) {

        const table =
            SIZE_TABLES[
                categoryId
            ] || [];


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
       FIND BY LABEL
       ======================================================== */

    function getSizeByLabel(
        categoryId,
        label
    ) {

        const table =
            SIZE_TABLES[
                categoryId
            ] || [];


        const target =
            String(
                label
            )
            .toLowerCase();


        const found =
            table.find(
                size =>
                    String(
                        size.label
                    )
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

        return (

            SIZE_TABLES[
                categoryId
            ] || []

        )
        .map(
            size => ({

                id:
                    size.id,

                label:
                    size.label,

                age:
                    size.age ??
                    null

            })
        );

    }


    /* ========================================================
       INTERPOLATION
       ======================================================== */

    function interpolate(
        a,
        b,
        ratio
    ) {

        const start =
            Number(a);


        const end =
            Number(b);


        return (

            start +
            (
                end -
                start
            ) *
            Number(ratio)

        );

    }


    /* ========================================================
       MEASUREMENT INTERPOLATION
       ======================================================== */

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

                "Size untuk interpolasi tidak ditemukan."

            );

        }


        const measurements =
            {};


        const keys = [

            ...new Set([

                ...Object.keys(
                    first.measurements ||
                    {}
                ),

                ...Object.keys(
                    second.measurements ||
                    {}
                )

            ])

        ];


        keys.forEach(
            key => {

                const a =
                    first.measurements?.[
                        key
                    ];


                const b =
                    second.measurements?.[
                        key
                    ];


                if (
                    Number.isFinite(
                        Number(a)
                    ) &&
                    Number.isFinite(
                        Number(b)
                    )
                ) {

                    measurements[key] =
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

                    measurements[key] =
                        Number(a);

                }
                else if (
                    Number.isFinite(
                        Number(b)
                    )
                ) {

                    measurements[key] =
                        Number(b);

                }

            }
        );


        return {

            id:
                `${first.id}-${second.id}-INTERPOLATED`,

            label:
                `${first.label}/${second.label}`,

            measurements,

            interpolated:
                true,

            ratio:
                Number(ratio)

        };

    }


    /* ========================================================
       SIZE → PROFILE DATA
       ======================================================== */

    function toMeasurementProfile(
        categoryId,
        sizeId
    ) {

        const size =
            getSize(
                categoryId,
                sizeId
            );


        if (
            !size
        ) {

            throw new Error(

                `Size "${sizeId}" ` +
                `tidak ditemukan untuk ${categoryId}.`

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
                size.age ??
                null,

            measurements:
                clone(
                    size.measurements
                ),

            unit:
                "cm",

            source:
                "PatternMaker Size System"

        };

    }


    /* ========================================================
       CUSTOM SIZE
       ======================================================== */

    function createCustomSize(
        options = {}
    ) {

        const id =
            options.id ||
            `CUSTOM-${Date.now()}`;


        const label =
            options.label ||
            "Custom";


        const measurements =
            clone(
                options.measurements ||
                {}
            );


        return {

            id,

            label,

            age:
                options.age ??
                null,

            measurements,

            unit:
                options.unit ||
                "cm",

            custom:
                true

        };

    }


    /* ========================================================
       REGISTER CUSTOM SIZE
       ======================================================== */

    function registerCustomSize(
        categoryId,
        size
    ) {

        if (
            !SIZE_TABLES[
                categoryId
            ]
        ) {

            SIZE_TABLES[
                categoryId
            ] = [];

        }


        const custom =
            createCustomSize(
                size
            );


        SIZE_TABLES[
            categoryId
        ]
        .push(
            custom
        );


        return clone(
            custom
        );

    }


    /* ========================================================
       VALIDATE SIZE
       ======================================================== */

    function validateSize(
        categoryId,
        size
    ) {

        const errors =
            [];


        const warnings =
            [];


        if (
            !CATEGORIES[
                categoryId
            ]
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
                "Size tidak tersedia."
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


        const measurements =
            size.measurements ||
            {};


        Object.entries(
            measurements
        )
        .forEach(
            (
                [
                    key,
                    value
                ]
            ) => {

                if (
                    !Number.isFinite(
                        Number(value)
                    )
                ) {

                    errors.push(

                        `Measurement "${key}" ` +
                        "harus berupa angka."

                    );

                    return;

                }


                if (
                    Number(value) <= 0
                ) {

                    warnings.push(

                        `Measurement "${key}" ` +
                        "tidak positif."

                    );

                }

            }
        );


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

                `Size table ${categoryId} kosong.`

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

                        `Duplicate size id: ${size.id}`

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


                result.warnings.push(
                    ...validation.warnings
                );

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
            CATEGORIES
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

        CATEGORIES,

        SIZE_TABLES,

        getCategory,

        getCategories,

        getSizeTable,

        getSize,

        getSizeByLabel,

        getSizeOptions,

        interpolateSizes,

        toMeasurementProfile,

        createCustomSize,

        registerCustomSize,

        validateSize,

        validateTable,

        validateAll

    };


})();
