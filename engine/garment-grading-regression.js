/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 69
 *
 * FILE:
 *   engine/garment-grading-regression.js
 * ============================================================
 *
 * REGRESSION MATRIX:
 *
 *   BODICE
 *   SKIRT
 *   PANTS
 *   SHORTS
 *   DRESS
 *   SHIRT
 *
 * Pipeline:
 *
 *   Generate
 *      ↓
 *   Grade Point Validation
 *      ↓
 *   Strict Grading
 *      ↓
 *   Variant Validation
 *      ↓
 *   Geometry Validation
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    const Grading =
        window.PatternMakerGradingEngine;

    const GradePointSchema =
        window.PatternMakerGradePointSchema;

    const PatternValidator =
        window.PatternMakerPatternValidator;


    if (
        !Grading
    ) {

        throw new Error(
            "grading-engine.js harus dimuat sebelum garment-grading-regression.js."
        );

    }


    if (
        !GradePointSchema
    ) {

        throw new Error(
            "grade-point-schema.js harus dimuat sebelum garment-grading-regression.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       TEST SIZE SET
       ======================================================== */

    const DEFAULT_SIZES = [

        {
            id:
                "S1",

            label:
                "SIZE 1"
        },

        {
            id:
                "S2",

            label:
                "SIZE 2"
        },

        {
            id:
                "S3",

            label:
                "SIZE 3"
        }

    ];


    /* ========================================================
       BASE PROFILES
       ======================================================== */

    const PROFILES = {

        child: {

            category:
                "child",

            measurements: {

                chest:
                    62,

                bust:
                    62,

                waist:
                    56,

                hip:
                    64,

                shoulder:
                    28,

                neck:
                    28,

                garmentLength:
                    40,

                sleeveLength:
                    35,

                upperArm:
                    22,

                crotchDepth:
                    20,

                inseam:
                    45,

                outseam:
                    55,

                ankle:
                    24,

                thigh:
                    36

            }

        },


        women: {

            category:
                "women",

            measurements: {

                chest:
                    88,

                bust:
                    88,

                waist:
                    68,

                hip:
                    94,

                shoulder:
                    37,

                neck:
                    38,

                garmentLength:
                    60,

                sleeveLength:
                    59,

                upperArm:
                    28,

                crotchDepth:
                    27,

                inseam:
                    74,

                outseam:
                    100,

                ankle:
                    34,

                thigh:
                    54

            }

        },


        men: {

            category:
                "men",

            measurements: {

                chest:
                    94,

                bust:
                    94,

                waist:
                    82,

                hip:
                    96,

                shoulder:
                    44,

                neck:
                    40,

                garmentLength:
                    70,

                sleeveLength:
                    61,

                upperArm:
                    32,

                crotchDepth:
                    28,

                inseam:
                    78,

                outseam:
                    104,

                ankle:
                    38,

                thigh:
                    60

            }

        }

    };


    /* ========================================================
       CLONE
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


    /* ========================================================
       NUMBER
       ======================================================== */

    function num(
        value,
        fallback = 0
    ) {

        const n =
            Number(value);


        return Number.isFinite(n)
            ? n
            : fallback;

    }


    /* ========================================================
       ENGINE LOOKUP
       ======================================================== */

    function getEngine(
        id
    ) {

        const map = {

            bodice:
                "PatternMakerBodice",

            skirt:
                "PatternMakerSkirt",

            pants:
                "PatternMakerPants",

            dress:
                "PatternMakerDress",

            shirt:
                "PatternMakerShirt"

        };


        const globalName =
            map[id];


        return globalName
            ? window[
                globalName
            ]
            : null;

    }


    /* ========================================================
       GARMENT CONTEXT
       ======================================================== */

    function buildContext(
        garment,
        profile
    ) {

        const base = {

            profile:
                clone(profile),

            fabric: {

                ease:
                    0

            },

            options: {

                notches:
                    true,

                seam:
                    0,

                tolerance:
                    0

            }

        };


        switch (
            garment
        ) {

            case "pants":

                return {

                    ...base,

                    garmentId:
                        "pants"

                };


            case "shorts":

                return {

                    ...base,

                    garmentId:
                        "shorts"

                };


            case "dress":

                return {

                    ...base,

                    garmentId:
                        "dress"

                };


            case "shirt":

                return {

                    ...base,

                    garmentId:
                        "shirt"

                };


            case "skirt":

                return {

                    ...base,

                    garmentId:
                        "skirt"

                };


            case "bodice":
            case "tshirt":

                return {

                    ...base,

                    garmentId:
                        "tshirt"

                };


            default:

                return base;

        }

    }


    /* ========================================================
       BASIC RESULT VALIDATION
       ======================================================== */

    function validateGeneratedPattern(
        pattern
    ) {

        const errors = [];
        const warnings = [];


        if (
            !pattern
        ) {

            errors.push(
                "Engine tidak menghasilkan pattern."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            !Array.isArray(
                pattern.pieces
            )
        ) {

            errors.push(
                "Pattern tidak memiliki pieces array."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            pattern.pieces.length ===
            0
        ) {

            errors.push(
                "Pattern memiliki 0 pieces."
            );

        }


        pattern.pieces.forEach(
            (
                piece,
                index
            ) => {

                if (
                    !Array.isArray(
                        piece.points
                    ) ||
                    piece.points.length <
                    3
                ) {

                    errors.push(

                        `Piece ${index + 1} ` +
                        "geometry tidak valid."

                    );

                }

            }
        );


        return {

            valid:
                errors.length ===
                0,

            errors,

            warnings

        };

    }


    /* ========================================================
       GRADE POINT VALIDATION
       ======================================================== */

    function validateGradePoints(
        pattern
    ) {

        const result =
            GradePointSchema
                .validatePatternGradePoints(
                    pattern
                );


        return result;

    }


    /* ========================================================
       STRICT GRADING
       ======================================================== */

    function runStrictGrading(
        pattern,
        category
    ) {

        try {

            const graded =
                Grading.gradePattern(

                    pattern,

                    {

                        category,

                        mode:
                            Grading.MODES
                                .STRICT,

                        sizes:
                            clone(
                                DEFAULT_SIZES
                            )

                    }

                );


            return {

                valid:
                    true,

                result:
                    graded,

                errors: [],

                warnings:
                    graded.warnings ||
                    []

            };

        }
        catch (
            error
        ) {

            return {

                valid:
                    false,

                result:
                    null,

                errors: [
                    error.message
                ],

                warnings: []

            };

        }

    }


    /* ========================================================
       GRADED RESULT VALIDATION
       ======================================================== */

    function validateGradedResult(
        graded
    ) {

        if (
            !graded
        ) {

            return {

                valid:
                    false,

                errors: [
                    "Graded result kosong."
                ],

                warnings: []

            };

        }


        if (
            !Array.isArray(
                graded.variants
            )
        ) {

            return {

                valid:
                    false,

                errors: [
                    "Graded result tidak memiliki variants."
                ],

                warnings: []

            };

        }


        if (
            graded.variants.length !==
            DEFAULT_SIZES.length
        ) {

            return {

                valid:
                    false,

                errors: [

                    `Expected ${DEFAULT_SIZES.length} ` +
                    `variants, received ${graded.variants.length}.`

                ],

                warnings: []

            };

        }


        const errors = [];
        const warnings = [];


        graded.variants.forEach(
            (
                variant,
                index
            ) => {

                if (
                    !Array.isArray(
                        variant.pieces
                    )
                ) {

                    errors.push(

                        `Variant ${index + 1} ` +
                        "tidak memiliki pieces."

                    );

                    return;

                }


                variant.pieces.forEach(
                    piece => {

                        const points =
                            piece.points ||
                            [];


                        points.forEach(
                            (
                                point,
                                pointIndex
                            ) => {

                                if (
                                    !Array.isArray(
                                        point
                                    ) ||
                                    !Number.isFinite(
                                        Number(
                                            point[0]
                                        )
                                    ) ||
                                    !Number.isFinite(
                                        Number(
                                            point[1]
                                        )
                                    )
                                ) {

                                    errors.push(

                                        `Variant ${index + 1}, ` +
                                        `${piece.name || "piece"}, ` +
                                        `point ${pointIndex + 1} invalid.`

                                    );

                                }

                            }
                        );

                    }
                );

            }
        );


        return {

            valid:
                errors.length ===
                0,

            errors,

            warnings

        };

    }


    /* ========================================================
       OPTIONAL BASE VALIDATOR
       ======================================================== */

    function validateWithPatternValidator(
        pattern
    ) {

        if (
            !PatternValidator
        ) {

            return {

                valid:
                    true,

                errors: [],

                warnings: [

                    "Pattern validator belum tersedia."

                ]

            };

        }


        return PatternValidator
            .validatePattern(
                pattern
            );

    }


    /* ========================================================
       RUN ONE GARMENT
       ======================================================== */

    function runGarment(
        garment,
        category
    ) {

        const report = {

            garment,

            category,

            valid:
                true,

            generation:
                null,

            gradePoints:
                null,

            strictGrading:
                null,

            baseValidation:
                null,

            gradedValidation:
                null,

            errors: [],

            warnings: []

        };


        const engine =
            getEngine(
                garment
            );


        if (
            !engine
        ) {

            report.valid =
                false;


            report.errors.push(

                `Engine "${garment}" belum tersedia.`

            );


            return report;

        }


        const profile =
            PROFILES[
                category
            ];


        if (
            !profile
        ) {

            report.valid =
                false;


            report.errors.push(

                `Profile category "${category}" belum tersedia.`

            );


            return report;

        }


        /* ====================================================
           GENERATION
           ==================================================== */

        let pattern;


        try {

            pattern =
                engine.generate(

                    buildContext(
                        garment,
                        profile
                    )

                );

        }
        catch (
            error
        ) {

            report.valid =
                false;


            report.errors.push(

                `Generation gagal: ${error.message}`

            );


            return report;

        }


        const generatedValidation =
            validateGeneratedPattern(
                pattern
            );


        report.generation =
            generatedValidation;


        if (
            !generatedValidation.valid
        ) {

            report.valid =
                false;


            report.errors.push(
                ...generatedValidation.errors
            );

            return report;

        }


        /* ====================================================
           GRADE POINTS
           ==================================================== */

        const gradePointResult =
            validateGradePoints(
                pattern
            );


        report.gradePoints =
            gradePointResult;


        if (
            !gradePointResult.valid
        ) {

            report.valid =
                false;


            report.errors.push(
                ...gradePointResult.errors
            );


            return report;

        }


        report.warnings.push(
            ...gradePointResult.warnings
        );


        /* ====================================================
           BASE PATTERN VALIDATION
           ==================================================== */

        const baseValidation =
            validateWithPatternValidator(
                pattern
            );


        report.baseValidation =
            baseValidation;


        if (
            !baseValidation.valid
        ) {

            report.valid =
                false;


            report.errors.push(
                ...baseValidation.errors
            );

        }


        /* ====================================================
           STRICT GRADING
           ==================================================== */

        const grading =
            runStrictGrading(

                pattern,

                category

            );


        report.strictGrading =
            {

                valid:
                    grading.valid,

                errors:
                    grading.errors,

                warnings:
                    grading.warnings,

                variantCount:

                    grading.result?.variants
                        ?.length ||
                    0

            };


        if (
            !grading.valid
        ) {

            report.valid =
                false;


            report.errors.push(
                ...grading.errors
            );


            return report;

        }


        report.warnings.push(
            ...grading.warnings
        );


        /* ====================================================
           GRADED VALIDATION
           ==================================================== */

        const gradedValidation =
            validateGradedResult(
                grading.result
            );


        report.gradedValidation =
            gradedValidation;


        if (
            !gradedValidation.valid
        ) {

            report.valid =
                false;


            report.errors.push(
                ...gradedValidation.errors
            );

        }


        report.warnings.push(
            ...gradedValidation.warnings
        );


        return report;

    }


    /* ========================================================
       RUN MATRIX
       ======================================================== */

    function runMatrix(
        options = {}
    ) {

        const categories =
            options.categories ||

            Object.keys(
                PROFILES
            );


        const garments = [

            "bodice",
            "skirt",
            "pants",
            "shorts",
            "dress",
            "shirt"

        ];


        const matrix = {

            version:
                VERSION,

            valid:
                true,

            total:
                0,

            passed:
                0,

            failed:
                0,

            results: {},

            errors: [],

            warnings: []

        };


        garments.forEach(
            garment => {

                matrix.results[
                    garment
                ] = {};


                categories.forEach(
                    category => {

                        matrix.total++;


                        const result =
                            runGarment(

                                garment,

                                category

                            );


                        matrix.results[
                            garment
                        ][
                            category
                        ] =
                            result;


                        if (
                            result.valid
                        ) {

                            matrix.passed++;

                        }
                        else {

                            matrix.failed++;

                            matrix.valid =
                                false;


                            matrix.errors.push({

                                garment,

                                category,

                                errors:
                                    result.errors

                            });

                        }


                        matrix.warnings.push(

                            ...(
                                result.warnings ||
                                []
                            )

                        );

                    }
                );

            }
        );


        return matrix;

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        options = {}
    ) {

        const result =
            runMatrix(
                options
            );


        console.group(
            "PatternMaker Garment Grading Regression"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Total:",
            result.total
        );


        console.log(
            "Passed:",
            result.passed
        );


        console.log(
            "Failed:",
            result.failed
        );


        console.log(
            "Valid:",
            result.valid
        );


        console.log(
            result
        );


        console.groupEnd();


        return result;

    }


    /* ========================================================
       ASSERT
       ======================================================== */

    function assert(
        result
    ) {

        if (
            !result ||
            result.valid !==
            true
        ) {

            const messages =
                result?.errors
                    ?.map(
                        item =>
                            `${item.garment}/${item.category}: ` +
                            item.errors.join(" | ")
                    )
                    .join("\n")

                ||

                "Garment grading regression failed.";


            throw new Error(
                messages
            );

        }


        return true;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerGarmentGradingRegression = {

        VERSION,

        DEFAULT_SIZES,

        PROFILES,

        runGarment,

        runMatrix,

        assert,

        debug

    };


})();
