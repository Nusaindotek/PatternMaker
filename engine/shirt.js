```javascript id="j5k3qv"
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 14 — engine/shirt.js
 * ============================================================
 *
 * SHIRT PATTERN ENGINE
 *
 * Fungsi:
 * - Menggunakan bodice engine sebagai base block.
 * - Menghasilkan FRONT + BACK + SLEEVE.
 * - Menambahkan PLACKET.
 * - Menambahkan COLLAR BASE.
 * - Menyediakan geometry yang kompatibel dengan
 *   Production Geometry.
 *
 * STATUS:
 * Base shirt construction.
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    if (
        !window.PatternMakerProductionGeometry
    ) {

        throw new Error(
            "production-geometry.js belum tersedia."
        );

    }


    if (
        !window.PatternMakerLegacyAdapters
    ) {

        throw new Error(
            "legacy-pattern-adapter.js belum tersedia."
        );

    }


    const ProductionGeometry =
        window.PatternMakerProductionGeometry;


    const Legacy =
        window.PatternMakerLegacyAdapters;


    /* ========================================================
       HELPERS
       ======================================================== */

    function safeNumber(
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
                Math.min(...xs),

            maxX:
                Math.max(...xs),

            minY:
                Math.min(...ys),

            maxY:
                Math.max(...ys),

            width:
                Math.max(...xs) -
                Math.min(...xs),

            height:
                Math.max(...ys) -
                Math.min(...ys)

        };

    }


    function translate(
        points,
        dx,
        dy
    ) {

        return points.map(
            p => [

                round(
                    p[0] + dx
                ),

                round(
                    p[1] + dy
                )

            ]
        );

    }


    /* ========================================================
       PLACKET
       ======================================================== */

    function createPlacket(
        front,
        options = {}
    ) {

        const bounds =
            getBounds(
                front.points
            );


        const width =
            Math.max(

                2.5,

                safeNumber(
                    options.width,
                    3
                )

            );


        const height =
            bounds.height;


        const x =
            bounds.minX +
            Math.max(
                2,
                bounds.width * 0.65
            );


        const y =
            bounds.minY;


        const points = [

            [x, y],

            [x + width, y],

            [x + width, y + height],

            [x, y + height]

        ];


        return {

            name:
                "PLACKET",

            type:
                "shirt-placket",

            side:
                "front",

            points,

            closed:
                true,

            quantity:
                1,

            label:
                "PLACKET"

        };

    }


    /* ========================================================
       COLLAR
       ======================================================== */

    function createCollar(
        measurements,
        options = {}
    ) {

        const neck =
            safeNumber(
                measurements.neck,
                38
            );


        /*
         * Base collar dimensions.
         *
         * Ini sengaja dibuat parametrik sederhana.
         * Formula collar produksi detail akan dikembangkan
         * terpisah.
         */

        const collarLength =
            Math.max(
                22,
                neck * 0.5
            );


        const collarWidth =
            Math.max(
                4,
                safeNumber(
                    options.width,
                    5
                )
            );


        const x =
            10;


        const y =
            0;


        const points = [

            [x, y],

            [
                x + collarLength,
                y
            ],

            [
                x + collarLength - 2,
                y + collarWidth
            ],

            [
                x + 2,
                y + collarWidth
            ]

        ];


        return {

            name:
                "COLLAR",

            type:
                "shirt-collar",

            side:
                "neck",

            points,

            closed:
                true,

            quantity:
                1,

            label:
                "COLLAR"

        };

    }


    /* ========================================================
       CREATE SHIRT PIECES
       ======================================================== */

    function createShirtPieces(
        context
    ) {

        const measurements =
            context.measurements ||
            {};


        const bodice =
            Legacy.BodiceAdapter
                ? Legacy.BodiceAdapter.generate(
                    context
                )
                : null;


        if (
            !bodice ||
            !bodice.geometry
        ) {

            throw new Error(
                "Bodice engine tidak dapat menghasilkan base shirt."
            );

        }


        const bodiceResult =
            bodice.geometry;


        /*
         * Sleeve menggunakan base bodice.
         */

        let sleeveResult =
            null;


        if (
            Legacy.SleeveAdapter
        ) {

            sleeveResult =
                Legacy.SleeveAdapter.generate(
                    context
                );

        }


        /*
         * FRONT
         */

        const frontPiece =
            ProductionGeometry.createFrontFromBodice(

                bodiceResult,

                {

                    label:
                        "SHIRT FRONT",

                    seamAllowance:
                        safeNumber(
                            context.options?.seamAllowance,
                            0
                        )

                }

            );


        frontPiece.name =
            "SHIRT FRONT";


        frontPiece.type =
            "shirt-front";


        /*
         * BACK
         */

        const backPiece =
            ProductionGeometry.createBackFromBodice(

                bodiceResult,

                {

                    label:
                        "SHIRT BACK",

                    seamAllowance:
                        safeNumber(
                            context.options?.seamAllowance,
                            0
                        )

                }

            );


        backPiece.name =
            "SHIRT BACK";


        backPiece.type =
            "shirt-back";


        /*
         * PLACKET
         */

        const placket =
            createPlacket(

                frontPiece,

                {

                    width:
                        safeNumber(
                            context.options?.placketWidth,
                            3
                        )

                }

            );


        const placketPiece =
            ProductionGeometry.createProductionPiece({

                name:
                    placket.name,

                type:
                    placket.type,

                side:
                    placket.side,

                points:
                    placket.points,

                quantity:
                    1,

                label:
                    placket.label,

                source:
                    "engine/shirt.js"

            });


        /*
         * COLLAR
         */

        const collar =
            createCollar(

                measurements,

                {

                    width:
                        safeNumber(
                            context.options?.collarWidth,
                            5
                        )

                }

            );


        const collarPiece =
            ProductionGeometry.createProductionPiece({

                name:
                    collar.name,

                type:
                    collar.type,

                side:
                    collar.side,

                points:
                    collar.points,

                quantity:
                    1,

                label:
                    collar.label,

                source:
                    "engine/shirt.js"

            });


        /*
         * SLEEVE
         */

        const pieces = [

            frontPiece,

            backPiece,

            placketPiece,

            collarPiece

        ];


        if (
            sleeveResult &&
            sleeveResult.geometry
        ) {

            const sleevePiece =
                ProductionGeometry.createSleeveFromLegacy(

                    sleeveResult.geometry,

                    {

                        name:
                            "SHIRT SLEEVE L",

                        side:
                            "left",

                        quantity:
                            1,

                        label:
                            "SHIRT SLEEVE L"

                    }

                );


            pieces.push(
                sleevePiece
            );


            /*
             * Sleeve kanan.
             */

            const bounds =
                ProductionGeometry.getBounds(

                    sleevePiece.points

                );


            const axis =
                (
                    bounds.minX +
                    bounds.maxX
                ) / 2;


            let sleeveRight =
                ProductionGeometry
                    .mirrorPieceX(

                        sleevePiece,

                        axis

                    );


            sleeveRight = {

                ...sleeveRight,

                name:
                    "SHIRT SLEEVE R",

                side:
                    "right",

                label:
                    "SHIRT SLEEVE R"

            };


            pieces.push(
                sleeveRight
            );

        }


        return {

            pieces,

            bodice:
                bodiceResult,

            sleeve:
                sleeveResult
                    ? sleeveResult.geometry
                    : null

        };

    }


    /* ========================================================
       GENERATE SHIRT
       ======================================================== */

    function generate(
        context = {}
    ) {

        if (
            !context.measurements
        ) {

            throw new Error(
                "Shirt Engine membutuhkan measurements."
            );

        }


        const result =
            createShirtPieces(
                context
            );


        /*
         * Layout Full / Open.
         *
         * Semua piece diletakkan terpisah.
         */

        const laidOut =
            ProductionGeometry.layoutOpenPieces(

                result.pieces,

                {

                    gap:
                        safeNumber(
                            context.options?.gap,
                            8
                        ),

                    grainline:
                        context.options?.grainline !== false,

                    notches:
                        context.options?.notches !== false

                }

            );


        return {

            type:
                "shirt",

            engine:
                "shirt",

            version:
                "1.0",

            pieces:
                laidOut,

            source:
                "engine/shirt.js",

            metadata: {

                garment:
                    "shirt",

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

                hasPlacket:
                    true,

                hasCollar:
                    true,

                note:
                    "Base shirt pattern. Fitting sample required before production."

            }

        };

    }


    /* ========================================================
       REGISTER ENGINE
       ======================================================== */

    const ShirtEngine = {

        id:
            "shirt",

        label:
            "Shirt Pattern Engine",

        version:
            "1.0",

        generate

    };


    /*
     * Registry baru.
     */

    if (
        window.PatternMakerPatternRegistry
    ) {

        window.PatternMakerPatternRegistry
            .registerEngine(
                "shirt",
                ShirtEngine
            );

    }


    /* ========================================================
       GLOBAL API
       ======================================================== */

    window.PatternMakerShirtEngine = {

        ShirtEngine,

        generate,

        createShirtPieces,

        createPlacket,

        createCollar

    };


})();
```
