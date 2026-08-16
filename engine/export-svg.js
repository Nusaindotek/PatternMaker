```javascript id="83svg"
(function () {

    "use strict";


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    const DEFAULT_OPTIONS = {

        sourceType:
            "production",

        validateBeforeExport:
            true,

        requireProductionPass:
            false,

        requireNestingPass:
            false,

        includeCut:
            true,

        includeSeam:
            false,

        includeGrainline:
            true,

        includeNotches:
            true,

        includeLabels:
            true,

        includeMarker:
            true,

        includeMetadata:
            true,

        precision:
            3,

        strokeWidth:
            0.4,

        seamStrokeWidth:
            0.25,

        grainlineStrokeWidth:
            0.25,

        notchStrokeWidth:
            0.35,

        labelFontSize:
            3,

        padding:
            10

    };


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    const ProductionValidator =
        window.PatternMakerProductionValidator;

    const NestingValidator =
        window.PatternMakerNestingValidator;


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
        precision
    ) {

        const factor =
            10 ** precision;


        return (

            Math.round(
                num(value) *
                factor
            )
            /
            factor

        );

    }


    /* ========================================================
       ESCAPE
       ======================================================== */

    function escapeXml(
        value
    ) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&apos;"
        );

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
       CLONE POINTS
       ======================================================== */

    function clonePoints(
        points
    ) {

        return (
            points ||
            []
        )
        .map(
            point => [

                num(point?.[0]),

                num(point?.[1])

            ]
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
       CLOSE
       ======================================================== */

    function closePoints(
        points
    ) {

        const result =
            clonePoints(
                points
            );


        if (
            result.length < 2
        ) {

            return result;

        }


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
       PATH
       ======================================================== */

    function pointsToPath(
        points,
        precision
    ) {

        const closed =
            closePoints(
                points
            );


        if (
            closed.length === 0
        ) {

            return "";

        }


        const commands = [

            `M ${round(
                closed[0][0],
                precision
            )} ${round(
                closed[0][1],
                precision
            )}`

        ];


        for (
            let i = 1;
            i < closed.length;
            i++
        ) {

            commands.push(

                `L ${round(
                    closed[i][0],
                    precision
                )} ${round(
                    closed[i][1],
                    precision
                )} ${""}`

            );

        }


        commands.push(
            "Z"
        );


        return commands.join(
            " "
        );

    }


    /* ========================================================
       LINE
       ======================================================== */

    function lineElement(
        a,
        b,
        className,
        strokeWidth,
        precision
    ) {

        return (

            `<line ` +

            `class="${escapeXml(
                className
            )}" ` +

            `x1="${round(
                a[0],
                precision
            )}" ` +

            `y1="${round(
                a[1],
                precision
            )}" ` +

            `x2="${round(
                b[0],
                precision
            )}" ` +

            `y2="${round(
                b[1],
                precision
            )}" ` +

            `stroke="currentColor" ` +

            `stroke-width="${strokeWidth}" ` +

            `fill="none" ` +

            `vector-effect="non-scaling-stroke"` +

            `/>`

        );

    }


    /* ========================================================
       GRAINLINE
       ======================================================== */

    function renderGrainline(
        piece,
        options
    ) {

        if (
            !options.includeGrainline
        ) {

            return "";

        }


        const grainline =
            piece?.grainline;


        if (
            !Array.isArray(
                grainline
            ) ||
            grainline.length <
            2
        ) {

            return "";

        }


        const first =
            grainline[0];


        const last =
            grainline[
                grainline.length - 1
            ];


        return lineElement(

            first,

            last,

            "grainline",

            options.grainlineStrokeWidth,

            options.precision

        );

    }


    /* ========================================================
       NOTCHES
       ======================================================== */

    function renderNotches(
        piece,
        options
    ) {

        if (
            !options.includeNotches
        ) {

            return "";

        }


        const notches =
            piece?.notches;


        if (
            !Array.isArray(
                notches
            ) ||
            notches.length === 0
        ) {

            return "";

        }


        const elements = [];


        notches.forEach(
            notch => {

                if (
                    !Array.isArray(
                        notch
                    ) ||
                    notch.length <
                    2
                ) {

                    return;

                }


                const x =
                    num(
                        notch[0]
                    );


                const y =
                    num(
                        notch[1]
                    );


                const size =
                    1.5;


                elements.push(

                    lineElement(

                        [
                            x,
                            y
                        ],

                        [
                            x,
                            y + size
                        ],

                        "notch",

                        options.notchStrokeWidth,

                        options.precision

                    )

                );

            }
        );


        return elements.join(
            ""
        );

    }


    /* ========================================================
       LABEL
       ======================================================== */

    function renderLabel(
        piece,
        options
    ) {

        if (
            !options.includeLabels
        ) {

            return "";

        }


        const points =
            piece?.cutPoints ||

            piece?.points ||

            [];


        const bounds =
            getBounds(
                points
            );


        const x =
            bounds.minX +
            bounds.width /
            2;


        const y =
            bounds.minY +
            bounds.height /
            2;


        const label =
            piece?.name ||
            "PIECE";


        return (

            `<text ` +

            `class="piece-label" ` +

            `x="${round(
                x,
                options.precision
            )}" ` +

            `y="${round(
                y,
                options.precision
            )}" ` +

            `text-anchor="middle" ` +

            `font-size="${num(
                options.labelFontSize,
                3
            )}" ` +

            `fill="currentColor"` +

            `>` +

            escapeXml(
                label
            ) +

            `</text>`

        );

    }


    /* ========================================================
       CUT LAYER
       ======================================================== */

    function renderCut(
        piece,
        options
    ) {

        if (
            !options.includeCut
        ) {

            return "";

        }


        const points =
            piece?.cutPoints ||

            piece?.points ||

            [];


        if (
            points.length < 3
        ) {

            return "";

        }


        return (

            `<path ` +

            `class="cut" ` +

            `d="${escapeXml(
                pointsToPath(
                    points,
                    options.precision
                )
            )}" ` +

            `fill="none" ` +

            `stroke="currentColor" ` +

            `stroke-width="${num(
                options.strokeWidth,
                0.4
            )}" ` +

            `vector-effect="non-scaling-stroke"` +

            `/>`

        );

    }


    /* ========================================================
       SEAM LAYER
       ======================================================== */

    function renderSeam(
        piece,
        options
    ) {

        if (
            !options.includeSeam
        ) {

            return "";

        }


        const points =
            piece?.seamPoints ||

            piece?.points ||

            [];


        if (
            points.length < 3
        ) {

            return "";

        }


        return (

            `<path ` +

            `class="seam" ` +

            `d="${escapeXml(
                pointsToPath(
                    points,
                    options.precision
                )
            )}" ` +

            `fill="none" ` +

            `stroke="currentColor" ` +

            `stroke-width="${num(
                options.seamStrokeWidth,
                0.25
            )}" ` +

            `stroke-dasharray="2 1" ` +

            `vector-effect="non-scaling-stroke"` +

            `/>`

        );

    }


    /* ========================================================
       PIECE
       ======================================================== */

    function renderPiece(
        piece,
        options
    ) {

        const parts = [];


        parts.push(

            renderCut(
                piece,
                options
            )

        );


        parts.push(

            renderSeam(
                piece,
                options
            )

        );


        parts.push(

            renderGrainline(
                piece,
                options
            )

        );


        parts.push(

            renderNotches(
                piece,
                options
            )

        );


        parts.push(

            renderLabel(
                piece,
                options
            )

        );


        return parts.join(
            ""
        );

    }


    /* ========================================================
       MARKER BOUNDARY
       ======================================================== */

    function renderMarker(
        marker,
        options
    ) {

        if (
            !options.includeMarker ||
            !marker
        ) {

            return "";

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

            return "";

        }


        return (

            `<rect ` +

            `class="marker-boundary" ` +

            `x="0" ` +

            `y="0" ` +

            `width="${round(
                width,
                options.precision
            )}" ` +

            `height="${round(
                length,
                options.precision
            )}" ` +

            `fill="none" ` +

            `stroke="currentColor" ` +

            `stroke-width="${num(
                options.strokeWidth,
                0.4
            )}" ` +

            `vector-effect="non-scaling-stroke"` +

            `/>`

        );

    }


    /* ========================================================
       PRODUCTION SOURCE
       ======================================================== */

    function normalizeProductionPieces(
        source
    ) {

        if (
            !source ||
            !Array.isArray(
                source.pieces
            )
        ) {

            throw new Error(
                "Production pattern tidak valid."
            );

        }


        return source.pieces;

    }


    /* ========================================================
       MARKER SOURCE
       ======================================================== */

    function normalizeMarkerPieces(
        source
    ) {

        if (
            !source ||
            !Array.isArray(
                source.placements
            )
        ) {

            throw new Error(
                "Marker result tidak valid."
            );

        }


        return source.placements.map(
            placement => ({

                ...placement,

                cutPoints:
                    placement.points ||

                    placement.cutPoints ||

                    []

            })

        );

    }


    /* ========================================================
       VALIDATION
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
                        true

                }

            );

        }


        throw new Error(

            `sourceType "${type}" tidak didukung.`

        );

    }


    /* ========================================================
       METADATA
       ======================================================== */

    function createMetadata(
        source,
        type,
        options
    ) {

        if (
            !options.includeMetadata
        ) {

            return "";

        }


        return [

            "<metadata>",

            escapeXml(

                JSON.stringify({

                    PatternMaker:
                        "Universal",

                    exporter:
                        VERSION,

                    sourceType:
                        type,

                    engine:
                        source?.engine ||
                        null,

                    unit:
                        "cm",

                    exportedAt:
                        new Date()
                            .toISOString()

                })

            ),

            "</metadata>"

        ].join(
            ""
        );

    }


    /* ========================================================
       CREATE SVG
       ======================================================== */

    function createSvg(
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

                "SVG export dibatalkan: " +

                validation.errors.join(
                    " | "
                )

            );

        }


        let pieces;


        let marker =
            null;


        if (
            type ===
            "marker"
        ) {

            pieces =
                normalizeMarkerPieces(
                    source
                );


            marker =
                source.marker ||
                null;

        }
        else {

            pieces =
                normalizeProductionPieces(
                    source
                );

        }


        const allPoints =
            pieces.flatMap(
                piece =>

                    piece.cutPoints ||

                    piece.points ||

                    []

            );


        let bounds =
            getBounds(
                allPoints
            );


        if (
            marker &&
            marker.width > 0 &&
            marker.length > 0
        ) {

            bounds = {

                minX:
                    0,

                minY:
                    0,

                maxX:
                    marker.width,

                maxY:
                    marker.length,

                width:
                    marker.width,

                height:
                    marker.length

            };

        }


        const padding =
            Math.max(
                0,
                num(
                    config.padding
                )
            );


        const viewBoxX =
            bounds.minX -
            padding;


        const viewBoxY =
            bounds.minY -
            padding;


        const viewBoxWidth =
            bounds.width +
            padding *
            2;


        const viewBoxHeight =
            bounds.height +
            padding *
            2;


        const parts = [];


        parts.push(

            `<svg ` +

            `xmlns="http://www.w3.org/2000/svg" ` +

            `version="1.1" ` +

            `viewBox="${round(
                viewBoxX,
                config.precision
            )} ${round(
                viewBoxY,
                config.precision
            )} ${round(
                viewBoxWidth,
                config.precision
            )} ${round(
                viewBoxHeight,
                config.precision
            )}" ` +

            `width="${round(
                viewBoxWidth,
                config.precision
            )}cm" ` +

            `height="${round(
                viewBoxHeight,
                config.precision
            )}cm">`

        );


        parts.push(

            createMetadata(
                source,
                type,
                config
            )

        );


        /*
         * Layer: marker
         */

        if (
            marker &&
            config.includeMarker
        ) {

            parts.push(

                `<g id="marker-layer">`,

                renderMarker(
                    marker,
                    config
                ),

                "</g>"

            );

        }


        /*
         * Layer: pieces
         */

        parts.push(

            `<g id="pattern-layer">`

        );


        pieces.forEach(
            piece => {

                parts.push(

                    `<g ` +

                    `id="${escapeXml(
                        piece.name ||
                        "piece"
                    )}" ` +

                    `data-piece="${escapeXml(
                        piece.name ||
                        ""
                    )}">`

                );


                parts.push(

                    renderPiece(
                        piece,
                        config
                    )

                );


                parts.push(
                    "</g>"
                );

            }
        );


        parts.push(
            "</g>"
        );


        parts.push(
            "</svg>"
        );


        return parts.join(
            ""
        );

    }


    /* ========================================================
       BLOB
       ======================================================== */

    function createBlob(
        source,
        options = {}
    ) {

        const svg =
            createSvg(
                source,
                options
            );


        return new Blob(

            [
                svg

            ],

            {

                type:
                    "image/svg+xml;charset=utf-8"

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
                "cm"

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerSvgExporter = {

        VERSION,

        DEFAULT_OPTIONS,

        escapeXml,

        getBounds,

        closePoints,

        pointsToPath,

        renderCut,

        renderSeam,

        renderGrainline,

        renderNotches,

        renderLabel,

        renderPiece,

        renderMarker,

        validateSource,

        createSvg,

        createBlob,

        getSummary

    };


})();
```
