```javascript
/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 85
 *
 * FILE:
 *   engine/universal-garment-audit.js
 * ============================================================
 *
 * UNIVERSAL GARMENT AUDIT
 *
 * Satu audit untuk seluruh pipeline:
 *
 *   GENERATE
 *      ↓
 *   BASE VALIDATION
 *      ↓
 *   GRADE POINT
 *      ↓
 *   STRICT GRADING
 *      ↓
 *   PRODUCTION GEOMETRY
 *      ↓
 *   PRODUCTION VALIDATION
 *      ↓
 *   NESTING
 *      ↓
 *   NESTING VALIDATION
 *      ↓
 *   OUTPUT AUDIT
 *      ↓
 *   FINAL RESULT
 *
 * ============================================================
 *
 * DOES NOT:
 *
 * - modify pattern
 * - modify grading
 * - modify seam
 * - modify nesting
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

    const OutputAudit =
        window.PatternMakerOutputAudit;


    if (
        !Grading ||
        !GradePointSchema ||
        !SeamProduction ||
        !ProductionValidator ||
        !Nesting ||
        !NestingValidator ||
        !OutputAudit
    ) {

        throw new Error(
            "universal-garment-audit.js membutuhkan " +
            "seluruh pipeline PatternMaker."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       GARMENT MAP
       ======================================================== */

    const ENGINE_MAP = Object.freeze({

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

    });


    /* ========================================================
       DEFAULT SIZES
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
       DEFAULT PROFILE
       ======================================================== */

    const DEFAULT_PROFILE = {

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
       DEFAULT OPTIONS
       ======================================================== */

    const DEFAULT_OPTIONS = {

        seamAllowance:
            1,

        miterLimit:
            4,

        curveTolerance:
            0.05,

        maxSegmentLength:
            2,

        materialWidth:
            140,

        spacing:
            0.5,

        allowRotation90:
            true,

        respectGrainline:
            true,

        requireTrueOffset:
            true,

        requireAllPlaced:
            true,

        requireProductionPass:
            true,

        requireNestingPass:
            true,

        auditOutputs:
            true,

        sourceUnit:
            "cm"

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
       MERGE OPTIONS
       ======================================================== */

    function normalizeOptions(
        options = {}
    ) {

        return {

            ...DEFAULT_OPTIONS,

            ...options,

            grading:

                {
                    ...(options.grading || {})
                },

            nesting:

                {
                    ...(options.nesting || {})
                }

        };

    }


    /* ========================================================
       ENGINE LOOKUP
       ======================================================== */

    function getEngine(
        garment
    ) {

        const globalName =
            ENGINE_MAP[
                garment
            ];


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
       CONTEXT
       ======================================================== */

    function buildContext(
        garment,
        profile,
        options
    ) {

        const context = {

            profile:
                clone(
                    profile
                ),

            fabric: {

                ease:
                    num(
                        options.ease,
                        0
                    )

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
       BASE GENERATION
       ======================================================== */

    function generatePattern(
        garment,
        profile,
        options
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

                garment,

                profile,

                options

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
       GRADED VALIDATION
       ======================================================== */

    function validateGraded(
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

                        `Graded variant ${index + 1} ` +
                        "tidak memiliki pieces."

                    );


                    return;

                }


                variant.pieces.forEach(
                    piece => {

                        const points =
                            piece.points ||
                            piece.seamPoints ||
                            [];


                        if (
                            !Array.isArray(points) ||
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
       STRICT GRADING
       ======================================================== */

    function grade(
        pattern,
        category,
        options
    ) {

        return Grading.gradePattern(

            pattern,

            {

                category,

                mode:
                    Grading.MODES
                        .STRICT,

                sizes:
                    clone(
                        options.sizes ||
                        DEFAULT_SIZES
                    ),

                rules:
                    options.grading?.rules ||
                    {}

            }

        );

    }


    /* ========================================================
       PRODUCTION
       ======================================================== */

    function createProduction(
        variant,
        options
    ) {

        return SeamProduction
            .applySeamAllowance(

                variant,

                {

                    defaultSeam:
                        num(
                            options.seamAllowance,
                            1
                        ),

                    miterLimit:
                        num(
                            options.miterLimit,
                            4
                        ),

                    curveTolerance:
                        num(
                            options.curveTolerance,
                            0.05
                        ),

                    maxSegmentLength:
                        num(
                            options.maxSegmentLength,
                            2
                        )

                }

            );

    }


    /* ========================================================
       PRODUCTION VALIDATION
       ======================================================== */

    function validateProduction(
        pattern,
        options
    ) {

        return ProductionValidator
            .validateForProduction(

                pattern,

                {

                    requireCutPoints:
                        true,

                    requireClosed:
                        true,

                    requireSeam:
                        options.requireProductionPass,

                    allowLegacyRadial:
                        false,

                    requireTrueOffset:
                        options.requireTrueOffset,

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
       NESTING
       ======================================================== */

    function createNesting(
        production,
        options
    ) {

        return Nesting.nest(

            production,

            {

                materialWidth:
                    num(
                        options.materialWidth,
                        140
                    ),

                spacing:
                    num(
                        options.spacing,
                        0.5
                    ),

                allowRotation90:
                    options.allowRotation90,

                respectGrainline:
                    options.respectGrainline,

                startMargin:
                    0,

                endMargin:
                    0

            }

        );

    }


    /* ========================================================
       NESTING VALIDATION
       ======================================================== */

    function validateNesting(
        nesting,
        options
    ) {

        return NestingValidator
            .validate(

                nesting,

                {

                    requireAllPlaced:
                        options.requireAllPlaced,

                    requireInsideMarker:
                        true,

                    checkOverlap:
                        true,

                    checkDuplicateIds:
                        true,

                    respectGrainline:
                        options.respectGrainline,

                    allowRotation90:
                        options.allowRotation90,

                    minimumEfficiency:
                        0,

                    maximumEfficiency:
                        100

                }

            );

    }


    /* ========================================================
       OUTPUT AUDIT
       ======================================================== */

    function auditOutputs(
        source,
        options
    ) {

        if (
            !options.auditOutputs
        ) {

            return {

                valid:
                    true,

                skipped:
                    true,

                errors: [],

                warnings: []

            };

        }


        return OutputAudit.audit(

            source,

            {

                sourceType:
                    "production",

                expectedUnit:
                    options.sourceUnit,

                requireSamePieceCount:
                    true,

                requireSamePieceNames:
                    true,

                requireSamePointCounts:
                    true,

                checkFiniteGeometry:
                    true,

                checkBounds:
                    true,

                checkUnit:
                    true

            }

        );

    }


    /* ========================================================
       SIZE PIPELINE
       ======================================================== */

    function runSize(
        variant,
        options
    ) {

        const sizeId =
            variant.metadata
                ?.grading
                ?.sizeId ||
            "UNKNOWN";


        const report = {

            sizeId,

            valid:
                true,

            production:
                null,

            productionValidation:
                null,

            nesting:
                null,

            nestingValidation:
                null,

            outputAudit:
                null,

            errors: [],

            warnings: []

        };


        /* ----------------------------------------------------
           PRODUCTION
           ---------------------------------------------------- */

        let production;


        try {

            production =
                createProduction(

                    variant,

                    options

                );

        }
        catch (
            error
        ) {

            report.valid =
                false;


            report.errors.push(

                `Production: ${error.message}`

            );


            return report;

        }


        const productionValidation =
            validateProduction(

                production,

                options

            );


        report.productionValidation =
            productionValidation;


        if (
            !productionValidation.valid
        ) {

            report.valid =
                false;


            report.errors.push(

                ...productionValidation.errors

            );

        }


        report.warnings.push(

            ...productionValidation.warnings

        );


        report.production = {

            pieceCount:
                production.pieces.length,

            seamStrategy:
                production.metadata
                    ?.seamStrategy ||
                null,

            seamAllowance:

                production.metadata
                    ?.seamAllowanceCm

                ??

                options.seamAllowance

        };


        /*
         * Stop before nesting if production is invalid.
         */

        if (
            !productionValidation.valid
        ) {

            return report;

        }


        /* ----------------------------------------------------
           NESTING
           ---------------------------------------------------- */

        let nesting;


        try {

            nesting =
                createNesting(

                    production,

                    options

                );

        }
        catch (
            error
        ) {

            report.valid =
                false;


            report.errors.push(

                `Nesting: ${error.message}`

            );


            return report;

        }


        const nestingValidation =
            validateNesting(

                nesting,

                options

            );


        report.nesting =
            nesting;


        report.nestingValidation =
            nestingValidation;


        if (
            !nestingValidation.valid
        ) {

            report.valid =
                false;


            report.errors.push(

                ...nestingValidation.errors

            );

        }


        report.warnings.push(

            ...nestingValidation.warnings

        );


        /*
         * Output audit is performed on the production
         * source. Marker output has its own audit path.
         */

        report.outputAudit =
            auditOutputs(

                production,

                options

            );


        if (
            !report.outputAudit.valid
        ) {

            report.valid =
                false;


            report.errors.push(

                ...report.outputAudit.errors

            );

        }


        report.warnings.push(

            ...report.outputAudit.warnings

        );


        return report;

    }


    /* ========================================================
       RUN GARMENT
       ======================================================== */

    function runGarment(
        garment,
        options = {}
    ) {

        const config =
            normalizeOptions(
                options
            );


        const profile =
            clone(

                config.profile ||

                DEFAULT_PROFILE

            );


        const category =
            profile.category ||
            "custom";


        const report = {

            version:
                VERSION,

            garment,

            category,

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

            sizes:
                [],

            errors: [],

            warnings: []

        };


        /* ----------------------------------------------------
           GENERATION
           ---------------------------------------------------- */

        let base;


        try {

            base =
                generatePattern(

                    garment,

                    profile,

                    config

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
                "Pattern generation gagal."
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
            ...baseValidation.warnings
        );


        /* ----------------------------------------------------
           GRADE POINT
           ---------------------------------------------------- */

        const gradePointValidation =
            validateGradePoints(
                base
            );


        report.gradePoints =
            gradePointValidation;


        if (
            !gradePointValidation.valid
        ) {

            report.valid =
                false;


            report.errors.push(

                ...gradePointValidation.errors

            );


            return report;

        }


        report.warnings.push(
            ...gradePointValidation.warnings
        );


        /* ----------------------------------------------------
           STRICT GRADING
           ---------------------------------------------------- */

        let graded;


        try {

            graded =
                grade(

                    base,

                    category,

                    config

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
            validateGraded(
                graded
            );


        report.grading = {

            valid:
                gradedValidation.valid,

            variantCount:
                graded?.variants?.length ||
                0,

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


        report.warnings.push(
            ...gradedValidation.warnings
        );


        /* ----------------------------------------------------
           SIZE LOOP
           ---------------------------------------------------- */

        graded.variants.forEach(
            variant => {

                const sizeReport =
                    runSize(

                        variant,

                        config

                    );


                report.sizes.push(
                    sizeReport
                );


                if (
                    !sizeReport.valid
                ) {

                    report.valid =
                        false;


                    report.errors.push(

                        ...sizeReport.errors.map(
                            error =>

                                `${
                                    sizeReport.sizeId
                                }: ${error}`

                        )

                    );

                }


                report.warnings.push(

                    ...sizeReport.warnings.map(
                        warning =>

                            `${
                                sizeReport.sizeId
                            }: ${warning}`

                    )

                );

            }
        );


        return report;

    }


    /* ========================================================
       RUN MATRIX
       ======================================================== */

    function runMatrix(
        options = {}
    ) {

        const config =
            normalizeOptions(
                options
            );


        const garments =
            config.garments ||

            [

                "bodice",
                "skirt",
                "pants",
                "shorts",
                "dress",
                "shirt"

            ];


        const results =
            {};


        let passed =
            0;

        let failed =
            0;


        garments.forEach(
            garment => {

                const result =
                    runGarment(

                        garment,

                        config

                    );


                results[
                    garment
                ] =
                    result;


                if (
                    result.valid
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

            const errors =
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

                        errors.push(

                            `${garment}: ` +

                            result.errors.join(
                                " | "
                            )

                        );

                    }

                }
            );


            throw new Error(

                errors.join(
                    "\n"
                ) ||

                "Universal garment audit failed."

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
            runMatrix(
                options
            );


        console.group(
            "PatternMaker Universal Garment Audit"
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
       PUBLIC API
       ======================================================== */

    window.PatternMakerUniversalGarmentAudit = {

        VERSION,

        ENGINE_MAP,

        DEFAULT_SIZES,

        DEFAULT_PROFILE,

        DEFAULT_OPTIONS,

        generatePattern,

        validateBase,

        validateGradePoints,

        validateGraded,

        createProduction,

        validateProduction,

        createNesting,

        validateNesting,

        auditOutputs,

        runSize,

        runGarment,

        runMatrix,

        assert,

        debug

    };


})();
```
