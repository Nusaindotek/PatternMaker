/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 39 — engine/universal-audit-runner.js
 * ============================================================
 *
 * UNIVERSAL AUDIT RUNNER
 *
 * Prinsip:
 *
 * - TIDAK memperbaiki source code.
 * - TIDAK mengubah garment.
 * - TIDAK mengubah measurement.
 * - TIDAK mengubah engine.
 *
 * Runner hanya mengumpulkan kondisi sistem.
 *
 * Dengan demikian kita tidak mengulang kesalahan:
 *
 * "mengubah kode yang sama tanpa validasi dependency."
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    const GarmentAudit =
        window.PatternMakerUniversalGarmentAudit;

    const Validator =
        window.PatternMakerValidator;

    const ProductionValidator =
        window.PatternMakerProductionValidator;

    const OutputAudit =
        window.PatternMakerOutputAudit;

    const NestingEngine =
        window.PatternMakerNestingEngine;

    const NestingPreview =
        window.PatternMakerNestingPreview;

    const Registry =
        window.PatternMakerPatternRegistry;

    const Schema =
        window.PatternMakerMeasurementSchema;


    /* ========================================================
       RESULT
       ======================================================== */

    function createResult() {

        return {

            valid: true,

            errors: [],

            warnings: [],

            info: [],

            checks: [],

            sections: {}

        };

    }


    function addCheck(
        result,
        name,
        passed,
        message = "",
        severity = "error"
    ) {

        const check = {

            name,

            passed,

            message,

            severity

        };


        result.checks.push(
            check
        );


        if (!passed) {

            result.valid =
                false;


            if (
                severity ===
                "warning"
            ) {

                result.warnings.push(
                    check
                );

            }
            else {

                result.errors.push(
                    check
                );

            }

        }

    }


    function addInfo(
        result,
        message
    ) {

        result.info.push(
            message
        );

    }


    /* ========================================================
       BASIC MODULE AUDIT
       ======================================================== */

    function auditModules() {

        const result =
            createResult();


        const modules = {

            "Measurement Schema":
                Schema,

            "Garment Audit":
                GarmentAudit,

            "Pattern Validator":
                Validator,

            "Production Validator":
                ProductionValidator,

            "Output Audit":
                OutputAudit,

            "Nesting Engine":
                NestingEngine,

            "Nesting Preview":
                NestingPreview,

            "Pattern Registry":
                Registry

        };


        Object.entries(
            modules
        )
        .forEach(
            ([name, module]) => {

                addCheck(

                    result,

                    `Module: ${name}`,

                    Boolean(
                        module
                    ),

                    module
                        ? ""
                        : `${name} belum tersedia.`

                );

            }
        );


        return result;

    }


    /* ========================================================
       GARMENT AUDIT
       ======================================================== */

    function auditGarments() {

        const result =
            createResult();


        if (
            !GarmentAudit
        ) {

            addCheck(

                result,

                "Universal Garment Audit",

                false,

                "Universal Garment Audit belum tersedia."

            );


            return result;

        }


        const audit =
            GarmentAudit.auditSystem();


        result.checks.push(
            ...(audit.checks || [])
        );


        result.errors.push(
            ...(audit.errors || [])
        );


        result.warnings.push(
            ...(audit.warnings || [])
        );


        result.sections.matrix =
            audit.matrix || null;


        result.valid =
            audit.valid;


        return result;

    }


    /* ========================================================
       PATTERN ENGINE AUDIT
       ======================================================== */

    function auditPatternEngines() {

        const result =
            createResult();


        if (
            !Registry
        ) {

            addCheck(

                result,

                "Pattern Registry",

                false,

                "Pattern Registry belum tersedia."

            );


            return result;

        }


        let engineIds =
            [];


        /*
         * Ambil API registry secara defensif.
         */

        if (
            typeof Registry.getEngineIds ===
            "function"
        ) {

            engineIds =
                Registry.getEngineIds();

        }
        else if (
            typeof Registry.getAllEngines ===
            "function"
        ) {

            const engines =
                Registry.getAllEngines();


            if (
                Array.isArray(
                    engines
                )
            ) {

                engineIds =
                    engines.map(
                        engine =>
                            engine.id
                    );

            }
            else if (
                engines &&
                typeof engines ===
                    "object"
            ) {

                engineIds =
                    Object.keys(
                        engines
                    );

            }

        }
        else {

            addInfo(

                result,

                "Pattern Registry tidak menyediakan API enumeration."

            );

            return result;

        }


        if (
            !Array.isArray(
                engineIds
            )
        ) {

            engineIds =
                [];

        }


        engineIds.forEach(
            engineId => {

                let engine =
                    null;


                if (
                    typeof Registry.getEngine ===
                    "function"
                ) {

                    engine =
                        Registry.getEngine(
                            engineId
                        );

                }


                addCheck(

                    result,

                    `Pattern engine: ${engineId}`,

                    Boolean(
                        engine &&
                        typeof engine.generate ===
                            "function"
                    ),

                    engine

                        ? (
                            typeof engine.generate ===
                                "function"

                                ? ""

                                : `Engine "${engineId}" ` +
                                  "tidak mempunyai generate()."
                          )

                        : `Engine "${engineId}" tidak ditemukan.`

                );

            }
        );


        result.sections.engineCount =
            engineIds.length;


        return result;

    }


    /* ========================================================
       LEGACY ENGINE AUDIT
       ======================================================== */

    function auditLegacyEngines() {

        const result =
            createResult();


        addCheck(

            result,

            "Legacy makeBodice",

            typeof window.makeBodice ===
                "function",

            "window.makeBodice belum tersedia."

        );


        addCheck(

            result,

            "Legacy makeSleeve",

            typeof window.makeSleeve ===
                "function",

            "window.makeSleeve belum tersedia."

        );


        return result;

    }


    /* ========================================================
       CURRENT APP STATE
       ======================================================== */

    function auditCurrentState() {

        const result =
            createResult();


        const state =
            window.PatternMakerApp?.state;


        addCheck(

            result,

            "Application State",

            Boolean(
                state
            ),

            "PatternMakerApp.state belum tersedia."

        );


        if (
            !state
        ) {

            return result;

        }


        addInfo(

            result,

            `Mode: ${state.mode || "-"}`

        );


        addInfo(

            result,

            `Garment: ${state.garment || "-"}`

        );


        addInfo(

            result,

            `Base pattern: ${
                state.basePattern
                    ? "available"
                    : "empty"
            }`

        );


        addInfo(

            result,

            `Cutting pattern: ${
                state.cuttingPattern
                    ? "available"
                    : "empty"
            }`

        );


        addInfo(

            result,

            `Nesting result: ${
                state.nestingResult
                    ? "available"
                    : "empty"
            }`

        );


        /*
         * State kosong bukan error.
         */

        return result;

    }


    /* ========================================================
       CURRENT SELECTION AUDIT
       ======================================================== */

    function auditCurrentSelection() {

        const result =
            createResult();


        const app =
            window.PatternMakerApp;


        if (
            !app ||
            !app.state
        ) {

            addCheck(

                result,

                "Current application",

                false,

                "PatternMakerApp belum tersedia."

            );


            return result;

        }


        if (
            !GarmentAudit
        ) {

            addCheck(

                result,

                "Current garment audit",

                false,

                "Universal Garment Audit belum tersedia."

            );


            return result;

        }


        const garmentId =
            app.state.garment;


        const profile =
            app.state.profile;


        const audit =
            GarmentAudit.auditCurrentSelection(

                profile,

                garmentId

            );


        result.checks.push(
            ...(audit.checks || [])
        );


        result.errors.push(
            ...(audit.errors || [])
        );


        result.warnings.push(
            ...(audit.warnings || [])
        );


        result.valid =
            audit.valid;


        return result;

    }


    /* ========================================================
       PRODUCTION STATE AUDIT
       ======================================================== */

    function auditProductionState() {

        const result =
            createResult();


        const pattern =
            window.PatternMakerApp
                ?.state
                ?.cuttingPattern;


        /*
         * Tidak ada pattern adalah kondisi
         * sebelum drafting, bukan error.
         */

        if (
            !pattern
        ) {

            addInfo(

                result,

                "Belum ada cuttingPattern. " +
                "Production audit belum dapat dijalankan."

            );


            return result;

        }


        if (
            !ProductionValidator
        ) {

            addCheck(

                result,

                "Production Validator",

                false,

                "Production Validator tidak tersedia."

            );


            return result;

        }


        const validation =
            ProductionValidator
                .validateForProduction(

                    pattern,

                    {

                        requireCutPoints:
                            true,

                        requireSeam:
                            true

                    }

                );


        result.checks.push(
            ...(validation.checks || [])
        );


        result.errors.push(
            ...(validation.errors || [])
        );


        result.warnings.push(
            ...(validation.warnings || [])
        );


        result.valid =
            validation.valid;


        return result;

    }


    /* ========================================================
       OUTPUT STATE AUDIT
       ======================================================== */

    function auditOutputState() {

        const result =
            createResult();


        const pattern =
            window.PatternMakerApp
                ?.state
                ?.cuttingPattern;


        if (
            !pattern
        ) {

            addInfo(

                result,

                "Belum ada cuttingPattern. " +
                "Output audit menunggu drafting."

            );


            return result;

        }


        if (
            !OutputAudit
        ) {

            addCheck(

                result,

                "Output Audit",

                false,

                "Output Audit belum tersedia."

            );


            return result;

        }


        const audit =
            OutputAudit.auditPattern(
                pattern
            );


        result.checks.push(
            ...(audit.checks || [])
        );


        result.errors.push(
            ...(audit.errors || [])
        );


        result.warnings.push(
            ...(audit.warnings || [])
        );


        result.valid =
            audit.valid;


        return result;

    }


    /* ========================================================
       NESTING STATE AUDIT
       ======================================================== */

    function auditNestingState() {

        const result =
            createResult();


        const nest =
            window.PatternMakerApp
                ?.state
                ?.nestingResult;


        if (
            !nest
        ) {

            addInfo(

                result,

                "Nesting belum dijalankan."

            );


            return result;

        }


        if (
            !NestingEngine
        ) {

            addCheck(

                result,

                "Nesting Engine",

                false,

                "Nesting Engine belum tersedia."

            );


            return result;

        }


        const validation =
            NestingEngine.validateNest(
                nest
            );


        addCheck(

            result,

            "Nesting geometry",

            validation.valid,

            validation.valid

                ? ""

                : validation.errors
                    .join(
                        " | "
                    )

        );


        if (
            validation.warnings?.length
        ) {

            validation.warnings.forEach(
                warning => {

                    addWarningMessage(

                        result,

                        "Nesting warning",

                        typeof warning ===
                            "string"

                            ? warning

                            : warning.message

                    );

                }
            );

        }


        return result;

    }


    function addWarningMessage(
        result,
        name,
        message
    ) {

        result.warnings.push({

            check:
                name,

            message

        });

    }


    /* ========================================================
       FULL RUN
       ======================================================== */

    function runFullAudit() {

        const result =
            createResult();


        /*
         * 1. Modules
         */

        const modules =
            auditModules();


        result.sections.modules =
            modules;


        mergeResult(
            result,
            modules
        );


        /*
         * 2. Garments
         */

        const garments =
            auditGarments();


        result.sections.garments =
            garments;


        mergeResult(
            result,
            garments
        );


        /*
         * 3. Pattern engines
         */

        const engines =
            auditPatternEngines();


        result.sections.patternEngines =
            engines;


        mergeResult(
            result,
            engines
        );


        /*
         * 4. Legacy
         */

        const legacy =
            auditLegacyEngines();


        result.sections.legacy =
            legacy;


        mergeResult(
            result,
            legacy
        );


        /*
         * 5. Current state
         */

        const state =
            auditCurrentState();


        result.sections.state =
            state;


        mergeResult(
            result,
            state
        );


        /*
         * 6. Current selection
         */

        const selection =
            auditCurrentSelection();


        result.sections.selection =
            selection;


        mergeResult(
            result,
            selection
        );


        /*
         * 7. Production
         */

        const production =
            auditProductionState();


        result.sections.production =
            production;


        mergeResult(
            result,
            production
        );


        /*
         * 8. Output
         */

        const output =
            auditOutputState();


        result.sections.output =
            output;


        mergeResult(
            result,
            output
        );


        /*
         * 9. Nesting
         */

        const nesting =
            auditNestingState();


        result.sections.nesting =
            nesting;


        mergeResult(
            result,
            nesting
        );


        result.valid =
            result.errors.length === 0;


        return result;

    }


    /* ========================================================
       MERGE
       ======================================================== */

    function mergeResult(
        target,
        source
    ) {

        target.checks.push(
            ...(source.checks || [])
        );


        target.errors.push(
            ...(source.errors || [])
        );


        target.warnings.push(
            ...(source.warnings || [])
        );


        target.info.push(
            ...(source.info || [])
        );


        if (
            source.valid === false
        ) {

            target.valid =
                false;

        }

    }


    /* ========================================================
       FORMAT
       ======================================================== */

    function formatResult(
        result
    ) {

        return {

            valid:
                result.valid,

            totalChecks:
                result.checks.length,

            passedChecks:
                result.checks.filter(
                    check =>
                        check.passed
                ).length,

            failedChecks:
                result.checks.filter(
                    check =>
                        !check.passed
                ).length,

            errors:
                result.errors,

            warnings:
                result.warnings,

            info:
                result.info,

            sections:
                result.sections

        };

    }


    /* ========================================================
       REPORT
       ======================================================== */

    function createReport(
        result
    ) {

        const formatted =
            formatResult(
                result
            );


        return {

            generatedAt:
                new Date()
                    .toISOString(),

            summary: {

                valid:
                    formatted.valid,

                totalChecks:
                    formatted.totalChecks,

                passed:
                    formatted.passedChecks,

                failed:
                    formatted.failedChecks,

                errors:
                    formatted.errors.length,

                warnings:
                    formatted.warnings.length

            },

            errors:
                formatted.errors,

            warnings:
                formatted.warnings,

            information:
                formatted.info,

            sections:
                formatted.sections

        };

    }


    /* ========================================================
       CONSOLE REPORT
       ======================================================== */

    function runDebug() {

        const result =
            runFullAudit();


        const report =
            createReport(
                result
            );


        console.group(
            "PatternMaker Universal Audit Runner"
        );


        console.log(
            "VALID:",
            report.summary.valid
        );


        console.log(
            "TOTAL CHECKS:",
            report.summary.totalChecks
        );


        console.log(
            "PASSED:",
            report.summary.passed
        );


        console.log(
            "FAILED:",
            report.summary.failed
        );


        console.log(
            "ERRORS:",
            report.summary.errors
        );


        console.log(
            "WARNINGS:",
            report.summary.warnings
        );


        console.log(
            "REPORT:",
            report
        );


        if (
            report.errors.length
        ) {

            console.error(
                "ERROR DETAILS:",
                report.errors
            );

        }


        if (
            report.warnings.length
        ) {

            console.warn(
                "WARNING DETAILS:",
                report.warnings
            );

        }


        console.groupEnd();


        return report;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerUniversalAuditRunner = {

        auditModules,

        auditGarments,

        auditPatternEngines,

        auditLegacyEngines,

        auditCurrentState,

        auditCurrentSelection,

        auditProductionState,

        auditOutputState,

        auditNestingState,

        runFullAudit,

        formatResult,

        createReport,

        runDebug

    };


})();
