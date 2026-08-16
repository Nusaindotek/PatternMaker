```javascript id="u8k3rm"
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 15 — engine/dress.js
 * ============================================================
 *
 * DRESS PATTERN ENGINE
 *
 * Base:
 *   Bodice + Sleeve
 *
 * Tambahan:
 *   Dress length
 *   Skirt / body extension
 *
 * Output:
 *   Full / Open pattern pieces
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const ProductionGeometry =
        window.PatternMakerProductionGeometry;


    const Legacy =
        window.PatternMakerLegacyAdapters;


    const Registry =
        window.PatternMakerPatternRegistry;


    if (
        !ProductionGeometry
    ) {

        throw new Error(
            "production-geometry.js belum tersedia."
        );

    }


    if (
        !Legacy
    ) {

        throw new Error(
            "legacy-pattern-adapter.js belum tersedia."
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
            Number(
                value
            );


        return Number.isFinite(n)
            ? n
            : fallback;

    }


    function round(
        value
    ) {

        return Math.round(
            Number(value) * 100
        ) / 100;

    }


    function shiftPoints(
        points,
        dx,
        dy
    ) {

        return points.map(
            point => [

                round(
                    point[0] + dx
                ),

                round(
                    point[1] + dy
                )

            ]
        );

    }


    function getBounds(
        points
    ) {

        const xs =
            points.map(
                p => p[0]
            );


        const ys =
            points.map(
                p => p[1]
            );


        return {

            minX:
                Math.min(
                    ...xs
                ),

            maxX:
                Math.max(
                    ...xs
                ),

            minY:
                Math.min(
                    ...ys
                ),

            maxY:
                Math.max(
                    ...ys
                ),

            width:
                Math.max(
                    ...xs
                ) -
                Math.min(
                    ...xs
                ),

            height:
                Math.max(
                    ...ys
                ) -
                Math.min(
                    ...ys
                )

        };

    }


    /* ========================================================
       CREATE DRESS BODY EXTENSION
       ======================================================== */

    function createDressExtension(
        bodicePiece,
        measurements,
        options = {}
    ) {

        const bodyLength =
            num(
                measurements.bodyLength,
                60
            );


        const dressLength =
            num(
                measurements.dressLength,
                110
            );


        const extension =
            Math.max(
                5,
                dressLength -
                bodyLength
            );


        const points =
            bodicePiece.points;


        const bounds =
            getBounds(
                points
            );


        const topY =
            bounds.maxY;


        /*
         * Membuat extension mengikuti lebar
         * bagian bawah bodice.
         */

        const bottomPoints = [

            [
                bounds.minX,
                topY
            ],

            [
                bounds.maxX,
                topY
            ],

            [
                bounds.maxX,
                topY +
                extension
            ],

            [
                bounds.minX,
                topY +
                extension
            ]

        ];


        return {

            ...bodicePiece,

            name:
                bodicePiece.name ===
                "FRONT"

                    ? "DRESS FRONT"

                    : "DRESS BACK",

            type:
                bodicePiece.name ===
                "FRONT"

                    ? "dress-front"

                    : "dress-back",

            points:
                [

                    points[0],

                    points[1],

                    points[2],

                    points[3],

                    ...bottomPoints.slice(
                        1
                    ),

                    bottomPoints[0]

                ],

            label:
                bodicePiece.name ===
                "FRONT"

                    ? "DRESS FRONT"

                    : "DRESS BACK"

        };

    }


    /* ========================================================
       IMPROVE DRESS SILHOUETTE
       ======================================================== */

    function shapeDressBottom(
        piece,
        measurements,
        options = {}
    ) {

        const hip =
            num(
                measurements.hip,
                96
            );


        const ease =
            num(
                options.ease,
                2
            );


        const targetWidth =
            Math.max(
                20,
                (
                    hip +
                    ease
                ) / 2
            );


        const bounds =
            getBounds(
                piece.points
            );


        const center =
            (
                bounds.minX +
                bounds.maxX
            ) / 2;


        const currentWidth =
            bounds.width;


        const widening =
            Math.max(
                0,
                targetWidth -
                currentWidth
            );


        const adjusted =
            piece.points.map(
                point => {

                    const normalized =
                        currentWidth > 0

                            ? (
                                point[0] -
                                center
                              ) /
                              (
                                currentWidth / 2
                              )

                            : 0;


                    /*
                     * Pelebaran hanya di bagian
                     * bawah dress.
                     */

                    const factor =
                        point[1] >
                        bounds.minY +
                        (
                            bounds.height *
                            0.45
                        )

                            ? (
                                1 +
                                widening /
                                Math.max(
                                    currentWidth,
                                    1
                                )
                              )

                            : 1;


                    return [

                        round(
                            center +
                            (
                                point[0] -
                                center
                            ) *
                            factor
                        ),

                        round(
                            point[1]
                        )

                    ];

                }
            );


        return {

            ...piece,

            points:
                adjusted

        };

    }


    /* ========================================================
       CREATE WAIST JOIN
       ======================================================== */

    function createWaistSeam(
        piece,
        options = {}
    ) {

        const bounds =
            getBounds(
                piece.points
            );


        const seamY =
            bounds.minY +
            bounds.height *
            0.42;


        return {

            ...piece,

            metadata: {

                ...(piece.metadata || {}),

                waistSeam:
                    round(
                        seamY
                    )

            }

        };

    }


    /* ========================================================
       CREATE DRESS PIECES
       ======================================================== */

    function createDressPieces(
        context
    ) {

        const measurements =
            context.measurements ||
            {};


        const bodiceResult =
            Legacy.BodiceAdapter.generate(
                context
            );


        if (
            !bodiceResult ||
            !bodiceResult.geometry
        ) {

            throw new Error(
                "Bodice engine gagal membuat base dress."
            );

        }


        const bodice =
            bodiceResult.geometry;


        /*
         * SLEEVE
         */

        let sleeve =
            null;


        if (
            Legacy.SleeveAdapter
        ) {

            const sleeveResult =
                Legacy.SleeveAdapter.generate(
                    context
                );


            if (
                sleeveResult
            ) {

                sleeve =
                    sleeveResult.geometry;

            }

        }


        /*
         * FRONT
         */

        let front =
            ProductionGeometry.createFrontFromBodice(

                bodice,

                {

                    label:
                        "DRESS FRONT"

                }

            );


        front =
            createDressExtension(

                front,

                measurements,

                context.options || {}

            );


        front =
            shapeDressBottom(

                front,

                measurements,

                context.options || {}

            );


        front =
            createWaistSeam(
                front
            );


        /*
         * BACK
         */

        let back =
            ProductionGeometry.createBackFromBodice(

                bodice,

                {

                    label:
                        "DRESS BACK"

                }

            );


        back =
            createDressExtension(

                back,

                measurements,

                context.options || {}

            );


        back =
            shapeDressBottom(

                back,

                measurements,

                context.options || {}

            );


        back =
            createWaistSeam(
                back
            );


        const pieces = [

            front,

            back

        ];


        /*
         * SLEEVES
         */

        if (
            sleeve
        ) {

            const sleeveLeft =
                ProductionGeometry.createSleeveFromLegacy(

                    sleeve,

                    {

                        name:
                            "DRESS SLEEVE L",

                        side:
                            "left",

                        quantity:
                            1,

                        label:
                            "DRESS SLEEVE L"

                    }

                );


            pieces.push(
                sleeveLeft
            );


            const bounds =
                ProductionGeometry.getBounds(
                    sleeveLeft.points
                );


            const axis =
                (
                    bounds.minX +
                    bounds.maxX
                ) /
                2;


            let sleeveRight =
                ProductionGeometry.mirrorPieceX(

                    sleeveLeft,

                    axis

                );


            sleeveRight = {

                ...sleeveRight,

                name:
                    "DRESS SLEEVE R",

                side:
                    "right",

                label:
                    "DRESS SLEEVE R"

            };


            pieces.push(
                sleeveRight
            );

        }


        return {

            pieces,

            bodice,

            sleeve

        };

    }


    /* ========================================================
       GENERATE DRESS
       ======================================================== */

    function generate(
        context = {}
    ) {

        if (
            !context.measurements
        ) {

            throw new Error(
                "Dress Engine membutuhkan measurements."
            );

        }


        const result =
            createDressPieces(
                context
            );


        const layout =
            ProductionGeometry.layoutOpenPieces(

                result.pieces,

                {

                    gap:
                        num(
                            context.options?.gap,
                            8
                        ),

                    grainline:
                        context.options?.grainline !== false,

                    notches:
                        context.options?.notches !== false

                }

            );


        const pattern = {

            type:
                "dress",

            engine:
                "dress",

            version:
                "1.0",

            pieces:
                layout,

            source:
                "engine/dress.js",

            metadata: {

                garment:
                    "dress",

                unit:
                    "cm",

                fullOpen:
                    true,

                hasFront:
                    true,

                hasBack:
                    true,

                hasSleeve:
                    Boolean(
                        result.sleeve
                    ),

                dressLength:
                    num(
                        context.measurements.dressLength,
                        0
                    ),

                note:
                    "Base dress pattern. Fitting sample required before mass production."

            }

        };


        return pattern;

    }


    /* ========================================================
       REGISTER
       ======================================================== */

    const DressEngine = {

        id:
            "dress",

        label:
            "Dress Pattern Engine",

        version:
            "1.0",

        generate

    };


    if (
        Registry
    ) {

        Registry.registerEngine(

            "dress",

            DressEngine

        );

    }


    /* ========================================================
       GLOBAL API
       ======================================================== */

    window.PatternMakerDressEngine = {

        DressEngine,

        generate,

        createDressPieces,

        createDressExtension,

        shapeDressBottom

    };


})();
```
