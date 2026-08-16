/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 41 — engine/grading-engine.js
 * ============================================================
 *
 * UNIVERSAL SIZE GRADING ENGINE
 *
 * Tujuan:
 *
 *   Base Pattern
 *       ↓
 *   Grading Rule
 *       ↓
 *   Size Variants
 *
 * ============================================================
 *
 * PRINSIP:
 *
 * 1. Base pattern tidak dimutasi.
 * 2. Setiap size merupakan clone terpisah.
 * 3. Grading bekerja berdasarkan titik geometry.
 * 4. Rule dapat berbeda untuk category.
 * 5. Engine dapat diperluas ke grade point profesional.
 *
 * ============================================================
 *
 * V1:
 *
 * - Delta chest
 * - Delta waist
 * - Delta hip
 * - Delta length
 * - Delta shoulder
 * - Delta sleeve
 *
 * V1 BELUM:
 *
 * - true grade-point ASTM
 * - nested-size optimization
 * - dart relocation grading
 * - curve reconstruction profesional
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       CONSTANTS
       ======================================================== */

    const VERSION =
        "1.0";


    /* ========================================================
       DEFAULT RULES
       ======================================================== */

    const DEFAULT_RULES = {

        child: {

            name:
                "Child Basic Grading",

            chest:
                2,

            waist:
                2,

            hip:
                2,

            length:
                2,

            shoulder:
                0.5,

            sleeve:
                1

        },

        teen: {

            name:
                "Teen Basic Grading",

            chest:
                2.5,

            waist:
                2,

            hip:
                2.5,

            length:
                2,

            shoulder:
                0.6,

            sleeve:
                1

        },

        women: {

            name:
                "Women Basic Grading",

            chest:
                4,

            waist:
                4,

            hip:
                4,

            length:
                1.5,

            shoulder:
                0.8,

            sleeve:
                1

        },

        men: {

            name:
                "Men Basic Grading",

            chest:
                4,

            waist:
                4,

            hip:
                4,

            length:
                2,

            shoulder:
                1,

            sleeve:
                1.5

        },

        custom: {

            name:
                "Custom Grading",

            chest:
                2,

            waist:
                2,

            hip:
                2,

            length:
                2,

            shoulder:
                0.5,

            sleeve:
                1

        }

    };


    /* ========================================================
       NUMBER HELPERS
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


    function round(
        value
    ) {

        return Math.round(
            Number(value) *
            1000
        ) / 1000;

    }


    /* ========================================================
       DEEP CLONE
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
       RULE MERGE
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

            ...(customRules?.[
                category
            ] || {})

        };

    }


    /* ========================================================
       SIGN
       ======================================================== */

    function directionSign(
        direction
    ) {

        const value =
            String(
                direction || ""
            )
            .toLowerCase();


        if (
            value ===
            "decrease"
        ) {

            return -1;

        }


        return 1;

    }


    /* ========================================================
       SIZE INDEX
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
                "Daftar size grading kosong."
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

        const middle =
            (
                sizes.length -
                1
            ) / 2;


        return (
            index -
            middle
        );

    }


    /* ========================================================
       COMPONENT TYPE
       ======================================================== */

    function detectAxis(
        point,
        index,
        piece
    ) {

        /*
         * V1 menggunakan geometry position.
         *
         * V2 dapat memakai explicit gradePoint
         * metadata dari pattern engine.
         */

        if (
            piece?.gradePoints &&
            piece.gradePoints[index]
        ) {

            return piece.gradePoints[index];

        }


        return {

            horizontal:
                "chest",

            vertical:
                "length"

        };

    }


    /* ========================================================
       GRADE DELTA
       ======================================================== */

    function getGradeDelta(
        rule,
        axis
    ) {

        const horizontal =
            axis?.horizontal ||
            "chest";


        const vertical =
            axis?.vertical ||
            "length";


        const horizontalDelta =
            num(
                rule[
                    horizontal
                ],
                0
            );


        const verticalDelta =
            num(
                rule[
                    vertical
                ],
                0
            );


        return {

            horizontal:
                horizontalDelta,

            vertical:
                verticalDelta

        };

    }


    /* ========================================================
       PIECE GRADING
       ======================================================== */

    function gradePiece(
        piece,
        rule,
        offset,
        options = {}
    ) {

        const output =
            clone(
                piece
            );


        const points =
            piece.cutPoints &&
            Array.isArray(
                piece.cutPoints
            )

                ? piece.cutPoints

                : piece.points;


        if (
            !Array.isArray(
                points
            )
        ) {

            throw new Error(

                `Piece "${piece.name || "unknown"}" ` +
                "tidak memiliki points."

            );

        }


        /*
         * Explicit point map:
         *
         * piece.gradePoints = [
         *   {
         *      horizontal: "chest",
         *      vertical: "length"
         *   }
         * ]
         *
         * Fallback:
         * chest + length
         */

        const transformed =
            points.map(
                (
                    point,
                    index
                ) => {

                    const axis =
                        detectAxis(

                            point,

                            index,

                            piece

                        );


                    const delta =
                        getGradeDelta(

                            rule,

                            axis

                        );


                    /*
                     * Half increment per side.
                     *
                     * Karena bust/waist/hip adalah
                     * ukuran keliling.
                     */

                    const xDelta =
                        (
                            delta.horizontal *
                            offset
                        ) /
                        2;


                    const yDelta =
                        delta.vertical *
                        offset;


                    return [

                        round(
                            Number(point[0]) +
                            xDelta
                        ),

                        round(
                            Number(point[1]) +
                            yDelta
                        )

                    ];

                }
            );


        /*
         * Preserve original geometry structure.
         */

        if (
            Array.isArray(
                piece.cutPoints
            )
        ) {

            output.cutPoints =
                transformed;

        }


        if (
            Array.isArray(
                piece.points
            )
        ) {

            output.points =
                transformed;

        }


        /*
         * Grainline.
         */

        if (
            Array.isArray(
                piece.grainline
            )
        ) {

            output.grainline =
                piece.grainline.map(
                    point => [

                        round(
                            Number(point[0])
                        ),

                        round(
                            Number(point[1]) +
                            (
                                rule.length *
                                offset
                            )
                        )

                    ]
                );

        }


        /*
         * Mark grade metadata.
         */

        output.grading =
            {

                offset,

                rule:
                    rule.name,

                version:
                    VERSION

            };


        return output;

    }


    /* ========================================================
       PATTERN GRADING
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


        const customRules =
            options.rules ||
            {};


        const rule =
            getRule(
                category,
                customRules
            );


        const sizes =
            normalizeSizes(
                options.sizes ||
                []
            );


        const variants =
            [];


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


                const sizePattern = {

                    pieces:
                        pattern.pieces.map(
                            piece =>
                                gradePiece(

                                    piece,

                                    rule,

                                    offset,

                                    options

                                )
                        ),

                    metadata: {

                        ...(clone(
                            pattern.metadata ||
                            {}
                        )),

                        grading: {

                            category,

                            rule:
                                rule.name,

                            sizeId:
                                size.id,

                            sizeLabel:
                                size.label,

                            offset,

                            version:
                                VERSION

                        },

                        unit:
                            pattern.metadata?.unit ||
                            "cm",

                        scale:
                            1

                    }

                };


                variants.push(
                    sizePattern
                );

            }
        );


        return {

            type:
                "graded-pattern",

            version:
                VERSION,

            category,

            rule,

            sizes,

            variants,

            metadata: {

                source:
                    "PatternMaker Universal",

                unit:
                    "cm",

                scale:
                    1,

                generatedAt:
                    new Date()
                        .toISOString()

            }

        };

    }


    /* ========================================================
       VALIDATE GRADED RESULT
       ======================================================== */

    function validateGradedPattern(
        graded
    ) {

        const errors =
            [];


        const warnings =
            [];


        if (
            !graded
        ) {

            errors.push(
                "Graded pattern belum tersedia."
            );

        }


        if (
            !Array.isArray(
                graded?.variants
            )
        ) {

            errors.push(
                "Graded pattern tidak memiliki variants."
            );

        }


        (
            graded?.variants ||
            []
        )
        .forEach(
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
                            piece.cutPoints &&
                            Array.isArray(
                                piece.cutPoints
                            )

                                ? piece.cutPoints

                                : piece.points;


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

                        }


                        points?.forEach(
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
                                        `point ${pointIndex + 1} ` +
                                        "tidak valid."

                                    );

                                }

                            }
                        );

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
       SIZE TABLE HELPER
       ======================================================== */

    function createSizeSeries(
        options = {}
    ) {

        const count =
            Math.max(
                1,
                Math.round(
                    num(
                        options.count,
                        5
                    )
                )
            );


        const prefix =
            options.prefix ||
            "SIZE";


        const start =
            num(
                options.start,
                1
            );


        const sizes =
            [];


        for (
            let i = 0;
            i < count;
            i++
        ) {

            sizes.push({

                id:
                    `${prefix}-${start + i}`,

                label:
                    `${prefix} ${start + i}`

            });

        }


        return sizes;

    }


    /* ========================================================
       COMMON READY-MADE SERIES
       ======================================================== */

    function createNumericSeries(
        start,
        end,
        step = 1
    ) {

        const output =
            [];


        const direction =
            end >= start
                ? 1
                : -1;


        const increment =
            Math.abs(
                step
            ) *
            direction;


        if (
            increment ===
            0
        ) {

            return [

                String(start)

            ];

        }


        let current =
            start;


        while (
            (
                direction > 0 &&
                current <= end
            )
            ||
            (
                direction < 0 &&
                current >= end
            )
        ) {

            output.push(
                String(
                    current
                )
            );


            current +=
                increment;

        }


        return output;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerGradingEngine = {

        VERSION,

        DEFAULT_RULES,

        clone,

        getRule,

        normalizeSizes,

        getSizeOffset,

        gradePiece,

        gradePattern,

        validateGradedPattern,

        createSizeSeries,

        createNumericSeries

    };


})();
