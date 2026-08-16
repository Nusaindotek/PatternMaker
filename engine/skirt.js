```javascript
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 65
 *
 * FILE:
 *   engine/skirt.js
 * ============================================================
 *
 * SOURCE:
 *   PatternMaker_Universal_v5_Production_Drafting.html
 *
 * EXTRACTED:
 *   makeSkirtPieces()
 *
 * ADDED:
 *   Grade-point metadata
 *
 * ============================================================
 *
 * FLOW:
 *
 * Canonical Profile
 *      ↓
 * Skirt Drafting
 *      ↓
 * Base Geometry
 *      ↓
 * Grade Points
 *      ↓
 * Strict Grading
 *
 * ============================================================
 *
 * IMPORTANT:
 *
 * - Base pattern default TIDAK menambahkan seam allowance.
 * - Legacy radial seam hanya aktif jika:
 *
 *     options.includeLegacySeam === true
 *
 * - Seam produksi tetap ditangani oleh:
 *
 *     seam-production.js
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

            "Skirt Engine membutuhkan " +
            "measurement-schema.js dan " +
            "measurement-mapper.js."

        );

    }


    if (
        !GradePointSchema
    ) {

        throw new Error(

            "grade-point-schema.js harus dimuat " +
            "sebelum skirt.js."

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
       GET MEASUREMENT
       ======================================================== */

    function getMeasurement(
        measurements,
        canonicalId,
        fallback,
        aliases = []
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
                    "skirt",

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

    function createSkirtGradePoints() {

        /*
         * Geometry:
         *
         * 0 = center waist
         * 1 = side waist
         * 2 = side hem
         * 3 = center hem
         *
         * Horizontal grading:
         *
         * waist = 1/4 circumference
         * hip   = 1/4 circumference
         *
         * Vertical grading:
         *
         * length = full vertical increment
         */

        return [

            {

                horizontalMeasurement:
                    "waist",

                verticalMeasurement:
                    "length",

                horizontalFactor:
                    0,

                verticalFactor:
                    0,

                role:
                    "center-waist"

            },

            {

                horizontalMeasurement:
                    "waist",

                verticalMeasurement:
                    "length",

                horizontalFactor:
                    0.25,

                verticalFactor:
                    0,

                role:
                    "side-waist"

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


    /* ========================================================
       ATTACH GRADE POINTS
       ======================================================== */

    function attachGradePoints(
        piece
    ) {

        const definitions =
            createSkirtGradePoints();


        const gradePoints =
            GradePointSchema
                .createFromPointDefinitions(
                    definitions
                );


        /*
         * Ensure grade-point count matches
         * actual geometry count.
         */

        if (
            gradePoints.length !==
            piece.points.length
        ) {

            throw new Error(

                `Skirt piece "${piece.name}" ` +
                "memiliki jumlah grade points " +
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
       SKIRT PIECES
       ======================================================== */

    function makeSkirtPieces(
        context = {}
    ) {

        const measurements =
            context?.profile?.measurements ||
            context?.measurements ||
            {};


        const waist =
            getMeasurement(

                measurements,

                "waist",

                72

            )

            +

            getEase(
                context
            );


        const hip =
            getMeasurement(

                measurements,

                "hip",

                96

            )

            +

            getEase(
                context
            );


        /*
         * Canonical:
         *
         * garmentLength
         *
         * Legacy:
         *
         * skirtLength
         */

        const length =
            getMeasurement(

                measurements,

                "garmentLength",

                55,

                [
                    "skirtLength"
                ]

            );


        /*
         * Legacy compatibility seam.
         *
         * Normal base pattern does not apply it.
         */

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


        /*
         * V5 formula preserved.
         */

        const qW =
            waist / 4;


        const qH =
            hip / 4;


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

        const frontBase = [

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


        const backBase = [

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
           SEAM OPTION
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
           FRONT PIECE
           ==================================================== */

        const frontPiece =
            makePiece(

                "SKIRT_FRONT",

                applyLegacySeam(
                    frontBase
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

                applyLegacySeam(
                    backBase
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


        /* ====================================================
           GRADE POINTS
           ==================================================== */

        const frontWithGrade =
            attachGradePoints(
                frontPiece
            );


        const backWithGrade =
            attachGradePoints(
                backPiece
            );


        return [

            frontWithGrade,

            backWithGrade

        ];

    }


    /* ========================================================
       ENGINE
       ======================================================== */

    const SkirtEngine = {

        id:
            "skirt",

        label:
            "Skirt Pattern Engine",

        version:
            VERSION,


        generate(
            context = {}
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

                    grading: {

                        supported:
                            true,

                        strict:
                            true,

                        gradePointSchema:
                            GradePointSchema.VERSION

                    },

                    formula:
                        "V5 makeSkirtPieces extraction"

                }

            };

        },


        makeSkirtPieces,


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

    window.PatternMakerSkirt =
        SkirtEngine;


})();
```
