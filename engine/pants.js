/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 19 — engine/pants.js
 * ============================================================
 *
 * PANTS PATTERN ENGINE
 *
 * Mendukung:
 *   - Pants
 *   - Shorts
 *
 * Measurement:
 *   waist
 *   hip
 *   rise
 *   thigh
 *   knee
 *   hem
 *   pantsLength
 *   shortsLength
 *
 * Output:
 *   FRONT
 *   BACK
 *   Full / Open
 *
 * Catatan:
 * Ini adalah base parametrik. Fitting sample tetap diperlukan
 * sebelum dipakai sebagai cutting master produksi.
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


    if (!ProductionGeometry) {

        throw new Error(
            "production-geometry.js belum tersedia."
        );

    }


    /* ========================================================
       HELPER
       ======================================================== */

    function num(value, fallback = 0) {

        const n = Number(value);

        return Number.isFinite(n)
            ? n
            : fallback;
    }


    function round(value) {

        return Math.round(
            Number(value) * 100
        ) / 100;
    }


    function getBounds(points) {

        const xs = points.map(
            point => point[0]
        );

        const ys = points.map(
            point => point[1]
        );

        return {

            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),

            width:
                Math.max(...xs) -
                Math.min(...xs),

            height:
                Math.max(...ys) -
                Math.min(...ys)

        };
    }


    /* ========================================================
       PANTS PARAMETERS
       ======================================================== */

    function calculateParameters(
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

        const rise =
            num(
                measurements.rise,
                27
            );

        const thigh =
            num(
                measurements.thigh,
                58
            );

        const knee =
            num(
                measurements.knee,
                thigh * 0.72
            );

        const hem =
            num(
                measurements.hem,
                32
            );

        const pantsLength =
            num(
                measurements.pantsLength,
                100
            );

        const shortsLength =
            num(
                measurements.shortsLength,
                38
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


        return {

            waist:
                waist + ease,

            hip:
                hip + ease,

            rise,

            thigh,

            knee,

            hem,

            pantsLength,

            shortsLength,

            ease,

            seam

        };

    }


    /* ========================================================
       CREATE FRONT
       ======================================================== */

    function createFront(
        measurements,
        options = {}
    ) {

        const p =
            calculateParameters(
                measurements,
                options
            );


        const length =
            options.short
                ? p.shortsLength
                : p.pantsLength;


        /*
         * Quarter hip.
         */

        const hipQuarter =
            p.hip / 4;


        const waistQuarter =
            p.waist / 4;


        /*
         * Front crotch extension.
         */

        const crotchExtension =
            Math.max(
                5,
                p.thigh / 6
            );


        /*
         * Position.
         */

        const x =
            0;

        const y =
            0;


        const riseY =
            p.rise;


        const kneeY =
            options.short
                ? length * 0.55
                : Math.min(
                    length * 0.62,
                    p.rise +
                    35
                );


        const hemY =
            length;


        /*
         * BASIC FRONT BLOCK
         *
         * A = waist center
         * B = waist side
         * C = crotch
         * D = inner leg
         * E = hem
         * F = side hem
         */

        const points = [

            [
                x,
                y
            ],

            [
                x + waistQuarter,
                y
            ],

            [
                x +
                hipQuarter +
                crotchExtension,
                riseY
            ],

            [
                x +
                hipQuarter * 0.72,
                kneeY
            ],

            [
                x +
                hipQuarter * 0.60,
                hemY
            ],

            [
                x,
                hemY
            ]

        ];


        const piece =
            ProductionGeometry
                .createProductionPiece({

                    name:
                        options.short
                            ? "SHORTS FRONT"
                            : "PANTS FRONT",

                    type:
                        options.short
                            ? "shorts-front"
                            : "pants-front",

                    side:
                        "front",

                    points,

                    quantity:
                        1,

                    label:
                        options.short
                            ? "SHORTS FRONT"
                            : "PANTS FRONT",

                    seamAllowance:
                        p.seam,

                    source:
                        "engine/pants.js"

                });


        const bounds =
            getBounds(
                points
            );


        /*
         * GRAINLINE
         */

        const grainX =
            (
                bounds.minX +
                bounds.maxX
            ) / 2;


        piece.grainline = [

            [
                round(grainX),
                round(bounds.minY + 5)
            ],

            [
                round(grainX),
                round(bounds.maxY - 5)
            ]

        ];


        /*
         * NOTCH AT KNEE
         */

        piece.notches = [

            [
                round(
                    bounds.maxX
                ),
                round(
                    kneeY
                )
            ]

        ];


        piece.metadata = {

            ...(piece.metadata || {}),

            waistQuarter:
                round(
                    waistQuarter
                ),

            hipQuarter:
                round(
                    hipQuarter
                ),

            rise:
                round(
                    p.rise
                ),

            kneeLine:
                round(
                    kneeY
                )

        };


        return piece;

    }


    /* ========================================================
       CREATE BACK
       ======================================================== */

    function createBack(
        measurements,
        options = {}
    ) {

        const p =
            calculateParameters(
                measurements,
                options
            );


        const length =
            options.short
                ? p.shortsLength
                : p.pantsLength;


        const hipQuarter =
            p.hip / 4;


        /*
         * Back waist is usually slightly larger
         * because of shaping.
         */

        const backWaistExtra =
            Math.max(
                1,
                hipQuarter * 0.05
            );


        const waistQuarter =
            (
                p.waist / 4
            ) +
            backWaistExtra;


        const crotchExtension =
            Math.max(
                7,
                p.thigh / 5
            );


        const riseY =
            p.rise;


        const kneeY =
            options.short
                ? length * 0.55
                : Math.min(
                    length * 0.62,
                    p.rise + 35
                );


        const hemY =
            length;


        const offsetX =
            60;


        const points = [

            [
                offsetX,
                0
            ],

            [
                offsetX +
                waistQuarter,
                0
            ],

            [
                offsetX +
                hipQuarter +
                crotchExtension,
                riseY
            ],

            [
                offsetX +
                hipQuarter * 0.75,
                kneeY
            ],

            [
                offsetX +
                hipQuarter * 0.62,
                hemY
            ],

            [
                offsetX,
                hemY
            ]

        ];


        const piece =
            ProductionGeometry
                .createProductionPiece({

                    name:
                        options.short
                            ? "SHORTS BACK"
                            : "PANTS BACK",

                    type:
                        options.short
                            ? "shorts-back"
                            : "pants-back",

                    side:
                        "back",

                    points,

                    quantity:
                        1,

                    label:
                        options.short
                            ? "SHORTS BACK"
                            : "PANTS BACK",

                    seamAllowance:
                        p.seam,

                    source:
                        "engine/pants.js"

                });


        const bounds =
            getBounds(
                points
            );


        /*
         * GRAINLINE
         */

        const grainX =
            (
                bounds.minX +
                bounds.maxX
            ) / 2;


        piece.grainline = [

            [
                round(grainX),
                round(bounds.minY + 5)
            ],

            [
                round(grainX),
                round(bounds.maxY - 5)
            ]

        ];


        /*
         * NOTCH
         */

        piece.notches = [

            [
                round(bounds.maxX),
                round(kneeY)
            ]

        ];


        piece.metadata = {

            ...(piece.metadata || {}),

            waistQuarter:
                round(waistQuarter),

            hipQuarter:
                round(hipQuarter),

            rise:
                round(p.rise),

            kneeLine:
                round(kneeY),

            backShaping:
                round(backWaistExtra)

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

        const p =
            calculateParameters(
                measurements,
                options
            );


        const waistbandHeight =
            Math.max(
                3,
                num(
                    options.waistbandHeight,
                    4
                )
            );


        const points = [

            [0, 0],

            [
                p.waist,
                0
            ],

            [
                p.waist,
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
                    options.short
                        ? "SHORTS WAISTBAND"
                        : "PANTS WAISTBAND",

                type:
                    options.short
                        ? "shorts-waistband"
                        : "pants-waistband",

                side:
                    "waist",

                points,

                quantity:
                    1,

                label:
                    options.short
                        ? "SHORTS WAISTBAND"
                        : "PANTS WAISTBAND",

                seamAllowance:
                    p.seam,

                source:
                    "engine/pants.js"

            });

    }


    /* ========================================================
       CREATE PANTS PIECES
       ======================================================== */

    function createPantsPieces(
        context
    ) {

        const measurements =
            context.measurements ||
            {};

        const options =
            context.options ||
            {};

        const short =
            context.garmentId ===
            "shorts";


        const front =
            createFront(

                measurements,

                {

                    ...options,

                    short

                }

            );


        const back =
            createBack(

                measurements,

                {

                    ...options,

                    short

                }

            );


        const pieces = [

            front,

            back

        ];


        /*
         * Waistband.
         */

        if (
            options.waistband !== false
        ) {

            pieces.push(

                createWaistband(

                    measurements,

                    {

                        ...options,

                        short

                    }

                )

            );

        }


        return pieces;

    }


    /* ========================================================
       GENERATE
       ======================================================== */

    function generate(
        context = {}
    ) {

        if (
            !context.measurements
        ) {

            throw new Error(
                "Pants Engine membutuhkan measurements."
            );

        }


        const pieces =
            createPantsPieces(
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


        const isShort =
            context.garmentId ===
            "shorts";


        return {

            type:
                isShort
                    ? "shorts"
                    : "pants",

            engine:
                "pants",

            version:
                "1.0",

            pieces:
                layout,

            source:
                "engine/pants.js",

            metadata: {

                garment:
                    isShort
                        ? "shorts"
                        : "pants",

                unit:
                    "cm",

                fullOpen:
                    true,

                waistband:
                    context.options?.waistband !== false,

                note:
                    "Base pants pattern. Fitting sample required before production."

            }

        };

    }


    /* ========================================================
       REGISTER
       ======================================================== */

    const PantsEngine = {

        id:
            "pants",

        label:
            "Pants / Shorts Pattern Engine",

        version:
            "1.0",

        generate

    };


    if (
        Registry
    ) {

        Registry.registerEngine(
            "pants",
            PantsEngine
        );

    }


    /* ========================================================
       GLOBAL API
       ======================================================== */

    window.PatternMakerPantsEngine = {

        PantsEngine,

        generate,

        createPantsPieces,

        createFront,

        createBack,

        createWaistband,

        calculateParameters

    };


})();
