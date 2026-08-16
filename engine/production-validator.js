/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 74
 *
 * FILE:
 *   engine/production-validator.js
 * ============================================================
 *
 * PRODUCTION QUALITY GATE
 *
 * Base Pattern
 *      ↓
 * Seam Production
 *      ↓
 * Curve Flattening
 *      ↓
 * True Polygon Offset
 *      ↓
 * THIS VALIDATOR
 *      ↓
 * Nesting / Export
 *
 * ============================================================
 *
 * VALIDATOR SEKARANG MEMBEDAKAN:
 *
 *   TRUE PRODUCTION
 *   - true-polygon-offset
 *   - curve-flatten-true-polygon-offset
 *
 *   LEGACY
 *   - legacy-radial
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCIES
       ======================================================== */

    const Geometry =
        window.PatternMakerProductionGeometry;

    const Seam =
        window.PatternMakerSeamProduction;


    if (
        !Geometry
    ) {

        throw new Error(
            "production-geometry.js harus dimuat sebelum production-validator.js."
        );

    }


    if (
        !Seam
    ) {

        throw new Error(
            "seam-production.js harus dimuat sebelum production-validator.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1.1";


    const EPSILON =
        1e-9;


    /* ========================================================
       DEFAULT OPTIONS
       ======================================================== */

    const DEFAULT_OPTIONS = {

        requireCutPoints:
            true,

        requireClosed:
            true,

        requireSeam:
            false,

        allowLegacyRadial:
            false,

        requireTrueOffset:
            false,

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
       OPTIONS
       ======================================================== */

    function normalizeOptions(
        options = {}
    ) {

        return {

            ...DEFAULT_OPTIONS,

            ...options

        };

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
            ) <=
            EPSILON &&

            Math.abs(
                Number(a[1]) -
                Number(b[1])
            ) <=
            EPSILON

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
            ) +
            EPSILON

            &&

            Number(b[0]) >=
            Math.min(
                Number(a[0]),
                Number(c[0])
            ) -
            EPSILON

            &&

            Number(b[1]) <=
            Math.max(
                Number(a[1]),
                Number(c[1])
            ) +
            EPSILON

            &&

            Number(b[1]) >=
            Math.min(
                Number(a[1]),
                Number(c[1])
            ) -
            EPSILON

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
                    )
                    %
                    points.length
                ];


            for (
                let j = i + 1;
                j < points.length;
                j++
            ) {

                /*
                 * Adjacent edges share a vertex.
                 */

                if (
                    j === i ||

                    j === (
                        i + 1
                    )
                    %
                    points.length ||

                    (
                        i === 0 &&
                        j ===
                            points.length - 1
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
                        )
                        %
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
            !Array.isArray(
                points
            )
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
                 * Repeated closing point may be intentional.
                 */

                if (
                    i === 0 &&

                    j ===
                        points.length - 1 &&

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
       ZERO LENGTH EDGES
       ======================================================== */

    function findZeroLengthEdges(
        points
    ) {

        const result =
            [];


        if (
            !Array.isArray(
                points
            ) ||
            points.length < 2
        ) {

            return result;

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
                    )
                    %
                    points.length
                ];


            if (
                Math.hypot(

                    Number(b[0]) -
                    Number(a[0]),

                    Number(b[1]) -
                    Number(a[1])

                ) <=
                EPSILON
            ) {

                result.push(
                    i
                );

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


        if (
            !Array.isArray(points) ||
            points.length < 3
        ) {

            errors.push(

                "Polygon requires at least 3 points."

            );


            return {

                valid:
                    false,

                errors

            };

        }


        points.forEach(
            (
                point,
                index
            ) => {

                if (
                    !Array.isArray(
                        point
                    ) ||
                    point.length < 2
                ) {

                    errors.push(

                        `Point ${index} invalid.`

                    );


                    return;

                }


                if (
                    !Number.isFinite(
                        Number(
                            point[0]
                        )
                    ) ||

                    !Number.isFinite(
                        Number(
                            point[1]
                        )
                    )
                ) {

                    errors.push(

                        `Point ${index} ` +
                        "contains non-finite coordinates."

                    );

                }

            }
        );


        return {

            valid:
                errors.length ===
                0,

            errors

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


        const name =
            piece?.name ||
            `piece-${index + 1}`;


        const basePoints =

            piece?.seamPoints ||

            piece?.points;


        const cutPoints =
            piece?.cutPoints;


        /* ----------------------------------------------------
           BASE GEOMETRY
           ---------------------------------------------------- */

        if (
            !Array.isArray(
                basePoints
            )
        ) {

            errors.push(

                `${name}: missing seam/base geometry.`

            );

        }
        else {

            const validation =
                validatePoints(
                    basePoints
                );


            if (
                !validation.valid
            ) {

                errors.push(

                    ...validation.errors.map(
                        error =>
                            `${name}: ${error}`
                    )

                );

            }

        }


        /* ----------------------------------------------------
           CUT GEOMETRY
           ---------------------------------------------------- */

        if (
            options.requireCutPoints &&
            !Array.isArray(
                cutPoints
            )
        ) {

            errors.push(

                `${name}: missing cutPoints.`

            );

        }


        if (
            Array.isArray(
                cutPoints
            )
        ) {

            const validation =
                validatePoints(
                    cutPoints
                );


            if (
                !validation.valid
            ) {

                errors.push(

                    ...validation.errors.map(
                        error =>
                            `${name}: ${error}`
                    )

                );

            }


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

                        `${name}: duplicate points detected.`

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

                        `${name}: zero-length edge detected.`

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

                    `${name}: cut area too small (${area}).`

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

                        `${name}: self-intersection detected.`

                    );

                }

            }

        }


        /* ----------------------------------------------------
           CLOSED
           ---------------------------------------------------- */

        if (
            options.requireClosed &&
            piece?.closed ===
            false
        ) {

            errors.push(

                `${name}: piece must be closed.`

            );

        }


        /* ----------------------------------------------------
           SEAM
           ---------------------------------------------------- */

        const seam =
            Number(
                piece?.metadata
                    ?.seamAllowanceCm
            );


        if (
            options.requireSeam
        ) {

            if (
                !Number.isFinite(
                    seam
                ) ||
                seam <= 0
            ) {

                errors.push(

                    `${name}: seam allowance required.`

                );

            }

        }


        if (
            Number.isFinite(
                seam
            ) &&
            seam < 0
        ) {

            errors.push(

                `${name}: negative seam allowance.`

            );

        }


        /* ----------------------------------------------------
           SEAM STRATEGY
           ---------------------------------------------------- */

        const strategy =
            piece?.metadata
                ?.seamStrategy ||
            "unknown";


        if (
            strategy ===
            "legacy-radial"
        ) {

            if (
                options.allowLegacyRadial
            ) {

                warnings.push(

                    `${name}: legacy-radial geometry.`

                );

            }
            else {

                errors.push(

                    `${name}: legacy-radial geometry ` +
                    "is not allowed."

                );

            }

        }


        if (
            options.requireTrueOffset
        ) {

            const allowed = [

                "true-polygon-offset",

                "curve-flatten-true-polygon-offset"

            ];


            if (
                !allowed.includes(
                    strategy
                )
            ) {

                errors.push(

                    `${name}: true production offset required.`

                );

            }

        }


        /* ----------------------------------------------------
           CURVE METADATA
           ---------------------------------------------------- */

        if (
            strategy ===
            "curve-flatten-true-polygon-offset"
        ) {

            if (
                piece?.metadata
                    ?.curveFlattened !==
                true
            ) {

                warnings.push(

                    `${name}: curve strategy declared ` +
                    "but curveFlattened metadata is missing."

                );

            }


            const tolerance =
                Number(
                    piece?.metadata
                        ?.curveTolerance
                );


            if (
                !Number.isFinite(
                    tolerance
                ) ||
                tolerance <= 0
            ) {

                warnings.push(

                    `${name}: curve tolerance metadata missing.`

                );

            }

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
       FULL PRODUCTION VALIDATION
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

        const checks =
            [];


        if (
            !pattern ||
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

                    "Pattern has no pieces."

                ],

                warnings: [],

                checks: [],

                summary: {

                    pieceCount:
                        0

                }

            };

        }


        /* ----------------------------------------------------
           PATTERN STRATEGY
           ---------------------------------------------------- */

        const patternStrategy =

            pattern.metadata
                ?.seamStrategy

            ||

            pattern.pieces[0]
                ?.metadata
                ?.seamStrategy

            ||

            "unknown";


        if (
            patternStrategy ===
            "legacy-radial"
        ) {

            if (
                config.allowLegacyRadial
            ) {

                warnings.push(

                    "Pattern uses legacy-radial geometry."

                );

            }
            else {

                errors.push(

                    "Pattern uses legacy-radial geometry."

                );

            }

        }


        if (
            config.requireTrueOffset
        ) {

            const allowed = [

                "true-polygon-offset",

                "curve-flatten-true-polygon-offset"

            ];


            if (
                !allowed.includes(
                    patternStrategy
                )
            ) {

                errors.push(

                    "Production pattern tidak menggunakan " +
                    "true seam offset."

                );

            }

        }


        checks.push({

            name:
                "Production strategy",

            passed:
                errors.length ===
                0,

            message:
                errors.join(
                    " | "
                )

        });


        /* ----------------------------------------------------
           PIECES
           ---------------------------------------------------- */

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
                        `piece-${index + 1}`,

                    passed:
                        result.valid,

                    message:
                        result.errors.join(
                            " | "
                        )

                });

            }
        );


        /* ----------------------------------------------------
           SEAM VALIDATION
           ---------------------------------------------------- */

        let seamValidation;


        try {

            seamValidation =
                Seam.validateSeamPattern(
                    pattern
                );

        }
        catch (
            error
        ) {

            seamValidation = {

                valid:
                    false,

                errors: [
                    error.message
                ],

                warnings: []

            };

        }


        if (
            !seamValidation.valid
        ) {

            errors.push(
                ...seamValidation.errors
            );

        }


        warnings.push(
            ...(
                seamValidation.warnings ||
                []
            )
        );


        checks.push({

            name:
                "Seam production",

            passed:
                seamValidation.valid,

            message:

                seamValidation.errors
                    .join(
                        " | "
                    )

        });


        /* ----------------------------------------------------
           BOUNDS
           ---------------------------------------------------- */

        let bounds =
            null;


        try {

            const points =

                pattern.pieces.flatMap(

                    piece =>

                        piece.cutPoints ||
                        piece.points ||
                        []

                );


            bounds =
                Geometry.getBounds(
                    points
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

            const validBounds =

                Number.isFinite(
                    bounds.minX
                ) &&

                Number.isFinite(
                    bounds.minY
                ) &&

                Number.isFinite(
                    bounds.maxX
                ) &&

                Number.isFinite(
                    bounds.maxY
                ) &&

                bounds.width >
                0 &&

                bounds.height >
                0;


            checks.push({

                name:
                    "Production bounds",

                passed:
                    validBounds,

                message:

                    validBounds

                        ? ""

                        : "Production bounds invalid."

            });


            if (
                !validBounds
            ) {

                errors.push(

                    "Production geometry memiliki bounds invalid."

                );

            }

        }


        /* ----------------------------------------------------
           FINAL
           ---------------------------------------------------- */

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

                errorCount:
                    errors.length,

                warningCount:
                    warnings.length,

                geometryStrategy:
                    patternStrategy,

                bounds

            }

        };

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

                    "Engine result missing pieces."

                ],

                warnings: [],

                checks: []

            };

        }


        try {

            const production =
                Seam.applySeamAllowance(

                    result,

                    {

                        defaultSeam:

                            num(
                                options.seamAllowance,
                                0
                            ),

                        miterLimit:

                            num(
                                options.miterLimit,
                                4
                            ),

                        curveTolerance:

                            num(
                                options.curveTolerance,
                                0.05
                            ),

                        maxSegmentLength:

                            num(
                                options.maxSegmentLength,
                                2
                            )

                    }

                );


            return validateForProduction(

                production,

                options

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

        validateEngineResult,

        isValidForProduction,

        findSelfIntersections,

        findDuplicatePoints,

        findZeroLengthEdges,

        segmentsIntersect,

        debug

    };


})();
