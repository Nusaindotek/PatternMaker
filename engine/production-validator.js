/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 59
 *
 * FILE:
 *   engine/production-validator.js
 * ============================================================
 *
 * QUALITY GATE FOR PRODUCTION GEOMETRY
 *
 * Flow:
 *
 * BASE PATTERN
 *      ↓
 * SEAM PRODUCTION
 *      ↓
 * CUTTING GEOMETRY
 *      ↓
 * THIS VALIDATOR
 *      ↓
 * NESTING / EXPORT
 *
 * ============================================================
 *
 * Validator TIDAK memperbaiki geometry.
 *
 * Validator hanya:
 *
 * - memeriksa piece
 * - memeriksa points
 * - memeriksa cutPoints
 * - memeriksa seam
 * - memeriksa bounds
 * - memeriksa duplicate points
 * - memeriksa zero-length edge
 * - memeriksa self-intersection
 * - memeriksa finite numbers
 *
 * ============================================================
 */

(function () {

    "use strict";


    const Geometry =
        window.PatternMakerProductionGeometry;

    const SeamProduction =
        window.PatternMakerSeamProduction;


    if (
        !Geometry
    ) {

        throw new Error(
            "production-geometry.js harus dimuat sebelum production-validator.js."
        );

    }


    if (
        !SeamProduction
    ) {

        throw new Error(
            "seam-production.js harus dimuat sebelum production-validator.js."
        );

    }


    const VERSION =
        "FINAL-v1";


    /* ========================================================
       CONSTANTS
       ======================================================== */

    const EPSILON =
        1e-7;


    const DEFAULT_OPTIONS = {

        requireCutPoints:
            true,

        requireClosed:
            true,

        requireSeam:
            false,

        requireGrainline:
            false,

        requireNotches:
            false,

        allowLegacyRadial:
            true,

        checkSelfIntersection:
            true,

        checkDuplicatePoints:
            true,

        checkZeroLengthEdges:
            true,

        minimumArea:
            0.001

    };


    /* ========================================================
       HELPERS
       ======================================================== */

    function num(
        value
    ) {

        const n =
            Number(value);


        return Number.isFinite(
            n
        )
            ? n
            : null;

    }


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


    function normalizeOptions(
        options = {}
    ) {

        return {

            ...DEFAULT_OPTIONS,

            ...options

        };

    }


    function pointEqual(
        a,
        b,
        epsilon = EPSILON
    ) {

        if (
            !Array.isArray(a) ||
            !Array.isArray(b)
        ) {

            return false;

        }


        return (

            Math.abs(
                Number(a[0]) -
                Number(b[0])
            ) <= epsilon

            &&

            Math.abs(
                Number(a[1]) -
                Number(b[1])
            ) <= epsilon

        );

    }


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


    function segmentsIntersect(
        p1,
        p2,
        q1,
        q2
    ) {

        /*
         * Identical endpoints are not by themselves
         * considered a self-intersection when they
         * are adjacent polygon edges.
         */

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
       EDGE SELF INTERSECTION
       ======================================================== */

    function findSelfIntersections(
        points
    ) {

        const intersections =
            [];


        if (
            !Array.isArray(points) ||
            points.length < 4
        ) {

            return intersections;

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
                 * Adjacent edges share a vertex
                 * and should not be counted.
                 */

                if (
                    j === i
                    ||

                    j === (
                        i + 1
                    ) % points.length

                    ||

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

                    intersections.push({

                        edgeA:
                            i,

                        edgeB:
                            j

                    });

                }

            }

        }


        return intersections;

    }


    /* ========================================================
       DUPLICATE POINTS
       ======================================================== */

    function findDuplicatePoints(
        points
    ) {

        const duplicates =
            [];


        if (
            !Array.isArray(points)
        ) {

            return duplicates;

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
                 * Closing point may intentionally
                 * repeat first point in some formats.
                 */

                if (
                    j ===
                    points.length - 1 &&
                    i === 0 &&
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

                    duplicates.push({

                        first:
                            i,

                        second:
                            j

                    });

                }

            }

        }


        return duplicates;

    }


    /* ========================================================
       ZERO LENGTH EDGES
       ======================================================== */

    function findZeroLengthEdges(
        points
    ) {

        const edges =
            [];


        if (
            !Array.isArray(points) ||
            points.length < 2
        ) {

            return edges;

        }


        for (
            let i = 0;
            i < points.length;
            i++
        ) {

            const a =
                points[i];


            const b =
                points[
                    (
                        i + 1
                    ) %
                    points.length
                ];


            const dx =
                Number(b[0]) -
                Number(a[0]);


            const dy =
                Number(b[1]) -
                Number(a[1]);


            if (
                Math.hypot(
                    dx,
                    dy
                ) <=
                EPSILON
            ) {

                edges.push(
                    i
                );

            }

        }


        return edges;

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
                    point.length <
                    2
                ) {

                    errors.push(

                        `Point ${index + 1} tidak valid.`

                    );


                    return;

                }


                const x =
                    num(
                        point[0]
                    );


                const y =
                    num(
                        point[1]
                    );


                if (
                    x === null ||
                    y === null
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
        options
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


        if (
            !piece.name
        ) {

            warnings.push(

                `Piece ${index + 1} tidak memiliki name.`

            );

        }


        const points =
            piece.points ||
            piece.seamPoints ||
            null;


        const cutPoints =
            piece.cutPoints ||
            null;


        if (
            !points
        ) {

            errors.push(

                `Piece "${piece.name || index + 1}" ` +
                "tidak memiliki base/seam points."

            );

        }
        else {

            const validation =
                validatePoints(
                    points
                );


            errors.push(
                ...validation.errors
            );


            warnings.push(
                ...validation.warnings
            );

        }


        if (
            options.requireCutPoints &&
            !cutPoints
        ) {

            errors.push(

                `Piece "${piece.name || index + 1}" ` +
                "tidak memiliki cutPoints."

            );

        }


        if (
            cutPoints
        ) {

            const validation =
                validatePoints(
                    cutPoints
                );


            errors.push(
                ...validation.errors
            );


            warnings.push(
                ...validation.warnings
            );


            if (
                options.checkDuplicatePoints
            ) {

                const duplicates =
                    findDuplicatePoints(
                        cutPoints
                    );


                if (
                    duplicates.length
                ) {

                    errors.push(

                        `Piece "${piece.name || index + 1}" ` +
                        `memiliki ${duplicates.length} duplicate point.`

                    );

                }

            }


            if (
                options.checkZeroLengthEdges
            ) {

                const zeroEdges =
                    findZeroLengthEdges(
                        cutPoints
                    );


                if (
                    zeroEdges.length
                ) {

                    errors.push(

                        `Piece "${piece.name || index + 1}" ` +
                        `memiliki ${zeroEdges.length} zero-length edge.`

                    );

                }

            }


            const area =
                Math.abs(
                    Geometry.signedArea(
                        cutPoints
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


            if (
                options.checkSelfIntersection
            ) {

                const intersections =
                    findSelfIntersections(
                        cutPoints
                    );


                if (
                    intersections.length
                ) {

                    errors.push(

                        `Piece "${piece.name || index + 1}" ` +
                        `memiliki ${intersections.length} self-intersection.`

                    );

                }

            }

        }


        /*
         * CLOSED
         */

        if (
            options.requireClosed &&
            piece.closed === false
        ) {

            errors.push(

                `Piece "${piece.name || index + 1}" ` +
                "harus closed untuk produksi."

            );

        }


        /*
         * SEAM
         */

        const seam =
            num(

                piece.metadata
                    ?.seamAllowanceCm

            );


        if (
            seam !== null &&
            seam < 0
        ) {

            errors.push(

                `Piece "${piece.name || index + 1}" ` +
                "memiliki seam allowance negatif."

            );

        }


        if (
            options.requireSeam &&
            (
                seam === null ||
                seam === 0
            )
        ) {

            errors.push(

                `Piece "${piece.name || index + 1}" ` +
                "belum memiliki seam allowance."

            );

        }


        /*
         * GRAINLINE
         */

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


        /*
         * NOTCHES
         */

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
                    "tidak memiliki notches array."

                );

            }

        }


        /*
         * LEGACY RADIAL
         */

        const strategy =
            piece.metadata
                ?.seamStrategy;


        if (
            strategy ===
            "legacy-radial"
        ) {

            if (
                options.allowLegacyRadial
            ) {

                warnings.push(

                    `Piece "${piece.name || index + 1}" ` +
                    "menggunakan legacy-radial seam geometry."

                );

            }
            else {

                errors.push(

                    `Piece "${piece.name || index + 1}" ` +
                    "masih menggunakan legacy-radial."

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

    function validateForProduction(
        pattern,
        options = {}
    ) {

        const config =
            normalizeOptions(
                options
            );


        const errors =
            [];

        const warnings =
            [];


        if (
            !pattern
        ) {

            errors.push(
                "Pattern tidak tersedia."
            );


            return {

                valid:
                    false,

                version:
                    VERSION,

                errors,

                warnings,

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
            )
        ) {

            errors.push(

                "Pattern tidak memiliki pieces array."

            );


            return {

                valid:
                    false,

                version:
                    VERSION,

                errors,

                warnings,

                checks: [],

                summary: {

                    pieceCount:
                        0

                }

            };

        }


        const checks =
            [];


        /*
         * Pattern type.
         */

        checks.push({

            name:
                "Pattern pieces available",

            passed:
                pattern.pieces.length >
                0,

            message:
                pattern.pieces.length > 0
                    ? ""
                    : "Tidak ada pieces."

        });


        /*
         * Engine metadata.
         */

        checks.push({

            name:
                "Pattern engine identified",

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

                        result.valid

                            ? ""

                            : result.errors.join(
                                " | "
                              )

                });

            }
        );


        /*
         * Seam-level validation.
         */

        const seamValidation =
            SeamProduction
                .validateSeamPattern(
                    pattern
                );


        if (
            !seamValidation.valid
        ) {

            errors.push(
                ...seamValidation.errors
            );

        }


        warnings.push(
            ...seamValidation.warnings
        );


        checks.push({

            name:
                "Seam production validation",

            passed:
                seamValidation.valid,

            message:

                seamValidation.valid

                    ? ""

                    : seamValidation.errors.join(
                        " | "
                    )

        });


        /*
         * Bounds.
         */

        let bounds =
            null;


        try {

            bounds =
                Geometry.getPatternBounds(
                    pattern
                );

        }
        catch (
            error
        ) {

            errors.push(

                "Pattern bounds gagal dihitung: " +
                error.message

            );

        }


        if (
            bounds
        ) {

            checks.push({

                name:
                    "Pattern bounds",

                passed:

                    Number.isFinite(
                        bounds.minX
                    ) &&

                    Number.isFinite(
                        bounds.minY
                    ) &&

                    Number.isFinite(
                        bounds.width
                    ) &&

                    Number.isFinite(
                        bounds.height
                    ),

                message:
                    ""

            });


            if (
                bounds.width <= 0 ||
                bounds.height <= 0
            ) {

                errors.push(

                    "Pattern memiliki bounds kosong."

                );

            }

        }


        /*
         * Seam requirement.
         */

        if (
            config.requireSeam
        ) {

            const piecesWithoutSeam =

                pattern.pieces.filter(
                    piece => {

                        const seam =
                            num(

                                piece.metadata
                                    ?.seamAllowanceCm

                            );


                        return (

                            seam === null ||
                            seam <= 0

                        );

                    }
                );


            if (
                piecesWithoutSeam.length
            ) {

                errors.push(

                    `${piecesWithoutSeam.length} piece ` +
                    "belum memiliki seam allowance."

                );

            }

        }


        /*
         * Final state.
         */

        const valid =
            errors.length ===
            0;


        return {

            valid,

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

    function isValidForProduction(
        pattern,
        options = {}
    ) {

        return validateForProduction(

            pattern,

            options

        ).valid;

    }


    /* ========================================================
       VALIDATE ENGINE RESULT
       ======================================================== */

    function validateEngineResult(
        result,
        options = {}
    ) {

        if (
            !result ||
            !Array.isArray(
                result.pieces
            )
        ) {

            return {

                valid:
                    false,

                errors: [

                    "Engine result tidak memiliki pieces."

                ],

                warnings: [],

                checks: []

            };

        }


        /*
         * Engine result is still BASE pattern.
         *
         * Convert it to seam/cut representation first.
         */

        let seamPattern;


        try {

            seamPattern =
                SeamProduction
                    .applySeamAllowance(

                        result,

                        {

                            defaultSeam:

                                num(
                                    options
                                        .seamAllowance,

                                    0

                                ),

                            strategy:

                                options
                                    .seamStrategy ||

                                "legacy-radial"

                        }

                    );

        }
        catch (
            error
        ) {

            return {

                valid:
                    false,

                errors: [

                    error.message

                ],

                warnings: [],

                checks: []

            };

        }


        return validateForProduction(

            seamPattern,

            options

        );

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        pattern,
        options = {}
    ) {

        const result =
            validateForProduction(

                pattern,

                options

            );


        console.group(
            "PatternMaker Production Validator"
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

    window.PatternMakerProductionValidator = {

        VERSION,

        DEFAULT_OPTIONS,

        validatePoints,

        validatePiece,

        validateForProduction,

        isValidForProduction,

        validateEngineResult,

        findSelfIntersections,

        findDuplicatePoints,

        findZeroLengthEdges,

        segmentsIntersect,

        debug

    };


})();
