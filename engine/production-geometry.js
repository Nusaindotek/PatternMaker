```javascript id="g2v8nx"
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 11 — engine/production-geometry.js
 * ============================================================
 *
 * FUNGSI:
 *
 * Mengubah hasil engine pola menjadi:
 *
 *     Production Pattern Pieces
 *
 * Format ini menjadi sumber bersama untuk:
 *
 *     Preview FULL / OPEN
 *     DXF
 *     PLT / HPGL
 *     SVG
 *     Pattern JSON
 *     Nesting / Marker
 *
 * ============================================================
 *
 * PRINSIP:
 *
 * Pattern Engine
 *       ↓
 * Production Geometry
 *       ↓
 * ┌───────────────┬──────────────┬──────────────┐
 * │ Preview       │ DXF          │ PLT/HPGL     │
 * └───────────────┴──────────────┴──────────────┘
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       HELPER
       ======================================================== */

    function round(
        value,
        decimals = 3
    ) {

        const multiplier =
            Math.pow(
                10,
                decimals
            );


        return Math.round(
            Number(value) *
            multiplier
        ) /
        multiplier;

    }


    function clonePoint(
        point
    ) {

        return [

            round(
                point[0]
            ),

            round(
                point[1]
            )

        ];

    }


    function clonePoints(
        points = []
    ) {

        return points.map(
            clonePoint
        );

    }


    /* ========================================================
       BOUNDS
       ======================================================== */

    function getBounds(
        points = []
    ) {

        if (
            !points.length
        ) {

            return {

                minX: 0,

                maxX: 0,

                minY: 0,

                maxY: 0,

                width: 0,

                height: 0

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


        const maxX =
            Math.max(
                ...xs
            );


        const minY =
            Math.min(
                ...ys
            );


        const maxY =
            Math.max(
                ...ys
            );


        return {

            minX,

            maxX,

            minY,

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
       PIECE ID
       ======================================================== */

    let pieceCounter =
        0;


    function createPieceId(
        prefix = "PIECE"
    ) {

        pieceCounter += 1;


        return (

            prefix +
            "-" +
            String(
                pieceCounter
            )
            .padStart(
                4,
                "0"
            )

        );

    }


    /* ========================================================
       CREATE PRODUCTION PIECE
       ======================================================== */

    function createProductionPiece(
        options = {}
    ) {

        if (
            !Array.isArray(
                options.points
            ) ||
            options.points.length < 3
        ) {

            throw new Error(
                "Production piece membutuhkan minimal 3 titik."
            );

        }


        const points =
            clonePoints(
                options.points
            );


        const bounds =
            getBounds(
                points
            );


        return {

            id:
                options.id ||
                createPieceId(
                    options.type ||
                    "PIECE"
                ),

            name:
                options.name ||
                "Pattern Piece",

            type:
                options.type ||
                "pattern",

            side:
                options.side ||
                null,

            quantity:
                Number(
                    options.quantity ||
                    1
                ),

            layer:
                options.layer ||
                "OUTLINE",

            points,

            closed:
                options.closed !== false,

            grainline:
                clonePoints(
                    options.grainline ||
                    []
                ),

            notches:
                clonePoints(
                    options.notches ||
                    []
                ),

            drillPoints:
                clonePoints(
                    options.drillPoints ||
                    []
                ),

            foldline:
                clonePoints(
                    options.foldline ||
                    []
                ),

            label:
                options.label ||
                options.name ||
                "Pattern Piece",

            seamAllowance:
                Number(
                    options.seamAllowance ||
                    0
                ),

            bounds,

            metadata:
                {
                    source:
                        options.source ||
                        "PatternMaker",

                    version:
                        "1.0",

                    createdAt:
                        new Date().toISOString()

                }

        };

    }


    /* ========================================================
       TRANSLATE
       ======================================================== */

    function translatePoints(
        points,
        dx,
        dy
    ) {

        return points.map(
            point => [

                round(
                    point[0] +
                    dx
                ),

                round(
                    point[1] +
                    dy
                )

            ]
        );

    }


    function translatePiece(
        piece,
        dx,
        dy
    ) {

        const translated = {

            ...piece,

            points:
                translatePoints(
                    piece.points,
                    dx,
                    dy
                ),

            grainline:
                translatePoints(
                    piece.grainline,
                    dx,
                    dy
                ),

            notches:
                translatePoints(
                    piece.notches,
                    dx,
                    dy
                ),

            drillPoints:
                translatePoints(
                    piece.drillPoints,
                    dx,
                    dy
                ),

            foldline:
                translatePoints(
                    piece.foldline,
                    dx,
                    dy
                )

        };


        translated.bounds =
            getBounds(
                translated.points
            );


        return translated;

    }


    /* ========================================================
       MIRROR X
       ======================================================== */

    function mirrorPointsX(
        points,
        axisX
    ) {

        return points.map(
            point => [

                round(
                    axisX -
                    (
                        point[0] -
                        axisX
                    )
                ),

                round(
                    point[1]
                )

            ]
        );

    }


    function mirrorPieceX(
        piece,
        axisX
    ) {

        const mirrored = {

            ...piece,

            points:
                mirrorPointsX(
                    piece.points,
                    axisX
                ),

            grainline:
                mirrorPointsX(
                    piece.grainline,
                    axisX
                ),

            notches:
                mirrorPointsX(
                    piece.notches,
                    axisX
                ),

            drillPoints:
                mirrorPointsX(
                    piece.drillPoints,
                    axisX
                ),

            foldline:
                mirrorPointsX(
                    piece.foldline,
                    axisX
                )

        };


        mirrored.bounds =
            getBounds(
                mirrored.points
            );


        return mirrored;

    }


    /* ========================================================
       CENTER PIECE
       ======================================================== */

    function centerPiece(
        piece
    ) {

        const bounds =
            getBounds(
                piece.points
            );


        return translatePiece(

            piece,

            -bounds.minX,

            -bounds.minY

        );

    }


    /* ========================================================
       CREATE FRONT FROM LEGACY BODICE
       ======================================================== */

    function createFrontFromBodice(
        bodice,
        options = {}
    ) {

        if (
            !bodice ||
            !bodice.front
        ) {

            throw new Error(
                "Bodice front tidak tersedia."
            );

        }


        const points = [

            bodice.front.A,

            bodice.front.B,

            bodice.front.C,

            bodice.front.D,

            bodice.front.E,

            bodice.front.F

        ];


        return createProductionPiece({

            id:
                options.id,

            name:
                "FRONT",

            type:
                "bodice-front",

            side:
                "front",

            quantity:
                1,

            points,

            label:
                options.label ||
                "FRONT",

            grainline:
                options.grainline ||
                [],

            notches:
                options.notches ||
                [],

            seamAllowance:
                options.seamAllowance ||
                0,

            source:
                "engine/bodice.js"

        });

    }


    /* ========================================================
       CREATE BACK FROM LEGACY BODICE
       ======================================================== */

    function createBackFromBodice(
        bodice,
        options = {}
    ) {

        if (
            !bodice ||
            !bodice.back
        ) {

            throw new Error(
                "Bodice back tidak tersedia."
            );

        }


        const points = [

            bodice.back.A,

            bodice.back.B,

            bodice.back.C,

            bodice.back.D,

            bodice.back.E,

            bodice.back.F

        ];


        return createProductionPiece({

            id:
                options.id,

            name:
                "BACK",

            type:
                "bodice-back",

            side:
                "back",

            quantity:
                1,

            points,

            label:
                options.label ||
                "BACK",

            grainline:
                options.grainline ||
                [],

            notches:
                options.notches ||
                [],

            seamAllowance:
                options.seamAllowance ||
                0,

            source:
                "engine/bodice.js"

        });

    }


    /* ========================================================
       CREATE SLEEVE FROM LEGACY ENGINE
       ======================================================== */

    function createSleeveFromLegacy(
        sleeve,
        options = {}
    ) {

        if (
            !sleeve
        ) {

            throw new Error(
                "Sleeve result tidak tersedia."
            );

        }


        const points = [

            sleeve.left,

            sleeve.leftCap,

            sleeve.top,

            sleeve.rightCap,

            sleeve.right,

            sleeve.bottomRight,

            sleeve.bottomLeft

        ];


        return createProductionPiece({

            id:
                options.id,

            name:
                options.name ||
                "SLEEVE",

            type:
                "sleeve",

            side:
                options.side ||
                null,

            quantity:
                options.quantity ||
                1,

            points,

            label:
                options.label ||
                "SLEEVE",

            grainline:
                options.grainline ||
                [],

            notches:
                options.notches ||
                [],

            seamAllowance:
                options.seamAllowance ||
                0,

            source:
                "engine/sleeve.js"

        });

    }


    /* ========================================================
       ADD GRAINLINE
       ======================================================== */

    function createDefaultGrainline(
        piece
    ) {

        const bounds =
            getBounds(
                piece.points
            );


        const x =
            (
                bounds.minX +
                bounds.maxX
            ) /
            2;


        return [

            [
                round(
                    x
                ),

                round(
                    bounds.minY +
                    5
                )

            ],

            [

                round(
                    x
                ),

                round(
                    bounds.maxY -
                    5
                )

            ]

        ];

    }


    /* ========================================================
       ADD BASIC NOTCH
       ======================================================== */

    function createBasicNotch(
        point
    ) {

        if (
            !point
        ) {

            return [];

        }


        const x =
            Number(
                point[0]
            );


        const y =
            Number(
                point[1]
            );


        return [

            [
                round(
                    x -
                    1.5
                ),

                round(
                    y -
                    1.5
                )

            ],

            [

                round(
                    x +
                    1.5
                ),

                round(
                    y +
                    1.5
                )

            ]

        ];

    }


    /* ========================================================
       NORMALIZE GRAINLINE
       ======================================================== */

    function normalizeGrainline(
        piece
    ) {

        if (
            piece.grainline &&
            piece.grainline.length
        ) {

            return piece;

        }


        piece.grainline =
            createDefaultGrainline(
                piece
            );


        return piece;

    }


    /* ========================================================
       NORMALIZE PIECE
       ======================================================== */

    function normalizePiece(
        piece,
        options = {}
    ) {

        const normalized = {

            ...piece,

            points:
                clonePoints(
                    piece.points
                ),

            grainline:
                clonePoints(
                    piece.grainline ||
                    []
                ),

            notches:
                clonePoints(
                    piece.notches ||
                    []
                ),

            drillPoints:
                clonePoints(
                    piece.drillPoints ||
                    []
                ),

            foldline:
                clonePoints(
                    piece.foldline ||
                    []
                )

        };


        /*
         * Grainline.
         */

        if (
            options.grainline !== false
        ) {

            normalizeGrainline(
                normalized
            );

        }


        /*
         * Notch.
         */

        if (
            options.notches !== false &&
            normalized.notches.length === 0
        ) {

            const reference =
                normalized.points[
                    Math.floor(
                        normalized.points.length /
                        2
                    )
                ];


            normalized.notches =
                createBasicNotch(
                    reference
                )
                    .length
                    ? [

                        reference

                    ]
                    : [];

        }


        normalized.bounds =
            getBounds(
                normalized.points
            );


        return normalized;

    }


    /* ========================================================
       FULL OPEN LAYOUT
       ======================================================== */

    function layoutOpenPieces(
        pieces,
        options = {}
    ) {

        const gap =
            Number(
                options.gap ||
                5
            );


        let currentX =
            0;


        const placed = [];


        pieces.forEach(
            piece => {

                const normalized =
                    normalizePiece(
                        piece,
                        options
                    );


                const bounds =
                    normalized.bounds;


                const width =
                    bounds.width;


                const dx =
                    currentX -
                    bounds.minX;


                const dy =
                    -bounds.minY;


                const moved =
                    translatePiece(
                        normalized,
                        dx,
                        dy
                    );


                placed.push(
                    moved
                );


                currentX +=
                    width +
                    gap;

            }
        );


        return placed;

    }


    /* ========================================================
       FULL PATTERN RESULT
       ======================================================== */

    function createProductionPattern(
        options = {}
    ) {

        const pieces =
            [];


        if (
            options.bodice
        ) {

            if (
                options.includeFront !== false
            ) {

                pieces.push(

                    createFrontFromBodice(

                        options.bodice,

                        {

                            label:
                                options.frontLabel ||
                                "FRONT",

                            grainline:
                                options.frontGrainline ||
                                [],

                            notches:
                                options.frontNotches ||
                                [],

                            seamAllowance:
                                options.seamAllowance ||
                                0

                        }

                    )

                );

            }


            if (
                options.includeBack !== false
            ) {

                pieces.push(

                    createBackFromBodice(

                        options.bodice,

                        {

                            label:
                                options.backLabel ||
                                "BACK",

                            grainline:
                                options.backGrainline ||
                                [],

                            notches:
                                options.backNotches ||
                                [],

                            seamAllowance:
                                options.seamAllowance ||
                                0

                        }

                    )

                );

            }

        }


        if (
            options.sleeve
        ) {

            pieces.push(

                createSleeveFromLegacy(

                    options.sleeve,

                    {

                        name:
                            "SLEEVE L",

                        side:
                            "left",

                        quantity:
                            1,

                        label:
                            options.sleeveLabel ||
                            "SLEEVE L",

                        grainline:
                            options.sleeveGrainline ||
                            [],

                        notches:
                            options.sleeveNotches ||
                            [],

                        seamAllowance:
                            options.seamAllowance ||
                            0

                    }

                )

            );


            /*
             * Sleeve kedua:
             *
             * Mirror dari sleeve pertama.
             */

            const firstSleeve =
                pieces[
                    pieces.length - 1
                ];


            const sleeveBounds =
                getBounds(
                    firstSleeve.points
                );


            const axisX =
                (
                    sleeveBounds.minX +
                    sleeveBounds.maxX
                ) /
                2;


            let secondSleeve =
                mirrorPieceX(
                    firstSleeve,
                    axisX
                );


            secondSleeve =
                {

                    ...secondSleeve,

                    id:
                        createPieceId(
                            "SLEEVE"
                        ),

                    name:
                        "SLEEVE R",

                    side:
                        "right",

                    label:
                        options.sleeveRightLabel ||
                        "SLEEVE R"

                };


            pieces.push(
                secondSleeve
            );

        }


        /*
         * Full / Open:
         *
         * tidak menggunakan foldline
         * sebagai bentuk utama.
         */

        const layout =
            layoutOpenPieces(

                pieces,

                {

                    gap:
                        options.gap ||
                        8,

                    grainline:
                        options.grainline !== false,

                    notches:
                        options.notches !== false

                }

            );


        return {

            pieces:
                layout,

            metadata: {

                mode:
                    "full-open",

                pieceCount:
                    layout.length,

                generatedAt:
                    new Date().toISOString(),

                unit:
                    "cm",

                scale:
                    1

            }

        };

    }


    /* ========================================================
       CALCULATE TOTAL BOUNDS
       ======================================================== */

    function getPatternBounds(
        pattern
    ) {

        if (
            !pattern ||
            !pattern.pieces ||
            !pattern.pieces.length
        ) {

            return getBounds(
                []
            );

        }


        const allPoints =
            pattern.pieces.flatMap(
                piece =>
                    piece.points
            );


        return getBounds(
            allPoints
        );

    }


    /* ========================================================
       AREA
       ======================================================== */

    function calculatePolygonArea(
        points
    ) {

        let area =
            0;


        for (
            let i = 0;
            i < points.length;
            i++
        ) {

            const j =
                (
                    i + 1
                ) %
                points.length;


            area +=

                (
                    points[i][0] *
                    points[j][1]
                )

                -

                (
                    points[j][0] *
                    points[i][1]
                );

        }


        return Math.abs(
            area / 2
        );

    }


    /* ========================================================
       PATTERN SUMMARY
       ======================================================== */

    function getPatternSummary(
        pattern
    ) {

        if (
            !pattern ||
            !pattern.pieces
        ) {

            return {

                pieceCount:
                    0,

                totalArea:
                    0,

                width:
                    0,

                height:
                    0

            };

        }


        const bounds =
            getPatternBounds(
                pattern
            );


        const totalArea =
            pattern.pieces.reduce(

                (
                    total,
                    piece
                ) =>

                    total +
                    calculatePolygonArea(
                        piece.points
                    ),

                0

            );


        return {

            pieceCount:
                pattern.pieces.length,

            totalArea:
                round(
                    totalArea
                ),

            width:
                round(
                    bounds.width
                ),

            height:
                round(
                    bounds.height
                )

        };

    }


    /* ========================================================
       VALIDATION
       ======================================================== */

    function validateProductionPattern(
        pattern
    ) {

        const errors = [];


        if (
            !pattern ||
            !Array.isArray(
                pattern.pieces
            )
        ) {

            errors.push(
                "Pattern tidak memiliki pieces."
            );


            return {

                valid:
                    false,

                errors

            };

        }


        pattern.pieces.forEach(
            (
                piece,
                index
            ) => {

                if (
                    !piece.points ||
                    piece.points.length < 3
                ) {

                    errors.push(

                        `Piece #${index + 1} ` +
                        `"${piece.name}" ` +
                        "tidak memiliki geometri valid."

                    );

                }


                if (
                    piece.quantity <= 0
                ) {

                    errors.push(

                        `Quantity piece "${piece.name}" ` +
                        "tidak valid."

                    );

                }

            }
        );


        return {

            valid:
                errors.length === 0,

            errors

        };

    }


    /* ========================================================
       EXPORT GLOBAL API
       ======================================================== */

    window.PatternMakerProductionGeometry = {

        getBounds,

        createProductionPiece,

        translatePoints,

        translatePiece,

        mirrorPointsX,

        mirrorPieceX,

        centerPiece,

        createFrontFromBodice,

        createBackFromBodice,

        createSleeveFromLegacy,

        createDefaultGrainline,

        createBasicNotch,

        normalizePiece,

        layoutOpenPieces,

        createProductionPattern,

        getPatternBounds,

        calculatePolygonArea,

        getPatternSummary,

        validateProductionPattern

    };


})();
```
