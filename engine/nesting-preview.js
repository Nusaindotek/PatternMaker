/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 77
 *
 * FILE:
 *   engine/nesting-preview.js
 * ============================================================
 *
 * RESPONSIBILITY:
 *
 *   Nesting Result
 *        ↓
 *   Preview Model
 *        ↓
 *   SVG / Canvas Renderer
 *
 * ============================================================
 *
 * TIDAK melakukan:
 *
 * - nesting
 * - collision calculation baru
 * - perubahan geometry
 * - grading
 * - seam
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const Nesting =
        window.PatternMakerNestingEngine;


    if (
        !Nesting
    ) {

        throw new Error(
            "nesting-engine.js harus dimuat sebelum nesting-preview.js."
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
       POINT CLONE
       ======================================================== */

    function clonePoints(
        points
    ) {

        return (
            points || []
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
            Math.min(...xs);


        const minY =
            Math.min(...ys);


        const maxX =
            Math.max(...xs);


        const maxY =
            Math.max(...ys);


        return {

            minX,
            minY,
            maxX,
            maxY,

            width:
                maxX - minX,

            height:
                maxY - minY

        };

    }


    /* ========================================================
       TRANSFORM PLACEMENT
       ======================================================== */

    function getPreviewPoints(
        placement
    ) {

        if (
            !placement ||
            !Array.isArray(
                placement.points
            )
        ) {

            return [];

        }


        return clonePoints(
            placement.points
        );

    }


    /* ========================================================
       SVG PATH
       ======================================================== */

    function pointsToSvgPath(
        points,
        close = true
    ) {

        if (
            !Array.isArray(points) ||
            points.length === 0
        ) {

            return "";

        }


        const commands = [

            `M ${num(points[0][0])} ${num(points[0][1])}`

        ];


        for (
            let i = 1;
            i < points.length;
            i++
        ) {

            commands.push(

                `L ${num(points[i][0])} ${num(points[i][1])}`

            );

        }


        if (
            close
        ) {

            commands.push(
                "Z"
            );

        }


        return commands.join(
            " "
        );

    }


    /* ========================================================
       PLACEMENT MODEL
       ======================================================== */

    function createPlacementModel(
        placement,
        index
    ) {

        const points =
            getPreviewPoints(
                placement
            );


        const bounds =
            getBounds(
                points
            );


        return {

            id:
                placement.id ||
                `placement-${index + 1}`,

            index,

            name:
                placement.name ||
                placement.id ||
                `PIECE-${index + 1}`,

            rotation:
                num(
                    placement.rotation
                ),

            x:
                num(
                    placement.x
                ),

            y:
                num(
                    placement.y
                ),

            points,

            path:
                pointsToSvgPath(
                    points,
                    true
                ),

            bounds,

            area:
                num(
                    placement.area
                ),

            originalIndex:
                Number.isInteger(
                    placement.originalIndex
                )
                    ? placement.originalIndex
                    : index,

            metadata:
                placement.metadata || {}

        };

    }


    /* ========================================================
       MARKER MODEL
       ======================================================== */

    function createMarkerModel(
        result
    ) {

        if (
            !result ||
            !result.marker
        ) {

            throw new Error(
                "Nesting result tidak memiliki marker."
            );

        }


        const placements =
            (
                result.placements ||
                []
            )
            .map(
                (
                    placement,
                    index
                ) =>
                    createPlacementModel(
                        placement,
                        index
                    )
            );


        const markerWidth =
            num(
                result.marker.width
            );


        const markerLength =
            num(
                result.marker.length
            );


        return {

            type:
                "nesting-preview",

            version:
                VERSION,

            marker: {

                width:
                    markerWidth,

                height:
                    markerLength,

                length:
                    markerLength,

                area:
                    num(
                        result.marker.area
                    ),

                pieceArea:
                    num(
                        result.marker.pieceArea
                    ),

                efficiency:
                    num(
                        result.marker.efficiency
                    )

            },

            placements,

            unplaced:
                (
                    result.unplaced ||
                    []
                )
                .map(
                    item => ({

                        name:
                            item.piece?.name ||
                            "UNKNOWN",

                        originalIndex:
                            item.originalIndex,

                        reason:
                            item.reason ||
                            "Tidak ditempatkan."

                    })
                ),

            metadata: {

                source:
                    result.metadata?.source ||
                    null,

                engine:
                    result.metadata?.engine ||
                    null,

                unit:
                    result.metadata?.unit ||
                    "cm",

                strategy:
                    result.metadata?.strategy ||
                    null,

                nestingVersion:
                    result.version ||
                    Nesting.VERSION

            }

        };

    }


    /* ========================================================
       SCALE
       ======================================================== */

    function calculateScale(
        markerWidth,
        markerLength,
        viewportWidth,
        viewportHeight,
        padding = 20
    ) {

        const availableWidth =
            Math.max(
                1,
                num(viewportWidth) -
                padding * 2
            );


        const availableHeight =
            Math.max(
                1,
                num(viewportHeight) -
                padding * 2
            );


        if (
            markerWidth <= 0 ||
            markerLength <= 0
        ) {

            return 1;

        }


        return Math.min(

            availableWidth /
            markerWidth,

            availableHeight /
            markerLength

        );

    }


    /* ========================================================
       FIT MODEL
       ======================================================== */

    function fitToViewport(
        model,
        options = {}
    ) {

        if (
            !model ||
            !model.marker
        ) {

            throw new Error(
                "Preview model tidak valid."
            );

        }


        const viewportWidth =
            num(
                options.width,
                1000
            );


        const viewportHeight =
            num(
                options.height,
                700
            );


        const padding =
            Math.max(
                0,
                num(
                    options.padding,
                    20
                )
            );


        const scale =
            calculateScale(

                model.marker.width,

                model.marker.length,

                viewportWidth,

                viewportHeight,

                padding

            );


        return {

            ...model,

            viewport: {

                width:
                    viewportWidth,

                height:
                    viewportHeight,

                padding,

                scale

            }

        };

    }


    /* ========================================================
       SCREEN COORDINATES
       ======================================================== */

    function toScreenPoints(
        points,
        scale,
        padding,
        markerHeight
    ) {

        return (
            points || []
        )
        .map(
            (
                [
                    x,
                    y
                ]
            ) => [

                padding +
                x *
                scale,

                padding +
                (
                    markerHeight -
                    y
                ) *
                scale

            ]
        );

    }


    /* ========================================================
       SCREEN PATH
       ======================================================== */

    function screenPath(
        points,
        scale,
        padding,
        markerHeight
    ) {

        const transformed =
            toScreenPoints(

                points,

                scale,

                padding,

                markerHeight

            );


        return pointsToSvgPath(
            transformed,
            true
        );

    }


    /* ========================================================
       SVG VIEW MODEL
       ======================================================== */

    function createSvgModel(
        model
    ) {

        if (
            !model?.viewport
        ) {

            throw new Error(
                "Model belum difit ke viewport."
            );

        }


        const scale =
            model.viewport.scale;


        const padding =
            model.viewport.padding;


        const markerHeight =
            model.marker.height;


        return {

            width:
                model.viewport.width,

            height:
                model.viewport.height,

            marker: {

                x:
                    padding,

                y:
                    padding,

                width:
                    model.marker.width *
                    scale,

                height:
                    model.marker.height *
                    scale

            },

            placements:

                model.placements.map(
                    placement => ({

                        id:
                            placement.id,

                        name:
                            placement.name,

                        rotation:
                            placement.rotation,

                        path:
                            screenPath(

                                placement.points,

                                scale,

                                padding,

                                markerHeight

                            ),

                        bounds:
                            placement.bounds,

                        metadata:
                            placement.metadata

                    })

                ),

            efficiency:
                model.marker.efficiency

        };

    }


    /* ========================================================
       FORMAT EFFICIENCY
       ======================================================== */

    function formatEfficiency(
        value,
        digits = 2
    ) {

        return (

            num(
                value
            )
            .toFixed(
                digits
            )
            +
            "%"

        );

    }


    /* ========================================================
       SUMMARY
       ======================================================== */

    function getSummary(
        model
    ) {

        return {

            pieceCount:
                model?.placements?.length ||
                0,

            unplacedCount:
                model?.unplaced?.length ||
                0,

            markerWidth:
                num(
                    model?.marker?.width
                ),

            markerLength:
                num(
                    model?.marker?.length
                ),

            efficiency:
                num(
                    model?.marker?.efficiency
                ),

            efficiencyLabel:
                formatEfficiency(
                    model?.marker?.efficiency
                )

        };

    }


    /* ========================================================
       CREATE PREVIEW
       ======================================================== */

    function createPreview(
        nestingResult,
        options = {}
    ) {

        const model =
            createMarkerModel(
                nestingResult
            );


        return fitToViewport(
            model,
            options
        );

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        nestingResult,
        options = {}
    ) {

        const model =
            createPreview(

                nestingResult,

                options

            );


        const svg =
            createSvgModel(
                model
            );


        console.group(
            "PatternMaker Nesting Preview"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Summary:",
            getSummary(
                model
            )
        );


        console.log(
            "SVG model:",
            svg
        );


        console.groupEnd();


        return {

            model,

            svg

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerNestingPreview = {

        VERSION,

        getBounds,

        pointsToSvgPath,

        createPlacementModel,

        createMarkerModel,

        calculateScale,

        fitToViewport,

        toScreenPoints,

        createSvgModel,

        formatEfficiency,

        getSummary,

        createPreview,

        debug

    };


})();
