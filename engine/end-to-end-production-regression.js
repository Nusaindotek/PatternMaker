/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 75
 *
 * FILE:
 *   engine/end-to-end-production-regression.js
 * ============================================================
 *
 * END-TO-END PRODUCTION REGRESSION
 *
 * Garment:
 *
 *   bodice
 *   skirt
 *   pants
 *   shorts
 *   dress
 *   shirt
 *
 * Pipeline:
 *
 *   GENERATE
 *      ↓
 *   BASE VALIDATION
 *      ↓
 *   GRADE POINT VALIDATION
 *      ↓
 *   STRICT GRADING
 *      ↓
 *   SEAM PRODUCTION
 *      ↓
 *   TRUE OFFSET
 *      ↓
 *   PRODUCTION VALIDATION
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

    const SeamProduction =
        window.PatternMakerSeamProduction;

    const ProductionValidator =
        window.PatternMakerProductionValidator;


    if (
        !Grading ||
        !GradePointSchema ||
        !SeamProduction ||
        !ProductionValidator
    ) {

        throw new Error(
            "KODE 75 membutuhkan grading, grade-point, seam-production, " +
            "dan production-validator."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       GARMENT DEFINITIONS
       ======================================================== */

    const GARMENTS = Object.freeze([

        "bodice",
        "skirt",
        "pants",
        "shorts",
        "dress",
        "shirt"

    ]);


    /* ========================================================
       TEST PROFILE
       ======================================================== */

    const PROFILE = {

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

    };


    /* ========================================================
       SIZE SET
       ======================================================== */

    const SIZES = [

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
       ENGINE LOOKUP
       ======================================================== */

    function getEngine(
        garment
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
            map[garment];


        if (
            !globalName
        ) {

            return null;

        }


        return window[
            globalName
        ] || null;

    }


    /* ========================================================
       ENGINE CONTEXT
       ======================================================== */

    function buildContext(
        garment
    ) {

        const context = {

            profile:
                clone(
                    PROFILE
                ),

            fabric: {

                ease:
                    0

            },

            options: {

                notches:
                    true,

                seam:
                    1,

                tolerance:
                    0

            }

        };


        switch (
            garment
        ) {

            case "bodice":

                context.garmentId =
                    "tshirt";

                break;


            case "skirt":

                context.garmentId =
                    "skirt";

                break;


            case "pants":

                context.garmentId =
                    "pants";

                break;


            case "shorts":

                context.garmentId =
                    "shorts";

                break;


            case "dress":

                context.garmentId =
                    "dress";

                break;


            case "shirt":

                context.garmentId =
                    "shirt";

                break;

        }


        return context;

    }


    /* ========================================================
       GENERATE
       ======================================================== */

    function generate(
        garment
    ) {

        const engine =
            getEngine(
                garment
            );


        if (
            !engine ||
            typeof engine.generate !==
            "function"
        ) {

            throw new Error(

                `Engine "${garment}" belum tersedia.`

            );

        }


        return engine.generate(

            buildContext(
                garment
            )

        );

    }


    /* ========================================================
       VALIDATE BASE
       ======================================================== */

    function validateBase(
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

                    "PatternValidator belum tersedia."

                ]

            };

        }


        return PatternValidator
            .validatePattern(
                pattern
            );

    }


    /* ========================================================
       VALIDATE GRADE POINT
       ======================================================== */

    function validateGradePoints(
        pattern
    ) {

        return GradePointSchema
            .validatePatternGradePoints(
                pattern
            );

    }


    /* ========================================================
       STRICT GRADING
       ======================================================== */

    function grade(
        pattern
    ) {

        return Grading.gradePattern(

            pattern,

            {

                category:
                    PROFILE.category,

                mode:
                    Grading.MODES
                        .STRICT,

                sizes:
                    clone(
                        SIZES
                    )

            }

        );

    }


    /* ========================================================
       GRADED VALIDATION
       ======================================================== */

    function validateGrading(
        graded
    ) {

        const errors =
            [];

        const warnings =
            [];


        if (
            !graded ||
            !Array.isArray(
                graded.variants
            )
        ) {

            errors.push(
                "Graded pattern tidak memiliki variants."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            graded.variants.length !==
            SIZES.length
        ) {

            errors.push(

                `Expected ${SIZES.length} variants, ` +
                `received ${graded.variants.length}.`

            );

        }


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


                        if (
                            points.length <
                            3
                        ) {

                            errors.push(

                                `Variant ${index + 1}, ` +
                                `${piece.name || "piece"} ` +
                                "geometry terlalu pendek."

                            );

                        }


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
       PRODUCTION CONVERSION
       ======================================================== */

    function createProductionPattern(
        variant
    ) {

        return SeamProduction
            .applySeamAllowance(

                variant,

                {

                    defaultSeam:
                        1,

                    miterLimit:
                        4,

                    curveTolerance:
                        0.05,

                    maxSegmentLength:
                        2

                }

            );

    }


    /* ========================================================
       VALIDATE PRODUCTION
       ======================================================== */

    function validateProduction(
        production
    ) {

        return ProductionValidator
            .validateForProduction(

                production,

                {

                    requireCutPoints:
                        true,

                    requireClosed:
                        true,

                    requireSeam:
                        true,

                    allowLegacyRadial:
                        false,

                    requireTrueOffset:
                        true,

                    checkSelfIntersection:
                        true,

                    checkDuplicatePoints:
                        true,

                    checkZeroLengthEdges:
                        true

                }

            );

    }


    /* ========================================================
       RUN ONE GARMENT
       ======================================================== */

    function runGarment(
        garment
    ) {

        const report = {

            garment,

            valid:
                true,

            generation:
                null,

            baseValidation:
                null,

            gradePoints:
                null,

            grading:
                null,

            production:
                null,

            productionValidation:
                null,

            errors: [],

            warnings: []

        };


        /* ----------------------------------------------------
           GENERATE
           ---------------------------------------------------- */

        let base;


        try {

            base =
                generate(
                    garment
                );

        }
        catch (
            error
        ) {

            report.valid =
                false;


            report.errors.push(

                `Generation: ${error.message}`

            );


            return report;

        }


        report.generation = {

            valid:
                Array.isArray(
                    base?.pieces
                ) &&
                base.pieces.length >
                0,

            pieceCount:
                base?.pieces?.length ||
                0

        };


        if (
            !report.generation.valid
        ) {

            report.valid =
                false;


            report.errors.push(
                "Engine tidak menghasilkan geometry."
            );


            return report;

        }


        /* ----------------------------------------------------
           BASE VALIDATION
           ---------------------------------------------------- */

        const baseValidation =
            validateBase(
                base
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


        report.warnings.push(

            ...(
                baseValidation.warnings ||
                []
            )

        );


        /* ----------------------------------------------------
           GRADE POINT
           ---------------------------------------------------- */

        const gradePoints =
            validateGradePoints(
                base
            );


        report.gradePoints =
            gradePoints;


        if (
            !gradePoints.valid
        ) {

            report.valid =
                false;


            report.errors.push(

                ...gradePoints.errors

            );


            return report;

        }


        report.warnings.push(

            ...(
                gradePoints.warnings ||
                []
            )

        );


        /* ----------------------------------------------------
           STRICT GRADING
           ---------------------------------------------------- */

        let graded;


        try {

            graded =
                grade(
                    base
                );

        }
        catch (
            error
        ) {

            report.valid =
                false;


            report.errors.push(

                `Strict grading: ${error.message}`

            );


            return report;

        }


        const gradingValidation =
            validateGrading(
                graded
            );


        report.grading =
            {

                valid:
                    gradingValidation.valid,

                variantCount:
                    graded.variants.length,

                errors:
                    gradingValidation.errors,

                warnings:
                    gradingValidation.warnings

            };


        if (
            !gradingValidation.valid
        ) {

            report.valid =
                false;


            report.errors.push(

                ...gradingValidation.errors

            );


            return report;

        }


        report.warnings.push(

            ...gradingValidation.warnings

        );


        /* ----------------------------------------------------
           PRODUCTION FOR EVERY GRADED VARIANT
           ---------------------------------------------------- */

        const productionVariants =
            [];


        graded.variants.forEach(
            (
                variant,
                index
            ) => {

                try {

                    const production =
                        createProductionPattern(
                            variant
                        );


                    const validation =
                        validateProduction(
                            production
                        );


                    productionVariants.push({

                        size:
                            variant.metadata
                                ?.grading
                                ?.sizeId ||
                            `SIZE-${index + 1}`,

                        valid:
                            validation.valid,

                        pieceCount:
                            production.pieces.length,

                        errors:
                            validation.errors,

                        warnings:
                            validation.warnings

                    });


                    if (
                        !validation.valid
                    ) {

                        report.valid =
                            false;


                        report.errors.push(

                            ...validation.errors.map(
                                error =>
                                    `Variant ${index + 1}: ${error}`
                            )

                        );

                    }


                    report.warnings.push(

                        ...validation.warnings.map(
                            warning =>
                                `Variant ${index + 1}: ${warning}`
                        )

                    );

                }
                catch (
                    error
                ) {

                    report.valid =
                        false;


                    report.errors.push(

                        `Variant ${index + 1} production: ` +
                        error.message

                    );


                    productionVariants.push({

                        size:
                            variant.metadata
                                ?.grading
                                ?.sizeId ||
                            `SIZE-${index + 1}`,

                        valid:
                            false,

                        pieceCount:
                            0,

                        errors: [

                            error.message

                        ],

                        warnings: []

                    });

                }

            }
        );


        report.production =
            {

                variantCount:
                    productionVariants.length,

                variants:
                    productionVariants

            };


        report.productionValidation =
            {

                valid:
                    productionVariants.every(
                        variant =>
                            variant.valid
                    ),

                passed:
                    productionVariants.filter(
                        variant =>
                            variant.valid
                    ).length,

                failed:
                    productionVariants.filter(
                        variant =>
                            !variant.valid
                    ).length

            };


        return report;

    }


    /* ========================================================
       RUN ALL
       ======================================================== */

    function runAll(
        options = {}
    ) {

        const garments =
            options.garments ||
            GARMENTS;


        const results =
            {};


        let passed =
            0;

        let failed =
            0;


        garments.forEach(
            garment => {

                const report =
                    runGarment(
                        garment
                    );


                results[
                    garment
                ] =
                    report;


                if (
                    report.valid
                ) {

                    passed++;

                }
                else {

                    failed++;

                }

            }
        );


        return {

            version:
                VERSION,

            valid:
                failed ===
                0,

            total:
                garments.length,

            passed,

            failed,

            results

        };

    }


    /* ========================================================
       ASSERT
       ======================================================== */

    function assert(
        report
    ) {

        if (
            !report ||
            report.valid !==
            true
        ) {

            const messages = [];

            Object.entries(
                report?.results ||
                {}
            )
            .forEach(
                (
                    [
                        garment,
                        result
                    ]
                ) => {

                    if (
                        !result.valid
                    ) {

                        messages.push(

                            `${garment}: ` +

                            result.errors.join(
                                " | "
                            )

                        );

                    }

                }
            );


            throw new Error(

                messages.join(
                    "\n"
                ) ||

                "End-to-end production regression failed."

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

        const report =
            runAll(
                options
            );


        console.group(
            "PatternMaker End-to-End Production Regression"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Total:",
            report.total
        );


        console.log(
            "Passed:",
            report.passed
        );


        console.log(
            "Failed:",
            report.failed
        );


        console.log(
            "Valid:",
            report.valid
        );


        console.log(
            report
        );


        console.groupEnd();


        return report;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerEndToEndProductionRegression = {

        VERSION,

        GARMENTS,

        PROFILE,

        SIZES,

        runGarment,

        runAll,

        assert,

        debug

    };


})();
