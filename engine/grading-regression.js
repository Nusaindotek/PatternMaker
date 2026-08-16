/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 64
 *
 * FILE:
 *   engine/grading-regression.js
 * ============================================================
 *
 * REGRESSION TEST UNTUK GRADING
 *
 * Tujuan:
 *
 *   Base Pattern
 *        ↓
 *   Strict Grading
 *        ↓
 *   Multi Size
 *        ↓
 *   Geometry Validation
 *        ↓
 *   Regression Report
 *
 * File ini TIDAK mengubah pattern.
 * File ini TIDAK mengubah grading rule.
 * File ini hanya menjalankan test.
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

            "grading-engine.js harus dimuat " +
            "sebelum grading-regression.js."

        );

    }


    if (
        !GradePointSchema
    ) {

        throw new Error(

            "grade-point-schema.js harus dimuat " +
            "sebelum grading-regression.js."

        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       TEST PROFILE
       ======================================================== */

    const DEFAULT_PROFILE = {

        category:
            "child",

        measurements: {

            chest:
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
                22

        }

    };


    /* ========================================================
       TEST SIZES
       ======================================================== */

    const DEFAULT_SIZES = [

        {

            id:
                "C06",

            label:
                "6"

        },

        {

            id:
                "C08",

            label:
                "8"

        },

        {

            id:
                "C10",

            label:
                "10"

        }

    ];


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
        fallback = null
    ) {

        const n =
            Number(
                value
            );


        return Number.isFinite(
            n
        )
            ? n
            : fallback;

    }


    /* ========================================================
       DISTANCE
       ======================================================== */

    function distance(
        a,
        b
    ) {

        if (
            !Array.isArray(a) ||
            !Array.isArray(b)
        ) {

            return null;

        }


        return Math.hypot(

            num(
                b[0],
                0
            )
            -
            num(
                a[0],
                0
            ),

            num(
                b[1],
                0
            )
            -
            num(
                a[1],
                0
            )

        );

    }


    /* ========================================================
       GEOMETRY SNAPSHOT
       ======================================================== */

    function snapshotPattern(
        pattern
    ) {

        return {

            engine:
                pattern?.engine ||
                null,

            pieceCount:
                Array.isArray(
                    pattern?.pieces
                )

                    ? pattern.pieces.length

                    : 0,

            pieces:

                (
                    pattern?.pieces ||
                    []
                )
                .map(
                    piece => ({

                        name:
                            piece.name ||

                            "UNKNOWN",

                        pointCount:

                            Array.isArray(
                                piece.points
                            )

                                ? piece.points.length

                                : 0,

                        bounds:
                            getPieceBounds(
                                piece
                            )

                    })

                )

        };

    }


    /* ========================================================
       PIECE BOUNDS
       ======================================================== */

    function getPieceBounds(
        piece
    ) {

        const points =
            piece?.points ||
            piece?.seamPoints ||
            [];


        if (
            points.length === 0
        ) {

            return {

                minX:
                    null,

                minY:
                    null,

                maxX:
                    null,

                maxY:
                    null,

                width:
                    null,

                height:
                    null

            };

        }


        const xs =
            points.map(
                point =>
                    num(
                        point[0],
                        0
                    )
            );


        const ys =
            points.map(
                point =>
                    num(
                        point[1],
                        0
                    )
            );


        const minX =
            Math.min(
                ...xs
            );


        const minY =
            Math.min(
                ...ys
            );


        const maxX =
            Math.max(
                ...xs
            );


        const maxY =
            Math.max(
                ...ys
            );


        return {

            minX,

            minY,

            maxX,

            maxY,

            width:
                maxX -
                minX,

            height:
                maxY -
                minY

        };

    }


    /* ========================================================
       MONOTONIC CHECK
       ======================================================== */

    function checkMonotonicSizeGrowth(
        graded
    ) {

        const errors =
            [];

        const variants =
            graded?.variants ||
            [];


        /*
         * This is a geometry sanity check,
         * not a claim that all garment dimensions
         * must monotonically increase in every direction.
         */

        for (
            let i = 1;
            i < variants.length;
            i++
        ) {

            const previous =
                variants[
                    i - 1
                ];


            const current =
                variants[
                    i
                ];


            const previousPieces =
                previous.pieces ||
                [];


            const currentPieces =
                current.pieces ||
                [];


            if (
                previousPieces.length !==
                currentPieces.length
            ) {

                errors.push(

                    `Variant ${i} dan ${i + 1} ` +
                    "memiliki jumlah pieces berbeda."

                );

                continue;

            }


            for (
                let j = 0;
                j < currentPieces.length;
                j++
            ) {

                const previousBounds =
                    getPieceBounds(
                        previousPieces[j]
                    );


                const currentBounds =
                    getPieceBounds(
                        currentPieces[j]
                    );


                if (
                    previousBounds.width ===
                    null ||
                    currentBounds.width ===
                    null
                ) {

                    continue;

                }


                if (
                    currentBounds.width <=
                    0
                ) {

                    errors.push(

                        `Variant ${i + 1}, ` +
                        `piece ${j + 1} memiliki width <= 0.`

                    );

                }


                if (
                    currentBounds.height <=
                    0
                ) {

                    errors.push(

                        `Variant ${i + 1}, ` +
                        `piece ${j + 1} memiliki height <= 0.`

                    );

                }

            }

        }


        return {

            valid:
                errors.length ===
                0,

            errors

        };

    }


    /* ========================================================
       POINT COUNT CHECK
       ======================================================== */

    function checkPointCounts(
        base,
        graded
    ) {

        const errors =
            [];


        const basePieces =
            base?.pieces ||
            [];


        const variants =
            graded?.variants ||
            [];


        variants.forEach(
            (
                variant,
                variantIndex
            ) => {

                if (
                    variant.pieces.length !==
                    basePieces.length
                ) {

                    errors.push(

                        `Variant ${variantIndex + 1} ` +
                        "jumlah pieces berbeda dari base pattern."

                    );


                    return;

                }


                variant.pieces.forEach(
                    (
                        piece,
                        pieceIndex
                    ) => {

                        const basePiece =
                            basePieces[
                                pieceIndex
                            ];


                        const baseCount =

                            Array.isArray(
                                basePiece.points
                            )

                                ? basePiece.points.length

                                : 0;


                        const gradeCount =

                            Array.isArray(
                                piece.points
                            )

                                ? piece.points.length

                                : 0;


                        if (
                            baseCount !==
                            gradeCount
                        ) {

                            errors.push(

                                `Variant ${variantIndex + 1}, ` +
                                `piece ${pieceIndex + 1}: ` +
                                `${gradeCount} points, ` +
                                `base ${baseCount}.`

                            );

                        }

                    }
                );

            }
        );


        return {

            valid:
                errors.length ===
                0,

            errors

        };

    }


    /* ========================================================
       POINT MOVEMENT CHECK
       ======================================================== */

    function checkPointMovement(
        graded
    ) {

        const errors =
            [];

        const warnings =
            [];


        const variants =
            graded?.variants ||
            [];


        if (
            variants.length <
            2
        ) {

            warnings.push(

                "Kurang dari 2 variant; " +
                "point movement belum dapat dibandingkan."

            );


            return {

                valid:
                    true,

                errors,

                warnings

            };

        }


        const baseVariant =
            variants[
                0
            ];


        const basePieces =
            baseVariant.pieces ||
            [];


        variants.forEach(
            (
                variant,
                variantIndex
            ) => {

                if (
                    variantIndex ===
                    0
                ) {

                    return;

                }


                variant.pieces.forEach(
                    (
                        piece,
                        pieceIndex
                    ) => {

                        const basePiece =
                            basePieces[
                                pieceIndex
                            ];


                        if (
                            !basePiece
                        ) {

                            return;

                        }


                        const basePoints =
                            basePiece.points ||
                            [];


                        const currentPoints =
                            piece.points ||
                            [];


                        const count =
                            Math.min(

                                basePoints.length,

                                currentPoints.length

                            );


                        let movementCount =
                            0;


                        for (
                            let i = 0;
                            i < count;
                            i++
                        ) {

                            const d =
                                distance(

                                    basePoints[i],

                                    currentPoints[i]

                                );


                            if (
                                d !== null &&
                                d >
                                1e-7
                            ) {

                                movementCount++;

                            }

                        }


                        if (
                            movementCount ===
                            0
                        ) {

                            warnings.push(

                                `Variant ${variantIndex + 1}, ` +
                                `piece "${piece.name}" ` +
                                "tidak memiliki point movement."

                            );

                        }

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
       STRICT REGRESSION
       ======================================================== */

    function runStrictRegression(
        pattern,
        options = {}
    ) {

        const sizes =
            options.sizes ||
            DEFAULT_SIZES;


        const category =
            options.category ||
            pattern?.metadata?.category ||
            DEFAULT_PROFILE.category;


        const result = {

            valid:
                true,

            version:
                VERSION,

            mode:
                "strict",

            category,

            sizes,

            checks: {},

            errors: [],

            warnings: [],

            snapshot:
                null,

            graded:
                null

        };


        /*
         * Check grade-point schema.
         */

        const gradePointValidation =
            GradePointSchema
                .validatePatternGradePoints(
                    pattern
                );


        result.checks.gradePoints =
            gradePointValidation;


        if (
            !gradePointValidation.valid
        ) {

            result.valid =
                false;


            result.errors.push(
                ...gradePointValidation.errors
            );


            return result;

        }


        result.warnings.push(
            ...gradePointValidation.warnings
        );


        /*
         * Strict grading.
         */

        try {

            result.graded =
                Grading.gradePattern(

                    pattern,

                    {

                        category,

                        mode:
                            Grading.MODES
                                .STRICT,

                        sizes:

                            clone(
                                sizes
                            ),

                        rules:
                            options.rules ||
                            {}

                    }

                );

        }
        catch (
            error
        ) {

            result.valid =
                false;


            result.errors.push(

                "Strict grading gagal: " +
                error.message

            );


            return result;

        }


        /*
         * Graded validation.
         */

        const gradedValidation =
            Grading
                .validateGradedPattern(
                    result.graded
                );


        result.checks.gradedPattern =
            gradedValidation;


        if (
            !gradedValidation.valid
        ) {

            result.valid =
                false;


            result.errors.push(
                ...gradedValidation.errors
            );

        }


        result.warnings.push(
            ...gradedValidation.warnings
        );


        /*
         * Point count.
         */

        const pointCounts =
            checkPointCounts(

                pattern,

                result.graded

            );


        result.checks.pointCounts =
            pointCounts;


        if (
            !pointCounts.valid
        ) {

            result.valid =
                false;


            result.errors.push(
                ...pointCounts.errors
            );

        }


        /*
         * Point movement.
         */

        const movement =
            checkPointMovement(
                result.graded
            );


        result.checks.pointMovement =
            movement;


        if (
            !movement.valid
        ) {

            result.valid =
                false;


            result.errors.push(
                ...movement.errors
            );

        }


        result.warnings.push(
            ...movement.warnings
        );


        /*
         * Geometry sanity.
         */

        const monotonic =
            checkMonotonicSizeGrowth(
                result.graded
            );


        result.checks.geometrySanity =
            monotonic;


        if (
            !monotonic.valid
        ) {

            result.valid =
                false;


            result.errors.push(
                ...monotonic.errors
            );

        }


        /*
         * Optional pattern validator.
         */

        if (
            PatternValidator
        ) {

            result.checks.basePattern =
                PatternValidator
                    .validatePattern(
                        pattern
                    );

            if (
                !result.checks.basePattern.valid
            ) {

                result.valid =
                    false;


                result.errors.push(

                    ...result.checks
                        .basePattern
                        .errors

                );

            }


            result.checks.gradedVariants =
                result.graded.variants
                    .map(
                        variant =>
                            PatternValidator
                                .validatePattern(
                                    variant
                                )
                    );


            result.checks.gradedVariants
                .forEach(
                    validation => {

                        if (
                            !validation.valid
                        ) {

                            result.valid =
                                false;


                            result.errors.push(
                                ...validation.errors
                            );

                        }

                    }
                );

        }


        result.snapshot = {

            base:
                snapshotPattern(
                    pattern
                ),

            variants:
                result.graded.variants
                    .map(
                        snapshotPattern
                    )

        };


        return result;

    }


    /* ========================================================
       BODICE REGRESSION
       ======================================================== */

    function runBodiceRegression(
        options = {}
    ) {

        const Bodice =
            window.PatternMakerBodice;


        if (
            !Bodice
        ) {

            return {

                valid:
                    false,

                errors: [

                    "PatternMakerBodice belum tersedia."

                ],

                warnings: [],

                checks: {}

            };

        }


        let pattern;


        try {

            pattern =
                Bodice.generate({

                    profile:

                        clone(
                            options.profile ||
                            DEFAULT_PROFILE
                        ),

                    garmentId:
                        "tshirt",

                    options: {

                        fit:
                            "regular",

                        notches:
                            true,

                        ease:
                            0

                    },

                    fabric: {

                        ease:
                            0

                    }

                });

        }
        catch (
            error
        ) {

            return {

                valid:
                    false,

                errors: [

                    "Bodice generation gagal: " +
                    error.message

                ],

                warnings: [],

                checks: {}

            };

        }


        return runStrictRegression(

            pattern,

            {

                ...options,

                category:
                    "child"

            }

        );

    }


    /* ========================================================
       RUN ALL
       ======================================================== */

    function runAll(
        options = {}
    ) {

        return {

            version:
                VERSION,

            bodice:
                runBodiceRegression(
                    options
                )

        };

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

            const message =

                result?.errors?.length

                    ? result.errors.join(
                        " | "
                    )

                    : "Grading regression failed.";

            throw new Error(
                message
            );

        }


        return true;

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        options = {}
    ) {

        const result =
            runAll(
                options
            );


        console.group(
            "PatternMaker Grading Regression"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            result
        );


        console.groupEnd();


        return result;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerGradingRegression = {

        VERSION,

        DEFAULT_PROFILE,

        DEFAULT_SIZES,

        runStrictRegression,

        runBodiceRegression,

        runAll,

        assert,

        debug

    };


})();
