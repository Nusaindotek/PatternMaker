/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 66
 *
 * FILE:
 *   engine/pants.js
 *
 * SOURCE:
 *   PatternMaker_Universal_v5_Production_Drafting.html
 *
 * EXTRACTED:
 *   makePantPieces(shorts=false)
 *
 * ADDED:
 *   Grade-point metadata
 *
 * ============================================================
 *
 * SUPPORT:
 *
 *   pants
 *   shorts
 *
 * ============================================================
 *
 * FLOW:
 *
 * Canonical Profile
 *       ↓
 * Pants Drafting
 *       ↓
 * Base Geometry
 *       ↓
 * Grade Points
 *       ↓
 * Strict Grading
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

            "Pants Engine membutuhkan " +
            "measurement-schema.js dan " +
            "measurement-mapper.js."

        );

    }


    if (
        !GradePointSchema
    ) {

        throw new Error(

            "grade-point-schema.js harus dimuat " +
            "sebelum pants.js."

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
        fallback,
        aliases = []
    ) {

        /*
         * Canonical field.
         */

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


        /*
         * Mapper.
         */

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


        /*
         * Explicit legacy aliases.
         */

        for (
            const alias
            of aliases
        ) {

            const value =
                measurements?.[
                    alias
                ];


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
                    "pants",

                source:
                    "V5-migration",

                version:
                    VERSION

            }

        };

    }


    /* ========================================================
       GRADE POINT DEFINITIONS
       ======================================================== */

    function createPantsGradePoints(
        type
    ) {

        /*
         * Pants geometry:
         *
         * 0 = waist center
         * 1 = waist side
         * 2 = crotch point
         * 3 = outer hem
         * 4 = inner hem
         * 5 = center hem
         *
         * Shorts:
         *   vertical control = garmentLength
         *
         * Pants:
         *   vertical control = outseam
         */

        const lengthMeasurement =

            type ===
            "shorts"

                ? "garmentLength"

                : "outseam";


        return [

            {

                horizontalMeasurement:
                    "waist",

                verticalMeasurement:
                    lengthMeasurement,

                horizontalFactor:
                    0,

                verticalFactor:
                    0,

                role:
                    "waist-center"

            },


            {

                horizontalMeasurement:
                    "waist",

                verticalMeasurement:
                    lengthMeasurement,

                horizontalFactor:
                    0.25,

                verticalFactor:
                    0,

                role:
                    "waist-side"

            },


            {

                horizontalMeasurement:
                    "hip",

                verticalMeasurement:
                    "crotchDepth",

                horizontalFactor:
                    0.25,

                verticalFactor:
                    1,

                role:
                    "crotch"

            },


            {

                horizontalMeasurement:
                    "hip",

                verticalMeasurement:
                    lengthMeasurement,

                horizontalFactor:
                    0.25,

                verticalFactor:
                    1,

                role:
                    "outer-hem"

            },


            {

                horizontalMeasurement:
                    "hip",

                verticalMeasurement:
                    lengthMeasurement,

                horizontalFactor:
                    0.25,

                verticalFactor:
                    1,

                role:
                    "inner-hem"

            },


            {

                horizontalMeasurement:
                    "hip",

                verticalMeasurement:
                    lengthMeasurement,

                horizontalFactor:
                    0,

                verticalFactor:
                    1,

                role:
                    "center-hem"

            }

        ];

    }


    /* ========================================================
       ATTACH GRADE POINTS
       ======================================================== */

    function attachGradePoints(
        piece,
        type
    ) {

        const definitions =
            createPantsGradePoints(
                type
            );


        const gradePoints =
            GradePointSchema
                .createFromPointDefinitions(
                    definitions
                );


        if (
            gradePoints.length !==
            piece.points.length
        ) {

            throw new Error(

                `Pants piece "${piece.name}" ` +
                "memiliki jumlah grade point " +
                "yang tidak sama dengan geometry."

            );

        }


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

                `Grade point validation failed ` +
                `for "${piece.name}": ` +

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
       PANTS / SHORTS ENGINE
       ======================================================== */

    function makePantPieces(
        context = {}
    ) {

        const measurements =

            context?.profile
                ?.measurements

            ||

            context?.measurements

            ||

            {};


        /*
         * Determine garment type.
         */

        const garmentId =
            String(

                context?.garment?.id ||

                context?.garmentId ||

                ""

            )
            .toLowerCase();


        const isShorts =

            garmentId ===
            "shorts"

            ||

            context?.shorts ===
            true;


        const type =
            isShorts
                ? "shorts"
                : "pants";


        /* ====================================================
           V5 MEASUREMENTS
           ==================================================== */

        const ease =
            getEase(
                context
            );


        const hip =
            getMeasurement(

                measurements,

                "hip",

                96

            ) +

            ease;


        const waist =
            getMeasurement(

                measurements,

                "waist",

                72

            ) +

            ease;


        /*
         * V5 calculated waist even though
         * the current polygon formula does not
         * directly consume it.
         */

        void waist;


        /*
         * rise → crotchDepth
         */

        const rise =
            getMeasurement(

                measurements,

                "crotchDepth",

                27,

                [
                    "rise"
                ]

            );


        /*
         * Pants:
         *
         * outseam
         *
         * Legacy:
         * pantsLength
         *
         * Shorts:
         *
         * garmentLength
         *
         * Legacy:
         * shortsLength
         */

        const length =

            isShorts

                ? getMeasurement(

                    measurements,

                    "garmentLength",

                    38,

                    [
                        "shortsLength"
                    ]

                  )

                : getMeasurement(

                    measurements,

                    "outseam",

                    100,

                    [

                        "pantsLength",

                        "garmentLength"

                    ]

                  );


        /*
         * thigh
         */

        const thigh =
            getMeasurement(

                measurements,

                "thigh",

                58,

                [
                    "thighCircumference"
                ]

            ) +

            ease;


        /*
         * V5 uses hem.
         *
         * Canonical fallback:
         * ankle.
         */

        const hem =
            getMeasurement(

                measurements,

                "ankle",

                32,

                [
                    "hem"
                ]

            ) +

            ease;


        /* ====================================================
           SEAM COMPATIBILITY
           ==================================================== */

        const seam =

            Math.max(

                0,

                num(
                    context?.options?.seam,
                    0
                )

                +

                num(
                    context?.options?.tolerance,
                    0
                )

            );


        const includeLegacySeam =

            context?.options
                ?.includeLegacySeam ===
            true;


        /* ====================================================
           V5 FORMULA
           ==================================================== */

        const w =
            Math.max(

                23,

                hip / 4

            );


        const crotch =
            Math.max(

                8,

                thigh / 7

            );


        const hemW =
            Math.max(

                12,

                hem / 4

            );


        /* ====================================================
           LEFT
           ==================================================== */

        const leftBase = [

            [
                20,
                20
            ],

            [
                20 + w,
                20
            ],

            [
                20 + w + crotch,
                20 + rise
            ],

            [
                20 + w + 4,
                20 + length
            ],

            [
                20 + w - hemW,
                20 + length
            ],

            [
                20,
                20 + length - 8
            ]

        ];


        /* ====================================================
           RIGHT
           ==================================================== */

        const x2 =
            55 +
            w;


        const rightBase = [

            [
                x2,
                20
            ],

            [
                x2 + w,
                20
            ],

            [
                x2 + w + crotch,
                20 + rise
            ],

            [
                x2 + w + 4,
                20 + length
            ],

            [
                x2 + w - hemW,
                20 + length
            ],

            [
                x2,
                20 + length - 8
            ]

        ];


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
           NOTCHES
           ==================================================== */

        const includeNotches =
            context?.options?.notches !==
            false;


        const leftNotches =

            includeNotches

                ? [

                    [
                        20 + w,

                        20 +
                        rise +
                        8

                    ]

                ]

                : [];


        const rightNotches =

            includeNotches

                ? [

                    [
                        x2 + w,

                        20 +
                        rise +
                        8

                    ]

                ]

                : [];


        /* ====================================================
           OPTIONAL LEGACY SEAM
           ==================================================== */

        const leftPoints =

            includeLegacySeam

                ? addRadialSeam(
                    leftBase,
                    seam
                  )

                : clonePoints(
                    leftBase
                  );


        const rightPoints =

            includeLegacySeam

                ? addRadialSeam(
                    rightBase,
                    seam
                  )

                : clonePoints(
                    rightBase
                  );


        /* ====================================================
           PIECES
           ==================================================== */

        const leftPiece =
            makePiece(

                isShorts
                    ? "SHORTS_L"
                    : "PANTS_L",

                leftPoints,

                {

                    grainline: [

                        [
                            20 +
                            w / 2,

                            30

                        ],

                        [
                            20 +
                            w / 2,

                            20 +
                            length -
                            8

                        ]

                    ],

                    notches:
                        leftNotches,

                    label:

                        `${
                            isShorts
                                ? "SHORTS"
                                : "PANTS"
                        } LEFT • ${categoryLabel}`

                }

            );


        const rightPiece =
            makePiece(

                isShorts
                    ? "SHORTS_R"
                    : "PANTS_R",

                rightPoints,

                {

                    grainline: [

                        [
                            x2 +
                            w / 2,

                            30

                        ],

                        [
                            x2 +
                            w / 2,

                            20 +
                            length -
                            8

                        ]

                    ],

                    notches:
                        rightNotches,

                    label:

                        `${
                            isShorts
                                ? "SHORTS"
                                : "PANTS"
                        } RIGHT • ${categoryLabel}`

                }

            );


        /* ====================================================
           GRADE POINTS
           ==================================================== */

        const leftWithGrade =
            attachGradePoints(

                leftPiece,

                type

            );


        const rightWithGrade =
            attachGradePoints(

                rightPiece,

                type

            );


        return [

            leftWithGrade,

            rightWithGrade

        ];

    }


    /* ========================================================
       ENGINE CONTRACT
       ======================================================== */

    const PantsEngine = {

        id:
            "pants",

        label:
            "Pants / Shorts Pattern Engine",

        version:
            VERSION,


        generate(
            context = {}
        ) {

            const category =
                context?.profile?.category ||
                context?.category ||
                "custom";


            const garmentId =
                String(

                    context?.garment?.id ||

                    context?.garmentId ||

                    ""

                )
                .toLowerCase();


            const type =

                garmentId ===
                    "shorts"

                    ||

                context?.shorts ===
                    true

                    ? "shorts"

                    : "pants";


            return {

                type:
                    "base-pattern",

                engine:
                    "pants",

                version:
                    VERSION,

                pieces:

                    makePantPieces(
                        context
                    ),

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

                    garmentType:
                        type,

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

                    grading: {

                        supported:
                            true,

                        strict:
                            true,

                        gradePointSchema:
                            GradePointSchema.VERSION

                    },

                    formula:
                        "V5 makePantPieces extraction"

                }

            };

        },


        makePantPieces,


        validateGradePoints(
            pattern
        ) {

            return GradePointSchema
                .validatePatternGradePoints(
                    pattern
                );

        }

    };


    /* ========================================================
       GLOBAL
       ======================================================== */

    window.PatternMakerPants =
        PantsEngine;


})();
