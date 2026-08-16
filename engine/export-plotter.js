/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 82
 *
 * FILE:
 *   engine/export-plotter.js
 * ============================================================
 *
 * HPGL PLOTTER EXPORTER
 *
 * Supports:
 *
 *   Production Pattern
 *   Marker / Nesting Result
 *
 * Internal geometry:
 *   cm
 *
 * Output:
 *   HPGL plotter units
 *
 * ============================================================
 *
 * IMPORTANT
 *
 * Exporter TIDAK:
 *
 * - mengubah drafting
 * - menambah seam
 * - melakukan nesting
 * - memperbaiki geometry
 *
 * Ia hanya melakukan:
 *
 *   cm → plotter units
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    const ProductionValidator =
        window.PatternMakerProductionValidator;

    const NestingValidator =
        window.PatternMakerNestingValidator;


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    const HPGL_VERSION =
        "HPGL-1";


    /* ========================================================
       DEFAULTS
       ======================================================== */

    const DEFAULT_OPTIONS = {

        unitsPerCm:
            40,

        sourceType:
            "production",

        validateBeforeExport:
            true,

        requireProductionPass:
            false,

        requireNestingPass:
            false,

        includeMarkerBoundary:
            true,

        penSelect:
            1,

        autoPenUp:
            true,

        precision:
            0,

        originX:
            0,

        originY:
            0,

        invertY:
            false

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
       ROUND
       ======================================================== */

    function round(
        value,
        precision
    ) {

        const factor =
            10 ** precision;


        return Math.round(
            num(value) *
            factor
        ) /
        factor;

    }


    /* ========================================================
       POINT VALIDATION
       ======================================================== */

    function validatePoints(
        points
    ) {

        return (

            Array.isArray(
                points
            )

            &&

            points.length >=
            2

            &&

            points.every(
                point =>

                    Array.isArray(
                        point
                    )

                    &&

                    Number.isFinite(
                        Number(
                            point[0]
                        )
                    )

                    &&

                    Number.isFinite(
                        Number(
                            point[1]
                        )
                    )

            )

        );

    }


    /* ========================================================
       CLOSE POLYGON
       ======================================================== */

    function closePoints(
        points
    ) {

        if (
            !Array.isArray(
                points
            ) ||
            points.length ===
            0
        ) {

            return [];

        }


        const result =
            points.map(
                point => [

                    num(
                        point[0]
                    ),

                    num(
                        point[1]
                    )

                ]
            );


        const first =
            result[0];


        const last =
            result[
                result.length - 1
            ];


        if (
            Math.abs(
                first[0] -
                last[0]
            ) > 1e-9

            ||

            Math.abs(
                first[1] -
                last[1]
            ) > 1e-9
        ) {

            result.push([

                first[0],

                first[1]

            ]);

        }


        return result;

    }


    /* ========================================================
       UNIT CONVERSION
       ======================================================== */

    function cmToPlotter(
        value,
        options
    ) {

        return Math.round(

            num(value) *
            num(
                options.unitsPerCm,
                DEFAULT_OPTIONS.unitsPerCm
            )

        );

    }


    /* ========================================================
       TRANSFORM POINT
       ======================================================== */

    function transformPoint(
        point,
        options
    ) {

        let x =
            num(
                point[0]
            );


        let y =
            num(
                point[1]
            );


        if (
            options.invertY
        ) {

            y =
                -y;

        }


        return [

            cmToPlotter(
                x +
                options.originX,

                options
            ),

            cmToPlotter(
                y +
                options.originY,

                options
            )

        ];

    }


    /* ========================================================
       HPGL HEADER
       ======================================================== */

    function createHeader(
        options
    ) {

        return [

            "IN;",
            `SP${num(options.penSelect, 1)};`

        ];

    }


    /* ========================================================
       MOVE
       ======================================================== */

    function penUp(
        point
    ) {

        return (

            `PU${point[0]},${point[1]};`

        );

    }


    function penDown(
        point
    ) {

        return (

            `PD${point[0]},${point[1]};`

        );

    }


    /* ========================================================
       POLYGON
       ======================================================== */

    function createPolygonCommands(
        points,
        options
    ) {

        const closed =
            closePoints(
                points
            );


        if (
            closed.length <
            2
        ) {

            throw new Error(
                "Polygon membutuhkan minimal dua titik."
            );

        }


        const commands = [];


        const first =
            transformPoint(
                closed[0],
                options
            );


        commands.push(

            penUp(
                first
            ),

            penDown(
                first
            )

        );


        for (
            let i = 1;
            i < closed.length;
            i++
        ) {

            const current =
                transformPoint(

                    closed[i],

                    options

                );


            commands.push(

                `${current[0]},${current[1]},`

            );

        }


        /*
         * HPGL PD supports coordinate pairs
         * separated by commas.
         *
         * We rebuild the command as a single
         * PD sequence for deterministic output.
         */

        const coordinates = [];


        for (
            let i = 1;
            i < closed.length;
            i++
        ) {

            const current =
                transformPoint(

                    closed[i],

                    options

                );


            coordinates.push(

                `${current[0]},${current[1]}`

            );

        }


        /*
         * Replace the preliminary commands with
         * clean HPGL.
         */

        commands.length = 0;


        commands.push(

            penUp(
                first
            ),

            "PD" +
            coordinates.join(",") +
            ";",

            "PU;"

        );


        return commands;

    }


    /* ========================================================
       PRODUCTION PIECES
       ======================================================== */

    function getProductionPieces(
        pattern
    ) {

        if (
            !pattern ||
            !Array.isArray(
                pattern.pieces
            )
        ) {

            throw new Error(
                "Production pattern tidak valid."
            );

        }


        return pattern.pieces.map(
            (
                piece,
                index
            ) => {

                const points =

                    piece.cutPoints

                    ||

                    piece.seamPoints

                    ||

                    piece.points

                    ||

                    [];


                if (
                    !validatePoints(
                        points
                    )
                ) {

                    throw new Error(

                        `Piece ${
                            piece.name ||
                            index + 1
                        } memiliki geometry invalid.`

                    );

                }


                return {

                    id:
                        piece.name ||
                        `PIECE-${index + 1}`,

                    name:
                        piece.name ||
                        `PIECE-${index + 1}`,

                    points:
                        closePoints(
                            points
                        ),

                    metadata:
                        piece.metadata ||
                        {}

                };

            }
        );

    }


    /* ========================================================
       MARKER PLACEMENTS
       ======================================================== */

    function getMarkerPieces(
        marker
    ) {

        if (
            !marker ||
            !Array.isArray(
                marker.placements
            )
        ) {

            throw new Error(
                "Marker result tidak valid."
            );

        }


        return marker.placements.map(
            (
                placement,
                index
            ) => {

                const points =
                    placement.points ||
                    [];


                if (
                    !validatePoints(
                        points
                    )
                ) {

                    throw new Error(

                        `Placement ${
                            placement.name ||
                            index + 1
                        } memiliki geometry invalid.`

                    );

                }


                return {

                    id:
                        placement.id ||
                        `PLACEMENT-${index + 1}`,

                    name:
                        placement.name ||
                        `PLACEMENT-${index + 1}`,

                    points:
                        closePoints(
                            points
                        ),

                    metadata:
                        placement.metadata ||
                        {}

                };

            }
        );

    }


    /* ========================================================
       MARKER BORDER
       ======================================================== */

    function createMarkerBoundary(
        marker,
        options
    ) {

        if (
            !marker ||
            !options.includeMarkerBoundary
        ) {

            return [];

        }


        const width =
            num(
                marker.width
            );


        const length =
            num(
                marker.length
            );


        if (
            width <=
            0 ||
            length <=
            0
        ) {

            throw new Error(
                "Marker dimensions invalid."
            );

        }


        return createPolygonCommands(

            [

                [0, 0],

                [width, 0],

                [width, length],

                [0, length]

            ],

            options

        );

    }


    /* ========================================================
       VALIDATE SOURCE
       ======================================================== */

    function validateSource(
        source,
        type,
        options
    ) {

        if (
            !options.validateBeforeExport
        ) {

            return {

                valid:
                    true,

                errors: [],

                warnings: []

            };

        }


        if (
            type ===
            "production"
        ) {

            if (
                !ProductionValidator
            ) {

                return {

                    valid:
                        false,

                    errors: [

                        "ProductionValidator tidak tersedia."

                    ],

                    warnings: []

                };

            }


            return ProductionValidator
                .validateForProduction(

                    source,

                    {

                        requireCutPoints:
                            true,

                        requireClosed:
                            true,

                        requireSeam:
                            options.requireProductionPass,

                        requireTrueOffset:
                            options.requireProductionPass,

                        allowLegacyRadial:
                            false

                    }

                );

        }


        if (
            type ===
            "marker"
        ) {

            if (
                !NestingValidator
            ) {

                return {

                    valid:
                        false,

                    errors: [

                        "NestingValidator tidak tersedia."

                    ],

                    warnings: []

                };

            }


            return NestingValidator.validate(

                source,

                {

                    requireAllPlaced:
                        options.requireNestingPass,

                    requireInsideMarker:
                        true,

                    checkOverlap:
                        true,

                    checkDuplicateIds:
                        true,

                    respectGrainline:
                        true

                }

            );

        }


        throw new Error(

            `sourceType "${type}" tidak didukung.`

        );

    }


    /* ========================================================
       CREATE PLOTTER DATA
       ======================================================== */

    function createPlotter(
        source,
        options = {}
    ) {

        const config =
            normalizeOptions(
                options
            );


        const type =
            config.sourceType ||
            "production";


        const validation =
            validateSource(

                source,

                type,

                config

            );


        if (
            !validation.valid
        ) {

            throw new Error(

                "Plotter export dibatalkan: " +

                validation.errors.join(
                    " | "
                )

            );

        }


        const commands = [

            ...createHeader(
                config
            )

        ];


        /*
         * Marker boundary.
         */

        if (
            type ===
            "marker"
        ) {

            commands.push(

                ...createMarkerBoundary(

                    source.marker,

                    config

                )

            );

        }


        /*
         * Geometry.
         */

        const pieces =

            type ===
            "marker"

                ? getMarkerPieces(
                    source
                  )

                : getProductionPieces(
                    source
                  );


        pieces.forEach(
            piece => {

                commands.push(

                    ...createPolygonCommands(

                        piece.points,

                        config

                    )

                );

            }
        );


        /*
         * End plotter.
         */

        commands.push(

            "SP0;",
            "IN;"

        );


        return {

            type:
                "plotter-output",

            version:
                VERSION,

            format:
                HPGL_VERSION,

            sourceType:
                type,

            unit:
                "cm",

            unitsPerCm:
                config.unitsPerCm,

            commands,

            text:
                commands.join(
                    "\n"
                ),

            pieceCount:
                pieces.length,

            metadata: {

                source:
                    source.metadata ||
                    {},

                exportedAt:
                    new Date()
                        .toISOString()

            }

        };

    }


    /* ========================================================
       TEXT
       ======================================================== */

    function getText(
        source,
        options = {}
    ) {

        return createPlotter(

            source,

            options

        ).text;

    }


    /* ========================================================
       BLOB
       ======================================================== */

    function createBlob(
        source,
        options = {}
    ) {

        const text =
            getText(

                source,

                options

            );


        return new Blob(

            [
                text

            ],

            {

                type:
                    "application/octet-stream"

            }

        );

    }


    /* ========================================================
       SUMMARY
       ======================================================== */

    function getSummary(
        source,
        options = {}
    ) {

        const output =
            createPlotter(

                source,

                {

                    ...options,

                    validateBeforeExport:
                        false

                }

            );


        return {

            version:
                VERSION,

            format:
                HPGL_VERSION,

            sourceType:
                output.sourceType,

            pieceCount:
                output.pieceCount,

            unit:
                output.unit,

            unitsPerCm:
                output.unitsPerCm

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerPlotterExporter = {

        VERSION,

        HPGL_VERSION,

        DEFAULT_OPTIONS,

        cmToPlotter,

        transformPoint,

        closePoints,

        validatePoints,

        createPolygonCommands,

        createMarkerBoundary,

        getProductionPieces,

        getMarkerPieces,

        validateSource,

        createPlotter,

        getText,

        createBlob,

        getSummary

    };


})();
