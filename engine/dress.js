/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 54
 *
 * FILE:
 *   engine/dress.js
 *
 * SOURCE:
 *   PatternMaker_Universal_v5_Production_Drafting.html
 *
 * EXTRACTED:
 *   makeDressPieces()
 *
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
            "Dress Engine membutuhkan measurement-schema.js dan bodice.js."
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
       MEASUREMENT
       ======================================================== */

    function getMeasurement(
        context,
        id,
        fallback,
        aliases = []
    ) {

        const source =
            context?.profile?.measurements ||
            context?.measurements ||
            {};


        const direct =
            source[id];


        if (
            Number.isFinite(
                Number(direct)
            ) &&
            Number(direct) > 0
        ) {

            return Number(
                direct
            );

        }


        for (
            const key
            of aliases
        ) {

            const value =
                source[key];


            if (
                Number.isFinite(
                    Number(value)
                ) &&
                Number(value) > 0
            ) {

                return Number(
                    value
                );

            }

        }


        return num(
            fallback
        );

    }


    /* ========================================================
       DRESS PIECES
       ======================================================== */

    function makeDressPieces(
        context = {}
    ) {

        /*
         * V5:
         *
         * makeDressPieces()
         *      ↓
         * makeUpperPieces("dress")
         *
         * We preserve that dependency.
         */

        const baseContext = {

            ...context,

            garment: {

                ...(context.garment || {}),

                id:
                    "dress"

            },

            garmentId:
                "dress"

        };


        /*
         * IMPORTANT:
         *
         * Normal modular mode:
         * seam stays outside the pattern engine.
         *
         * Legacy comparison:
         * caller can explicitly set
         *
         * includeLegacySeam: true
         *
         * in the Bodice engine.
         */

        const baseResult =
            Bodice.generate({

                ...baseContext,

                options: {

                    ...(context.options || {})

                }

            });


        const pieces =
            baseResult.pieces;


        if (
            !Array.isArray(
                pieces
            )
        ) {

            throw new Error(
                "Bodice Engine tidak menghasilkan pieces untuk Dress."
            );

        }


        /* ====================================================
           SOURCE MEASUREMENTS
           ==================================================== */

        const source =
            context?.profile?.measurements ||
            context?.measurements ||
            {};


        /*
         * V5 uses:
         *
         * dressLength
         * bodyLength
         *
         * They are legacy names.
         *
         * Canonical fallback:
         *
         * garmentLength
         */

        const targetLength =

            Number.isFinite(
                Number(
                    source.dressLength
                )
            ) &&
            Number(
                source.dressLength
            ) > 0

                ? Number(
                    source.dressLength
                )

                : getMeasurement(

                    context,

                    "garmentLength",

                    110

                );


        const baseBodyLength =

            Number.isFinite(
                Number(
                    source.bodyLength
                )
            ) &&
            Number(
                source.bodyLength
            ) > 0

                ? Number(
                    source.bodyLength
                )

                : getMeasurement(

                    context,

                    "garmentLength",

                    60

                );


        /*
         * Equivalent to V5:
         *
         * extra =
         *   max(0, dressLength - bodyLength)
         */

        const extra =
            Math.max(

                0,

                targetLength -
                baseBodyLength

            );


        /* ====================================================
           EXTEND FRONT / BACK
           ==================================================== */

        pieces.forEach(
            piece => {

                if (
                    piece.name !==
                        "FRONT" &&

                    piece.name !==
                        "BACK"
                ) {

                    return;

                }


                const points =
                    piece.points ||
                    [];


                if (
                    !points.length
                ) {

                    return;

                }


                const maxY =
                    Math.max(

                        ...points.map(

                            point =>
                                Number(
                                    point[1]
                                )

                        )

                    );


                /*
                 * Match V5 behavior:
                 *
                 * Only points on the bottom edge
                 * are extended.
                 */

                piece.points =
                    points.map(
                        (
                            [
                                x,
                                y
                            ]
                        ) => [

                            Number(x),

                            Number(y) ===
                                maxY

                                ? Number(y) +
                                  extra

                                : Number(y)

                        ]
                    );


                /*
                 * Extend grainline endpoint.
                 */

                if (
                    piece.grainline
                ) {

                    const grainline =
                        piece.grainline.map(
                            point => [

                                Number(
                                    point[0]
                                ),

                                Number(
                                    point[1]
                                )

                            ]
                        );


                    if (
                        grainline.length >=
                        2
                    ) {

                        grainline[1][1] +=
                            extra;

                    }


                    piece.grainline =
                        grainline;

                }

            }
        );


        /* ====================================================
           CATEGORY
           ==================================================== */

        const category =
            context?.profile?.category ||
            context?.category ||
            "custom";


        const categoryLabel =
            Schema.getCategoryLabel(
                category
            );


        /* ====================================================
           RESULT
           ==================================================== */

        return {

            type:
                "base-pattern",

            engine:
                "dress",

            version:
                VERSION,

            pieces,

            metadata: {

                source:
                    "PatternMaker V5",

                migration:
                    true,

                category,

                categoryLabel,

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
                    "V5 makeDressPieces extraction"

            }

        };

    }


    /* ========================================================
       ENGINE CONTRACT
       ======================================================== */

    const DressEngine = {

        id:
            "dress",

        label:
            "Dress Pattern Engine",

        version:
            VERSION,

        generate:
            makeDressPieces,

        makeDressPieces

    };


    /* ========================================================
       GLOBAL
       ======================================================== */

    window.PatternMakerDress =
        DressEngine;


})();
