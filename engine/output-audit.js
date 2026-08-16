/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 84
 *
 * FILE:
 *   engine/output-audit.js
 * ============================================================
 *
 * OUTPUT CONSISTENCY AUDIT
 *
 * Production / Marker
 *        ↓
 *   DXF / HPGL / SVG
 *        ↓
 *   THIS AUDITOR
 *
 * ============================================================
 *
 * Audit:
 *
 * - piece count
 * - piece names
 * - geometry point count
 * - bounds
 * - marker dimensions
 * - output source type
 * - unit
 * - duplicate pieces
 * - missing pieces
 * - non-finite geometry
 *
 * ============================================================
 *
 * IMPORTANT:
 *
 * Auditor TIDAK memperbaiki output.
 * Auditor hanya PASS / FAIL.
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    const Dxf =
        window.PatternMakerDxfExporter;

    const Plotter =
        window.PatternMakerPlotterExporter;

    const Svg =
        window.PatternMakerSvgExporter;


    if (
        !Dxf ||
        !Plotter ||
        !Svg
    ) {

        throw new Error(
            "output-audit.js membutuhkan DXF, Plotter, dan SVG exporter."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    const EPSILON =
        1e-7;


    /* ========================================================
       DEFAULT OPTIONS
       ======================================================== */

    const DEFAULT_OPTIONS = {

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
            true,

        expectedUnit:
            "cm",

        sourceType:
            "production"

    };


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
       OPTIONS
       ======================================================== */

    function normalizeOptions(
        options = {}
    ) {

        return {

            ...DEFAULT_OPTIONS,

            ...options

        };

    }


    /* ========================================================
       POINTS
       ======================================================== */

    function getPoints(
        piece
    ) {

        return (

            piece?.cutPoints ||

            piece?.points ||

            piece?.seamPoints ||

            []

        );

    }


    /* ========================================================
       BOUNDS
       ======================================================== */

    function getBounds(
        points
    ) {

        if (
            !Array.isArray(points) ||
            points.length ===
            0
        ) {

            return {

                minX:
                    0,

                minY:
                    0,

                maxX:
                    0,

                maxY:
                    0,

                width:
                    0,

                height:
                    0

            };

        }


        const xs =
            points.map(
                point =>
                    Number(
                        point[0]
                    )
            );


        const ys =
            points.map(
                point =>
                    Number(
                        point[1]
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
       FINITE POINTS
       ======================================================== */

    function hasFinitePoints(
        points
    ) {

        if (
            !Array.isArray(points) ||
            points.length ===
            0
        ) {

            return false;

        }


        return points.every(
            point =>

                Array.isArray(
                    point
                ) &&

                point.length >=
                2 &&

                Number.isFinite(
                    Number(
                        point[0]
                    )
                ) &&

                Number.isFinite(
                    Number(
                        point[1]
                    )
                )

        );

    }


    /* ========================================================
       PIECE SNAPSHOT
       ======================================================== */

    function createPieceSnapshot(
        piece,
        index
    ) {

        const points =
            getPoints(
                piece
            );


        return {

            index,

            name:
                piece?.name ||
                `PIECE-${index + 1}`,

            pointCount:
                points.length,

            finite:
                hasFinitePoints(
                    points
                ),

            bounds:
                getBounds(
                    points
                )

        };

    }


    /* ========================================================
       PRODUCTION SNAPSHOT
       ======================================================== */

    function createProductionSnapshot(
        source
    ) {

        const pieces =
            Array.isArray(
                source?.pieces
            )

                ? source.pieces

                : [];


        return {

            sourceType:
                "production",

            unit:
                source?.metadata?.unit ||
                "cm",

            engine:
                source?.engine ||
                null,

            pieceCount:
                pieces.length,

            pieces:
                pieces.map(
                    createPieceSnapshot
                )

        };

    }


    /* ========================================================
       MARKER SNAPSHOT
       ======================================================== */

    function createMarkerSnapshot(
        source
    ) {

        const placements =
            Array.isArray(
                source?.placements
            )

                ? source.placements

                : [];


        return {

            sourceType:
                "marker",

            unit:
                source?.metadata?.unit ||
                "cm",

            engine:
                source?.metadata?.engine ||
                null,

            pieceCount:
                placements.length,

            marker: {

                width:
                    num(
                        source?.marker?.width
                    ),

                length:
                    num(
                        source?.marker?.length
                    ),

                area:
                    num(
                        source?.marker?.area
                    )

            },

            pieces:

                placements.map(
                    (
                        placement,
                        index
                    ) => ({

                        index,

                        name:
                            placement?.name ||
                            placement?.id ||
                            `PLACEMENT-${index + 1}`,

                        pointCount:
                            Array.isArray(
                                placement?.points
                            )
                                ? placement.points.length
                                : 0,

                        finite:
                            hasFinitePoints(
                                placement?.points ||
                                []
                            ),

                        bounds:
                            getBounds(
                                placement?.points ||
                                []
                            )

                    })

                )

        };

    }


    /* ========================================================
       NAME MAP
       ======================================================== */

    function createNameMap(
        pieces
    ) {

        const map =
            new Map();


        pieces.forEach(
            piece => {

                map.set(

                    String(
                        piece.name
                    ),

                    piece

                );

            }
        );


        return map;

    }


    /* ========================================================
       DUPLICATE NAMES
       ======================================================== */

    function findDuplicateNames(
        pieces
    ) {

        const seen =
            new Set();

        const duplicates =
            [];


        pieces.forEach(
            piece => {

                const name =
                    String(
                        piece.name
                    );


                if (
                    seen.has(
                        name
                    )
                ) {

                    duplicates.push(
                        name
                    );

                }
                else {

                    seen.add(
                        name
                    );

                }

            }
        );


        return duplicates;

    }


    /* ========================================================
       COMPARE SNAPSHOTS
       ======================================================== */

    function compareSnapshots(
        expected,
        actual,
        options
    ) {

        const errors =
            [];

        const warnings =
            [];


        /* ----------------------------------------------------
           PIECE COUNT
           ---------------------------------------------------- */

        if (
            options.requireSamePieceCount &&
            expected.pieceCount !==
            actual.pieceCount
        ) {

            errors.push(

                `Piece count mismatch: ` +

                `${expected.pieceCount} vs ` +

                `${actual.pieceCount}.`

            );

        }


        /* ----------------------------------------------------
           UNIT
           ---------------------------------------------------- */

        if (
            options.checkUnit
        ) {

            if (
                String(
                    expected.unit
                )
                .toLowerCase() !==
                String(
                    options.expectedUnit
                )
                .toLowerCase()
            ) {

                errors.push(

                    `Expected source unit "${options.expectedUnit}", ` +

                    `received "${expected.unit}".`

                );

            }


            if (
                String(
                    actual.unit
                )
                .toLowerCase() !==
                String(
                    options.expectedUnit
                )
                .toLowerCase()
            ) {

                errors.push(

                    `Output unit "${actual.unit}" ` +
                    `tidak sesuai expected unit ` +
                    `"${options.expectedUnit}".`

                );

            }

        }


        /* ----------------------------------------------------
           NAMES
           ---------------------------------------------------- */

        if (
            options.requireSamePieceNames
        ) {

            const expectedNames =
                expected.pieces
                    .map(
                        piece =>
                            piece.name
                    )
                    .sort();


            const actualNames =
                actual.pieces
                    .map(
                        piece =>
                            piece.name
                    )
                    .sort();


            if (
                JSON.stringify(
                    expectedNames
                ) !==
                JSON.stringify(
                    actualNames
                )
            ) {

                errors.push(

                    "Piece names tidak konsisten " +
                    "antara source dan output."

                );

            }

        }


        /* ----------------------------------------------------
           DUPLICATES
           ---------------------------------------------------- */

        const expectedDuplicates =
            findDuplicateNames(
                expected.pieces
            );


        if (
            expectedDuplicates.length
        ) {

            errors.push(

                "Source memiliki duplicate piece names: " +

                expectedDuplicates.join(
                    ", "
                )

            );

        }


        const actualDuplicates =
            findDuplicateNames(
                actual.pieces
            );


        if (
            actualDuplicates.length
        ) {

            errors.push(

                "Output memiliki duplicate piece names: " +

                actualDuplicates.join(
                    ", "
                )

            );

        }


        /* ----------------------------------------------------
           FINITE GEOMETRY
           ---------------------------------------------------- */

        if (
            options.checkFiniteGeometry
        ) {

            expected.pieces.forEach(
                piece => {

                    if (
                        !piece.finite
                    ) {

                        errors.push(

                            `Source piece "${piece.name}" ` +
                            "memiliki geometry non-finite."

                        );

                    }

                }
            );


            actual.pieces.forEach(
                piece => {

                    if (
                        !piece.finite
                    ) {

                        errors.push(

                            `Output piece "${piece.name}" ` +
                            "memiliki geometry non-finite."

                        );

                    }

                }
            );

        }


        /* ----------------------------------------------------
           POINT COUNT
           ---------------------------------------------------- */

        if (
            options.requireSamePointCounts
        ) {

            const expectedMap =
                createNameMap(
                    expected.pieces
                );


            actual.pieces.forEach(
                piece => {

                    const sourcePiece =
                        expectedMap.get(
                            String(
                                piece.name
                            )
                        );


                    if (
                        !sourcePiece
                    ) {

                        return;

                    }


                    /*
                     * Marker/exporters may close polygons
                     * by repeating the first point.
                     */

                    const sourceCount =
                        sourcePiece.pointCount;


                    const actualCount =
                        piece.pointCount;


                    const difference =
                        Math.abs(

                            actualCount -
                            sourceCount

                        );


                    if (
                        difference > 1
                    ) {

                        warnings.push(

                            `Point count "${piece.name}" ` +
                            `berubah dari ${sourceCount} ` +
                            `menjadi ${actualCount}.`

                        );

                    }

                }
            );

        }


        /* ----------------------------------------------------
           BOUNDS
           ---------------------------------------------------- */

        if (
            options.checkBounds
        ) {

            expected.pieces.forEach(
                piece => {

                    if (
                        piece.bounds.width <= 0 ||
                        piece.bounds.height <= 0
                    ) {

                        errors.push(

                            `Source piece "${piece.name}" ` +
                            "memiliki bounds invalid."

                        );

                    }

                }
            );


            actual.pieces.forEach(
                piece => {

                    if (
                        piece.bounds.width <= 0 ||
                        piece.bounds.height <= 0
                    ) {

                        errors.push(

                            `Output piece "${piece.name}" ` +
                            "memiliki bounds invalid."

                        );

                    }

                }
            );

        }


        return {

            valid:
                errors.length ===
                0,

            errors,

            warnings

        };

    }


    /* ========================================================
       BUILD OUTPUT SNAPSHOT
       ======================================================== */

    function snapshotOutput(
        output,
        type
    ) {

        /*
         * Exporter outputs are intentionally represented
         * through the same geometry source used to create
         * the file.
         *
         * This avoids parsing DXF/SVG textual syntax merely
         * for structural verification.
         */

        if (
            type ===
            "marker"
        ) {

            return createMarkerSnapshot(
                output
            );

        }


        return createProductionSnapshot(
            output
        );

    }


    /* ========================================================
       AUDIT PRODUCTION
       ======================================================== */

    function auditProduction(
        source,
        options = {}
    ) {

        const config =
            normalizeOptions(
                options
            );


        const errors =
            [];

        const warnings =
            [];


        const sourceSnapshot =
            createProductionSnapshot(
                source
            );


        /*
         * Generate exporter summaries.
         */

        let dxfSummary;

        let plotterSummary;

        let svgSummary;


        try {

            dxfSummary =
                Dxf.getSummary(

                    source,

                    {

                        sourceType:
                            "production"

                    }

                );

        }
        catch (
            error
        ) {

            errors.push(

                `DXF audit gagal: ${error.message}`

            );

        }


        try {

            plotterSummary =
                Plotter.getSummary(

                    source,

                    {

                        sourceType:
                            "production"

                    }

                );

        }
        catch (
            error
        ) {

            errors.push(

                `Plotter audit gagal: ${error.message}`

            );

        }


        try {

            svgSummary =
                Svg.getSummary(

                    source,

                    {

                        sourceType:
                            "production"

                    }

                );

        }
        catch (
            error
        ) {

            errors.push(

                `SVG audit gagal: ${error.message}`

            );

        }


        /*
         * Cross-export piece count.
         */

        if (
            dxfSummary
        ) {

            if (
                dxfSummary.pieceCount !==
                sourceSnapshot.pieceCount
            ) {

                errors.push(

                    "DXF piece count mismatch."

                );

            }

        }


        if (
            plotterSummary
        ) {

            if (
                plotterSummary.pieceCount !==
                sourceSnapshot.pieceCount
            ) {

                errors.push(

                    "Plotter piece count mismatch."

                );

            }

        }


        if (
            svgSummary
        ) {

            if (
                svgSummary.pieceCount !==
                sourceSnapshot.pieceCount
            ) {

                errors.push(

                    "SVG piece count mismatch."

                );

            }

        }


        return {

            valid:
                errors.length ===
                0,

            version:
                VERSION,

            source:
                sourceSnapshot,

            outputs: {

                dxf:
                    dxfSummary ||
                    null,

                plotter:
                    plotterSummary ||
                    null,

                svg:
                    svgSummary ||
                    null

            },

            errors,

            warnings

        };

    }


    /* ========================================================
       AUDIT MARKER
       ======================================================== */

    function auditMarker(
        source,
        options = {}
    ) {

        const config =
            normalizeOptions(

                {

                    ...options,

                    sourceType:
                        "marker"

                }

            );


        const errors =
            [];

        const warnings =
            [];


        const sourceSnapshot =
            createMarkerSnapshot(
                source
            );


        let dxfSummary;

        let plotterSummary;

        let svgSummary;


        try {

            dxfSummary =
                Dxf.getSummary(

                    source,

                    {

                        sourceType:
                            "marker"

                    }

                );

        }
        catch (
            error
        ) {

            errors.push(

                `DXF marker audit gagal: ${error.message}`

            );

        }


        try {

            plotterSummary =
                Plotter.getSummary(

                    source,

                    {

                        sourceType:
                            "marker"

                    }

                );

        }
        catch (
            error
        ) {

            errors.push(

                `Plotter marker audit gagal: ${error.message}`

            );

        }


        try {

            svgSummary =
                Svg.getSummary(

                    source,

                    {

                        sourceType:
                            "marker"

                    }

                );

        }
        catch (
            error
        ) {

            errors.push(

                `SVG marker audit gagal: ${error.message}`

            );

        }


        const expectedCount =
            sourceSnapshot.pieceCount;


        [
            [
                "DXF",
                dxfSummary
            ],
            [
                "Plotter",
                plotterSummary
            ],
            [
                "SVG",
                svgSummary
            ]

        ]
        .forEach(
            (
                [
                    name,
                    summary
                ]
            ) => {

                if (
                    !summary
                ) {

                    return;

                }


                if (
                    summary.pieceCount !==
                    expectedCount
                ) {

                    errors.push(

                        `${name} marker piece count mismatch.`

                    );

                }

            }
        );


        if (
            config.checkUnit &&
            String(
                sourceSnapshot.unit
            )
            .toLowerCase() !==
            String(
                config.expectedUnit
            )
            .toLowerCase()
        ) {

            errors.push(

                `Marker unit "${sourceSnapshot.unit}" ` +
                `tidak sesuai "${config.expectedUnit}".`

            );

        }


        return {

            valid:
                errors.length ===
                0,

            version:
                VERSION,

            source:
                sourceSnapshot,

            outputs: {

                dxf:
                    dxfSummary ||
                    null,

                plotter:
                    plotterSummary ||
                    null,

                svg:
                    svgSummary ||
                    null

            },

            errors,

            warnings

        };

    }


    /* ========================================================
       FULL AUDIT
       ======================================================== */

    function audit(
        source,
        options = {}
    ) {

        const config =
            normalizeOptions(
                options
            );


        if (
            config.sourceType ===
            "marker"
        ) {

            return auditMarker(

                source,

                config

            );

        }


        return auditProduction(

            source,

            config

        );

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        source,
        options = {}
    ) {

        const report =
            audit(

                source,

                options

            );


        console.group(
            "PatternMaker Output Audit"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Valid:",
            report.valid
        );


        console.log(
            "Errors:",
            report.errors
        );


        console.log(
            "Warnings:",
            report.warnings
        );


        console.log(
            "Source:",
            report.source
        );


        console.log(
            "Outputs:",
            report.outputs
        );


        console.groupEnd();


        return report;

    }


    /* ========================================================
       ASSERT
       ======================================================== */

    function assert(
        source,
        options = {}
    ) {

        const report =
            audit(

                source,

                options

            );


        if (
            !report.valid
        ) {

            throw new Error(

                report.errors.join(
                    " | "
                )

            );

        }


        return true;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerOutputAudit = {

        VERSION,

        DEFAULT_OPTIONS,

        getBounds,

        hasFinitePoints,

        createPieceSnapshot,

        createProductionSnapshot,

        createMarkerSnapshot,

        compareSnapshots,

        auditProduction,

        auditMarker,

        audit,

        debug,

        assert

    };


})();
