/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 78
 *
 * FILE:
 *   engine/nesting-svg-renderer.js
 * ============================================================
 *
 * RESPONSIBILITY:
 *
 *   Nesting Result
 *        ↓
 *   Nesting Preview Model
 *        ↓
 *   SVG Marker
 *
 * ============================================================
 *
 * TIDAK melakukan:
 *
 * - nesting
 * - grading
 * - seam calculation
 * - geometry modification
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const Preview =
        window.PatternMakerNestingPreview;


    if (
        !Preview
    ) {

        throw new Error(
            "nesting-preview.js harus dimuat sebelum nesting-svg-renderer.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


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
       ESCAPE XML
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
       DEFAULT OPTIONS
       ======================================================== */

    const DEFAULT_OPTIONS = {

        background:
            "none",

        markerStrokeWidth:
            1,

        pieceStrokeWidth:
            0.5,

        showPieceLabels:
            true,

        showGrainline:
            true,

        showEfficiency:
            true,

        showMarkerDimensions:
            true,

        showUnplaced:
            true,

        labelFontSize:
            3.5,

        dimensionFontSize:
            3,

        margin:
            10

    };


    /* ========================================================
       MERGE OPTIONS
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
       GET MARKER MODEL
       ======================================================== */

    function normalizeModel(
        value
    ) {

        /*
         * Accept:
         *
         * preview model
         * OR
         * raw nesting result
         */

        if (
            value?.model &&
            value?.svg
        ) {

            return value.model;

        }


        if (
            value?.marker &&
            Array.isArray(
                value.placements
            )
        ) {

            return value;

        }


        throw new Error(
            "Nesting preview model tidak valid."
        );

    }


    /* ========================================================
       COLOR CLASS
       ======================================================== */

    function pieceClass(
        placement,
        index
    ) {

        /*
         * Deterministic classes.
         * Styling can be controlled externally.
         */

        return (

            "pm-piece-" +
            (
                index % 12
            )

        );

    }


    /* ========================================================
       RENDER MARKER RECT
       ======================================================== */

    function renderMarker(
        svgModel
    ) {

        const marker =
            svgModel.marker;


        return [

            `<rect `,

            `class="pm-marker" `,

            `x="${num(marker.x)}" `,

            `y="${num(marker.y)}" `,

            `width="${num(marker.width)}" `,

            `height="${num(marker.height)}" `,

            `fill="none" `,

            `stroke="currentColor" `,

            `stroke-width="${num(marker.strokeWidth, 1)}"`,

            `/>`

        ].join("");

    }


    /* ========================================================
       RENDER PIECE
       ======================================================== */

    function renderPiece(
        placement,
        index,
        options
    ) {

        const path =
            escapeXml(
                placement.path
            );


        const className =
            pieceClass(
                placement,
                index
            );


        const labelX =
            num(
                placement.bounds?.minX,
                0
            );


        const labelY =
            num(
                placement.bounds?.minY,
                0
            );


        const parts = [];


        parts.push(

            `<path ` +

            `class="${className} pm-piece" ` +

            `data-piece-id="${escapeXml(
                placement.id
            )}" ` +

            `data-piece-name="${escapeXml(
                placement.name
            )}" ` +

            `data-rotation="${num(
                placement.rotation
            )}" ` +

            `d="${path}" ` +

            `fill="none" ` +

            `stroke="currentColor" ` +

            `stroke-width="${num(
                options.pieceStrokeWidth,
                0.5
            )}" ` +

            `vector-effect="non-scaling-stroke"` +

            `/>`

        );


        if (
            options.showPieceLabels
        ) {

            parts.push(

                `<text ` +

                `class="pm-piece-label" ` +

                `x="${labelX}" ` +

                `y="${labelY}" ` +

                `font-size="${num(
                    options.labelFontSize,
                    3.5
                )}" ` +

                `fill="currentColor"` +

                `>` +

                escapeXml(
                    placement.name
                ) +

                `</text>`

            );

        }


        if (
            options.showGrainline
        ) {

            const metadata =
                placement.metadata ||
                {};


            const grainline =
                metadata.grainline;


            if (
                Array.isArray(
                    grainline
                ) &&
                grainline.length >=
                2
            ) {

                const a =
                    grainline[0];


                const b =
                    grainline[
                        grainline.length - 1
                    ];


                parts.push(

                    `<line ` +

                    `class="pm-grainline" ` +

                    `x1="${num(a[0])}" ` +

                    `y1="${num(a[1])}" ` +

                    `x2="${num(b[0])}" ` +

                    `y2="${num(b[1])}" ` +

                    `stroke="currentColor" ` +

                    `stroke-width="0.35" ` +

                    `stroke-dasharray="2 1"` +

                    `/>`

                );

            }

        }


        return parts.join(
            ""
        );

    }


    /* ========================================================
       DIMENSION HORIZONTAL
       ======================================================== */

    function renderHorizontalDimension(
        x,
        y,
        width,
        label,
        options
    ) {

        const parts = [];


        const textY =
            y -
            2;


        parts.push(

            `<line ` +

            `class="pm-dimension" ` +

            `x1="${num(x)}" ` +

            `y1="${num(y)}" ` +

            `x2="${num(x + width)}" ` +

            `y2="${num(y)}" ` +

            `stroke="currentColor" ` +

            `stroke-width="0.35"` +

            `/>`

        );


        parts.push(

            `<text ` +

            `class="pm-dimension-label" ` +

            `x="${num(
                x +
                width /
                2
            )}" ` +

            `y="${num(textY)}" ` +

            `text-anchor="middle" ` +

            `font-size="${num(
                options.dimensionFontSize,
                3
            )}" ` +

            `fill="currentColor"` +

            `>` +

            escapeXml(
                label
            ) +

            `</text>`

        );


        return parts.join(
            ""
        );

    }


    /* ========================================================
       DIMENSION VERTICAL
       ======================================================== */

    function renderVerticalDimension(
        x,
        y,
        height,
        label,
        options
    ) {

        const parts = [];


        parts.push(

            `<line ` +

            `class="pm-dimension" ` +

            `x1="${num(x)}" ` +

            `y1="${num(y)}" ` +

            `x2="${num(x)}" ` +

            `y2="${num(y + height)}" ` +

            `stroke="currentColor" ` +

            `stroke-width="0.35"` +

            `/>`

        );


        parts.push(

            `<text ` +

            `class="pm-dimension-label" ` +

            `x="${num(
                x + 2
            )}" ` +

            `y="${num(
                y +
                height /
                2
            )}" ` +

            `font-size="${num(
                options.dimensionFontSize,
                3
            )}" ` +

            `fill="currentColor"` +

            `transform="rotate(90 ${num(
                x + 2
            )} ${num(
                y +
                height /
                2
            )})"` +

            `>` +

            escapeXml(
                label
            ) +

            `</text>`

        );


        return parts.join(
            ""
        );

    }


    /* ========================================================
       EFFICIENCY
       ======================================================== */

    function renderEfficiency(
        svgModel,
        options
    ) {

        if (
            !options.showEfficiency
        ) {

            return "";

        }


        const efficiency =
            num(
                svgModel.efficiency
            );


        return (

            `<text ` +

            `class="pm-efficiency" ` +

            `x="${num(
                svgModel.marker.x
            )}" ` +

            `y="${num(
                svgModel.marker.y
            ) - 5}" ` +

            `font-size="4" ` +

            `fill="currentColor"` +

            `>` +

            `escapeXml(
                `Efficiency: ${efficiency.toFixed(2)}%`
            ) +

            `</text>`

        );

    }


    /* ========================================================
       UNPLACED
       ======================================================== */

    function renderUnplaced(
        model,
        options
    ) {

        if (
            !options.showUnplaced ||
            !Array.isArray(
                model.unplaced
            ) ||
            model.unplaced.length ===
            0
        ) {

            return "";

        }


        const marker =
            model.marker;


        const x =
            num(
                marker.width
            )
            +
            num(
                model.viewport?.padding,
                10
            )
            +
            10;


        const y =
            num(
                model.viewport?.padding,
                10
            );


        const lines = [

            `<g class="pm-unplaced">`,

            `<text ` +
            `x="${x}" ` +
            `y="${y}" ` +
            `font-size="4" ` +
            `fill="currentColor">` +

            `Unplaced`

            +

            `</text>`

        ];


        model.unplaced.forEach(
            (
                item,
                index
            ) => {

                lines.push(

                    `<text ` +

                    `x="${x}" ` +

                    `y="${y + 6 + index * 5}" ` +

                    `font-size="3" ` +

                    `fill="currentColor">` +

                    escapeXml(
                        item.name
                    )

                    +

                    `</text>`

                );

            }
        );


        lines.push(
            "</g>"
        );


        return lines.join(
            ""
        );

    }


    /* ========================================================
       SVG
       ======================================================== */

    function renderSvg(
        input,
        options = {}
    ) {

        const config =
            normalizeOptions(
                options
            );


        const model =
            normalizeModel(
                input
            );


        const fitted =
            model.viewport

                ? model

                : Preview.fitToViewport(

                    model,

                    {

                        width:
                            options.width ||
                            1200,

                        height:
                            options.height ||
                            800,

                        padding:
                            options.padding ||
                            30

                    }

                );


        const svgModel =
            Preview.createSvgModel(
                fitted
            );


        const width =
            num(
                svgModel.width,
                1200
            );


        const height =
            num(
                svgModel.height,
                800
            );


        const parts = [];


        parts.push(

            `<svg ` +

            `xmlns="http://www.w3.org/2000/svg" ` +

            `viewBox="0 0 ${width} ${height}" ` +

            `width="${width}" ` +

            `height="${height}" ` +

            `role="img" ` +

            `aria-label="PatternMaker Marker Preview"` +

            `>`

        );


        parts.push(

            `<g ` +

            `class="pm-marker-layer" ` +

            `fill="${escapeXml(
                config.background
            )}"` +

            `>`

        );


        parts.push(
            `<rect ` +

            `x="0" ` +

            `y="0" ` +

            `width="${width}" ` +

            `height="${height}" ` +

            `fill="${escapeXml(
                config.background
            )}"` +

            `/>`

        );


        parts.push(

            `<rect ` +

            `class="pm-marker" ` +

            `x="${num(
                svgModel.marker.x
            )}" ` +

            `y="${num(
                svgModel.marker.y
            )}" ` +

            `width="${num(
                svgModel.marker.width
            )}" ` +

            `height="${num(
                svgModel.marker.height
            )}" ` +

            `fill="none" ` +

            `stroke="currentColor" ` +

            `stroke-width="${num(
                config.markerStrokeWidth,
                1
            )}"` +

            `/>`

        );


        parts.push(
            "</g>"
        );


        parts.push(

            `<g class="pm-pieces">`

        );


        fitted.placements.forEach(
            (
                placement,
                index
            ) => {

                const screenPath =
                    Preview.createSvgModel({

                        ...fitted,

                        placements: [

                            placement

                        ]

                    })
                    .placements[0]
                    ?.path || "";


                parts.push(

                    `<path ` +

                    `class="${pieceClass(
                        placement,
                        index
                    )} pm-piece" ` +

                    `data-piece-id="${escapeXml(
                        placement.id
                    )}" ` +

                    `data-piece-name="${escapeXml(
                        placement.name
                    )}" ` +

                    `data-rotation="${num(
                        placement.rotation
                    )}" ` +

                    `d="${escapeXml(
                        screenPath
                    )}" ` +

                    `fill="none" ` +

                    `stroke="currentColor" ` +

                    `stroke-width="${num(
                        config.pieceStrokeWidth,
                        0.5
                    )}" ` +

                    `vector-effect="non-scaling-stroke"` +

                    `/>`

                );

            }
        );


        parts.push(
            "</g>"
        );


        /*
         * Labels.
         */

        if (
            config.showPieceLabels
        ) {

            parts.push(
                `<g class="pm-labels">`
            );


            fitted.placements.forEach(
                placement => {

                    const bounds =
                        placement.bounds;


                    const x =
                        fitted.viewport.padding +

                        bounds.minX *
                        fitted.viewport.scale;


                    const y =
                        fitted.viewport.padding +

                        (
                            fitted.marker.height -
                            bounds.minY
                        )
                        *
                        fitted.viewport.scale;


                    parts.push(

                        `<text ` +

                        `class="pm-piece-label" ` +

                        `x="${num(x)}" ` +

                        `y="${num(y)}" ` +

                        `font-size="${num(
                            config.labelFontSize,
                            3.5
                        )}" ` +

                        `fill="currentColor">` +

                        escapeXml(
                            placement.name
                        ) +

                        `</text>`

                    );

                }
            );


            parts.push(
                "</g>"
            );

        }


        /*
         * Dimensions.
         */

        if (
            config.showMarkerDimensions
        ) {

            const marker =
                svgModel.marker;


            parts.push(

                renderHorizontalDimension(

                    marker.x,

                    marker.y -

                    8,

                    marker.width,

                    `${num(
                        fitted.marker.width
                    )} cm`,

                    config

                )

            );


            parts.push(

                renderVerticalDimension(

                    marker.x -

                    8,

                    marker.y,

                    marker.height,

                    `${num(
                        fitted.marker.length
                    )} cm`,

                    config

                )

            );

        }


        /*
         * Efficiency.
         */

        parts.push(

            renderEfficiency(

                svgModel,

                config

            )

        );


        /*
         * Unplaced pieces.
         */

        parts.push(

            renderUnplaced(

                fitted,

                config

            )

        );


        parts.push(
            "</svg>"
        );


        return parts.join(
            ""
        );

    }


    /* ========================================================
       DOWNLOAD DATA
       ======================================================== */

    function getSvgBlob(
        input,
        options = {}
    ) {

        const svg =
            renderSvg(

                input,

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
       RENDER TO DOM
       ======================================================== */

    function renderToElement(
        element,
        input,
        options = {}
    ) {

        if (
            !element
        ) {

            throw new Error(
                "Target SVG element tidak tersedia."
            );

        }


        const svg =
            renderSvg(

                input,

                options

            );


        element.innerHTML =
            svg
            .replace(
                /^<svg[^>]*>/,
                ""
            )
            .replace(
                /<\/svg>$/,
                ""
            );


        return svg;

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        input,
        options = {}
    ) {

        const svg =
            renderSvg(

                input,

                options

            );


        console.group(
            "PatternMaker Nesting SVG Renderer"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "SVG length:",
            svg.length
        );


        console.log(
            svg
        );


        console.groupEnd();


        return svg;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerNestingSvgRenderer = {

        VERSION,

        DEFAULT_OPTIONS,

        escapeXml,

        renderSvg,

        getSvgBlob,

        renderToElement,

        debug

    };


})();
