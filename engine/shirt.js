/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 68
 *
 * FILE:
 *   engine/shirt.js
 *
 * SOURCE:
 *   PatternMaker_Universal_v5_Production_Drafting.html
 *
 * V5 BEHAVIOR:
 *   makeUpperPieces("shirt")
 *   +
 *   PLACKET
 *
 * ADDED:
 *   Grade-point metadata
 *
 * ============================================================
 *
 * IMPORTANT:
 *
 * - FRONT / BACK / SLEEVE memiliki grade points.
 * - PLACKET TIDAK memiliki grade points.
 * - PLACKET diperlakukan sebagai accessory / production piece.
 * - Seam production tetap berada di seam-production.js.
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
            "Shirt Engine membutuhkan measurement-schema.js dan bodice.js."
        );

    }


    if (
        !GradePointSchema
    ) {

        throw new Error(
            "grade-point-schema.js harus dimuat sebelum shirt.js."
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
            Number(value);

        return Number.isFinite(n)
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
            points || []
        )
        .map(
            point => [
                num(point[0]),
                num(point[1])
            ]
        );

    }


    /* ========================================================
       GRADE POINT DEFINITIONS
       ======================================================== */

    function createBodyGradePoints() {

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
                    "body-hem"
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
       SLEEVE GRADE POINT DEFINITIONS
       ======================================================== */

    function createSleeveGradePoints() {

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

                `Shirt piece "${piece.name}" ` +
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

                `Grade point validation gagal ` +
                `untuk "${piece.name}": ` +

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
            !Array.isArray(
                front.points
            ) ||
            front.points.length < 2
        ) {

            throw new Error(
                "Shirt Engine tidak dapat menentukan posisi PLACKET."
            );

        }


        const points =
            front.points;


        const xs =
            points.map(
                point =>
                    Number(point[0])
            );


        const ys =
            points.map(
                point =>
                    Number(point[1])
            );


        const minX =
            Math.min(
                ...xs
            );


        const maxY =
            Math.max(
                ...ys
            );


        const minY =
            Math.min(
                ...ys
            );


        const qHip =

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

            ) / 4;


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


        const width =
            Math.max(
                3,
                seam + 1.5
            );


        /*
         * Preserve the V5 open-layout relationship:
         *
         * frontX + qHip + 7
         *
         * The migrated FRONT uses its actual minimum X
         * as the front reference.
         */

        const x =
            minX +
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
                    x + width,
                    top
                ],

                [
                    x + width,
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
                    VERSION,

                gradingExcluded:
                    true,

                productionAccessory:
                    true

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
         * Use the migrated Bodice engine.
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
                "Bodice Engine tidak menghasilkan pieces untuk Shirt."
            );

        }


        /*
         * Convert body pieces to shirt metadata.
         */

        const pieces =
            bodiceResult.pieces
                .map(
                    piece => {

                        const output = {

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

                        };


                        /*
                         * Grade points are already created
                         * by Bodice KODE 63.
                         *
                         * We keep them here.
                         */

                        return output;

                    }
                );


        /*
         * Add PLACKET separately.
         *
         * PLACKET explicitly has:
         *
         *   gradingExcluded: true
         *
         * and does not receive gradePoints.
         */

        const placket =
            makePlacket(
                shirtContext,
                pieces
            );


        pieces.push(
            placket
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

            pieces,

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
                        GradePointSchema.VERSION,

                    excludedPieces: [

                        "PLACKET"

                    ]

                },

                formula:
                    'V5 makeUpperPieces("shirt") extraction'

            }

        };

    }


    /* ========================================================
       VALIDATE GRADE POINTS
       ======================================================== */

    function validateGradePoints(
        pattern
    ) {

        const errors =
            [];

        const warnings =
            [];


        if (
            !pattern ||
            !Array.isArray(
                pattern.pieces
            )
        ) {

            errors.push(
                "Shirt pattern tidak memiliki pieces."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        pattern.pieces.forEach(
            piece => {

                /*
                 * PLACKET intentionally excluded.
                 */

                if (
                    piece.name ===
                    "PLACKET"
                ) {

                    if (
                        piece.gradePoints
                    ) {

                        errors.push(

                            "PLACKET tidak boleh memiliki gradePoints."

                        );

                    }


                    if (
                        piece.metadata
                            ?.gradingExcluded !==
                        true
                    ) {

                        warnings.push(

                            "PLACKET sebaiknya memiliki " +
                            "metadata gradingExcluded=true."

                        );

                    }


                    return;

                }


                const validation =
                    GradePointSchema
                        .validatePieceGradePoints(
                            piece
                        );


                if (
                    !validation.valid
                ) {

                    errors.push(
                        ...validation.errors
                    );

                }


                warnings.push(
                    ...validation.warnings
                );

            }
        );


        return {

            valid:
                errors.length ===
                0,

            errors,

            warnings

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


        generate(
            context = {}
        ) {

            return makeShirtPieces(
                context
            );

        },


        makeShirtPieces,


        validateGradePoints

    };


    /* ========================================================
       GLOBAL
       ======================================================== */

    window.PatternMakerShirt =
        ShirtEngine;


})();
