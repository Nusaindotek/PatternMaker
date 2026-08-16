```javascript
/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 80
 *
 * FILE:
 *   engine/end-to-end-marker-regression.js
 * ============================================================
 *
 * END-TO-END MARKER REGRESSION
 *
 * Pipeline:
 *
 * GENERATE
 *    ↓
 * BASE VALIDATION
 *    ↓
 * GRADE POINT
 *    ↓
 * STRICT GRADING
 *    ↓
 * TRUE SEAM
 *    ↓
 * PRODUCTION VALIDATION
 *    ↓
 * NESTING
 *    ↓
 * NESTING VALIDATION
 *    ↓
 * MARKER PASS
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

    const Nesting =
        window.PatternMakerNestingEngine;

    const NestingValidator =
        window.PatternMakerNestingValidator;


    if (
        !Grading ||
        !GradePointSchema ||
        !SeamProduction ||
        !ProductionValidator ||
        !Nesting ||
        !NestingValidator
    ) {

        throw new Error(

            "KODE 80 membutuhkan seluruh production + nesting pipeline."

        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       GARMENTS
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
       PROFILE
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
       NESTING OPTIONS
       ======================================================== */

    const NESTING_OPTIONS = {

        materialWidth:
            140,

        spacing:
            0.5,

        allowRotation90:
            true,

        respectGrainline:
            true,

        startMargin:
            0,

        endMargin:
            0

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
       GET ENGINE
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
       BUILD CONTEXT
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
       BASE VALIDATION
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

                warnings: []

            };

        }


        return PatternValidator
            .validatePattern(
                pattern
            );

    }


    /* ========================================================
       GRADE POINT VALIDATION
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
       STRICT GRADE
       ======================================================== */

    function gradePattern(
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

    function validateGradedPattern(
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
                "Graded result tidak memiliki variants."
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
                                "geometry invalid."

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
       CREATE PRODUCTION
       ======================================================== */

    function createProduction(
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
       PRODUCTION VALIDATION
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
       NEST
       ======================================================== */

    function nestProduction(
        production
    ) {

        return Nesting.nest(

            production,

            {

                ...NESTING_OPTIONS

            }

        );

    }


    /* ========================================================
       NESTING VALIDATION
       ======================================================== */

    function validateNesting(
        nested
    ) {

        return NestingValidator.validate(

            nested,

            {

                requireAllPlaced:
                    true,

                requireInsideMarker:
                    true,

                checkOverlap:
                    true,

                checkDuplicateIds:
                    true,

                respectGrainline:
                    true,

                allowRotation90:
                    true,

                minimumEfficiency:
                    0,

                maximumEfficiency:
                    100

            }

        );

    }


    /* ========================================================
       RUN GARMENT
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

            nesting:
                null,

            nestingValidation:
                null,

            marker:
                null,

            errors: [],

            warnings: []

        };


        /* ----------------------------------------------------
           GENERATION
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
                )

                &&

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

                "Engine tidak menghasilkan pieces."

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
                gradePattern(
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


        const gradedValidation =
            validateGradedPattern(
                graded
            );


        report.grading = {

            valid:
                gradedValidation.valid,

            variants:
                graded.variants.length,

            errors:
                gradedValidation.errors,

            warnings:
                gradedValidation.warnings

        };


        if (
            !gradedValidation.valid
        ) {

            report.valid =
                false;


            report.errors.push(

                ...gradedValidation.errors

            );


            return report;

        }


        /* ----------------------------------------------------
           PRODUCTION + NESTING PER SIZE
           ---------------------------------------------------- */

        const sizeResults =
            [];


        graded.variants.forEach(
            (
                variant,
                index
            ) => {

                const sizeId =
                    variant.metadata
                        ?.grading
                        ?.sizeId ||

                    `SIZE-${index + 1}`;


                let production;


                try {

                    production =
                        createProduction(
                            variant
                        );

                }
                catch (
                    error
                ) {

                    report.valid =
                        false;


                    report.errors.push(

                        `${sizeId} production: ` +
                        error.message

                    );


                    sizeResults.push({

                        sizeId,

                        valid:
                            false,

                        production:
                            false,

                        nesting:
                            false,

                        errors: [
                            error.message
                        ]

                    });


                    return;

                }


                const productionValidation =
                    validateProduction(
                        production
                    );


                if (
                    !productionValidation.valid
                ) {

                    report.valid =
                        false;


                    report.errors.push(

                        ...productionValidation.errors.map(
                            error =>
                                `${sizeId}: ${error}`
                        )

                    );

                }


                report.warnings.push(

                    ...productionValidation.warnings.map(
                        warning =>
                            `${sizeId}: ${warning}`
                    )

                );


                let nested;


                try {

                    nested =
                        nestProduction(
                            production
                        );

                }
                catch (
                    error
                ) {

                    report.valid =
                        false;


                    report.errors.push(

                        `${sizeId} nesting: ` +
                        error.message

                    );


                    sizeResults.push({

                        sizeId,

                        valid:
                            false,

                        production:
                            productionValidation.valid,

                        nesting:
                            false,

                        errors: [
                            error.message
                        ]

                    });


                    return;

                }


                const nestingValidation =
                    validateNesting(
                        nested
                    );


                if (
                    !nestingValidation.valid
                ) {

                    report.valid =
                        false;


                    report.errors.push(

                        ...nestingValidation.errors.map(
                            error =>
                                `${sizeId}: ${error}`
                        )

                    );

                }


                report.warnings.push(

                    ...nestingValidation.warnings.map(
                        warning =>
                            `${sizeId}: ${warning}`
                    )

                );


                sizeResults.push({

                    sizeId,

                    valid:

                        productionValidation.valid &&

                        nestingValidation.valid,

                    production:
                        productionValidation.valid,

                    nesting:
                        nestingValidation.valid,

                    productionSummary:
                        productionValidation.summary,

                    nestingSummary:
                        nestingValidation.summary,

                    errors: [

                        ...productionValidation.errors,

                        ...nestingValidation.errors

                    ]

                });

            }
        );


        report.nesting =
            {

                sizeCount:
                    sizeResults.length,

                passed:

                    sizeResults.filter(
                        result =>
                            result.nesting
                    ).length,

                failed:

                    sizeResults.filter(
                        result =>
                            !result.nesting
                    ).length

            };


        report.nestingValidation =
            {

                valid:

                    sizeResults.every(
                        result =>
                            result.nesting
                    ),

                results:
                    sizeResults

            };


        report.marker =
            {

                sizes:
                    sizeResults.map(
                        result => ({

                            sizeId:
                                result.sizeId,

                            valid:
                                result.valid,

                            production:
                                result.production,

                            nesting:
                                result.nesting,

                            efficiency:

                                result.nestingSummary
                                    ?.calculatedEfficiency
                                    ??

                                result.nestingSummary
                                    ?.reportedEfficiency
                                    ??

                                0,

                            markerLength:

                                result.nestingSummary
                                    ?.markerLength
                                    ??
                                0

                        })

                    )

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

            total:
                garments.length,

            passed,

            failed,

            valid:
                failed ===
                0,

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

            const messages =
                [];


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

                "End-to-end marker regression failed."

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
            "PatternMaker End-to-End Marker Regression"
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

    window.PatternMakerEndToEndMarkerRegression = {

        VERSION,

        GARMENTS,

        PROFILE,

        SIZES,

        NESTING_OPTIONS,

        runGarment,

        runAll,

        assert,

        debug

    };


})();
```
