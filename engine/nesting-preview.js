/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 37 — engine/nesting-preview.js
 * ============================================================
 *
 * FULL MARKER / NESTING PREVIEW
 *
 * Input:
 *     PatternMakerNestingEngine.createNest()
 *
 * Output:
 *     SVG marker preview
 *
 * Unit internal:
 *     cm
 *
 * Prinsip:
 *
 *     nestingResult
 *          ↓
 *     visual marker
 *
 * Preview TIDAK menghitung ulang nesting.
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    const ProductionGeometry =
        window.PatternMakerProductionGeometry;

    const NestingEngine =
        window.PatternMakerNestingEngine;


    if (
        !ProductionGeometry
    ) {

        throw new Error(
            "production-geometry.js belum tersedia."
        );

    }


    if (
        !NestingEngine
    ) {

        throw new Error(
            "nesting-engine.js belum tersedia."
        );

    }


    /* ========================================================
       HELPERS
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


    function round(
        value
    ) {

        return Math.round(
            Number(value) * 1000
        ) / 1000;

    }


    function $(id) {

        return document.getElementById(id);

    }


    /* ========================================================
       SVG NAMESPACE
       ======================================================== */

    const SVG_NS =
        "http://www.w3.org/2000/svg";


    /* ========================================================
       PIECE POINTS
       ======================================================== */

    function getPoints(
        piece
    ) {

        if (
            Array.isArray(piece?.points) &&
            piece.points.length >= 3
        ) {

            return piece.points;

        }


        if (
            Array.isArray(piece?.sourcePiece?.cutPoints) &&
            piece.sourcePiece.cutPoints.length >= 3
        ) {

            return piece.sourcePiece.cutPoints.map(
                point => [

                    num(point[0]) +
                    num(piece.x),

                    num(point[1]) +
                    num(piece.y)

                ]
            );

        }


        return [];

    }


    /* ========================================================
       MARKER BOUNDS
       ======================================================== */

    function getMarkerBounds(
        nest,
        padding = 5
    ) {

        const fabricWidth =
            num(
                nest?.fabric?.width,
                0
            );


        const fabricLength =
            num(
                nest?.fabric?.length,
                0
            );


        let maxY =
            fabricLength;


        (
            nest?.pieces ||
            []
        )
        .forEach(
            piece => {

                maxY =
                    Math.max(

                        maxY,

                        num(piece.y) +
                        num(piece.height)

                    );

            }
        );


        return {

            minX:
                -padding,

            minY:
                -padding,

            maxX:
                fabricWidth +
                padding,

            maxY:
                maxY +
                padding,

            width:
                fabricWidth +
                padding * 2,

            height:
                maxY +
                padding * 2

        };

    }


    /* ========================================================
       CREATE SVG
       ======================================================== */

    function createSvg(
        nest,
        options = {}
    ) {

        if (
            !nest
        ) {

            throw new Error(
                "Nesting result belum tersedia."
            );

        }


        const bounds =
            getMarkerBounds(
                nest,
                num(
                    options.padding,
                    5
                )
            );


        const svg =
            document.createElementNS(
                SVG_NS,
                "svg"
            );


        svg.setAttribute(
            "viewBox",

            `${bounds.minX} ` +
            `${bounds.minY} ` +
            `${bounds.width} ` +
            `${bounds.height}`

        );


        svg.setAttribute(
            "preserveAspectRatio",
            "xMidYMid meet"
        );


        svg.setAttribute(
            "width",
            "100%"
        );


        svg.setAttribute(
            "height",
            "100%"
        );


        svg.setAttribute(
            "aria-label",
            "Marker / Nesting Preview"
        );


        /*
         * ====================================================
         * BACKGROUND
         * ====================================================
         */

        const background =
            document.createElementNS(
                SVG_NS,
                "rect"
            );


        background.setAttribute(
            "x",
            bounds.minX
        );


        background.setAttribute(
            "y",
            bounds.minY
        );


        background.setAttribute(
            "width",
            bounds.width
        );


        background.setAttribute(
            "height",
            bounds.height
        );


        background.setAttribute(
            "fill",
            "#f7f7f7"
        );


        svg.appendChild(
            background
        );


        /*
         * ====================================================
         * FABRIC
         * ====================================================
         */

        const fabric =
            document.createElementNS(
                SVG_NS,
                "rect"
            );


        fabric.setAttribute(
            "x",
            "0"
        );


        fabric.setAttribute(
            "y",
            "0"
        );


        fabric.setAttribute(
            "width",
            num(
                nest.fabric?.width
            )
        );


        fabric.setAttribute(
            "height",
            num(
                nest.fabric?.length
            )
        );


        fabric.setAttribute(
            "fill",
            "#ffffff"
        );


        fabric.setAttribute(
            "stroke",
            "#101828"
        );


        fabric.setAttribute(
            "stroke-width",
            "0.5"
        );


        svg.appendChild(
            fabric
        );


        /*
         * ====================================================
         * FABRIC LABEL
         * ====================================================
         */

        const fabricLabel =
            document.createElementNS(
                SVG_NS,
                "text"
            );


        fabricLabel.setAttribute(
            "x",
            num(
                nest.fabric?.width
            ) / 2
        );


        fabricLabel.setAttribute(
            "y",
            -1
        );


        fabricLabel.setAttribute(
            "text-anchor",
            "middle"
        );


        fabricLabel.setAttribute(
            "font-size",
            "2.5"
        );


        fabricLabel.setAttribute(
            "font-weight",
            "700"
        );


        fabricLabel.textContent =

            `MARKER • ` +
            `${round(
                nest.fabric?.width
            )} × ` +
            `${round(
                nest.fabric?.length
            )} cm`;


        svg.appendChild(
            fabricLabel
        );


        /*
         * ====================================================
         * PIECES
         * ====================================================
         */

        (
            nest.pieces ||
            []
        )
        .forEach(
            (
                piece,
                index
            ) => {

                const points =
                    getPoints(
                        piece
                    );


                if (
                    points.length < 3
                ) {

                    return;

                }


                const polygon =
                    document.createElementNS(
                        SVG_NS,
                        "polygon"
                    );


                polygon.setAttribute(

                    "points",

                    points
                        .map(
                            point =>
                                `${point[0]},${point[1]}`
                        )
                        .join(" ")

                );


                polygon.setAttribute(
                    "fill",
                    "white"
                );


                polygon.setAttribute(
                    "stroke",
                    "#111827"
                );


                polygon.setAttribute(
                    "stroke-width",
                    "0.4"
                );


                polygon.setAttribute(
                    "vector-effect",
                    "non-scaling-stroke"
                );


                polygon.dataset.piece =
                    String(
                        piece.name ||
                        `piece-${index + 1}`
                    );


                polygon.dataset.instance =
                    String(
                        piece.instanceIndex + 1
                    );


                svg.appendChild(
                    polygon
                );


                /*
                 * ============================================
                 * PIECE LABEL
                 * ============================================
                 */

                const bounds =
                    ProductionGeometry.getBounds(
                        points
                    );


                const label =
                    document.createElementNS(
                        SVG_NS,
                        "text"
                    );


                label.setAttribute(
                    "x",

                    (
                        bounds.minX +
                        bounds.maxX
                    ) / 2

                );


                label.setAttribute(
                    "y",

                    (
                        bounds.minY +
                        bounds.maxY
                    ) / 2

                );


                label.setAttribute(
                    "text-anchor",
                    "middle"
                );


                label.setAttribute(
                    "dominant-baseline",
                    "middle"
                );


                label.setAttribute(
                    "font-size",
                    "2.2"
                );


                label.setAttribute(
                    "font-weight",
                    "700"
                );


                label.textContent =

                    piece.label ||
                    piece.name ||
                    `Piece ${index + 1}`;


                svg.appendChild(
                    label
                );


                /*
                 * ============================================
                 * INSTANCE NUMBER
                 * ============================================
                 */

                const instanceLabel =
                    document.createElementNS(
                        SVG_NS,
                        "text"
                    );


                instanceLabel.setAttribute(
                    "x",

                    bounds.minX + 1

                );


                instanceLabel.setAttribute(
                    "y",

                    bounds.minY + 3

                );


                instanceLabel.setAttribute(
                    "font-size",
                    "1.8"
                );


                instanceLabel.setAttribute(
                    "font-weight",
                    "600"
                );


                instanceLabel.textContent =

                    `#${num(
                        piece.instanceIndex,
                        0
                    ) + 1}`;


                svg.appendChild(
                    instanceLabel
                );


                /*
                 * ============================================
                 * GRAINLINE
                 * ============================================
                 */

                if (
                    Array.isArray(
                        piece.grainline
                    ) &&
                    piece.grainline.length >= 2
                ) {

                    const grain =
                        document.createElementNS(
                            SVG_NS,
                            "line"
                        );


                    grain.setAttribute(
                        "x1",
                        piece.grainline[0][0]
                    );


                    grain.setAttribute(
                        "y1",
                        piece.grainline[0][1]
                    );


                    grain.setAttribute(
                        "x2",
                        piece.grainline[1][0]
                    );


                    grain.setAttribute(
                        "y2",
                        piece.grainline[1][1]
                    );


                    grain.setAttribute(
                        "stroke",
                        "#344054"
                    );


                    grain.setAttribute(
                        "stroke-width",
                        "0.3"
                    );


                    grain.setAttribute(
                        "stroke-dasharray",
                        "2 1"
                    );


                    svg.appendChild(
                        grain
                    );

                }

            }
        );


        /*
         * ====================================================
         * UNPLACED WARNING
         * ====================================================
         */

        if (
            nest.unplaced?.length
        ) {

            const warning =
                document.createElementNS(
                    SVG_NS,
                    "text"
                );


            warning.setAttribute(
                "x",
                1
            );


            warning.setAttribute(
                "y",
                num(
                    nest.fabric?.length,
                    100
                ) - 1
            );


            warning.setAttribute(
                "font-size",
                "2.5"
            );


            warning.setAttribute(
                "font-weight",
                "700"
            );


            warning.textContent =

                `${nest.unplaced.length} PIECE ` +
                `BELUM TERPASANG`;


            svg.appendChild(
                warning
            );

        }


        return svg;

    }


    /* ========================================================
       RENDER INTO CONTAINER
       ======================================================== */

    function render(
        container,
        nest,
        options = {}
    ) {

        if (
            typeof container ===
            "string"
        ) {

            container =
                $(container);

        }


        if (
            !container
        ) {

            throw new Error(
                "Container nesting preview tidak ditemukan."
            );

        }


        container.innerHTML =
            "";


        const svg =
            createSvg(
                nest,
                options
            );


        container.appendChild(
            svg
        );


        return svg;

    }


    /* ========================================================
       FIT
       ======================================================== */

    function fit(
        container
    ) {

        if (
            typeof container ===
            "string"
        ) {

            container =
                $(container);

        }


        if (
            !container
        ) {

            return;

        }


        const svg =
            container.querySelector(
                "svg"
            );


        if (
            !svg
        ) {

            return;

        }


        svg.setAttribute(
            "preserveAspectRatio",
            "xMidYMid meet"
        );

    }


    /* ========================================================
       SUMMARY
       ======================================================== */

    function getPreviewSummary(
        nest
    ) {

        const summary =
            NestingEngine.getSummary(
                nest
            );


        return {

            ...summary,

            previewUnit:
                "cm",

            previewScale:
                1

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerNestingPreview = {

        getPoints,

        getMarkerBounds,

        createSvg,

        render,

        fit,

        getPreviewSummary

    };


})();
