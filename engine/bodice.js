/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 51
 * FILE: engine/bodice.js
 * ============================================================
 *
 * Migrated from PatternMaker Universal v5:
 *   makeUpperPieces()
 *
 * IMPORTANT
 * - Reads canonical measurements from context, not DOM/state.
 * - Generates BASE geometry by default.
 * - Legacy radial seam can be enabled explicitly with
 *   context.options.includeLegacySeam=true for comparison tests.
 * - Normal production seam must be handled by seam-production.js.
 * ============================================================
 */

(function () {

    "use strict";

    const Schema =
        window.PatternMakerMeasurementSchema;

    const Mapper =
        window.PatternMakerMeasurementMapper;


    if (
        !Schema ||
        !Mapper
    ) {

        throw new Error(
            "Bodice Engine membutuhkan measurement-schema.js dan measurement-mapper.js."
        );

    }


    const VERSION =
        "V5-MIGRATED-v1";


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


    function round1(
        value
    ) {

        return Math.round(
            num(value) * 10
        ) / 10;

    }


    function clonePoints(
        points
    ) {

        return (points || [])
            .map(
                point => [
                    num(point[0]),
                    num(point[1])
                ]
            );

    }


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

            return Number(direct);

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

            return Number(mapped);

        }


        return num(
            fallback
        );

    }


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

            chest:
                getMeasurement(
                    source,
                    "chest",
                    88
                ),

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

            shoulder:
                getMeasurement(
                    source,
                    "shoulder",
                    38
                ),

            neck:
                getMeasurement(
                    source,
                    "neck",
                    38
                ),

            garmentLength:
                getMeasurement(
                    source,
                    "garmentLength",
                    60
                ),

            sleeveLength:
                getMeasurement(
                    source,
                    "sleeveLength",
                    58
                ),

            upperArm:
                getMeasurement(
                    source,
                    "upperArm",
                    28
                )

        };

    }


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


    function getFit(
        context
    ) {

        return String(

            context?.options?.fit ||
            context?.fit ||
            "regular"

        )
        .toLowerCase();

    }


    function getFitAdjustment(
        fit
    ) {

        return {

            close:
                -1,

            regular:
                0,

            relaxed:
                1.5,

            oversize:
                3

        }[
            fit
        ] ?? 0;

    }


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


        let cx = 0;
        let cy = 0;


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
                    ) || 1;


                const f =
                    (
                        len +
                        seam
                    ) /
                    len;


                return [

                    round1(
                        cx +
                        dx * f
                    ),

                    round1(
                        cy +
                        dy * f
                    )

                ];

            }
        );

    }


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
                    "bodice",

                source:
                    "V5-migration",

                version:
                    VERSION

            }

        };

    }


    function translatePoints(
        points,
        dx,
        dy
    ) {

        return points.map(
            (
                [
                    x,
                    y
                ]
            ) => [

                round1(
                    x + dx
                ),

                round1(
                    y + dy
                )

            ]
        );

    }


    function makeUpperPieces(
        context = {}
    ) {

        const measurements =
            getMeasurements(
                context
            );


        const chest =
            measurements.chest +
            getEase(
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


        /*
         * Kept for parity with V5.
         * V5 currently calculates waist here,
         * but the polygon formula does not use it.
         */

        void waist;


        const shoulder =
            measurements.shoulder;


        const neck =
            measurements.neck;


        const bodyLength =
            measurements.garmentLength;


        const sleeveLength =
            measurements.sleeveLength;


        const upperArm =
            measurements.upperArm +
            getEase(
                context
            ) * 0.5;


        const qChest =
            chest / 4;


        const qHip =
            hip / 4;


        const shoulderHalf =
            Math.max(
                10,
                shoulder / 2
            );


        const neckWidth =
            Math.max(
                5.5,
                neck / 6
            );


        const armhole =
            Math.max(
                18,
                chest / 6 + 3
            );


        const fit =
            getFit(
                context
            );


        const fitAdd =
            getFitAdjustment(
                fit
            );


        /*
         * FRONT
         */

        const frontBase = [

            [0, 0],

            [
                neckWidth + 2,
                0
            ],

            [
                shoulderHalf,
                2.2
            ],

            [
                qChest + fitAdd,
                armhole
            ],

            [
                qHip + fitAdd,
                bodyLength
            ],

            [
                0,
                bodyLength
            ]

        ];


        /*
         * BACK
         */

        const backBase = [

            [0, 0],

            [
                neckWidth + 2.5,
                0
            ],

            [
                shoulderHalf,
                1.8
            ],

            [
                qChest + fitAdd,
                armhole
            ],

            [
                qHip + fitAdd,
                bodyLength
            ],

            [
                0,
                bodyLength
            ]

        ];


        /*
         * SLEEVE
         */

        const sleeveWidth =
            Math.max(
                18,
                upperArm / 2
            );


        const sleeveBase = [

            [0, 0],

            [
                sleeveWidth,
                3
            ],

            [
                sleeveWidth + 3,
                sleeveLength * 0.48
            ],

            [
                sleeveWidth * 0.78,
                sleeveLength
            ],

            [
                0,
                sleeveLength
            ]

        ];


        /*
         * FULL OPEN POSITION
         * Same arrangement logic as V5.
         */

        const frontX =
            15;


        const backX =
            frontX +
            qHip +
            35;


        const sleeve1X =
            backX +
            qHip +
            35;


        const sleeve2X =
            sleeve1X +
            sleeveWidth +
            25;


        const y =
            25;


        const includeNotches =
            context?.options?.notches !==
            false;


        /*
         * Legacy radial seam is OFF
         * for the normal base-pattern path.
         */

        const includeLegacySeam =
            context?.options?.includeLegacySeam ===
            true;


        const seam =
            num(
                context?.options?.seam,
                0
            ) +

            num(
                context?.options?.tolerance,
                0
            );


        const category =
            context?.profile?.category ||
            context?.category ||
            "custom";


        const categoryLabel =
            Schema.getCategoryLabel(
                category
            );


        const frontPoints =
            translatePoints(

                frontBase,

                frontX,

                y

            );


        const backPoints =
            translatePoints(

                backBase,

                backX,

                y

            );


        const sleeveLeftPoints =
            translatePoints(

                sleeveBase,

                sleeve1X,

                y + 5

            );


        const sleeveRightPoints =
            translatePoints(

                sleeveBase,

                sleeve2X,

                y + 5

            );


        const applyLegacySeam =
            points =>

                includeLegacySeam

                    ? addRadialSeam(
                        points,
                        seam
                    )

                    : clonePoints(
                        points
                    );


        const pieces = [

            makePiece(
                "FRONT",

                applyLegacySeam(
                    frontPoints
                ),

                {

                    grainline: [

                        [
                            frontX +
                            qHip / 2,

                            y + 8

                        ],

                        [
                            frontX +
                            qHip / 2,

                            y +
                            bodyLength -
                            8

                        ]

                    ],

                    notches:
                        includeNotches

                            ? [

                                [
                                    frontX +
                                    qChest,

                                    y +
                                    armhole

                                ]

                            ]

                            : [],

                    label:
                        `FRONT • ${categoryLabel}`

                }

            ),


            makePiece(
                "BACK",

                applyLegacySeam(
                    backPoints
                ),

                {

                    grainline: [

                        [
                            backX +
                            qHip / 2,

                            y + 8

                        ],

                        [
                            backX +
                            qHip / 2,

                            y +
                            bodyLength -
                            8

                        ]

                    ],

                    notches:
                        includeNotches

                            ? [

                                [
                                    backX +
                                    qChest,

                                    y +
                                    armhole

                                ]

                            ]

                            : [],

                    label:
                        `BACK • ${categoryLabel}`

                }

            ),


            makePiece(
                "SLEEVE_L",

                applyLegacySeam(
                    sleeveLeftPoints
                ),

                {

                    grainline: [

                        [
                            sleeve1X +
                            sleeveWidth / 2,

                            y + 12

                        ],

                        [
                            sleeve1X +
                            sleeveWidth / 2,

                            y +
                            sleeveLength -
                            8

                        ]

                    ],

                    notches:
                        includeNotches

                            ? [

                                [
                                    sleeve1X +
                                    sleeveWidth *
                                    0.72,

                                    y + 6

                                ]

                            ]

                            : [],

                    label:
                        `SLEEVE L • ${categoryLabel}`

                }

            ),


            makePiece(
                "SLEEVE_R",

                applyLegacySeam(
                    sleeveRightPoints
                ),

                {

                    grainline: [

                        [
                            sleeve2X +
                            sleeveWidth / 2,

                            y + 12

                        ],

                        [
                            sleeve2X +
                            sleeveWidth / 2,

                            y +
                            sleeveLength -
                            8

                        ]

                    ],

                    notches:
                        includeNotches

                            ? [

                                [
                                    sleeve2X +
                                    sleeveWidth *
                                    0.72,

                                    y + 6

                                ]

                            ]

                            : [],

                    label:
                        `SLEEVE R • ${categoryLabel}`

                }

            )

        ];


        /*
         * SHIRT PLACKET
         */

        if (

            context?.garment?.id ===
                "shirt"

            ||

            context?.garmentId ===
                "shirt"

            ||

            context?.kind ===
                "shirt"

        ) {

            const placketW =
                Math.max(
                    3,
                    seam + 1.5
                );


            const x =
                frontX +
                qHip +
                7;


            pieces.push(

                makePiece(

                    "PLACKET",

                    [

                        [
                            x,
                            y + 4
                        ],

                        [
                            x +
                            placketW,
                            y + 4
                        ],

                        [
                            x +
                            placketW,
                            y +
                            bodyLength -
                            4
                        ],

                        [
                            x,
                            y +
                            bodyLength -
                            4
                        ]

                    ],

                    {

                        label:
                            `PLACKET • ${categoryLabel}`

                    }

                )

            );

        }


        return {

            type:
                "base-pattern",

            engine:
                "bodice",

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

                fit,

                fullOpen:
                    true,

                seamAllowanceIncluded:
                    includeLegacySeam,

                productionGeometry:
                    false,

                formula:
                    "V5 makeUpperPieces extraction"

            }

        };

    }


    const BodiceEngine = {

        id:
            "bodice",

        label:
            "Bodice / Top Pattern Engine",

        version:
            VERSION,

        generate(
            context
        ) {

            return makeUpperPieces(
                context
            );

        },

        makeUpperPieces

    };


    window.PatternMakerBodice =
        BodiceEngine;


})();
