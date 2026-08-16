/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 67
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
 * ADDED:
 *   Grade-point metadata
 *
 * ============================================================
 *
 * FLOW:
 *
 * Canonical Profile
 *       ↓
 * Bodice Base
 *       ↓
 * Dress Length Extension
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

    const Bodice =
        window.PatternMakerBodice;

    const GradePointSchema =
        window.PatternMakerGradePointSchema;


    if (
        !Schema ||
        !Bodice
    ) {

        throw new Error(

            "Dress Engine membutuhkan " +
            "measurement-schema.js dan " +
            "bodice.js."

        );

    }


    if (
        !GradePointSchema
    ) {

        throw new Error(

            "grade-point-schema.js harus dimuat " +
            "sebelum dress.js."

        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "V5-MIGRATED-v1.2";


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
                    Number(
                        value
                    )
                ) &&
                Number(
                    value
                ) > 0
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
       GRADE POINT DEFINITIONS
       ======================================================== */

    function createDressBodyGradePoints() {

        /*
         * Dress FRONT/BACK inherit the body construction
         * points from Bodice, but their vertical grading
         * is tied to the dress length.
         *
         * Geometry:
         *
         * 0 = center neckline
         * 1 = neck edge
         * 2 = shoulder
         * 3 = armhole
         * 4 = side hem
         * 5 = center hem
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
                    "dress-side-hem"

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
                    "dress-center-hem"

            }

        ];

    }


    /* ========================================================
       SLEEVE GRADE POINT DEFINITIONS
       ======================================================== */

    function createDressSleeveGradePoints() {

        /*
         * Dress uses the same sleeve geometry as Bodice.
         *
         * This is intentionally kept separate from the
         * dress-body grade points so dress length does not
         * accidentally affect sleeve grading.
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


        if (
            gradePoints.length !==
            piece.points.length
        ) {

            throw new Error(

                `Dress piece "${piece.name}" ` +
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
       EXTEND BODY PIECE
       ======================================================== */

    function extendBodyPiece(
        piece,
        extraLength
    ) {

        const output = {

            ...piece

        };


        const points =
            clonePoints(
                piece.points
            );


        if (
            points.length <
            3
        ) {

            throw new Error(

                `Dress piece "${piece.name}" ` +
                "tidak memiliki geometry valid."

            );

        }


        /*
         * V5 behavior:
         *
         * find maximum Y,
         * then extend bottom points only.
         */

        const maxY =
            Math.max(

                ...points.map(
                    point =>
                        Number(
                            point[1]
                        )
                )

            );


        output.points =
            points.map(
                (
                    [
                        x,
                        y
                    ]
                ) => [

                    x,

                    y === maxY

                        ? y +
                          extraLength

                        : y

                ]
            );


        /*
         * Extend grainline endpoint.
         */

        if (
            Array.isArray(
                output.grainline
            ) &&
            output.grainline.length >=
            2
        ) {

            const grainline =
                clonePoints(
                    output.grainline
                );


            grainline[
                grainline.length - 1
            ][1] +=
                extraLength;


            output.grainline =
                grainline;

        }


        return output;

    }


    /* ========================================================
       DRESS PIECES
       ======================================================== */

    function makeDressPieces(
        context = {}
    ) {

        const measurements =
            context?.profile?.measurements ||
            context?.measurements ||
            {};


        /*
         * V5 dependency:
         *
         * makeDressPieces()
         * uses makeUpperPieces()
         *
         * We preserve that architecture.
         */

        const dressContext = {

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
         * Generate base bodice.
         */

        const baseResult =
            Bodice.generate(
                dressContext
            );


        if (
            !baseResult ||
            !Array.isArray(
                baseResult.pieces
            )
        ) {

            throw new Error(

                "Bodice Engine tidak menghasilkan " +
                "pieces untuk Dress."

            );

        }


        /*
         * V5:
         *
         * dressLength - bodyLength
         *
         * bodyLength compatibility:
         *   bodyLength
         *
         * canonical:
         *   garmentLength
         */

        const targetLength =
            getMeasurement(

                measurements,

                "garmentLength",

                110,

                [
                    "dressLength"
                ]

            );


        const baseBodyLength =
            getMeasurement(

                measurements,

                "garmentLength",

                60,

                [
                    "bodyLength"
                ]

            );


        /*
         * Avoid extending if the supplied base garment
         * length is already equal to or greater than
         * requested dress length.
         */

        const extraLength =
            Math.max(

                0,

                targetLength -
                baseBodyLength

            );


        /*
         * Start from Bodice pieces.
         *
         * We intentionally rebuild grade metadata afterward
         * so Dress owns its own grading definition.
         */

        const pieces =
            baseResult.pieces
                .map(
                    piece => ({
                        ...piece,

                        gradePoints:
                            undefined
                    })
                );


        /*
         * Extend FRONT/BACK only.
         */

        const bodyPieces =
            pieces.map(
                piece => {

                    if (
                        piece.name !==
                            "FRONT" &&

                        piece.name !==
                            "BACK"
                    ) {

                        return piece;

                    }


                    return extendBodyPiece(

                        piece,

                        extraLength

                    );

                }
            );


        /* ====================================================
           RE-ATTACH DRESS GRADE POINTS
           ==================================================== */

        const bodyDefinitions =
            createDressBodyGradePoints();


        const sleeveDefinitions =
            createDressSleeveGradePoints();


        const finalPieces =
            bodyPieces.map(
                piece => {

                    if (
                        piece.name ===
                            "FRONT" ||

                        piece.name ===
                            "BACK"
                    ) {

                        return attachGradePoints(

                            piece,

                            bodyDefinitions

                        );

                    }


                    if (
                        piece.name ===
                            "SLEEVE_L" ||

                        piece.name ===
                            "SLEEVE_R"
                    ) {

                        return attachGradePoints(

                            piece,

                            sleeveDefinitions

                        );

                    }


                    return piece;

                }
            );


        /*
         * Remove undefined gradePoints from any unexpected
         * piece that might be returned by a future engine.
         */

        finalPieces.forEach(
            piece => {

                if (
                    piece.gradePoints ===
                    undefined
                ) {

                    delete piece.gradePoints;

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

            pieces:
                finalPieces,

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

                dressLength:
                    targetLength,

                baseBodyLength,

                extraLength,

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
                    "V5 makeDressPieces extraction"

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

    const DressEngine = {

        id:
            "dress",

        label:
            "Dress Pattern Engine",

        version:
            VERSION,

        generate(
            context = {}
        ) {

            return makeDressPieces(
                context
            );

        },

        makeDressPieces,

        validateGradePoints

    };


    /* ========================================================
       GLOBAL
       ======================================================== */

    window.PatternMakerDress =
        DressEngine;


})();
