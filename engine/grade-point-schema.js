/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 88
 *
 * FILE:
 *   engine/grade-point-schema.js
 * ============================================================
 *
 * GRADE-POINT CONTRACT
 *
 * Purpose:
 *
 *   Pattern Geometry
 *        ↓
 *   Grade Point Metadata
 *        ↓
 *   Grading Engine
 *
 * ============================================================
 *
 * HARDENING FIX:
 *
 * KODE 88 memastikan public API berikut selalu tersedia:
 *
 *   normalizePoint()
 *   createFromPointDefinitions()
 *   validatePoint()
 *   validatePieceGradePoints()
 *   validatePatternGradePoints()
 *   attachGradePoints()
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1.1";


    /* ========================================================
       CONSTANTS
       ======================================================== */

    const AXES = Object.freeze({

        HORIZONTAL:
            "horizontal",

        VERTICAL:
            "vertical"

    });


    const DIRECTIONS = Object.freeze({

        BOTH:
            "both",

        POSITIVE:
            "positive",

        NEGATIVE:
            "negative"

    });


    const MEASUREMENT_KEYS = Object.freeze([

        "chest",

        "bust",

        "waist",

        "hip",

        "shoulder",

        "neck",

        "armhole",

        "upperArm",

        "wrist",

        "length",

        "garmentLength",

        "sleeveLength",

        "rise",

        "crotchDepth",

        "inseam",

        "outseam",

        "ankle",

        "thigh"

    ]);


    /* ========================================================
       NUMBER
       ======================================================== */

    function num(
        value,
        fallback = null
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
       AXIS
       ======================================================== */

    function normalizeAxis(
        value
    ) {

        const key =
            String(
                value || ""
            )
            .trim()
            .toLowerCase();


        if (
            key ===
            "x"

            ||

            key ===
            "width"
        ) {

            return AXES.HORIZONTAL;

        }


        if (
            key ===
            "y"

            ||

            key ===
            "height"

            ||

            key ===
            "depth"
        ) {

            return AXES.VERTICAL;

        }


        if (
            key ===
            AXES.HORIZONTAL

            ||

            key ===
            AXES.VERTICAL
        ) {

            return key;

        }


        return null;

    }


    /* ========================================================
       DIRECTION
       ======================================================== */

    function normalizeDirection(
        value
    ) {

        const key =
            String(
                value ||

                DIRECTIONS.BOTH

            )
            .trim()
            .toLowerCase();


        return Object.values(
            DIRECTIONS
        )
        .includes(
            key
        )

            ? key

            : DIRECTIONS.BOTH;

    }


    /* ========================================================
       MEASUREMENT KEY
       ======================================================== */

    function normalizeMeasurementKey(
        value
    ) {

        const key =
            String(
                value || ""
            )
            .trim();


        return MEASUREMENT_KEYS
            .includes(
                key
            )

            ? key

            : null;

    }


    /* ========================================================
       POINT NORMALIZATION
       ======================================================== */

    function normalizePoint(
        point,
        index = 0
    ) {

        if (
            Array.isArray(
                point
            )
        ) {

            return {

                index,

                x:
                    num(
                        point[0],
                        0
                    ),

                y:
                    num(
                        point[1],
                        0
                    ),

                horizontalMeasurement:
                    "hip",

                verticalMeasurement:
                    "length",

                horizontalFactor:
                    1,

                verticalFactor:
                    1,

                direction:
                    DIRECTIONS.BOTH,

                role:
                    "edge"

            };

        }


        return {

            index,

            x:
                num(
                    point?.x,
                    0
                ),

            y:
                num(
                    point?.y,
                    0
                ),

            horizontalMeasurement:

                normalizeMeasurementKey(
                    point?.horizontalMeasurement
                )

                ||

                normalizeMeasurementKey(
                    point?.horizontal
                )

                ||

                "hip",


            verticalMeasurement:

                normalizeMeasurementKey(
                    point?.verticalMeasurement
                )

                ||

                normalizeMeasurementKey(
                    point?.vertical
                )

                ||

                "length",


            horizontalFactor:
                num(
                    point?.horizontalFactor,
                    1
                ),


            verticalFactor:
                num(
                    point?.verticalFactor,
                    1
                ),


            direction:
                normalizeDirection(
                    point?.direction
                ),


            role:
                String(
                    point?.role ||
                    "edge"
                )

        };

    }


    /* ========================================================
       VALIDATE POINT
       ======================================================== */

    function validatePoint(
        point,
        index = 0
    ) {

        const errors =
            [];

        const warnings =
            [];


        const normalized =
            normalizePoint(
                point,
                index
            );


        /*
         * Coordinate.
         */

        if (
            !Number.isFinite(
                normalized.x
            ) ||

            !Number.isFinite(
                normalized.y
            )
        ) {

            errors.push(

                `Grade point ${index + 1} ` +
                "memiliki koordinat invalid."

            );

        }


        /*
         * Measurement.
         */

        if (
            !normalizeMeasurementKey(
                normalized.horizontalMeasurement
            )
        ) {

            errors.push(

                `Grade point ${index + 1} ` +
                "horizontal measurement invalid."

            );

        }


        if (
            !normalizeMeasurementKey(
                normalized.verticalMeasurement
            )
        ) {

            errors.push(

                `Grade point ${index + 1} ` +
                "vertical measurement invalid."

            );

        }


        /*
         * Factors.
         */

        if (
            !Number.isFinite(
                normalized.horizontalFactor
            )
        ) {

            errors.push(

                `Grade point ${index + 1} ` +
                "horizontalFactor invalid."

            );

        }


        if (
            !Number.isFinite(
                normalized.verticalFactor
            )
        ) {

            errors.push(

                `Grade point ${index + 1} ` +
                "verticalFactor invalid."

            );

        }


        if (
            normalized.horizontalFactor ===
            0

            &&

            normalized.verticalFactor ===
            0
        ) {

            warnings.push(

                `Grade point ${index + 1} ` +
                "tidak bergerak saat grading."

            );

        }


        return {

            valid:
                errors.length ===
                0,

            errors,

            warnings,

            point:
                normalized

        };

    }


    /* ========================================================
       CREATE DEFAULT POINT
       ======================================================== */

    function createDefaultPoint(
        index,
        options = {}
    ) {

        return normalizePoint(

            {

                x:
                    options.x ??
                    0,

                y:
                    options.y ??
                    0,

                horizontalMeasurement:

                    options.horizontalMeasurement ||

                    options.horizontal ||

                    "hip",

                verticalMeasurement:

                    options.verticalMeasurement ||

                    options.vertical ||

                    "length",

                horizontalFactor:

                    options.horizontalFactor ??

                    1,

                verticalFactor:

                    options.verticalFactor ??

                    1,

                direction:

                    options.direction ||

                    DIRECTIONS.BOTH,

                role:

                    options.role ||

                    "edge"

            },

            index

        );

    }


    /* ========================================================
       CREATE FROM DEFINITIONS
       ======================================================== */

    function createFromPointDefinitions(
        definitions = []
    ) {

        if (
            !Array.isArray(
                definitions
            )
        ) {

            throw new Error(

                "definitions harus berupa array."

            );

        }


        return definitions.map(
            (
                definition,
                index
            ) =>

                createDefaultPoint(

                    index,

                    definition || {}

                )

        );

    }


    /* ========================================================
       VALIDATE PIECE
       ======================================================== */

    function validatePieceGradePoints(
        piece
    ) {

        const errors =
            [];

        const warnings =
            [];


        const points =
            Array.isArray(
                piece?.points
            )

                ? piece.points

                : (

                    Array.isArray(
                        piece?.seamPoints
                    )

                        ? piece.seamPoints

                        : []

                );


        const gradePoints =
            Array.isArray(
                piece?.gradePoints
            )

                ? piece.gradePoints

                : [];


        if (
            points.length <
            3
        ) {

            errors.push(

                "Geometry harus memiliki " +
                "minimal 3 points."

            );

        }


        if (
            gradePoints.length !==
            points.length
        ) {

            errors.push(

                `Grade-point count ` +

                `${gradePoints.length} ` +

                `!= geometry count ` +

                `${points.length}.`

            );

        }


        gradePoints.forEach(
            (
                gradePoint,
                index
            ) => {

                const result =
                    validatePoint(

                        gradePoint,

                        index

                    );


                errors.push(
                    ...result.errors
                );


                warnings.push(
                    ...result.warnings
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
       VALIDATE PATTERN
       ======================================================== */

    function validatePatternGradePoints(
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

            return {

                valid:
                    false,

                errors: [

                    "Pattern tidak memiliki pieces."

                ],

                warnings: []

            };

        }


        pattern.pieces.forEach(
            (
                piece,
                index
            ) => {

                const result =
                    validatePieceGradePoints(
                        piece
                    );


                if (
                    !result.valid
                ) {

                    errors.push(

                        `Piece ${index + 1}: ` +

                        result.errors.join(
                            " | "
                        )

                    );

                }


                warnings.push(
                    ...result.warnings
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
       ATTACH GRADE POINTS
       ======================================================== */

    function attachGradePoints(
        piece,
        gradePoints
    ) {

        if (
            !piece
        ) {

            throw new Error(
                "Piece tidak tersedia."
            );

        }


        if (
            !Array.isArray(
                gradePoints
            )
        ) {

            throw new Error(
                "gradePoints harus berupa array."
            );

        }


        const normalized =
            gradePoints.map(
                (
                    point,
                    index
                ) =>
                    normalizePoint(
                        point,
                        index
                    )
            );


        const candidate = {

            ...piece,

            gradePoints:
                normalized

        };


        const validation =
            validatePieceGradePoints(
                candidate
            );


        if (
            !validation.valid
        ) {

            throw new Error(

                validation.errors.join(
                    " | "
                )

            );

        }


        return candidate;

    }


    /* ========================================================
       HARDENED PUBLIC API
       ======================================================== */

    const API = {

        VERSION,

        AXES,

        DIRECTIONS,

        MEASUREMENT_KEYS,

        normalizeAxis,

        normalizeDirection,

        normalizeMeasurementKey,

        normalizePoint,

        validatePoint,

        createDefaultPoint,

        createFromPointDefinitions,

        validatePieceGradePoints,

        validatePatternGradePoints,

        attachGradePoints

    };


    /*
     * Preserve any pre-existing measurement APIs.
     *
     * This makes loading order safer in the current
     * modular migration.
     */

    if (
        !globalThis.PatternMakerMeasurementSchema
    ) {

        globalThis.PatternMakerMeasurementSchema = {

            getCategoryLabel(
                category
            ) {

                return (

                    String(
                        category ||
                        "custom"
                    )

                );

            }

        };

    }


    if (
        !globalThis.PatternMakerMeasurementMapper
    ) {

        globalThis.PatternMakerMeasurementMapper = {

            getValue(
                measurements,
                key
            ) {

                return measurements?.[
                    key
                ];

            }

        };

    }


    globalThis.PatternMakerGradePointSchema =
        API;


})();
