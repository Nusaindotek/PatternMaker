/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 55
 * FILE: engine/shirt.js
 * ============================================================
 *
 * SOURCE:
 *   PatternMaker_Universal_v5_Production_Drafting.html
 *
 * V5 source behavior:
 *   makeUpperPieces("shirt")
 *
 * Shirt is intentionally built on the migrated Bodice engine.
 * The V5-specific addition is the PLACKET piece.
 *
 * Seam allowance remains outside the normal base-pattern path.
 * Legacy radial seam can explicitly be requested through
 * context.options.includeLegacySeam=true.
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    const Schema =
        window.PatternMakerMeasurementSchema;

    const Bodice =
        window.PatternMakerBodice;


    if (
        !Schema ||
        !Bodice
    ) {

        throw new Error(
            "Shirt Engine membutuhkan measurement-schema.js dan bodice.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "V5-MIGRATED-v1";


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
       PLACKET
       ======================================================== */

    function makePlacket(
        context,
        pieces
    ) {

        const front =
            pieces.find(
                piece =>
                    piece.name === "FRONT"
            );


        if (
            !front ||
            !Array.isArray(front.points) ||
            front.points.length < 2
        ) {

            throw new Error(

                "Shirt Engine tidak dapat menentukan " +
                "posisi PLACKET dari FRONT."

            );

        }


        const points =
            front.points;


        const minX =
            Math.min(
                ...points.map(
                    point =>
                        Number(point[0])
                )
            );


        const maxX =
            Math.max(
                ...points.map(
                    point =>
                        Number(point[0])
                )
            );


        const minY =
            Math.min(
                ...points.map(
                    point =>
                        Number(point[1])
                )
            );


        const maxY =
            Math.max(
                ...points.map(
                    point =>
                        Number(point[1])
                )
            );


        const qHip =
            Math.max(

                0,

                (
                    num(
                        context?.profile
                            ?.measurements
                            ?.hip,

                        96

                    )
                    +

                    num(
                        context?.fabric?.ease,
                        0
                    )

                ) / 4

            );


        const seam =
            num(
                context?.options?.seam,
                0
            )

            +

            num(
                context?.options?.tolerance,
                0
            );


        const placketWidth =
            Math.max(

                3,

                seam + 1.5

            );


        /*
         * V5:
         *
         * x =
         *     frontX +
         *     qHip +
         *     7
         *
         * frontX = 15
         *
         * In the migrated bodice engine FRONT starts
         * from the same open-preview reference.
         *
         * We derive it from actual geometry rather
         * than DOM/state.
         */

        const frontX =
            minX;


        const x =
            frontX +
            qHip +
            7;


        const top =
            minY + 4;


        const bottom =
            maxY - 4;


        const category =
            context?.profile?.category ||
            context?.category ||
            "custom";


        return {

            name:
                "PLACKET",

            layer:
                "OUTLINE",

            points: [

                [
                    x,
                    top
                ],

                [
                    x +
                    placketWidth,

                    top
                ],

                [
                    x +
                    placketWidth,

                    bottom
                ],

                [
                    x,
                    bottom
                ]

            ],

            closed:
                true,

            grainline:
                null,

            notches:
                [],

            label:

                `PLACKET • ${

                    Schema.getCategoryLabel(
                        category
                    )

                }`,

            metadata: {

                engine:
                    "shirt",

                source:
                    "V5-migration",

                version:
                    VERSION

            }

        };

    }


    /* ========================================================
       SHIRT PIECES
       ======================================================== */

    function makeShirtPieces(
        context = {}
    ) {

        const shirtContext = {

            ...context,

            garment: {

                ...(context.garment || {}),

                id:
                    "shirt"

            },

            garmentId:
                "shirt"

        };


        /*
         * Use migrated Bodice engine.
         */

        const bodiceResult =
            Bodice.generate(
                shirtContext
            );


        if (
            !bodiceResult ||
            !Array.isArray(
                bodiceResult.pieces
            )
        ) {

            throw new Error(

                "Bodice Engine tidak menghasilkan " +
                "pieces untuk Shirt."

            );

        }


        /*
         * Convert base-piece metadata to shirt.
         */

        const basePieces =
            bodiceResult.pieces.map(

                piece => ({

                    ...piece,

                    metadata: {

                        ...(piece.metadata || {}),

                        engine:
                            "shirt",

                        source:
                            "V5-migration",

                        version:
                            VERSION

                    }

                })

            );


        /*
         * Add V5 PLACKET.
         */

        basePieces.push(

            makePlacket(

                shirtContext,

                basePieces

            )

        );


        const category =
            context?.profile?.category ||
            context?.category ||
            "custom";


        return {

            type:
                "base-pattern",

            engine:
                "shirt",

            version:
                VERSION,

            pieces:
                basePieces,

            metadata: {

                source:
                    "PatternMaker V5",

                migration:
                    true,

                category,

                categoryLabel:
                    Schema.getCategoryLabel(
                        category
                    ),

                unit:
                    "cm",

                scale:
                    1,

                fullOpen:
                    true,

                seamAllowanceIncluded:

                    Boolean(
                        context?.options
                            ?.includeLegacySeam
                    ),

                productionGeometry:
                    false,

                formula:
                    'V5 makeUpperPieces("shirt") extraction'

            }

        };

    }


    /* ========================================================
       ENGINE CONTRACT
       ======================================================== */

    const ShirtEngine = {

        id:
            "shirt",

        label:
            "Shirt Pattern Engine",

        version:
            VERSION,

        generate:
            makeShirtPieces,

        makeShirtPieces

    };


    /* ========================================================
       GLOBAL
       ======================================================== */

    window.PatternMakerShirt =
        ShirtEngine;


})();
