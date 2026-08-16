/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * FILE: engine/measurement-schema.js
 * ============================================================
 *
 * SINGLE SOURCE OF TRUTH
 * untuk canonical body measurements.
 *
 * ============================================================
 *
 * CANONICAL IDs:
 *
 * chest
 * bust
 * waist
 * hip
 * shoulder
 * neck
 * armhole
 * bicep
 * wrist
 * upperArm
 * backLength
 * frontLength
 * garmentLength
 * sleeveLength
 * sleeveOpening
 * crotchDepth
 * inseam
 * outseam
 * thigh
 * knee
 * calf
 * ankle
 * head
 *
 * ============================================================
 *
 * UNIT INTERNAL:
 *   cm
 *
 * Semua engine internal menggunakan cm.
 *
 * UI boleh menggunakan cm / mm / inch.
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       UNIT DEFINITIONS
       ======================================================== */

    const UNIT_FACTORS = {

        cm:
            1,

        mm:
            0.1,

        in:
            2.54,

        inch:
            2.54

    };


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
                "Ukuran anak.",

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
                "Ukuran remaja.",

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
                "Ukuran wanita dewasa.",

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
                "Ukuran pria dewasa.",

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
                "Ukuran bebas.",

            ageMin:
                null,

            ageMax:
                null

        }

    };


    /* ========================================================
       MEASUREMENT DEFINITIONS
       ======================================================== */

    const MEASUREMENTS = {

        chest: {

            id:
                "chest",

            label:
                "Lingkar Dada",

            shortLabel:
                "Dada",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "tshirt",
                    "shirt",
                    "dress",
                    "jacket",
                    "bodice"

                ],

            min:
                30,

            max:
                180

        },


        bust: {

            id:
                "bust",

            label:
                "Lingkar Bust",

            shortLabel:
                "Bust",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "dress",
                    "bodice"

                ],

            min:
                40,

            max:
                180

        },


        waist: {

            id:
                "waist",

            label:
                "Lingkar Pinggang",

            shortLabel:
                "Pinggang",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "tshirt",
                    "shirt",
                    "dress",
                    "skirt",
                    "pants",
                    "shorts",
                    "bodice"

                ],

            min:
                30,

            max:
                180

        },


        hip: {

            id:
                "hip",

            label:
                "Lingkar Pinggul",

            shortLabel:
                "Pinggul",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "dress",
                    "skirt",
                    "pants",
                    "shorts"

                ],

            min:
                35,

            max:
                190

        },


        neck: {

            id:
                "neck",

            label:
                "Lingkar Leher",

            shortLabel:
                "Leher",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "shirt",
                    "dress",
                    "tshirt"

                ],

            min:
                20,

            max:
                80

        },


        shoulder: {

            id:
                "shoulder",

            label:
                "Lebar Bahu",

            shortLabel:
                "Bahu",

            type:
                "width",

            axis:
                "horizontal",

            requiredFor:
                [

                    "tshirt",
                    "shirt",
                    "dress",
                    "bodice"

                ],

            min:
                10,

            max:
                70

        },


        armhole: {

            id:
                "armhole",

            label:
                "Lingkar Kerung Lengan",

            shortLabel:
                "Kerung",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "tshirt",
                    "shirt",
                    "dress",
                    "jacket"

                ],

            min:
                15,

            max:
                80

        },


        bicep: {

            id:
                "bicep",

            label:
                "Lingkar Bisep",

            shortLabel:
                "Bisep",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "sleeve",
                    "shirt",
                    "jacket"

                ],

            min:
                10,

            max:
                70

        },


        upperArm: {

            id:
                "upperArm",

            label:
                "Lingkar Lengan Atas",

            shortLabel:
                "Lengan Atas",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "sleeve"

                ],

            min:
                10,

            max:
                70

        },


        wrist: {

            id:
                "wrist",

            label:
                "Lingkar Pergelangan",

            shortLabel:
                "Pergelangan",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "sleeve",
                    "shirt"

                ],

            min:
                8,

            max:
                40

        },


        backLength: {

            id:
                "backLength",

            label:
                "Panjang Punggung",

            shortLabel:
                "Punggung",

            type:
                "length",

            axis:
                "vertical",

            requiredFor:
                [

                    "tshirt",
                    "shirt",
                    "dress",
                    "bodice"

                ],

            min:
                15,

            max:
                100

        },


        frontLength: {

            id:
                "frontLength",

            label:
                "Panjang Muka",

            shortLabel:
                "Muka",

            type:
                "length",

            axis:
                "vertical",

            requiredFor:
                [

                    "shirt",
                    "dress",
                    "bodice"

                ],

            min:
                15,

            max:
                110

        },


        garmentLength: {

            id:
                "garmentLength",

            label:
                "Panjang Baju",

            shortLabel:
                "Panjang",

            type:
                "length",

            axis:
                "vertical",

            requiredFor:
                [

                    "tshirt",
                    "shirt",
                    "dress"

                ],

            min:
                20,

            max:
                180

        },


        sleeveLength: {

            id:
                "sleeveLength",

            label:
                "Panjang Lengan",

            shortLabel:
                "Panjang Lengan",

            type:
                "length",

            axis:
                "vertical",

            requiredFor:
                [

                    "sleeve",
                    "shirt"

                ],

            min:
                10,

            max:
                100

        },


        sleeveOpening: {

            id:
                "sleeveOpening",

            label:
                "Bukaan Lengan",

            shortLabel:
                "Bukaan Lengan",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "sleeve"

                ],

            min:
                8,

            max:
                60

        },


        crotchDepth: {

            id:
                "crotchDepth",

            label:
                "Kedalaman Pesak",

            shortLabel:
                "Pesak",

            type:
                "length",

            axis:
                "vertical",

            requiredFor:
                [

                    "pants",
                    "shorts"

                ],

            min:
                10,

            max:
                50

        },


        inseam: {

            id:
                "inseam",

            label:
                "Panjang Dalam Kaki",

            shortLabel:
                "Inseam",

            type:
                "length",

            axis:
                "vertical",

            requiredFor:
                [

                    "pants",
                    "shorts"

                ],

            min:
                15,

            max:
                110

        },


        outseam: {

            id:
                "outseam",

            label:
                "Panjang Luar Kaki",

            shortLabel:
                "Outseam",

            type:
                "length",

            axis:
                "vertical",

            requiredFor:
                [

                    "pants",
                    "shorts"

                ],

            min:
                20,

            max:
                150

        },


        thigh: {

            id:
                "thigh",

            label:
                "Lingkar Paha",

            shortLabel:
                "Paha",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "pants",
                    "shorts"

                ],

            min:
                20,

            max:
                100

        },


        knee: {

            id:
                "knee",

            label:
                "Lingkar Lutut",

            shortLabel:
                "Lutut",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "pants"

                ],

            min:
                15,

            max:
                80

        },


        calf: {

            id:
                "calf",

            label:
                "Lingkar Betis",

            shortLabel:
                "Betis",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "pants"

                ],

            min:
                15,

            max:
                70

        },


        ankle: {

            id:
                "ankle",

            label:
                "Lingkar Mata Kaki",

            shortLabel:
                "Mata Kaki",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "pants"

                ],

            min:
                10,

            max:
                50

        },


        head: {

            id:
                "head",

            label:
                "Lingkar Kepala",

            shortLabel:
                "Kepala",

            type:
                "circumference",

            axis:
                "horizontal",

            requiredFor:
                [

                    "headwear"

                ],

            min:
                35,

            max:
                70

        }

    };


    /* ========================================================
       ALIASES
       ======================================================== */

    const ALIASES = {

        bust:
            [

                "bust",
                "bustCircumference",
                "lingkarBust",
                "lingkarDadaWanita"

            ],

        chest:
            [

                "chest",
                "chestCircumference",
                "lingkarDada",
                "lingkarDadaAnak",
                "lingkarDadaPria"

            ],

        waist:
            [

                "waist",
                "waistCircumference",
                "lingkarPinggang"

            ],

        hip:
            [

                "hip",
                "hipCircumference",
                "lingkarPinggul"

            ],

        shoulder:
            [

                "shoulder",
                "shoulderWidth",
                "lebarBahu"

            ],

        neck:
            [

                "neck",
                "neckCircumference",
                "lingkarLeher"

            ],

        armhole:
            [

                "armhole",
                "armholeCircumference",
                "lingkarKerung"

            ],

        bicep:
            [

                "bicep",
                "bicepCircumference",
                "lingkarBisep"

            ],

        upperArm:
            [

                "upperArm",
                "upperArmCircumference",
                "lingkarLenganAtas"

            ],

        wrist:
            [

                "wrist",
                "wristCircumference",
                "lingkarPergelangan"

            ],

        backLength:
            [

                "backLength",
                "backBodyLength",
                "panjangPunggung"

            ],

        frontLength:
            [

                "frontLength",
                "frontBodyLength",
                "panjangMuka"

            ],

        garmentLength:
            [

                "garmentLength",
                "bodyLength",
                "length",
                "panjangBaju"

            ],

        sleeveLength:
            [

                "sleeveLength",
                "armLength",
                "panjangLengan"

            ],

        sleeveOpening:
            [

                "sleeveOpening",
                "cuff",
                "bukaanLengan"

            ],

        crotchDepth:
            [

                "crotchDepth",
                "rise",
                "kedalamanPesak"

            ],

        inseam:
            [

                "inseam",
                "innerLeg",
                "panjangDalamKaki"

            ],

        outseam:
            [

                "outseam",
                "outerLeg",
                "panjangLuarKaki"

            ],

        thigh:
            [

                "thigh",
                "thighCircumference",
                "lingkarPaha"

            ],

        knee:
            [

                "knee",
                "kneeCircumference",
                "lingkarLutut"

            ],

        calf:
            [

                "calf",
                "calfCircumference",
                "lingkarBetis"

            ],

        ankle:
            [

                "ankle",
                "ankleCircumference",
                "lingkarMataKaki"

            ],

        head:
            [

                "head",
                "headCircumference",
                "lingkarKepala"

            ]

    };


    /* ========================================================
       NUMBER
       ======================================================== */

    function toNumber(
        value
    ) {

        const n =
            Number(
                value
            );


        return Number.isFinite(n)
            ? n
            : null;

    }


    /* ========================================================
       UNIT
       ======================================================== */

    function normalizeUnit(
        unit
    ) {

        const value =
            String(
                unit || "cm"
            )
            .toLowerCase()
            .trim();


        if (
            value === "inch"
        ) {

            return "in";

        }


        if (
            UNIT_FACTORS[
                value
            ]
        ) {

            return value;

        }


        return "cm";

    }


    function measurementToCm(
        value,
        unit = "cm"
    ) {

        const number =
            toNumber(
                value
            );


        if (
            number ===
            null
        ) {

            return null;

        }


        const normalized =
            normalizeUnit(
                unit
            );


        return (

            number *
            UNIT_FACTORS[
                normalized
            ]

        );

    }


    function cmToUnit(
        value,
        unit = "cm"
    ) {

        const number =
            toNumber(
                value
            );


        if (
            number ===
            null
        ) {

            return null;

        }


        const normalized =
            normalizeUnit(
                unit
            );


        return (

            number /
            UNIT_FACTORS[
                normalized
            ]

        );

    }


    function convertMeasurement(
        value,
        fromUnit,
        toUnit
    ) {

        const cm =
            measurementToCm(
                value,
                fromUnit
            );


        if (
            cm ===
            null
        ) {

            return null;

        }


        return cmToUnit(
            cm,
            toUnit
        );

    }


    /* ========================================================
       CATEGORY
       ======================================================== */

    function getCategoryDefinition(
        category
    ) {

        return (
            CATEGORY_DEFINITIONS[
                category
            ] ||
            null
        );

    }


    function getCategoryLabel(
        category
    ) {

        return (

            CATEGORY_DEFINITIONS[
                category
            ]?.label ||

            String(
                category || "Custom"
            )

        );

    }


    function getCategories() {

        return Object.values(
            CATEGORY_DEFINITIONS
        )
        .map(
            definition =>
                ({
                    ...definition
                })
        );

    }


    /* ========================================================
       MEASUREMENT
       ======================================================== */

    function getMeasurementDefinition(
        id
    ) {

        if (
            !id
        ) {

            return null;

        }


        if (
            MEASUREMENTS[
                id
            ]
        ) {

            return {
                ...MEASUREMENTS[
                    id
                ]
            };

        }


        const canonical =
            resolveCanonicalId(
                id
            );


        if (
            canonical &&
            MEASUREMENTS[
                canonical
            ]
        ) {

            return {
                ...MEASUREMENTS[
                    canonical
                ]
            };

        }


        return null;

    }


    function getMeasurementIds() {

        return Object.keys(
            MEASUREMENTS
        );

    }


    /* ========================================================
       ALIAS RESOLUTION
       ======================================================== */

    function normalizeKey(
        value
    ) {

        return String(
            value || ""
        )
        .trim()
        .toLowerCase()
        .replace(
            /[\s_-]+/g,
            ""
        );

    }


    function resolveCanonicalId(
        input
    ) {

        if (
            !input
        ) {

            return null;

        }


        const normalized =
            normalizeKey(
                input
            );


        for (
            const canonicalId
            of Object.keys(
                MEASUREMENTS
            )
        ) {

            if (
                normalizeKey(
                    canonicalId
                ) ===
                normalized
            ) {

                return canonicalId;

            }

        }


        for (
            const [
                canonicalId,
                aliases
            ]
            of Object.entries(
                ALIASES
            )
        ) {

            if (
                aliases.some(
                    alias =>
                        normalizeKey(
                            alias
                        ) ===
                        normalized
                )
            ) {

                return canonicalId;

            }

        }


        return null;

    }


    /* ========================================================
       NORMALIZE OBJECT
       ======================================================== */

    function normalizeMeasurementObject(
        input,
        options = {}
    ) {

        const source =
            input &&
            typeof input ===
                "object"

                ? input

                : {};


        const sourceUnit =
            normalizeUnit(
                options.unit ||
                "cm"
            );


        const output = {};

        const warnings = [];


        Object.entries(
            source
        )
        .forEach(
            (
                [
                    key,
                    value
                ]
            ) => {

                const canonical =
                    resolveCanonicalId(
                        key
                    );


                if (
                    !canonical
                ) {

                    warnings.push({

                        key,

                        message:
                            `Measurement "${key}" ` +
                            "tidak dikenal."

                    });


                    return;

                }


                const cm =
                    measurementToCm(
                        value,
                        sourceUnit
                    );


                if (
                    cm ===
                    null
                ) {

                    warnings.push({

                        key,

                        message:
                            `Measurement "${key}" ` +
                            "bukan angka."

                    });


                    return;

                }


                output[
                    canonical
                ] =
                    cm;

            }
        );


        return {

            measurements:
                output,

            unit:
                "cm",

            warnings

        };

    }


    /* ========================================================
       VALIDATE VALUE
       ======================================================== */

    function validateMeasurementValue(
        id,
        valueCm
    ) {

        const canonical =
            resolveCanonicalId(
                id
            );


        if (
            !canonical
        ) {

            return {

                valid:
                    false,

                message:
                    `Measurement "${id}" tidak dikenal.`

            };

        }


        const definition =
            MEASUREMENTS[
                canonical
            ];


        const value =
            toNumber(
                valueCm
            );


        if (
            value ===
            null
        ) {

            return {

                valid:
                    false,

                message:
                    `${canonical} harus berupa angka.`

            };

        }


        if (
            value <= 0
        ) {

            return {

                valid:
                    false,

                message:
                    `${definition.label} harus lebih besar dari 0.`

            };

        }


        if (
            definition.min !==
            undefined &&
            value <
            definition.min
        ) {

            return {

                valid:
                    false,

                message:

                    `${definition.label} terlalu kecil ` +
                    `(minimum ${definition.min} cm).`

            };

        }


        if (
            definition.max !==
            undefined &&
            value >
            definition.max
        ) {

            return {

                valid:
                    false,

                message:

                    `${definition.label} terlalu besar ` +
                    `(maksimum ${definition.max} cm).`

            };

        }


        return {

            valid:
                true,

            canonicalId:
                canonical,

            valueCm:
                value

        };

    }


    /* ========================================================
       VALIDATE OBJECT
       ======================================================== */

    function validateMeasurementObject(
        measurements
    ) {

        const errors = [];

        const warnings = [];


        Object.entries(
            measurements || {}
        )
        .forEach(
            (
                [
                    id,
                    value
                ]
            ) => {

                const result =
                    validateMeasurementValue(
                        id,
                        value
                    );


                if (
                    !result.valid
                ) {

                    errors.push(
                        result.message
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
       REQUIRED MEASUREMENTS
       ======================================================== */

    function getRequiredForGarment(
        garment
    ) {

        if (
            !garment
        ) {

            return [];

        }


        return [
            ...new Set(

                (
                    garment.requiredMeasurements ||
                    []
                )
                .map(
                    resolveCanonicalId
                )
                .filter(
                    Boolean
                )

            )
        ];

    }


    /* ========================================================
       ALIAS LOOKUP
       ======================================================== */

    function getAliases(
        canonicalId
    ) {

        const canonical =
            resolveCanonicalId(
                canonicalId
            );


        if (
            !canonical
        ) {

            return [];

        }


        return [

            canonical,

            ...(
                ALIASES[
                    canonical
                ] ||
                []
            )

        ];

    }


    /* ========================================================
       SYSTEM VALIDATION
       ======================================================== */

    function validateSchema() {

        const errors = [];

        const warnings = [];


        Object.entries(
            MEASUREMENTS
        )
        .forEach(
            (
                [
                    id,
                    definition
                ]
            ) => {

                if (
                    definition.id !==
                    id
                ) {

                    errors.push(

                        `Measurement definition "${id}" ` +
                        "memiliki id tidak konsisten."

                    );

                }


                if (
                    !definition.label
                ) {

                    errors.push(

                        `Measurement "${id}" ` +
                        "tidak memiliki label."

                    );

                }


                if (
                    !definition.type
                ) {

                    errors.push(

                        `Measurement "${id}" ` +
                        "tidak memiliki type."

                    );

                }


                if (
                    !definition.axis
                ) {

                    warnings.push(

                        `Measurement "${id}" ` +
                        "tidak memiliki axis."

                    );

                }

            }
        );


        Object.entries(
            ALIASES
        )
        .forEach(
            (
                [
                    canonical,
                    aliases
                ]
            ) => {

                if (
                    !MEASUREMENTS[
                        canonical
                    ]
                ) {

                    errors.push(

                        `Alias "${canonical}" ` +
                        "menunjuk canonical ID yang tidak ada."

                    );

                }


                if (
                    !Array.isArray(
                        aliases
                    )
                ) {

                    errors.push(

                        `Alias list "${canonical}" ` +
                        "harus berupa array."

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
       PUBLIC API
       ======================================================== */

    window.PatternMakerMeasurementSchema = {

        VERSION,

        UNIT_FACTORS,

        CATEGORY_DEFINITIONS,

        MEASUREMENTS,

        ALIASES,

        normalizeUnit,

        measurementToCm,

        cmToUnit,

        convertMeasurement,

        getCategoryDefinition,

        getCategoryLabel,

        getCategories,

        getMeasurementDefinition,

        getMeasurementIds,

        resolveCanonicalId,

        getAliases,

        normalizeMeasurementObject,

        validateMeasurementValue,

        validateMeasurementObject,

        getRequiredForGarment,

        validateSchema

    };


})();
