/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 33 — engine/output-audit.js
 * ============================================================
 *
 * OUTPUT CONSISTENCY AUDITOR
 *
 * Membandingkan:
 *
 *   Cutting Geometry
 *        ↓
 *   DXF
 *   PLT
 *   SVG
 *
 * Fokus:
 *
 * - Piece count
 * - Piece identity
 * - Point count
 * - Bounds
 * - Width
 * - Height
 * - Unit
 * - Scale
 * - Cutting boundary
 *
 * ============================================================
 *
 * AUDITOR TIDAK MENGUBAH PATTERN.
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    const Geometry =
        window.PatternMakerProductionGeometry;

    const Validator =
        window.PatternMakerProductionValidator;

    const DXF =
        window.PatternMakerDXF;

    const Plotter =
        window.PatternMakerPlotter;

    const SVG =
        window.PatternMakerSVG;


    /* ========================================================
       RESULT
       ======================================================== */

    function createResult() {

        return {

            valid:
                true,

            errors:
                [],

            warnings:
                [],

            checks:
                [],

            summary:
                null

        };

    }


    function addCheck(
        result,
        name,
        passed,
        message = ""
    ) {

        result.checks.push({

            name,

            passed,

            message

        });


        if (!passed) {

            result.valid =
                false;

            result.errors.push({

                check:
                    name,

                message

            });

        }

    }


    function addWarning(
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
       ROUND
       ======================================================== */

    function round(
        value,
        decimals = 4
    ) {

        const factor =
            10 ** decimals;


        return Math.round(
            Number(value) *
            factor
        ) / factor;

    }


    /* ========================================================
       CUT POINTS
       ======================================================== */

    function getCutPoints(
        piece
    ) {

        if (
            piece?.cutPoints &&
            Array.isArray(
                piece.cutPoints
            ) &&
            piece.cutPoints.length >= 3
        ) {

            return piece.cutPoints;

        }


        if (
            piece?.points &&
            Array.isArray(
                piece.points
            ) &&
            piece.points.length >= 3
        ) {

            return piece.points;

        }


        return [];

    }


    /* ========================================================
       PIECE SIGNATURE
       ======================================================== */

    function getPieceSignature(
        piece
    ) {

        const points =
            getCutPoints(
                piece
            );


        return {

            name:
                piece?.name ||
                "",

            type:
                piece?.type ||
                "",

            pointCount:
                points.length,

            quantity:
                num(
                    piece?.quantity,
                    1
                )

        };

    }


    /* ========================================================
       PATTERN SUMMARY
       ======================================================== */

    function summarizePattern(
        pattern
    ) {

        if (
            !pattern ||
            !Array.isArray(
                pattern.pieces
            )
        ) {

            return {

                valid:
                    false,

                pieceCount:
                    0,

                pieces:
                    [],

                bounds:
                    null

            };

        }


        const pieces =
            pattern.pieces.map(
                piece => {

                    const points =
                        getCutPoints(
                            piece
                        );


                    let bounds =
                        null;


                    if (
                        Geometry &&
                        points.length >= 3
                    ) {

                        bounds =
                            Geometry.getBounds(
                                points
                            );

                    }


                    return {

                        ...getPieceSignature(
                            piece
                        ),

                        bounds:
                            bounds

                                ? {

                                    minX:
                                        round(
                                            bounds.minX
                                        ),

                                    maxX:
                                        round(
                                            bounds.maxX
                                        ),

                                    minY:
                                        round(
                                            bounds.minY
                                        ),

                                    maxY:
                                        round(
                                            bounds.maxY
                                        ),

                                    width:
                                        round(
                                            bounds.width
                                        ),

                                    height:
                                        round(
                                            bounds.height
                                        )

                                }

                                : null

                    };

                }
            );


        let overallBounds =
            null;


        if (
            Geometry
        ) {

            try {

                overallBounds =
                    Geometry.getPatternBounds(
                        pattern
                    );

            }
            catch (
                error
            ) {

                overallBounds =
                    null;

            }

        }


        return {

            valid:
                true,

            pieceCount:
                pieces.length,

            pieces,

            bounds:
                overallBounds

                    ? {

                        minX:
                            round(
                                overallBounds.minX
                            ),

                        maxX:
                            round(
                                overallBounds.maxX
                            ),

                        minY:
                            round(
                                overallBounds.minY
                            ),

                        maxY:
                            round(
                                overallBounds.maxY
                            ),

                        width:
                            round(
                                overallBounds.width
                            ),

                        height:
                            round(
                                overallBounds.height
                            )

                    }

                    : null,

            metadata: {

                unit:
                    pattern.metadata?.unit ||
                    null,

                scale:
                    num(
                        pattern.metadata?.scale,
                        1
                    ),

                geometryType:
                    pattern.metadata?.geometryType ||
                    null

            }

        };

    }


    /* ========================================================
       PIECE COMPARISON
       ======================================================== */

    function comparePiece(
        referencePiece,
        targetPiece,
        index,
        result,
        tolerance = 0.001
    ) {

        const reference =
            getPieceSignature(
                referencePiece
            );


        const target =
            getPieceSignature(
                targetPiece
            );


        addCheck(

            result,

            `Piece ${index + 1} name`,

            reference.name ===
            target.name,

            `Reference "${reference.name}" != ` +
            `Target "${target.name}".`

        );


        addCheck(

            result,

            `Piece ${index + 1} type`,

            reference.type ===
            target.type,

            `Reference "${reference.type}" != ` +
            `Target "${target.type}".`

        );


        addCheck(

            result,

            `Piece ${index + 1} point count`,

            reference.pointCount ===
            target.pointCount,

            `Reference ${reference.pointCount} points != ` +
            `Target ${target.pointCount} points.`

        );


        /*
         * Bounds.
         */

        const referencePoints =
            getCutPoints(
                referencePiece
            );


        const targetPoints =
            getCutPoints(
                targetPiece
            );


        if (
            Geometry &&
            referencePoints.length >= 3 &&
            targetPoints.length >= 3
        ) {

            const a =
                Geometry.getBounds(
                    referencePoints
                );


            const b =
                Geometry.getBounds(
                    targetPoints
                );


            const fields = [

                "minX",
                "maxX",
                "minY",
                "maxY",
                "width",
                "height"

            ];


            fields.forEach(
                field => {

                    const delta =
                        Math.abs(

                            Number(a[field]) -
                            Number(b[field])

                        );


                    addCheck(

                        result,

                        `Piece ${index + 1} ${field}`,

                        delta <=
                            tolerance,

                        `Reference ${field}=${a[field]}, ` +
                        `Target ${field}=${b[field]}, ` +
                        `delta=${delta}.`

                    );

                }
            );

        }

    }


    /* ========================================================
       COMPARE PATTERNS
       ======================================================== */

    function comparePatterns(
        referencePattern,
        targetPattern,
        label,
        tolerance = 0.001
    ) {

        const result =
            createResult();


        const reference =
            summarizePattern(
                referencePattern
            );


        const target =
            summarizePattern(
                targetPattern
            );


        addCheck(

            result,

            `${label} piece count`,

            reference.pieceCount ===
            target.pieceCount,

            `Reference=${reference.pieceCount}, ` +
            `Target=${target.pieceCount}.`

        );


        const count =
            Math.min(

                reference.pieces.length,

                target.pieces.length

            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            comparePiece(

                referencePattern.pieces[i],

                targetPattern.pieces[i],

                i,

                result,

                tolerance

            );

        }


        result.summary = {

            reference,

            target

        };


        return result;

    }


    /* ========================================================
       VALIDATE SOURCE PATTERN
       ======================================================== */

    function validateSourcePattern(
        pattern
    ) {

        const result =
            createResult();


        if (
            !Validator
        ) {

            addCheck(

                result,

                "Production validator",

                false,

                "Production Validator belum tersedia."

            );


            return result;

        }


        const validation =
            Validator.validateForProduction(

                pattern,

                {

                    requireCutPoints:
                        true,

                    requireSeam:
                        true

                }

            );


        result.checks.push(
            ...validation.checks
        );


        result.errors.push(
            ...validation.errors
        );


        result.warnings.push(
            ...validation.warnings
        );


        result.valid =
            validation.valid;


        return result;

    }


    /* ========================================================
       EXPORTER AVAILABILITY
       ======================================================== */

    function validateExporters() {

        const result =
            createResult();


        addCheck(

            result,

            "DXF exporter",

            Boolean(
                DXF &&
                typeof DXF.buildDXF ===
                    "function"
            ),

            "DXF exporter belum tersedia."

        );


        addCheck(

            result,

            "PLT exporter",

            Boolean(
                Plotter &&
                typeof Plotter.buildHPGL ===
                    "function"
            ),

            "PLT exporter belum tersedia."

        );


        addCheck(

            result,

            "SVG exporter",

            Boolean(
                SVG &&
                typeof SVG.buildSVG ===
                    "function"
            ),

            "SVG exporter belum tersedia."

        );


        return result;

    }


    /* ========================================================
       UNIT AUDIT
       ======================================================== */

    function auditUnits() {

        const result =
            createResult();


        /*
         * DXF
         */

        if (
            DXF &&
            typeof DXF.getExportInfo ===
                "function"
        ) {

            const info =
                DXF.getExportInfo();


            addCheck(

                result,

                "DXF source unit",

                info.sourceUnit ===
                    "cm",

                `DXF sourceUnit=${info.sourceUnit}.`

            );


            addCheck(

                result,

                "DXF output unit",

                info.outputUnit ===
                    "mm",

                `DXF outputUnit=${info.outputUnit}.`

            );


            addCheck(

                result,

                "DXF conversion",

                Number(info.conversion) ===
                    10,

                `DXF conversion=${info.conversion}.`

            );

        }


        /*
         * SVG
         */

        if (
            SVG &&
            typeof SVG.getExportInfo ===
                "function"
        ) {

            const info =
                SVG.getExportInfo();


            addCheck(

                result,

                "SVG source unit",

                info.sourceUnit ===
                    "cm",

                `SVG sourceUnit=${info.sourceUnit}.`

            );


            addCheck(

                result,

                "SVG output unit",

                info.outputUnit ===
                    "mm",

                `SVG outputUnit=${info.outputUnit}.`

            );


            addCheck(

                result,

                "SVG conversion",

                Number(info.conversion) ===
                    10,

                `SVG conversion=${info.conversion}.`

            );


            addCheck(

                result,

                "SVG scale",

                Number(info.scale) ===
                    1,

                `SVG scale=${info.scale}.`

            );

        }


        /*
         * PLT
         *
         * HPGL itself does not carry physical mm
         * metadata consistently across all devices,
         * so we validate the configured conversion.
         */

        if (
            Plotter &&
            typeof Plotter.getExportInfo ===
                "function"
        ) {

            const info =
                Plotter.getExportInfo();


            addCheck(

                result,

                "PLT source unit",

                info.sourceUnit ===
                    "cm",

                `PLT sourceUnit=${info.sourceUnit}.`

            );


            addCheck(

                result,

                "PLT mm conversion",

                Number(
                    info.millimetersPerCm
                ) === 10,

                `PLT millimetersPerCm=` +
                `${info.millimetersPerCm}.`

            );


            addCheck(

                result,

                "PLT units/mm positive",

                Number(
                    info.unitsPerMm
                ) > 0,

                `PLT unitsPerMm=${info.unitsPerMm}.`

            );

        }


        return result;

    }


    /* ========================================================
       SERIALIZE EXPORTER SOURCE
       ======================================================== */

    function auditDXFText(
        pattern
    ) {

        const result =
            createResult();


        if (
            !DXF
        ) {

            addCheck(

                result,

                "DXF object",

                false,

                "DXF exporter tidak tersedia."

            );


            return result;

        }


        try {

            const dxf =
                DXF.buildDXF(
                    pattern,

                    {

                        includeGrainline:
                            false,

                        includeNotches:
                            false,

                        includeDrillPoints:
                            false,

                        includeLabels:
                            false

                    }

                );


            addCheck(

                result,

                "DXF output exists",

                typeof dxf ===
                    "string" &&
                dxf.length > 0,

                "DXF output kosong."

            );


            addCheck(

                result,

                "DXF contains ENTITIES",

                dxf.includes(
                    "ENTITIES"
                ),

                "DXF tidak memiliki ENTITIES section."

            );


            addCheck(

                result,

                "DXF contains LWPOLYLINE",

                dxf.includes(
                    "LWPOLYLINE"
                ),

                "DXF tidak memiliki cutting polyline."

            );


            addCheck(

                result,

                "DXF terminates EOF",

                dxf.trim()
                    .endsWith(
                        "EOF"
                    ),

                "DXF tidak diakhiri EOF."

            );

        }
        catch (
            error
        ) {

            addCheck(

                result,

                "DXF build",

                false,

                error.message

            );

        }


        return result;

    }


    /* ========================================================
       PLT TEXT AUDIT
       ======================================================== */

    function auditPLTText(
        pattern
    ) {

        const result =
            createResult();


        if (
            !Plotter
        ) {

            addCheck(

                result,

                "PLT object",

                false,

                "PLT exporter tidak tersedia."

            );


            return result;

        }


        try {

            const hpgl =
                Plotter.buildHPGL(

                    pattern,

                    {

                        includeGrainline:
                            false,

                        includeNotches:
                            false,

                        includeDrillPoints:
                            false,

                        includeLabels:
                            false

                    }

                );


            addCheck(

                result,

                "PLT output exists",

                typeof hpgl ===
                    "string" &&
                hpgl.length > 0,

                "PLT output kosong."

            );


            addCheck(

                result,

                "PLT initialize",

                hpgl.includes(
                    "IN;"
                ),

                "PLT tidak memiliki initialize command."

            );


            addCheck(

                result,

                "PLT pen up",

                hpgl.includes(
                    "PU"
                ),

                "PLT tidak memiliki pen-up command."

            );


            addCheck(

                result,

                "PLT pen down",

                hpgl.includes(
                    "PD"
                ),

                "PLT tidak memiliki pen-down command."

            );


        }
        catch (
            error
        ) {

            addCheck(

                result,

                "PLT build",

                false,

                error.message

            );

        }


        return result;

    }


    /* ========================================================
       SVG TEXT AUDIT
       ======================================================== */

    function auditSVGText(
        pattern
    ) {

        const result =
            createResult();


        if (
            !SVG
        ) {

            addCheck(

                result,

                "SVG object",

                false,

                "SVG exporter tidak tersedia."

            );


            return result;

        }


        try {

            const svg =
                SVG.buildSVG(

                    pattern,

                    {

                        includeGrainline:
                            false,

                        includeNotches:
                            false,

                        includeDrillPoints:
                            false,

                        includeLabels:
                            false

                    }

                );


            addCheck(

                result,

                "SVG output exists",

                typeof svg ===
                    "string" &&
                svg.length > 0,

                "SVG output kosong."

            );


            addCheck(

                result,

                "SVG element",

                svg.includes(
                    "<svg"
                ),

                "SVG root tidak ditemukan."

            );


            addCheck(

                result,

                "SVG cutting polygon",

                svg.includes(
                    'data-layer="CUT"'
                ),

                "SVG cutting layer tidak ditemukan."

            );


            addCheck(

                result,

                "SVG metadata unit",

                svg.includes(
                    "data-patternmaker-unit=\"mm\""
                ),

                "SVG unit metadata tidak ditemukan."

            );


            addCheck(

                result,

                "SVG scale",

                svg.includes(
                    "data-patternmaker-scale=\"1\""
                ),

                "SVG scale 1:1 tidak ditemukan."

            );

        }
        catch (
            error
        ) {

            addCheck(

                result,

                "SVG build",

                false,

                error.message

            );

        }


        return result;

    }


    /* ========================================================
       FULL AUDIT
       ======================================================== */

    function auditPattern(
        pattern,
        options = {}
    ) {

        const result =
            createResult();


        /*
         * Source validation.
         */

        const sourceResult =
            validateSourcePattern(
                pattern
            );


        result.checks.push(
            ...sourceResult.checks
        );


        result.errors.push(
            ...sourceResult.errors
        );


        result.warnings.push(
            ...sourceResult.warnings
        );


        /*
         * Exporters.
         */

        const exportersResult =
            validateExporters();


        result.checks.push(
            ...exportersResult.checks
        );


        result.errors.push(
            ...exportersResult.errors
        );


        result.warnings.push(
            ...exportersResult.warnings
        );


        /*
         * Units.
         */

        const unitResult =
            auditUnits();


        result.checks.push(
            ...unitResult.checks
        );


        result.errors.push(
            ...unitResult.errors
        );


        result.warnings.push(
            ...unitResult.warnings
        );


        /*
         * Text construction audit.
         */

        const dxfResult =
            auditDXFText(
                pattern
            );


        result.checks.push(
            ...dxfResult.checks
        );


        result.errors.push(
            ...dxfResult.errors
        );


        result.warnings.push(
            ...dxfResult.warnings
        );


        const pltResult =
            auditPLTText(
                pattern
            );


        result.checks.push(
            ...pltResult.checks
        );


        result.errors.push(
            ...pltResult.errors
        );


        result.warnings.push(
            ...pltResult.warnings
        );


        const svgResult =
            auditSVGText(
                pattern
            );


        result.checks.push(
            ...svgResult.checks
        );


        result.errors.push(
            ...svgResult.errors
        );


        result.warnings.push(
            ...svgResult.warnings
        );


        /*
         * Summary.
         */

        result.summary =
            summarizePattern(
                pattern
            );


        result.valid =
            result.errors.length === 0;


        return result;

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

            summary:
                result.summary

        };

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function runDebug(
        pattern = null
    ) {

        const target =
            pattern ||
            window.PatternMakerApp?.state
                ?.cuttingPattern;


        if (
            !target
        ) {

            console.warn(
                "PatternMaker Output Audit: " +
                "belum ada cuttingPattern."
            );


            return {

                valid:
                    false,

                totalChecks:
                    0,

                passedChecks:
                    0,

                failedChecks:
                    1,

                errors: [

                    {

                        check:
                            "Pattern",

                        message:
                            "Belum ada cuttingPattern."

                    }

                ],

                warnings: [],

                summary:
                    null

            };

        }


        const result =
            auditPattern(
                target
            );


        const formatted =
            formatResult(
                result
            );


        console.group(
            "PatternMaker Output Audit"
        );


        console.log(
            "Valid:",
            formatted.valid
        );


        console.log(
            "Checks:",
            formatted.totalChecks
        );


        console.log(
            "Passed:",
            formatted.passedChecks
        );


        console.log(
            "Failed:",
            formatted.failedChecks
        );


        console.log(
            "Summary:",
            formatted.summary
        );


        if (
            formatted.errors.length
        ) {

            console.error(
                "Errors:",
                formatted.errors
            );

        }


        if (
            formatted.warnings.length
        ) {

            console.warn(
                "Warnings:",
                formatted.warnings
            );

        }


        console.groupEnd();


        return formatted;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerOutputAudit = {

        summarizePattern,

        comparePatterns,

        validateSourcePattern,

        validateExporters,

        auditUnits,

        auditDXFText,

        auditPLTText,

        auditSVGText,

        auditPattern,

        formatResult,

        runDebug

    };


})();
