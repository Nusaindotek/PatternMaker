/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 63
 *
 * FILE:
 *   engine/bodice.js
 * ============================================================
 *
 * Migrated from:
 *   PatternMaker Universal V5
 *
 * Added:
 *   Professional grade-point metadata
 *
 * ============================================================
 *
 * FLOW:
 *
 * Canonical Profile
 *       ↓
 * Bodice Drafting
 *       ↓
 * Base Geometry
 *       ↓
 * Grade Points
 *       ↓
 * Grading Engine
 *
 * ============================================================
 *
 * IMPORTANT:
 *
 * Grade points are metadata.
 * They do not directly modify geometry.
 *
 * Production seam allowance remains outside this engine.
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

    const GradePointSchema =
        window.PatternMakerGradePointSchema;


    if (
        !Schema ||
        !Mapper
    ) {

        throw new Error(

            "Bodice Engine membutuhkan " +
            "measurement-schema.js dan " +
            "measurement-mapper.js."

        );

    }


    if (
        !GradePointSchema
    ) {

        throw new Error(

            "grade-point-schema.js harus dimuat " +
            "sebelum bodice.js."

        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "V5-MIGRATED-v1.1";


    /* ========================================================
       NUMBER
       ======================================================== */

    function num(
        value,
        fallback = 0
    ) {

        const n =
            Number(
                value
            );


        return Number.isFinite(
            n
        )
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
            num(value) *
            10
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

                num(
                    point[0]
                ),

                num(
                    point[1]
                )

            ]
        );

    }


    /* ========================================================
       MEASUREMENT
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
                Number(
                    direct
                )
            ) &&
            Number(
                direct
            ) > 0
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
                Number(
                    mapped
                )
            ) &&
            Number(
                mapped
            ) > 0
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
       FIT
       ======================================================== */

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


    /* ========================================================
       FIT ADJUSTMENT
       ======================================================== */

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


    /* ========================================================
       LEGACY RADIAL SEAM
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
                    x -
                    cx;


                const dy =
                    y -
                    cy;


                const length =
                    Math.hypot(
                        dx,
                        dy
                    ) ||
                    1;


                const factor =
                    (
                        length +
                        seam
                    ) /
                    length;


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
                    "bodice",

                source:
                    "V5-migration",

                version:
                    VERSION

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
            (
                [
                    x,
                    y
                ]
            ) => [

                round1(
                    x +
                    dx
                ),

                round1(
                    y +
                    dy
                )

            ]
        );

    }


    /* ========================================================
       GRADE POINT BUILDERS
       ======================================================== */

    function createBodyGradePoints() {

        /*
         * Geometry points:
         *
         * 0 = center neckline
         * 1 = neck edge
         * 2 = shoulder
         * 3 = armhole / bust point
         * 4 = side hem
         * 5 = center hem
         *
         * Canonical grading relationship:
         *
         * shoulder width:
         *   half shoulder = 0.5
         *
         * chest / hip:
         *   quarter pattern = 0.25
         *
         * vertical:
         *   length-based
         */

        return [

            {

                horizontalMeasurement:
                    "shoulder",

                verticalMeasurement:
                    "length",

                horizontalFactor:
                    0,

                verticalFactor:
                    0,

                role:
                    "center-neck"

            },

            {

                horizontalMeasurement:
                    "shoulder",

                verticalMeasurement:
                    "length",

                horizontalFactor:
                    0,

                verticalFactor:
                    0,

                role:
                    "neck-edge"

            },

            {

                horizontalMeasurement:
                    "shoulder",

                verticalMeasurement:
                    "length",

                horizontalFactor:
                    0.5,

                verticalFactor:
                    0,

                role:
                    "shoulder"

            },

            {

                horizontalMeasurement:
                    "chest",

                verticalMeasurement:
                    "length",

                horizontalFactor:
                    0.25,

                verticalFactor:
                    0.35,

                role:
                    "armhole"

            },

            {

                horizontalMeasurement:
                    "hip",

                verticalMeasurement:
                    "length",

                horizontalFactor:
                    0.25,

                verticalFactor:
                    1,

                role:
                    "side-hem"

            },

            {

                horizontalMeasurement:
                    "hip",

                verticalMeasurement:
                    "length",

                horizontalFactor:
                    0,

                verticalFactor:
                    1,

                role:
                    "center-hem"

            }

        ];

    }


    function createSleeveGradePoints() {

        /*
         * Sleeve geometry:
         *
         * 0 = cap center
         * 1 = cap edge
         * 2 = side at mid length
         * 3 = hem edge
         * 4 = hem center
         */

        return [

            {

                horizontalMeasurement:
                    "upperArm",

                verticalMeasurement:
                    "sleeveLength",

                horizontalFactor:
                    0,

                verticalFactor:
                    0,

                role:
                    "sleeve-cap-center"

            },

            {

                horizontalMeasurement:
                    "upperArm",

                verticalMeasurement:
                    "sleeveLength",

                horizontalFactor:
                    0.5,

                verticalFactor:
                    0,

                role:
                    "sleeve-cap-edge"

            },

            {

                horizontalMeasurement:
                    "upperArm",

                verticalMeasurement:
                    "sleeveLength",

                horizontalFactor:
                    0.5,

                verticalFactor:
                    0.5,

                role:
                    "sleeve-side"

            },

            {

                horizontalMeasurement:
                    "upperArm",

                verticalMeasurement:
                    "sleeveLength",

                horizontalFactor:
                    0.5,

                verticalFactor:
                    1,

                role:
                    "sleeve-hem-edge"

            },

            {

                horizontalMeasurement:
                    "upperArm",

                verticalMeasurement:
                    "sleeveLength",

                horizontalFactor:
                    0,

                verticalFactor:
                    1,

                role:
                    "sleeve-hem-center"

            }

        ];

    }


    /* ========================================================
       ATTACH GRADE POINTS
       ======================================================== */

    function attachGradePoints(
        piece,
        definitions
    ) {

        const gradePoints =
            GradePointSchema
                .createFromPointDefinitions(
                    definitions
                );


        const validation =
            GradePointSchema
                .validatePieceGradePoints({

                    ...piece,

                    gradePoints

                });


        if (
            !validation.valid
        ) {

            throw new Error(

                `Grade point validation failed for ` +
                `"${piece.name}": ` +

                validation.errors.join(
                    " | "
                )

            );

        }


        return {

            ...piece,

            gradePoints

        };

    }


    /* ========================================================
       MAKE UPPER PIECES
       ======================================================== */

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


        /*
         * Retained for V5 compatibility.
         */

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
            ) *
            0.5;


        const qChest =
            chest /
            4;


        const qHip =
            hip /
            4;


        const shoulderHalf =
            Math.max(

                10,

                shoulder /
                2

            );


        const neckWidth =
            Math.max(

                5.5,

                neck /
                6

            );


        const armhole =
            Math.max(

                18,

                chest /
                6 +
                3

            );


        const fit =
            getFit(
                context
            );


        const fitAdd =
            getFitAdjustment(
                fit
            );


        /* ====================================================
           FRONT
           ==================================================== */

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
                qChest +
                fitAdd,
                armhole
            ],

            [
                qHip +
                fitAdd,
                bodyLength
            ],

            [
                0,
                bodyLength
            ]

        ];


        /* ====================================================
           BACK
           ==================================================== */

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
                qChest +
                fitAdd,
                armhole
            ],

            [
                qHip +
                fitAdd,
                bodyLength
            ],

            [
                0,
                bodyLength
            ]

        ];


        /* ====================================================
           SLEEVE
           ==================================================== */

        const sleeveWidth =
            Math.max(

                18,

                upperArm /
                2

            );


        const sleeveBase = [

            [0, 0],

            [
                sleeveWidth,
                3
            ],

            [
                sleeveWidth + 3,
                sleeveLength *
                0.48
            ],

            [
                sleeveWidth *
                0.78,
                sleeveLength
            ],

            [
                0,
                sleeveLength
            ]

        ];


        /* ====================================================
           OPEN POSITION
           ==================================================== */

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


        /* ====================================================
           OPTIONS
           ==================================================== */

        const includeNotches =
            context?.options?.notches !==
            false;


        const includeLegacySeam =
            context?.options
                ?.includeLegacySeam ===
            true;


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
           TRANSLATE
           ==================================================== */

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


        /* ====================================================
           LEGACY SEAM
           ==================================================== */

        function applyLegacySeam(
            points
        ) {

            return (

                includeLegacySeam

                    ? addRadialSeam(
                        points,
                        seam
                    )

                    : clonePoints(
                        points
                    )

            );

        }


        /* ====================================================
           PIECES
           ==================================================== */

        const frontPiece =
            makePiece(

                "FRONT",

                applyLegacySeam(
                    frontPoints
                ),

                {

                    grainline: [

                        [
                            frontX +
                            qHip /
                            2,

                            y + 8

                        ],

                        [
                            frontX +
                            qHip /
                            2,

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

            );


        const backPiece =
            makePiece(

                "BACK",

                applyLegacySeam(
                    backPoints
                ),

                {

                    grainline: [

                        [
                            backX +
                            qHip /
                            2,

                            y + 8

                        ],

                        [
                            backX +
                            qHip /
                            2,

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

            );


        const sleeveLeftPiece =
            makePiece(

                "SLEEVE_L",

                applyLegacySeam(
                    sleeveLeftPoints
                ),

                {

                    grainline: [

                        [
                            sleeve1X +
                            sleeveWidth /
                            2,

                            y + 12

                        ],

                        [
                            sleeve1X +
                            sleeveWidth /
                            2,

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

            );


        const sleeveRightPiece =
            makePiece(

                "SLEEVE_R",

                applyLegacySeam(
                    sleeveRightPoints
                ),

                {

                    grainline: [

                        [
                            sleeve2X +
                            sleeveWidth /
                            2,

                            y + 12

                        ],

                        [
                            sleeve2X +
                            sleeveWidth /
                            2,

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

            );


        /* ====================================================
           ATTACH GRADE POINTS
           ==================================================== */

        const bodyGradeDefinitions =
            createBodyGradePoints();


        const sleeveGradeDefinitions =
            createSleeveGradePoints();


        const frontWithGrade =
            attachGradePoints(

                frontPiece,

                bodyGradeDefinitions

            );


        const backWithGrade =
            attachGradePoints(

                backPiece,

                bodyGradeDefinitions

            );


        const sleeveLeftWithGrade =
            attachGradePoints(

                sleeveLeftPiece,

                sleeveGradeDefinitions

            );


        const sleeveRightWithGrade =
            attachGradePoints(

                sleeveRightPiece,

                sleeveGradeDefinitions

            );


        const pieces = [

            frontWithGrade,

            backWithGrade,

            sleeveLeftWithGrade,

            sleeveRightWithGrade

        ];


        /* ====================================================
           RESULT
           ==================================================== */

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

                grading: {

                    supported:
                        true,

                    strict:
                        true,

                    gradePointSchema:
                        GradePointSchema.VERSION

                },

                formula:
                    "V5 makeUpperPieces extraction"

            }

        };

    }


    /* ========================================================
       VALIDATE GRADE POINTS
       ======================================================== */

    function validateGradePoints(
        pattern
    ) {

        return GradePointSchema
            .validatePatternGradePoints(
                pattern
            );

    }


    /* ========================================================
       ENGINE CONTRACT
       ======================================================== */

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

        makeUpperPieces,

        validateGradePoints

    };


    /* ========================================================
       GLOBAL
       ======================================================== */

    window.PatternMakerBodice =
        BodiceEngine;


})();
