/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 60
 *
 * FILE:
 *   engine/pattern-validator.js
 * ============================================================
 *
 * BASE PATTERN QUALITY GATE
 *
 * Tanggung jawab:
 *
 *   Pattern Engine
 *        ↓
 *   BASE PATTERN
 *        ↓
 *   Pattern Validator
 *
 * Tidak menangani:
 *
 * - seam allowance produksi
 * - cutting boundary
 * - nesting
 * - export
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const Geometry =
        window.PatternMakerProductionGeometry;


    if (
        !Geometry
    ) {

        throw new Error(
            "production-geometry.js harus dimuat sebelum pattern-validator.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1";


    const EPSILON =
        1e-7;


    const DEFAULT_OPTIONS = {

        requireClosed:
            true,

        checkDuplicates:
            true,

        checkSelfIntersection:
            true,

        requireGrainline:
            false,

        requireNotches:
            false,

        minimumArea:
            0.001

    };


    /* ========================================================
       NUMBER
       ======================================================== */

    function num(
        value
    ) {

        const n =
            Number(
                value
            );


        return Number.isFinite(
            n
        )
            ? n
            : null;

    }


    /* ========================================================
       POINT EQUALITY
       ======================================================== */

    function pointEqual(
        a,
        b
    ) {

        return (

            Array.isArray(a) &&
            Array.isArray(b) &&

            Math.abs(
                Number(a[0]) -
                Number(b[0])
            ) <= EPSILON

            &&

            Math.abs(
                Number(a[1]) -
                Number(b[1])
            ) <= EPSILON

        );

    }


    /* ========================================================
       ORIENTATION
       ======================================================== */

    function orientation(
        a,
        b,
        c
    ) {

        const value =

            (
                Number(b[1]) -
                Number(a[1])
            )
            *
            (
                Number(c[0]) -
                Number(b[0])
            )

            -

            (
                Number(b[0]) -
                Number(a[0])
            )
            *
            (
                Number(c[1]) -
                Number(b[1])
            );


        if (
            Math.abs(value) <=
            EPSILON
        ) {

            return 0;

        }


        return value > 0
            ? 1
            : 2;

    }


    /* ========================================================
       ON SEGMENT
       ======================================================== */

    function onSegment(
        a,
        b,
        c
    ) {

        return (

            Number(b[0]) <=
            Math.max(
                Number(a[0]),
                Number(c[0])
            ) + EPSILON

            &&

            Number(b[0]) >=
            Math.min(
                Number(a[0]),
                Number(c[0])
            ) - EPSILON

            &&

            Number(b[1]) <=
            Math.max(
                Number(a[1]),
                Number(c[1])
            ) + EPSILON

            &&

            Number(b[1]) >=
            Math.min(
                Number(a[1]),
                Number(c[1])
            ) - EPSILON

        );

    }


    /* ========================================================
       SEGMENT INTERSECTION
       ======================================================== */

    function segmentsIntersect(
        p1,
        p2,
        q1,
        q2
    ) {

        const o1 =
            orientation(
                p1,
                p2,
                q1
            );


        const o2 =
            orientation(
                p1,
                p2,
                q2
            );


        const o3 =
            orientation(
                q1,
                q2,
                p1
            );


        const o4 =
            orientation(
                q1,
                q2,
                p2
            );


        if (
            o1 !== o2 &&
            o3 !== o4
        ) {

            return true;

        }


        if (
            o1 === 0 &&
            onSegment(
                p1,
                q1,
                p2
            )
        ) {

            return true;

        }


        if (
            o2 === 0 &&
            onSegment(
                p1,
                q2,
                p2
            )
        ) {

            return true;

        }


        if (
            o3 === 0 &&
            onSegment(
                q1,
                p1,
                q2
            )
        ) {

            return true;

        }


        if (
            o4 === 0 &&
            onSegment(
                q1,
                p2,
                q2
            )
        ) {

            return true;

        }


        return false;

    }


    /* ========================================================
       SELF INTERSECTION
       ======================================================== */

    function findSelfIntersections(
        points
    ) {

        const result =
            [];


        if (
            !Array.isArray(points) ||
            points.length < 4
        ) {

            return result;

        }


        for (
            let i = 0;
            i < points.length;
            i++
        ) {

            const a1 =
                points[i];


            const a2 =
                points[
                    (
                        i + 1
                    ) %
                    points.length
                ];


            for (
                let j = i + 1;
                j < points.length;
                j++
            ) {

                /*
                 * Adjacent polygon edges are allowed
                 * to share a vertex.
                 */

                if (
                    j === i ||
                    j === (
                        i + 1
                    ) % points.length ||
                    (
                        i === 0 &&
                        j === points.length - 1
                    )
                ) {

                    continue;

                }


                const b1 =
                    points[j];


                const b2 =
                    points[
                        (
                            j + 1
                        ) %
                        points.length
                    ];


                if (
                    segmentsIntersect(
                        a1,
                        a2,
                        b1,
                        b2
                    )
                ) {

                    result.push({

                        edgeA:
                            i,

                        edgeB:
                            j

                    });

                }

            }

        }


        return result;

    }


    /* ========================================================
       DUPLICATE POINTS
       ======================================================== */

    function findDuplicatePoints(
        points
    ) {

        const result =
            [];


        if (
            !Array.isArray(points)
        ) {

            return result;

        }


        for (
            let i = 0;
            i < points.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < points.length;
                j++
            ) {

                /*
                 * Closing point duplication can be legitimate.
                 */

                if (
                    i === 0 &&
                    j === points.length - 1 &&
                    pointEqual(
                        points[i],
                        points[j]
                    )
                ) {

                    continue;

                }


                if (
                    pointEqual(
                        points[i],
                        points[j]
                    )
                ) {

                    result.push({

                        first:
                            i,

                        second:
                            j

                    });

                }

            }

        }


        return result;

    }


    /* ========================================================
       POINT VALIDATION
       ======================================================== */

    function validatePoints(
        points
    ) {

        const errors =
            [];

        const warnings =
            [];


        if (
            !Array.isArray(points)
        ) {

            errors.push(
                "Points harus berupa array."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            points.length <
            3
        ) {

            errors.push(

                "Polygon membutuhkan minimal 3 points."

            );

        }


        points.forEach(
            (
                point,
                index
            ) => {

                if (
                    !Array.isArray(point) ||
                    point.length < 2
                ) {

                    errors.push(

                        `Point ${index + 1} tidak valid.`

                    );


                    return;

                }


                if (
                    num(point[0]) === null ||
                    num(point[1]) === null
                ) {

                    errors.push(

                        `Point ${index + 1} ` +
                        "memiliki coordinate non-numeric."

                    );

                }

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
       PIECE VALIDATION
       ======================================================== */

    function validatePiece(
        piece,
        index,
        options = DEFAULT_OPTIONS
    ) {

        const errors =
            [];

        const warnings =
            [];


        if (
            !piece ||
            typeof piece !==
                "object"
        ) {

            errors.push(

                `Piece ${index + 1} bukan object.`

            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        const points =
            piece.points ||
            piece.seamPoints;


        if (
            !points
        ) {

            errors.push(

                `Piece "${piece.name || index + 1}" ` +
                "tidak memiliki points."

            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        const pointValidation =
            validatePoints(
                points
            );


        errors.push(
            ...pointValidation.errors
        );


        warnings.push(
            ...pointValidation.warnings
        );


        if (
            options.requireClosed &&
            piece.closed === false
        ) {

            errors.push(

                `Piece "${piece.name || index + 1}" ` +
                "tidak berstatus closed."

            );

        }


        if (
            options.checkDuplicates
        ) {

            const duplicates =
                findDuplicatePoints(
                    points
                );


            if (
                duplicates.length
            ) {

                errors.push(

                    `Piece "${piece.name || index + 1}" ` +
                    "memiliki duplicate points."

                );

            }

        }


        if (
            options.checkSelfIntersection
        ) {

            const intersections =
                findSelfIntersections(
                    points
                );


            if (
                intersections.length
            ) {

                errors.push(

                    `Piece "${piece.name || index + 1}" ` +
                    "memiliki self-intersection."

                );

            }

        }


        if (
            pointValidation.valid
        ) {

            const area =
                Math.abs(
                    Geometry.signedArea(
                        points
                    )
                );


            if (
                area <
                options.minimumArea
            ) {

                errors.push(

                    `Piece "${piece.name || index + 1}" ` +
                    `memiliki area terlalu kecil (${area}).`

                );

            }

        }


        if (
            options.requireGrainline
        ) {

            if (
                !Array.isArray(
                    piece.grainline
                ) ||
                piece.grainline.length <
                2
            ) {

                errors.push(

                    `Piece "${piece.name || index + 1}" ` +
                    "tidak memiliki grainline."

                );

            }

        }


        if (
            options.requireNotches
        ) {

            if (
                !Array.isArray(
                    piece.notches
                )
            ) {

                errors.push(

                    `Piece "${piece.name || index + 1}" ` +
                    "tidak memiliki notches."

                );

            }

        }


        return {

            valid:
                errors.length === 0,

            errors,

            warnings

        };

    }


    /* ========================================================
       PATTERN VALIDATION
       ======================================================== */

    function validatePattern(
        pattern,
        options = {}
    ) {

        const config = {

            ...DEFAULT_OPTIONS,

            ...options

        };


        const errors =
            [];

        const warnings =
            [];

        const checks =
            [];


        if (
            !pattern
        ) {

            return {

                valid:
                    false,

                version:
                    VERSION,

                errors: [
                    "Pattern tidak tersedia."
                ],

                warnings: [],

                checks: [],

                summary: {

                    pieceCount:
                        0

                }

            };

        }


        if (
            !Array.isArray(
                pattern.pieces
            ) ||
            pattern.pieces.length ===
                0
        ) {

            return {

                valid:
                    false,

                version:
                    VERSION,

                errors: [
                    "Pattern tidak memiliki pieces."
                ],

                warnings: [],

                checks: [],

                summary: {

                    pieceCount:
                        0

                }

            };

        }


        checks.push({

            name:
                "Pieces available",

            passed:
                true,

            message:
                ""

        });


        checks.push({

            name:
                "Engine identified",

            passed:
                Boolean(
                    pattern.engine
                ),

            message:

                pattern.engine

                    ? ""

                    : "Engine pattern belum diketahui."

        });


        pattern.pieces.forEach(
            (
                piece,
                index
            ) => {

                const result =
                    validatePiece(

                        piece,

                        index,

                        config

                    );


                errors.push(
                    ...result.errors
                );


                warnings.push(
                    ...result.warnings
                );


                checks.push({

                    name:
                        `Piece ${index + 1} geometry`,

                    passed:
                        result.valid,

                    message:
                        result.errors.join(
                            " | "
                        )

                });

            }
        );


        /*
         * Calculate bounds independently.
         */

        const allPoints =
            pattern.pieces.flatMap(
                piece =>
                    piece.points ||
                    piece.seamPoints ||
                    []
            );


        const bounds =
            Geometry.getBounds(
                allPoints
            );


        const boundsValid =

            Number.isFinite(
                bounds.width
            ) &&

            Number.isFinite(
                bounds.height
            ) &&

            bounds.width >
            0 &&

            bounds.height >
            0;


        checks.push({

            name:
                "Pattern bounds",

            passed:
                boundsValid,

            message:

                boundsValid

                    ? ""

                    : "Pattern bounds tidak valid."

        });


        if (
            !boundsValid
        ) {

            errors.push(

                "Pattern memiliki bounds kosong atau invalid."

            );

        }


        return {

            valid:
                errors.length ===
                0,

            version:
                VERSION,

            errors,

            warnings,

            checks,

            summary: {

                pieceCount:
                    pattern.pieces.length,

                bounds,

                errorCount:
                    errors.length,

                warningCount:
                    warnings.length

            }

        };

    }


    /* ========================================================
       QUICK CHECK
       ======================================================== */

    function isValid(
        pattern,
        options = {}
    ) {

        return validatePattern(

            pattern,

            options

        ).valid;

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        pattern,
        options = {}
    ) {

        const result =
            validatePattern(

                pattern,

                options

            );


        console.group(
            "PatternMaker Base Pattern Validator"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Valid:",
            result.valid
        );


        console.log(
            "Errors:",
            result.errors
        );


        console.log(
            "Warnings:",
            result.warnings
        );


        console.log(
            "Summary:",
            result.summary
        );


        console.groupEnd();


        return result;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerPatternValidator = {

        VERSION,

        DEFAULT_OPTIONS,

        validatePoints,

        validatePiece,

        validatePattern,

        isValid,

        findDuplicatePoints,

        findSelfIntersections,

        segmentsIntersect,

        debug

    };


})();
