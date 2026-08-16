/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 81
 *
 * FILE:
 *   engine/export-dxf.js
 * ============================================================
 *
 * DXF R12 ASCII EXPORTER
 *
 * Supports:
 *
 * 1. Production Pattern
 *      piece.cutPoints
 *
 * 2. Marker / Nesting Result
 *      placement.points
 *
 * ============================================================
 *
 * IMPORTANT:
 *
 * Exporter TIDAK:
 *
 * - memperbaiki polygon
 * - menambah seam
 * - melakukan nesting
 * - mengubah skala geometry
 *
 * Exporter hanya serializes geometry.
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
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


    /* ========================================================
       CONSTANTS
       ======================================================== */

    const DXF_VERSION =
        "AC1009";


    const DEFAULT_OPTIONS = {

        unit:
            "CM",

        layer:
            "CUT",

        includeLabels:
            false,

        includeMarkerBoundary:
            true,

        validateBeforeExport:
            true,

        requireProductionPass:
            false,

        requireNestingPass:
            false,

        precision:
            4

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
       NORMALIZE OPTIONS
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
       ESCAPE TEXT
       ======================================================== */

    function cleanText(
        value
    ) {

        return String(
            value ?? ""
        )
        .replace(
            /[\r\n]+/g,
            " "
        );

    }


    /* ========================================================
       POINT VALIDATION
       ======================================================== */

    function validatePoints(
        points
    ) {

        if (
            !Array.isArray(points) ||
            points.length <
            2
        ) {

            return false;

        }


        return points.every(
            point =>

                Array.isArray(point) &&

                Number.isFinite(
                    Number(point[0])
                ) &&

                Number.isFinite(
                    Number(point[1])
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
            !Array.isArray(points) ||
            points.length === 0
        ) {

            return [];

        }


        const result =
            points.map(
                point => [

                    num(point[0]),

                    num(point[1])

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
       BOUNDS
       ======================================================== */

    function getBounds(
        points
    ) {

        if (
            !Array.isArray(points) ||
            points.length === 0
        ) {

            return {

                minX: 0,
                minY: 0,
                maxX: 0,
                maxY: 0,
                width: 0,
                height: 0

            };

        }


        const xs =
            points.map(
                point =>
                    num(point[0])
            );


        const ys =
            points.map(
                point =>
                    num(point[1])
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
       DXF HEADER
       ======================================================== */

    function createHeader() {

        return [

            "0",
            "SECTION",

            "2",
            "HEADER",

            "9",
            "$ACADVER",

            "1",
            DXF_VERSION,

            "0",
            "ENDSEC"

        ];

    }


    /* ========================================================
       TABLE SECTION
       ======================================================== */

    function createTables() {

        return [

            "0",
            "SECTION",

            "2",
            "TABLES",

            "0",
            "TABLE",

            "2",
            "LAYER",

            "70",
            "1",

            "0",
            "LAYER",

            "2",
            "CUT",

            "70",
            "0",

            "62",
            "7",

            "6",
            "CONTINUOUS",

            "0",
            "ENDTAB",

            "0",
            "ENDSEC"

        ];

    }


    /* ========================================================
       LWPOLYLINE
       ======================================================== */

    function createPolylineEntity(
        points,
        options
    ) {

        const closedPoints =
            closePoints(
                points
            );


        if (
            closedPoints.length <
            3
        ) {

            throw new Error(
                "Polyline membutuhkan minimal 2 titik."
            );

        }


        const lines = [

            "0",
            "LWPOLYLINE",

            "8",
            cleanText(
                options.layer
            ),

            "90",
            String(
                closedPoints.length - 1
            ),

            "70",
            "1"

        ];


        for (
            let i = 0;
            i <
            closedPoints.length - 1;
            i++
        ) {

            const [
                x,
                y
            ] =
                closedPoints[i];


            lines.push(

                "10",

                String(
                    round(
                        x,
                        options.precision
                    )
                ),

                "20",

                String(
                    round(
                        y,
                        options.precision
                    )
                )

            );

        }


        return lines;

    }


    /* ========================================================
       TEXT ENTITY
       ======================================================== */

    function createTextEntity(
        text,
        x,
        y,
        options
    ) {

        return [

            "0",
            "TEXT",

            "8",
            cleanText(
                options.layer
            ),

            "10",
            String(
                round(
                    x,
                    options.precision
                )
            ),

            "20",
            String(
                round(
                    y,
                    options.precision
                )
            ),

            "40",
            String(
                round(
                    options.textHeight,
                    options.precision
                )
            ),

            "1",
            cleanText(
                text
            )

        ];

    }


    /* ========================================================
       MARKER BOUNDARY
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
            width <= 0 ||
            length <= 0
        ) {

            throw new Error(
                "Marker dimensions invalid."
            );

        }


        return createPolylineEntity(

            [

                [0, 0],

                [width, 0],

                [width, length],

                [0, length]

            ],

            {

                ...options,

                layer:
                    "MARKER"

            }

        );

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
                    piece.cutPoints ||
                    piece.seamPoints ||
                    piece.points ||
                    [];


                if (
                    !validatePoints(
                        points
                    )
                ) {

                    throw new Error(

                        `Piece ${piece.name || index + 1} ` +
                        "tidak memiliki geometry valid."

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
       NESTED PLACEMENTS
       ======================================================== */

    function getNestedPieces(
        nesting
    ) {

        if (
            !nesting ||
            !Array.isArray(
                nesting.placements
            )
        ) {

            throw new Error(
                "Nesting result tidak valid."
            );

        }


        return nesting.placements.map(
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

                        `Placement ${placement.name || index + 1} ` +
                        "tidak memiliki geometry valid."

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
       VALIDATE INPUT
       ======================================================== */

    function validateExportSource(
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


        return {

            valid:
                true,

            errors: [],

            warnings: []

        };

    }


    /* ========================================================
       CREATE DXF
       ======================================================== */

    function createDxf(
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
            validateExportSource(

                source,

                type,

                config

            );


        if (
            !validation.valid
        ) {

            throw new Error(

                "Export dibatalkan: " +

                validation.errors.join(
                    " | "
                )

            );

        }


        const sections = [];


        sections.push(
            ...createHeader()
        );


        sections.push(
            ...createTables()
        );


        sections.push(

            "0",
            "SECTION",

            "2",
            "ENTITIES"

        );


        /*
         * Marker.
         */

        if (
            type ===
            "marker"
        ) {

            sections.push(

                ...createMarkerBoundary(

                    source.marker,

                    config

                )

            );

        }


        /*
         * Pieces.
         */

        const pieces =

            type ===
            "marker"

                ? getNestedPieces(
                    source
                  )

                : getProductionPieces(
                    source
                  );


        pieces.forEach(
            piece => {

                sections.push(

                    ...createPolylineEntity(

                        piece.points,

                        {

                            ...config,

                            layer:
                                config.layer

                        }

                    )

                );


                if (
                    config.includeLabels
                ) {

                    const bounds =
                        getBounds(
                            piece.points
                        );


                    sections.push(

                        ...createTextEntity(

                            piece.name,

                            bounds.minX,

                            bounds.minY,

                            {

                                ...config,

                                textHeight:
                                    3

                            }

                        )

                    );

                }

            }
        );


        sections.push(

            "0",
            "ENDSEC",

            "0",
            "EOF"

        );


        return sections.join(
            "\n"
        );

    }


    /* ========================================================
       BLOB
       ======================================================== */

    function createBlob(
        source,
        options = {}
    ) {

        const dxf =
            createDxf(

                source,

                options

            );


        return new Blob(

            [
                dxf

            ],

            {

                type:
                    "application/dxf"

            }

        );

    }


    /* ========================================================
       TEXT OUTPUT
       ======================================================== */

    function getText(
        source,
        options = {}
    ) {

        return createDxf(

            source,

            options

        );

    }


    /* ========================================================
       SUMMARY
       ======================================================== */

    function getSummary(
        source,
        options = {}
    ) {

        const type =
            options.sourceType ||
            "production";


        const pieces =

            type ===
            "marker"

                ? source?.placements ||
                  []

                : source?.pieces ||
                  [];


        return {

            version:
                VERSION,

            sourceType:
                type,

            pieceCount:
                pieces.length,

            unit:
                options.unit ||
                "CM",

            dxfVersion:
                DXF_VERSION

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerDxfExporter = {

        VERSION,

        DXF_VERSION,

        DEFAULT_OPTIONS,

        getBounds,

        validatePoints,

        createPolylineEntity,

        createMarkerBoundary,

        getProductionPieces,

        getNestedPieces,

        validateExportSource,

        createDxf,

        createBlob,

        getText,

        getSummary

    };


})();
