/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 52
 *
 * FILE:
 *   engine/skirt.js
 *
 * SOURCE:
 *   PatternMaker_Universal_v5_Production_Drafting.html
 *
 * EXTRACTED:
 *   makeSkirtPieces()
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

    const Mapper =
        window.PatternMakerMeasurementMapper;


    if (
        !Schema ||
        !Mapper
    ) {

        throw new Error(
            "Skirt Engine membutuhkan measurement schema + mapper."
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
       ROUND
       ======================================================== */

    function round1(
        value
    ) {

        return Math.round(
            num(value) * 10
        ) / 10;

    }


    /* ========================================================
       CLONE POINTS
       ======================================================== */

    function clonePoints(
        points
    ) {

        return (
            points ||
            []
        )
        .map(
            point => [

                num(point[0]),

                num(point[1])

            ]
        );

    }


    /* ========================================================
       GET MEASUREMENT
       ======================================================== */

    function getMeasurement(
        measurements,
        canonicalId,
        fallback
    ) {

        const direct =
            measurements?.[
                canonicalId
            ];


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


        const mapped =
            Mapper.getValue(

                measurements || {},

                canonicalId

            );


        if (
            Number.isFinite(
                Number(mapped)
            ) &&
            Number(mapped) > 0
        ) {

            return Number(
                mapped
            );

        }


        return num(
            fallback
        );

    }


    /* ========================================================
       MEASUREMENTS
       ======================================================== */

    function getMeasurements(
        context
    ) {

        const profile =
            context?.profile;


        const source =
            profile?.measurements ||
            context?.measurements ||
            {};


        return {

            waist:
                getMeasurement(
                    source,
                    "waist",
                    72
                ),

            hip:
                getMeasurement(
                    source,
                    "hip",
                    96
                ),

            garmentLength:
                getMeasurement(
                    source,
                    "garmentLength",
                    55
                )

        };

    }


    /* ========================================================
       EASE
       ======================================================== */

    function getEase(
        context
    ) {

        return Math.max(

            0,

            num(

                context?.fabric?.ease,

                num(
                    context?.options?.ease,
                    0
                )

            )

        );

    }


    /* ========================================================
       RADIAL SEAM
       ======================================================== */

    function addRadialSeam(
        points,
        seam
    ) {

        if (
            !(seam > 0) ||
            points.length < 3
        ) {

            return clonePoints(
                points
            );

        }


        let cx =
            0;

        let cy =
            0;


        for (
            const [
                x,
                y
            ]
            of points
        ) {

            cx += x;
            cy += y;

        }


        cx /=
            points.length;


        cy /=
            points.length;


        return points.map(
            (
                [
                    x,
                    y
                ]
            ) => {

                const dx =
                    x - cx;


                const dy =
                    y - cy;


                const len =
                    Math.hypot(
                        dx,
                        dy
                    ) ||
                    1;


                const factor =
                    (
                        len +
                        seam
                    ) /
                    len;


                return [

                    round1(
                        cx +
                        dx *
                        factor
                    ),

                    round1(
                        cy +
                        dy *
                        factor
                    )

                ];

            }
        );

    }


    /* ========================================================
       PIECE
       ======================================================== */

    function makePiece(
        name,
        points,
        options = {}
    ) {

        return {

            name,

            layer:
                options.layer ||
                "OUTLINE",

            points:
                clonePoints(
                    points
                ),

            closed:
                options.closed !==
                false,

            grainline:
                options.grainline
                    ? clonePoints(
                        options.grainline
                    )
                    : null,

            notches:
                options.notches
                    ? clonePoints(
                        options.notches
                    )
                    : [],

            label:
                options.label ||
                name,

            metadata: {

                engine:
                    "skirt",

                source:
                    "V5-migration",

                version:
                    VERSION

            }

        };

    }


    /* ========================================================
       SKIRT ENGINE
       ======================================================== */

    function makeSkirtPieces(
        context = {}
    ) {

        const measurements =
            getMeasurements(
                context
            );


        const waist =
            measurements.waist +
            getEase(
                context
            );


        const hip =
            measurements.hip +
            getEase(
                context
            );


        const length =
            measurements.garmentLength;


        const seam =
            num(
                context?.options?.seam,
                0
            ) +

            num(
                context?.options?.tolerance,
                0
            );


        const qW =
            waist /
            4;


        const qH =
            hip /
            4;


        const dart =
            Math.max(

                2,

                (
                    qH -
                    qW
                ) *
                0.7

            );


        /* ====================================================
           FRONT
           ==================================================== */

        const front = [

            [
                20,
                20
            ],

            [
                20 +
                qW +
                dart,

                20

            ],

            [
                20 +
                qH +
                2,

                20 +
                length

            ],

            [
                20,

                20 +
                length

            ]

        ];


        /* ====================================================
           BACK
           ==================================================== */

        const backX =
            50 +
            qH +
            qW;


        const back = [

            [
                backX,
                20
            ],

            [
                backX +
                qW +
                dart,

                20

            ],

            [
                backX +
                qW +
                qH +
                2,

                20 +
                length

            ],

            [
                backX,

                20 +
                length

            ]

        ];


        const category =
            context?.profile?.category ||
            context?.category ||
            "custom";


        const categoryLabel =
            Schema.getCategoryLabel(
                category
            );


        const includeNotches =
            context?.options?.notches !==
            false;


        /* ====================================================
           FRONT PIECE
           ==================================================== */

        const frontPiece =
            makePiece(

                "SKIRT_FRONT",

                addRadialSeam(
                    front,
                    seam
                ),

                {

                    grainline: [

                        [
                            20 +
                            qH / 2,

                            30
                        ],

                        [
                            20 +
                            qH / 2,

                            20 +
                            length -
                            8

                        ]

                    ],

                    notches:

                        includeNotches

                            ? [

                                [
                                    20 +
                                    qH +
                                    2,

                                    20 +
                                    length /
                                    2

                                ]

                            ]

                            : [],

                    label:
                        `SKIRT FRONT • ${categoryLabel}`

                }

            );


        /* ====================================================
           BACK PIECE
           ==================================================== */

        const backPiece =
            makePiece(

                "SKIRT_BACK",

                addRadialSeam(
                    back,
                    seam
                ),

                {

                    grainline: [

                        [
                            backX +
                            qH / 2,

                            30

                        ],

                        [
                            backX +
                            qH / 2,

                            20 +
                            length -
                            8

                        ]

                    ],

                    notches:

                        includeNotches

                            ? [

                                [
                                    backX +
                                    qH +
                                    qW +
                                    2,

                                    20 +
                                    length /
                                    2

                                ]

                            ]

                            : [],

                    label:
                        `SKIRT BACK • ${categoryLabel}`

                }

            );


        return [

            frontPiece,

            backPiece

        ];

    }


    /* ========================================================
       ENGINE CONTRACT
       ======================================================== */

    const SkirtEngine = {

        id:
            "skirt",

        label:
            "Skirt Pattern Engine",

        version:
            VERSION,

        generate(
            context
        ) {

            const category =
                context?.profile?.category ||
                context?.category ||
                "custom";


            return {

                type:
                    "base-pattern",

                engine:
                    "skirt",

                version:
                    VERSION,

                pieces:
                    makeSkirtPieces(
                        context
                    ),

                metadata: {

                    source:
                        "PatternMaker V5",

                    migration:
                        true,

                    category,

                    unit:
                        "cm",

                    scale:
                        1,

                    fullOpen:
                        true,

                    seamAllowanceIncluded:
                        true,

                    productionGeometry:
                        false,

                    formula:
                        "V5 makeSkirtPieces extraction"

                }

            };

        },

        makeSkirtPieces

    };


    /* ========================================================
       GLOBAL EXPORT
       ======================================================== */

    window.PatternMakerSkirt =
        SkirtEngine;


})();
