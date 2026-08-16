/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 61
 *
 * FILE:
 *   engine/grading-engine.js
 * ============================================================
 *
 * RESPONSIBILITY:
 *
 *   BASE PATTERN
 *       ↓
 *   GRADE POINTS
 *       ↓
 *   CATEGORY GRADING RULE
 *       ↓
 *   MULTI SIZE PATTERN
 *
 * ============================================================
 *
 * IMPORTANT:
 *
 * STRICT MODE
 *   membutuhkan explicit gradePoints pada setiap piece.
 *
 * APPROXIMATE MODE
 *   hanya fallback untuk preview/testing.
 *
 * Approximate grading TIDAK boleh dianggap sebagai
 * final garment-factory grading.
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
       MODES
       ======================================================== */

    const MODES = Object.freeze({

        STRICT:
            "strict",

        APPROXIMATE:
            "approximate"

    });


    /* ========================================================
       DEFAULT RULES
       ======================================================== *
       IMPORTANT:
       These are architecture defaults.
       They are NOT claimed as universal industry standards.
       Production rule tables should eventually come from
       the user's garment/brand grading specification.
       ======================================================== */

    const DEFAULT_RULES = {

        child: {

            name:
                "Child Basic",

            chest:
                2,

            bust:
                2,

            waist:
                2,

            hip:
                2,

            shoulder:
                0.5,

            armhole:
                1,

            upperArm:
                1,

            length:
                2,

            sleeveLength:
                1.5,

            rise:
                1,

            inseam:
                2,

            outseam:
                2

        },


        teen: {

            name:
                "Teen Basic",

            chest:
                2.5,

            bust:
                2.5,

            waist:
                2,

            hip:
                2.5,

            shoulder:
                0.6,

            armhole:
                1,

            upperArm:
                1,

            length:
                2,

            sleeveLength:
                1.5,

            rise:
                1,

            inseam:
                2,

            outseam:
                2

        },


        women: {

            name:
                "Women Basic",

            chest:
                4,

            bust:
                4,

            waist:
                4,

            hip:
                4,

            shoulder:
                0.8,

            armhole:
                1,

            upperArm:
                1,

            length:
                1.5,

            sleeveLength:
                1,

            rise:
                1,

            inseam:
                1.5,

            outseam:
                1.5

        },


        men: {

            name:
                "Men Basic",

            chest:
                4,

            bust:
                4,

            waist:
                4,

            hip:
                4,

            shoulder:
                1,

            armhole:
                1,

            upperArm:
                1,

            length:
                2,

            sleeveLength:
                1.5,

            rise:
                1,

            inseam:
                2,

            outseam:
                2

        },


        custom: {

            name:
                "Custom",

            chest:
                2,

            bust:
                2,

            waist:
                2,

            hip:
                2,

            shoulder:
                0.5,

            armhole:
                1,

            upperArm:
                1,

            length:
                2,

            sleeveLength:
                1,

            rise:
                1,

            inseam:
                2,

            outseam:
                2

        }

    };


    /* ========================================================
       CLONE
       ======================================================== */

    function clone(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return value;

        }


        if (
            typeof structuredClone ===
            "function"
        ) {

            return structuredClone(
                value
            );

        }


        return JSON.parse(
            JSON.stringify(
                value
            )
        );

    }


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


        return Number.isFinite(n)
            ? n
            : fallback;

    }


    /* ========================================================
       ROUND
       ======================================================== */

    function round(
        value
    ) {

        return Math.round(
            num(value) * 1000
        ) / 1000;

    }


    /* ========================================================
       RULE
       ======================================================== */

    function getRule(
        category,
        customRules = {}
    ) {

        const base =
            DEFAULT_RULES[
                category
            ] ||
            DEFAULT_RULES.custom;


        return {

            ...base,

            ...(customRules[
                category
            ] || {})

        };

    }


    /* ========================================================
       SIZE NORMALIZATION
       ======================================================== */

    function normalizeSizes(
        sizes
    ) {

        if (
            !Array.isArray(
                sizes
            ) ||
            sizes.length === 0
        ) {

            throw new Error(
                "Daftar grading size kosong."
            );

        }


        return sizes.map(
            (
                size,
                index
            ) => {

                if (
                    typeof size ===
                    "string"
                ) {

                    return {

                        id:
                            size,

                        label:
                            size,

                        index

                    };

                }


                return {

                    ...size,

                    id:
                        size.id ||
                        size.name ||
                        `SIZE-${index + 1}`,

                    label:
                        size.label ||
                        size.name ||
                        `Size ${index + 1}`,

                    index

                };

            }
        );

    }


    /* ========================================================
       SIZE OFFSET
       ======================================================== */

    function getSizeOffset(
        sizes,
        index
    ) {

        const center =
            (
                sizes.length - 1
            ) / 2;


        return (

            Number(index) -
            center

        );

    }


    /* ========================================================
       CANONICAL AXIS
       ======================================================== */

    function normalizeAxis(
        axis
    ) {

        const value =
            String(
                axis || ""
            )
            .trim()
            .toLowerCase();


        const aliases = {

            x:
                "horizontal",

            y:
                "vertical",

            horizontal:
                "horizontal",

            vertical:
                "vertical",

            width:
                "horizontal",

            length:
                "vertical"

        };


        return (

            aliases[
                value
            ] ||

            "horizontal"

        );

    }


    /* ========================================================
       GRADE POINT TYPE
       ======================================================== */

    function normalizeGradePoint(
        point,
        index
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
                        point[0]
                    ),

                y:
                    num(
                        point[1]
                    ),

                horizontal:
                    "chest",

                vertical:
                    "length"

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

            horizontal:
                point?.horizontal ||
                "chest",

            vertical:
                point?.vertical ||
                "length",

            horizontalFactor:
                point?.horizontalFactor ??
                1,

            verticalFactor:
                point?.verticalFactor ??
                1

        };

    }


    /* ========================================================
       GET GRADE POINTS
       ======================================================== */

    function getGradePoints(
        piece
    ) {

        if (
            !Array.isArray(
                piece?.gradePoints
            )
        ) {

            return null;

        }


        return piece.gradePoints.map(
            (
                point,
                index
            ) =>

                normalizeGradePoint(
                    point,
                    index
                )

        );

    }


    /* ========================================================
       STRICT CHECK
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
                pieceIndex
            ) => {

                const points =
                    piece.points ||
                    piece.seamPoints;


                const gradePoints =
                    getGradePoints(
                        piece
                    );


                if (
                    !gradePoints
                ) {

                    errors.push(

                        `Piece "${piece.name || pieceIndex + 1}" ` +
                        "belum memiliki gradePoints."

                    );


                    return;

                }


                if (
                    gradePoints.length !==
                    points.length
                ) {

                    errors.push(

                        `Piece "${piece.name || pieceIndex + 1}" ` +
                        "jumlah gradePoints tidak sama dengan geometry points."

                    );

                }


                gradePoints.forEach(
                    (
                        point,
                        pointIndex
                    ) => {

                        if (
                            point.x === null ||
                            point.y === null
                        ) {

                            errors.push(

                                `Piece "${piece.name || pieceIndex + 1}" ` +
                                `gradePoint ${pointIndex + 1} tidak memiliki coordinate.`

                            );

                        }


                        if (
                            !point.horizontal
                        ) {

                            warnings.push(

                                `Piece "${piece.name || pieceIndex + 1}" ` +
                                `gradePoint ${pointIndex + 1} tidak memiliki horizontal rule.`

                            );

                        }


                        if (
                            !point.vertical
                        ) {

                            warnings.push(

                                `Piece "${piece.name || pieceIndex + 1}" ` +
                                `gradePoint ${pointIndex + 1} tidak memiliki vertical rule.`

                            );

                        }

                    }
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
       APPROXIMATE GRADE MAP
       ======================================================== */

    function createApproximateGradePoints(
        piece
    ) {

        const points =
            piece.points ||
            piece.seamPoints ||
            [];


        if (
            points.length <
            3
        ) {

            return [];

        }


        let minX =
            Infinity;

        let maxX =
            -Infinity;

        let minY =
            Infinity;

        let maxY =
            -Infinity;


        points.forEach(
            point => {

                minX =
                    Math.min(
                        minX,
                        num(
                            point[0]
                        )
                    );


                maxX =
                    Math.max(
                        maxX,
                        num(
                            point[0]
                        )
                    );


                minY =
                    Math.min(
                        minY,
                        num(
                            point[1]
                        )
                    );


                maxY =
                    Math.max(
                        maxY,
                        num(
                            point[1]
                        )
                    );

            }
        );


        const width =
            Math.max(
                1,
                maxX - minX
            );


        const height =
            Math.max(
                1,
                maxY - minY
            );


        return points.map(
            (
                point,
                index
            ) => {

                const normalizedX =
                    (
                        num(
                            point[0]
                        ) -
                        minX
                    ) /
                    width;


                const normalizedY =
                    (
                        num(
                            point[1]
                        ) -
                        minY
                    ) /
                    height;


                /*
                 * Approximate mapping:
                 *
                 * X:
                 *   middle body → chest
                 *   lower body  → hip
                 *
                 * Y:
                 *   vertical length
                 */

                let horizontal =
                    "chest";


                if (
                    normalizedY >
                    0.65
                ) {

                    horizontal =
                        "hip";

                }
                else if (
                    normalizedY >
                    0.35
                ) {

                    horizontal =
                        "waist";

                }


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

                    horizontal,

                    vertical:
                        "length",

                    horizontalFactor:
                        1,

                    verticalFactor:
                        1

                };

            }
        );

    }


    /* ========================================================
       DELTA
       ======================================================== */

    function calculateDelta(
        rule,
        gradePoint,
        offset
    ) {

        const horizontalKey =
            gradePoint.horizontal ||
            "chest";


        const verticalKey =
            gradePoint.vertical ||
            "length";


        const horizontalDelta =
            num(
                rule[
                    horizontalKey
                ],
                0
            );


        const verticalDelta =
            num(
                rule[
                    verticalKey
                ],
                0
            );


        const horizontalFactor =
            num(
                gradePoint.horizontalFactor,
                1
            );


        const verticalFactor =
            num(
                gradePoint.verticalFactor,
                1
            );


        /*
         * Circumference grade:
         *
         * A full body circumference increase
         * is divided across the corresponding
         * pattern sides.
         *
         * factor:
         * 0.5 = half body
         * 0.25 = quarter body
         */

        const xDelta =

            horizontalDelta *
            offset *
            horizontalFactor;


        const yDelta =

            verticalDelta *
            offset *
            verticalFactor;


        return {

            x:
                xDelta,

            y:
                yDelta

        };

    }


    /* ========================================================
       GRADE PIECE
       ======================================================== */

    function gradePiece(
        piece,
        rule,
        offset,
        options = {}
    ) {

        const points =
            piece.points ||
            piece.seamPoints ||
            [];


        if (
            !Array.isArray(
                points
            ) ||
            points.length <
            3
        ) {

            throw new Error(

                `Piece "${piece.name || "unknown"}" ` +
                "tidak memiliki geometry yang valid."

            );

        }


        let gradePoints =
            getGradePoints(
                piece
            );


        let approximate =
            false;


        /*
         * STRICT
         */

        if (
            !gradePoints &&
            options.mode ===
            MODES.STRICT
        ) {

            throw new Error(

                `Piece "${piece.name || "unknown"}" ` +
                "tidak memiliki gradePoints ` +
                "untuk strict grading."

            );

        }


        /*
         * APPROXIMATE
         */

        if (
            !gradePoints
        ) {

            gradePoints =
                createApproximateGradePoints(
                    piece
                );


            approximate =
                true;

        }


        const gradedPoints =
            points.map(
                (
                    point,
                    index
                ) => {

                    const gradePoint =
                        gradePoints[
                            index
                        ];


                    const delta =
                        calculateDelta(

                            rule,

                            gradePoint,

                            offset

                        );


                    return [

                        round(
                            num(
                                point[0]
                            ) +
                            delta.x
                        ),

                        round(
                            num(
                                point[1]
                            ) +
                            delta.y
                        )

                    ];

                }
            );


        const output =
            clone(
                piece
            );


        output.points =
            gradedPoints;


        if (
            Array.isArray(
                piece.seamPoints
            )
        ) {

            output.seamPoints =
                gradedPoints.map(
                    point => [
                        point[0],
                        point[1]
                    ]
                );

        }


        /*
         * CutPoints cannot safely be preserved after
         * grading base geometry because the seam geometry
         * must be regenerated.
         */

        delete output.cutPoints;


        output.grading = {

            version:
                VERSION,

            offset,

            rule:
                rule.name,

            approximate

        };


        return output;

    }


    /* ========================================================
       GRADE PATTERN
       ======================================================== */

    function gradePattern(
        pattern,
        options = {}
    ) {

        if (
            !pattern ||
            !Array.isArray(
                pattern.pieces
            )
        ) {

            throw new Error(

                "Pattern tidak valid untuk grading."

            );

        }


        const category =
            options.category ||
            pattern.metadata?.category ||
            "custom";


        const mode =
            options.mode ||
            MODES.STRICT;


        if (
            !MODES[
                Object
                    .keys(
                        MODES
                    )
                    .find(
                        key =>
                            MODES[key] ===
                            mode
                    )
            ]
        ) {

            throw new Error(

                `Grading mode "${mode}" tidak dikenal.`

            );

        }


        const rule =
            getRule(

                category,

                options.rules ||
                {}

            );


        const sizes =
            normalizeSizes(
                options.sizes ||
                []
            );


        const variants =
            [];


        const warnings =
            [];


        if (
            mode ===
            MODES.STRICT
        ) {

            const gradeValidation =
                validateGradePoints(
                    pattern
                );


            if (
                !gradeValidation.valid
            ) {

                throw new Error(

                    "Strict grading gagal: " +

                    gradeValidation.errors.join(
                        " | "
                    )

                );

            }

        }
        else {

            warnings.push(

                "Approximate grading aktif. " +
                "Hasil ini tidak boleh dianggap sebagai " +
                "final factory grading."

            );

        }


        sizes.forEach(
            (
                size,
                index
            ) => {

                const offset =
                    getSizeOffset(
                        sizes,
                        index
                    );


                const gradedPieces =
                    pattern.pieces.map(
                        piece =>

                            gradePiece(

                                piece,

                                rule,

                                offset,

                                {

                                    ...options,

                                    mode

                                }

                            )

                    );


                variants.push({

                    ...clone(
                        pattern
                    ),

                    type:
                        "graded-pattern",

                    pieces:
                        gradedPieces,

                    metadata: {

                        ...(pattern.metadata || {}),

                        grading: {

                            version:
                                VERSION,

                            mode,

                            category,

                            rule:
                                rule.name,

                            sizeId:
                                size.id,

                            sizeLabel:
                                size.label,

                            index,

                            offset

                        },

                        cutGeometryInvalidated:
                            true

                    }

                });

            }
        );


        return {

            type:
                "graded-pattern-set",

            version:
                VERSION,

            mode,

            category,

            rule,

            sizes,

            variants,

            warnings,

            metadata: {

                source:
                    "PatternMaker Universal",

                baseEngine:
                    pattern.engine,

                generatedAt:
                    new Date()
                        .toISOString(),

                unit:
                    pattern.metadata?.unit ||
                    "cm"

            }

        };

    }


    /* ========================================================
       VALIDATE GRADED SET
       ======================================================== */

    function validateGradedPattern(
        graded
    ) {

        const errors =
            [];

        const warnings =
            [];


        if (
            !graded ||
            !Array.isArray(
                graded.variants
            )
        ) {

            errors.push(

                "Graded pattern set tidak memiliki variants."

            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            graded.variants.length ===
            0
        ) {

            errors.push(
                "Graded pattern set kosong."
            );

        }


        graded.variants.forEach(
            (
                variant,
                variantIndex
            ) => {

                if (
                    !Array.isArray(
                        variant.pieces
                    )
                ) {

                    errors.push(

                        `Variant ${variantIndex + 1} ` +
                        "tidak memiliki pieces."

                    );


                    return;

                }


                variant.pieces.forEach(
                    (
                        piece,
                        pieceIndex
                    ) => {

                        const points =
                            piece.points ||
                            piece.seamPoints ||
                            [];


                        if (
                            !Array.isArray(
                                points
                            ) ||
                            points.length <
                            3
                        ) {

                            errors.push(

                                `Variant ${variantIndex + 1}, ` +
                                `piece ${pieceIndex + 1} ` +
                                "geometry tidak valid."

                            );


                            return;

                        }


                        points.forEach(
                            (
                                point,
                                pointIndex
                            ) => {

                                if (
                                    !Array.isArray(
                                        point
                                    ) ||
                                    point.length <
                                    2 ||
                                    !Number.isFinite(
                                        Number(point[0])
                                    ) ||
                                    !Number.isFinite(
                                        Number(point[1])
                                    )
                                ) {

                                    errors.push(

                                        `Variant ${variantIndex + 1}, ` +
                                        `piece ${pieceIndex + 1}, ` +
                                        `point ${pointIndex + 1} invalid.`

                                    );

                                }

                            }
                        );

                    }
                );


                if (
                    variant.metadata
                        ?.cutGeometryInvalidated !==
                    true
                ) {

                    warnings.push(

                        `Variant ${variantIndex + 1} ` +
                        "belum menandai cut geometry sebagai invalidated."

                    );

                }

            }
        );


        if (
            graded.mode ===
            MODES.APPROXIMATE
        ) {

            warnings.push(

                "Set grading menggunakan approximate mode."

            );

        }


        return {

            valid:
                errors.length ===
                0,

            errors,

            warnings

        };

    }


    /* ========================================================
       SIZE SERIES
       ======================================================== */

    function createSizeSeries(
        ids
    ) {

        return normalizeSizes(
            ids
        );

    }


    /* ========================================================
       GRADE PREVIEW
       ======================================================== */

    function createGradePreview(
        pattern,
        options = {}
    ) {

        const result =
            gradePattern(

                pattern,

                {

                    ...options,

                    mode:
                        MODES.APPROXIMATE,

                    sizes:
                        options.sizes ||
                        [

                            {
                                id:
                                    "BASE",

                                label:
                                    "Base"

                            },

                            {
                                id:
                                    "UP",

                                label:
                                    "Grade +1"

                            },

                            {
                                id:
                                    "DOWN",

                                label:
                                    "Grade -1"

                            }

                        ]

                }

            );


        return result;

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        pattern,
        options = {}
    ) {

        const result =
            createGradePreview(

                pattern,

                options

            );


        console.group(
            "PatternMaker Grading Engine"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Mode:",
            result.mode
        );


        console.log(
            "Category:",
            result.category
        );


        console.log(
            "Rule:",
            result.rule
        );


        console.log(
            "Variants:",
            result.variants
        );


        console.groupEnd();


        return result;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerGradingEngine = {

        VERSION,

        MODES,

        DEFAULT_RULES,

        getRule,

        normalizeSizes,

        getSizeOffset,

        getGradePoints,

        validateGradePoints,

        createApproximateGradePoints,

        calculateDelta,

        gradePiece,

        gradePattern,

        validateGradedPattern,

        createSizeSeries,

        createGradePreview,

        debug

    };


})();
