```javascript id="q7n4mx"
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 17 — engine/skirt.js
 * ============================================================
 *
 * SKIRT PATTERN ENGINE
 *
 * Output:
 *   SKIRT FRONT
 *   SKIRT BACK
 *
 * Parameter:
 *   waist
 *   hip
 *   skirtLength
 *   ease
 *   seam allowance
 *
 * Fitur:
 *   - Full / Open
 *   - Waist shaping
 *   - Basic dart
 *   - Grainline
 *   - Notch
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


    const Registry =
        window.PatternMakerPatternRegistry;


    if (
        !ProductionGeometry
    ) {

        throw new Error(
            "production-geometry.js belum tersedia."
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
            value * 100
        ) / 100;

    }


    function getBounds(
        points
    ) {

        const xs =
            points.map(
                point => point[0]
            );


        const ys =
            points.map(
                point => point[1]
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
       DART DISTRIBUTION
       ======================================================== */

    function calculateDart(
        waistQuarter,
        hipQuarter,
        options = {}
    ) {

        /*
         * Selisih pinggul dan pinggang menentukan
         * kebutuhan shaping.
         */

        const shaping =
            Math.max(
                0,
                hipQuarter -
                waistQuarter
            );


        /*
         * Total shaping yang diletakkan
         * pada dart dasar.
         *
         * Ini bukan satu-satunya metode patternmaking,
         * tetapi menjadi base parametrik yang stabil.
         */

        const totalDart =
            Math.max(
                1.5,
                shaping *
                0.55
            );


        const requested =
            num(
                options.dart,
                totalDart
            );


        return Math.min(
            Math.max(
                1,
                requested
            ),
            Math.max(
                1,
                totalDart * 1.5
            )
        );

    }


    /* ========================================================
       FRONT SKIRT
       ======================================================== */

    function createFront(
        measurements,
        options = {}
    ) {

        const waist =
            num(
                measurements.waist,
                72
            );


        const hip =
            num(
                measurements.hip,
                96
            );


        const length =
            Math.max(
                20,
                num(
                    measurements.skirtLength,
                    55
                )
            );


        const ease =
            num(
                options.ease,
                2
            );


        const seam =
            Math.max(
                0,
                num(
                    options.seamAllowance,
                    1
                )
            );


        /*
         * Quarter measurement.
         */

        const waistQuarter =
            (
                waist +
                ease
            ) / 4;


        const hipQuarter =
            (
                hip +
                ease
            ) / 4;


        const dart =
            calculateDart(
                waistQuarter,
                hipQuarter,
                options
            );


        /*
         * Front center.
         */

        const centerX =
            0;


        const topY =
            0;


        const hipY =
            Math.max(
                18,
                length * 0.42
            );


        const hemY =
            length;


        /*
         * Basic front shape.
         *
         * A = center waist
         * B = side waist
         * C = side hip
         * D = side hem
         * E = center hem
         */

        const points = [

            [
                centerX,
                topY
            ],

            [
                waistQuarter +
                dart,
                topY
            ],

            [
                hipQuarter,
                hipY
            ],

            [
                hipQuarter,
                hemY
            ],

            [
                centerX,
                hemY
            ]

        ];


        /*
         * Seam allowance sederhana.
         *
         * Production Geometry akan menerima
         * nilai seam sebagai metadata.
         */

        const piece =
            ProductionGeometry
                .createProductionPiece({

                    name:
                        "SKIRT FRONT",

                    type:
                        "skirt-front",

                    side:
                        "front",

                    points,

                    quantity:
                        1,

                    label:
                        "SKIRT FRONT",

                    seamAllowance:
                        seam,

                    source:
                        "engine/skirt.js"

                });


        /*
         * Grainline.
         */

        const bounds =
            getBounds(
                points
            );


        piece.grainline = [

            [

                round(
                    (
                        bounds.minX +
                        bounds.maxX
                    ) / 2
                ),

                round(
                    bounds.minY +
                    5
                )

            ],

            [

                round(
                    (
                        bounds.minX +
                        bounds.maxX
                    ) / 2
                ),

                round(
                    bounds.maxY -
                    5
                )

            ]

        ];


        /*
         * Notch pada garis hip.
         */

        piece.notches = [

            [

                round(
                    bounds.maxX
                ),

                round(
                    hipY
                )

            ]

        ];


        piece.metadata = {

            ...(piece.metadata || {}),

            dartWidth:
                round(
                    dart
                ),

            hipLine:
                round(
                    hipY
                )

        };


        return piece;

    }


    /* ========================================================
       BACK SKIRT
       ======================================================== */

    function createBack(
        measurements,
        options = {}
    ) {

        const waist =
            num(
                measurements.waist,
                72
            );


        const hip =
            num(
                measurements.hip,
                96
            );


        const length =
            Math.max(
                20,
                num(
                    measurements.skirtLength,
                    55
                )
            );


        const ease =
            num(
                options.ease,
                2
            );


        const seam =
            Math.max(
                0,
                num(
                    options.seamAllowance,
                    1
                )
            );


        const waistQuarter =
            (
                waist +
                ease
            ) / 4;


        const hipQuarter =
            (
                hip +
                ease
            ) / 4;


        /*
         * Back dart sedikit lebih besar
         * daripada front.
         */

        const dart =
            calculateDart(

                waistQuarter,

                hipQuarter,

                {

                    dart:
                        num(
                            options.backDart,
                            (
                                hipQuarter -
                                waistQuarter
                            ) * 0.75
                        )

                }

            );


        const centerX =
            0;


        const topY =
            0;


        const hipY =
            Math.max(
                18,
                length * 0.42
            );


        const hemY =
            length;


        const points = [

            [
                centerX,
                topY
            ],

            [
                waistQuarter +
                dart,
                topY
            ],

            [
                hipQuarter,
                hipY
            ],

            [
                hipQuarter,
                hemY
            ],

            [
                centerX,
                hemY
            ]

        ];


        const piece =
            ProductionGeometry
                .createProductionPiece({

                    name:
                        "SKIRT BACK",

                    type:
                        "skirt-back",

                    side:
                        "back",

                    points,

                    quantity:
                        1,

                    label:
                        "SKIRT BACK",

                    seamAllowance:
                        seam,

                    source:
                        "engine/skirt.js"

                });


        const bounds =
            getBounds(
                points
            );


        piece.grainline = [

            [

                round(
                    (
                        bounds.minX +
                        bounds.maxX
                    ) / 2
                ),

                round(
                    bounds.minY +
                    5
                )

            ],

            [

                round(
                    (
                        bounds.minX +
                        bounds.maxX
                    ) / 2
                ),

                round(
                    bounds.maxY -
                    5
                )

            ]

        ];


        piece.notches = [

            [

                round(
                    bounds.maxX
                ),

                round(
                    hipY
                )

            ]

        ];


        piece.metadata = {

            ...(piece.metadata || {}),

            dartWidth:
                round(
                    dart
                ),

            hipLine:
                round(
                    hipY
                )

        };


        return piece;

    }


    /* ========================================================
       CREATE WAISTBAND
       ======================================================== */

    function createWaistband(
        measurements,
        options = {}
    ) {

        const waist =
            num(
                measurements.waist,
                72
            );


        const seam =
            Math.max(
                0,
                num(
                    options.seamAllowance,
                    1
                )
            );


        const waistbandHeight =
            Math.max(
                3,
                num(
                    options.waistbandHeight,
                    4
                )
            );


        const width =
            waist +
            num(
                options.ease,
                0
            );


        const points = [

            [0, 0],

            [
                width,
                0
            ],

            [
                width,
                waistbandHeight
            ],

            [
                0,
                waistbandHeight
            ]

        ];


        return ProductionGeometry
            .createProductionPiece({

                name:
                    "WAISTBAND",

                type:
                    "skirt-waistband",

                side:
                    "waist",

                points,

                quantity:
                    1,

                label:
                    "WAISTBAND",

                seamAllowance:
                    seam,

                source:
                    "engine/skirt.js"

            });

    }


    /* ========================================================
       CREATE SKIRT PIECES
       ======================================================== */

    function createSkirtPieces(
        context
    ) {

        const measurements =
            context.measurements ||
            {};


        const options =
            context.options ||
            {};


        const front =
            createFront(
                measurements,
                {

                    ...options,

                    ease:
                        num(
                            context.fabric?.ease,
                            2
                        )

                }

            );


        const back =
            createBack(
                measurements,
                {

                    ...options,

                    ease:
                        num(
                            context.fabric?.ease,
                            2
                        )

                }

            );


        const pieces = [

            front,

            back

        ];


        /*
         * Waistband hanya dibuat jika
         * fitur waistband diaktifkan.
         */

        if (
            options.waistband !== false
        ) {

            pieces.push(

                createWaistband(

                    measurements,

                    options

                )

            );

        }


        return pieces;

    }


    /* ========================================================
       GENERATE SKIRT
       ======================================================== */

    function generate(
        context = {}
    ) {

        if (
            !context.measurements
        ) {

            throw new Error(
                "Skirt Engine membutuhkan measurements."
            );

        }


        const pieces =
            createSkirtPieces(
                context
            );


        const layout =
            ProductionGeometry
                .layoutOpenPieces(

                    pieces,

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


        return {

            type:
                "skirt",

            engine:
                "skirt",

            version:
                "1.0",

            pieces:
                layout,

            source:
                "engine/skirt.js",

            metadata: {

                garment:
                    "skirt",

                unit:
                    "cm",

                fullOpen:
                    true,

                waistband:
                    context.options?.waistband !== false,

                note:
                    "Base skirt pattern. Fitting sample required before mass production."

            }

        };

    }


    /* ========================================================
       ENGINE OBJECT
       ======================================================== */

    const SkirtEngine = {

        id:
            "skirt",

        label:
            "Skirt Pattern Engine",

        version:
            "1.0",

        generate

    };


    /* ========================================================
       REGISTER ENGINE
       ======================================================== */

    if (
        Registry
    ) {

        Registry.registerEngine(

            "skirt",

            SkirtEngine

        );

    }


    /* ========================================================
       GLOBAL API
       ======================================================== */

    window.PatternMakerSkirtEngine = {

        SkirtEngine,

        generate,

        createSkirtPieces,

        createFront,

        createBack,

        createWaistband,

        calculateDart

    };


})();
```
