/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 86
 *
 * FILE:
 *   engine/universal-audit-runner.js
 * ============================================================
 *
 * UNIVERSAL SYSTEM AUDIT RUNNER
 *
 * Single command:
 *
 *   PatternMakerUniversalAuditRunner.run()
 *
 * ============================================================
 *
 * AUDIT MATRIX:
 *
 *   Garment
 *      ↓
 *   Base Pattern
 *      ↓
 *   Grade Points
 *      ↓
 *   Strict Grading
 *      ↓
 *   Production
 *      ↓
 *   Nesting
 *      ↓
 *   Output
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const GarmentAudit =
        window.PatternMakerUniversalGarmentAudit;


    if (
        !GarmentAudit
    ) {

        throw new Error(
            "universal-garment-audit.js harus dimuat sebelum universal-audit-runner.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       DEFAULT CONFIG
       ======================================================== */

    const DEFAULT_CONFIG = {

        garments: [

            "bodice",
            "skirt",
            "pants",
            "shorts",
            "dress",
            "shirt"

        ],

        profile:
            GarmentAudit.DEFAULT_PROFILE,

        sizes:
            GarmentAudit.DEFAULT_SIZES,

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
            "cm",

        stopOnFirstFailure:
            false

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
       CONFIG
       ======================================================== */

    function normalizeConfig(
        options = {}
    ) {

        return {

            ...clone(
                DEFAULT_CONFIG
            ),

            ...options,

            profile:
                clone(
                    options.profile ||
                    DEFAULT_CONFIG.profile
                ),

            sizes:
                clone(
                    options.sizes ||
                    DEFAULT_CONFIG.sizes
                )

        };

    }


    /* ========================================================
       TIMESTAMP
       ======================================================== */

    function nowIso() {

        return new Date()
            .toISOString();

    }


    /* ========================================================
       CREATE EMPTY RESULT
       ======================================================== */

    function createEmptyResult() {

        return {

            version:
                VERSION,

            startedAt:
                null,

            finishedAt:
                null,

            durationMs:
                0,

            valid:
                false,

            totalGarments:
                0,

            passedGarments:
                0,

            failedGarments:
                0,

            results:
                {},

            failures:
                [],

            warnings:
                [],

            summary: {

                generation:
                    {
                        passed: 0,
                        failed: 0
                    },

                baseValidation:
                    {
                        passed: 0,
                        failed: 0
                    },

                gradePoints:
                    {
                        passed: 0,
                        failed: 0
                    },

                grading:
                    {
                        passed: 0,
                        failed: 0
                    },

                production:
                    {
                        passed: 0,
                        failed: 0
                    },

                nesting:
                    {
                        passed: 0,
                        failed: 0
                    },

                outputAudit:
                    {
                        passed: 0,
                        failed: 0
                    }

            }

        };

    }


    /* ========================================================
       INCREMENT STAGE
       ======================================================== */

    function incrementStage(
        result,
        stage,
        passed
    ) {

        if (
            !result.summary[stage]
        ) {

            return;

        }


        if (
            passed
        ) {

            result.summary[
                stage
            ].passed++;

        }
        else {

            result.summary[
                stage
            ].failed++;

        }

    }


    /* ========================================================
       ANALYZE GARMENT REPORT
       ======================================================== */

    function analyzeGarment(
        result,
        report
    ) {

        incrementStage(

            result,

            "generation",

            report.generation
                ?.valid ===
            true

        );


        incrementStage(

            result,

            "baseValidation",

            report.baseValidation
                ?.valid ===
            true

        );


        incrementStage(

            result,

            "gradePoints",

            report.gradePoints
                ?.valid ===
            true

        );


        incrementStage(

            result,

            "grading",

            report.grading
                ?.valid ===
            true

        );


        /*
         * Size-level stages.
         */

        const sizes =
            report.sizes ||
            [];


        sizes.forEach(
            size => {

                incrementStage(

                    result,

                    "production",

                    size.productionValidation
                        ?.valid ===
                    true

                );


                incrementStage(

                    result,

                    "nesting",

                    size.nestingValidation
                        ?.valid ===
                    true

                );


                incrementStage(

                    result,

                    "outputAudit",

                    size.outputAudit
                        ?.valid ===
                    true

                );

            }
        );

    }


    /* ========================================================
       RUN SINGLE GARMENT
       ======================================================== */

    function runGarment(
        garment,
        config,
        result
    ) {

        let report;


        try {

            report =
                GarmentAudit.runGarment(

                    garment,

                    {

                        ...config,

                        profile:
                            clone(
                                config.profile
                            ),

                        sizes:
                            clone(
                                config.sizes
                            )

                    }

                );

        }
        catch (
            error
        ) {

            report = {

                garment,

                valid:
                    false,

                errors: [

                    error.message

                ],

                warnings: [],

                generation: {

                    valid:
                        false

                },

                baseValidation: {

                    valid:
                        false

                },

                gradePoints: {

                    valid:
                        false

                },

                grading: {

                    valid:
                        false

                },

                sizes: []

            };

        }


        result.results[
            garment
        ] =
            report;


        analyzeGarment(
            result,
            report
        );


        if (
            report.valid
        ) {

            result.passedGarments++;

        }
        else {

            result.failedGarments++;


            result.failures.push({

                garment,

                errors:
                    report.errors ||
                    [],

                warnings:
                    report.warnings ||
                    []

            });


            result.warnings.push(

                ...(
                    report.warnings ||
                    []
                )
                .map(
                    warning =>
                        `${garment}: ${warning}`
                )

            );

        }


        return report;

    }


    /* ========================================================
       RUN
       ======================================================== */

    function run(
        options = {}
    ) {

        const config =
            normalizeConfig(
                options
            );


        const result =
            createEmptyResult();


        const started =
            performance.now();


        result.startedAt =
            nowIso();


        result.totalGarments =
            config.garments.length;


        for (
            const garment
            of config.garments
        ) {

            const report =
                runGarment(

                    garment,

                    config,

                    result

                );


            if (
                !report.valid &&
                config.stopOnFirstFailure
            ) {

                break;

            }

        }


        result.valid =

            result.failedGarments ===
            0

            &&

            result.passedGarments ===
            result.totalGarments;


        result.finishedAt =
            nowIso();


        result.durationMs =

            Math.round(

                (
                    performance.now() -
                    started

                ) * 100

            ) / 100;


        return result;

    }


    /* ========================================================
       FLAT SUMMARY
       ======================================================== */

    function getFlatSummary(
        result
    ) {

        if (
            !result
        ) {

            return null;

        }


        return {

            valid:
                result.valid,

            totalGarments:
                result.totalGarments,

            passedGarments:
                result.passedGarments,

            failedGarments:
                result.failedGarments,

            durationMs:
                result.durationMs,

            generationPassed:
                result.summary.generation.passed,

            baseValidationPassed:
                result.summary.baseValidation.passed,

            gradePointPassed:
                result.summary.gradePoints.passed,

            gradingPassed:
                result.summary.grading.passed,

            productionPassed:
                result.summary.production.passed,

            nestingPassed:
                result.summary.nesting.passed,

            outputAuditPassed:
                result.summary.outputAudit.passed

        };

    }


    /* ========================================================
       COMPLETION %
       ======================================================== */

    function calculateCompletion(
        result
    ) {

        if (
            !result
        ) {

            return 0;

        }


        const stages = [

            "generation",

            "baseValidation",

            "gradePoints",

            "grading",

            "production",

            "nesting",

            "outputAudit"

        ];


        let passed =
            0;

        let total =
            0;


        stages.forEach(
            stage => {

                const item =
                    result.summary[
                        stage
                    ];


                if (
                    !item
                ) {

                    return;

                }


                passed +=
                    item.passed;


                total +=
                    item.passed +
                    item.failed;

            }
        );


        if (
            total ===
            0
        ) {

            return 0;

        }


        return Math.round(

            (
                passed /
                total

            ) *

            10000

        ) / 100;

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
                [];


            if (
                result?.failures
            ) {

                result.failures.forEach(
                    failure => {

                        messages.push(

                            `${failure.garment}: ` +

                            (
                                failure.errors ||
                                []
                            )
                            .join(
                                " | "
                            )

                        );

                    }
                );

            }


            throw new Error(

                messages.join(
                    "\n"
                )

                ||

                "PatternMaker universal audit FAILED."

            );

        }


        return true;

    }


    /* ========================================================
       REPORT
       ======================================================== */

    function createReport(
        result
    ) {

        return {

            version:
                VERSION,

            status:

                result.valid

                    ? "PASS"

                    : "FAIL",

            completion:
                calculateCompletion(
                    result
                ),

            summary:
                getFlatSummary(
                    result
                ),

            failures:
                result.failures,

            warnings:
                result.warnings,

            startedAt:
                result.startedAt,

            finishedAt:
                result.finishedAt,

            durationMs:
                result.durationMs

        };

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        options = {}
    ) {

        const result =
            run(
                options
            );


        const report =
            createReport(
                result
            );


        console.group(
            "PatternMaker Universal Audit Runner"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Status:",
            report.status
        );


        console.log(
            "Completion:",
            `${report.completion}%`
        );


        console.log(
            "Summary:",
            report.summary
        );


        console.log(
            "Failures:",
            report.failures
        );


        console.log(
            "Warnings:",
            report.warnings
        );


        console.log(
            "Raw result:",
            result
        );


        console.groupEnd();


        return result;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerUniversalAuditRunner = {

        VERSION,

        DEFAULT_CONFIG,

        normalizeConfig,

        runGarment,

        run,

        assert,

        createReport,

        getFlatSummary,

        calculateCompletion,

        debug

    };


})();
