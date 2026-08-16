/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 62
 *
 * FILE:
 *   engine/grade-point-schema.js
 * ============================================================
 *
 * CENTRAL GRADE-POINT SCHEMA
 *
 * Tujuan:
 *
 *   Pattern Geometry
 *        ↓
 *   Grade Point Metadata
 *        ↓
 *   Grading Engine
 *
 * Tidak membuat geometry.
 * Tidak mengubah pattern.
 * Tidak menangani UI.
 *
 * ============================================================
 *
 * Grade point menjelaskan:
 *
 * - posisi titik
 * - measurement yang mengontrol X
 * - measurement yang mengontrol Y
 * - faktor perpindahan
 * - arah grading
 * - role titik
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    /* ========================================================
       AXES
       ======================================================== */

    const AXES = Object.freeze({

        HORIZONTAL:
            "horizontal",

        VERTICAL:
            "vertical"

    });


    /* ========================================================
       DIRECTIONS
       ======================================================== */

    const DIRECTIONS = Object.freeze({

        BOTH:
            "both",

        POSITIVE:
            "positive",

        NEGATIVE:
            "negative"

    });


    /* ========================================================
       ALLOWED MEASUREMENT KEYS
       ======================================================== */

    const MEASUREMENT_KEYS = Object.freeze([

        "chest",

        "bust",

        "waist",

        "hip",

        "shoulder",

        "armhole",

        "upperArm",

        "length",

        "garmentLength",

        "sleeveLength",

        "rise",

        "crotchDepth",

        "inseam",

        "outseam"

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
       AXIS NORMALIZER
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
            key === "x" ||
            key === "width"
        ) {

            return AXES.HORIZONTAL;

        }


        if (
            key === "y" ||
            key === "height" ||
            key === "depth"
        ) {

            return AXES.VERTICAL;

        }


        if (
            key === AXES.HORIZONTAL ||
            key === AXES.VERTICAL
        ) {

            return key;

        }


        return null;

    }


    /* ========================================================
       DIRECTION NORMALIZER
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
       MEASUREMENT KEY NORMALIZER
       ======================================================== */

    function normalizeMeasurementKey(
        value
    ) {

        const key =
            String(
                value || ""
            )
            .trim();


        return MEASUREMENT_KEYS.includes(
            key
        )

            ? key

            : null;

    }


    /* ========================================================
       POINT NORMALIZER
       ======================================================== */

    function normalizePoint(
        point,
        index = 0
    ) {

        /*
         * Array form:
         *
         * [x, y]
         *
         * This form is allowed for compatibility,
         * but defaults to approximate mapping.
         */

        if (
            Array.isArray(
                point
            )
        ) {

            return {

                index,

                x:
                    num(
                        point[0]
                    ),

                y:
                    num(
                        point[1]
                    ),

                horizontalMeasurement:
                    "chest",

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
                    point?.x
                ),

            y:
                num(
                    point?.y
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

                "chest",


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


        if (
            normalized.x ===
            null ||
            normalized.y ===
            null
        ) {

            errors.push(

                `Grade point ${index + 1} ` +
                "memiliki koordinat invalid."

            );

        }


        if (
            !normalized.horizontalMeasurement
        ) {

            errors.push(

                `Grade point ${index + 1} ` +
                "tidak memiliki horizontal measurement."

            );

        }


        if (
            !normalized.verticalMeasurement
        ) {

            errors.push(

                `Grade point ${index + 1} ` +
                "tidak memiliki vertical measurement."

            );

        }


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
            0 &&

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
                errors.length === 0,

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

                index,

                x:
                    options.x ??
                    0,

                y:
                    options.y ??
                    0,

                horizontalMeasurement:

                    options.horizontalMeasurement ||

                    "chest",

                verticalMeasurement:

                    options.verticalMeasurement ||

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
       VALIDATE PIECE GRADE POINTS
       ======================================================== */

    function validatePieceGradePoints(
        piece
    ) {

        const errors =
            [];

        const warnings =
            [];


        const points =
            piece?.points ||
            piece?.seamPoints ||
            [];


        const gradePoints =
            piece?.gradePoints;


        if (
            !Array.isArray(
                points
            ) ||
            points.length <
            3
        ) {

            errors.push(

                `Piece "${piece?.name || "unknown"}" ` +
                "tidak memiliki minimal 3 geometry points."

            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            !Array.isArray(
                gradePoints
            )
        ) {

            errors.push(

                `Piece "${piece?.name || "unknown"}" ` +
                "belum memiliki gradePoints."

            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            gradePoints.length !==
            points.length
        ) {

            errors.push(

                `Piece "${piece?.name || "unknown"}" ` +
                `memiliki ${gradePoints.length} gradePoints ` +
                `untuk ${points.length} geometry points.`

            );

        }


        gradePoints.forEach(
            (
                point,
                index
            ) => {

                const result =
                    validatePoint(
                        point,
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
                errors.length === 0,

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
            !piece ||
            !Array.isArray(
                gradePoints
            )
        ) {

            throw new Error(

                "Piece dan gradePoints harus tersedia."

            );

        }


        const candidate = {

            ...piece,

            gradePoints

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


        return {

            ...piece,

            gradePoints:

                gradePoints.map(
                    (
                        point,
                        index
                    ) =>
                        normalizePoint(
                            point,
                            index
                        )
                )

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

            errors.push(
                "Pattern tidak memiliki pieces."
            );


            return {

                valid:
                    false,

                errors,

                warnings

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

                    result.errors.forEach(
                        error => {

                            errors.push(

                                `Piece ${index + 1}: ` +
                                error

                            );

                        }
                    );

                }


                warnings.push(
                    ...result.warnings
                );

            }
        );


        return {

            valid:
                errors.length === 0,

            errors,

            warnings

        };

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

                    definition

                )

        );

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerGradePointSchema = {

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

        validatePieceGradePoints,

        attachGradePoints,

        validatePatternGradePoints,

        createFromPointDefinitions

    };


})();
