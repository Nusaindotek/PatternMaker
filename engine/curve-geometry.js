```javascript
/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 71
 *
 * FILE:
 *   engine/curve-geometry.js
 * ============================================================
 *
 * CURVE GEOMETRY LAYER
 *
 * Tujuan:
 *
 *   Curve
 *      ↓
 *   Adaptive Sampling
 *      ↓
 *   Polyline
 *      ↓
 *   True Polygon Offset
 *
 * ============================================================
 *
 * Supported:
 *
 * - Line
 * - Quadratic Bezier
 * - Cubic Bezier
 * - Polyline
 *
 * ============================================================
 *
 * IMPORTANT:
 *
 * Hasil flattening adalah approximation terkontrol.
 *
 * Untuk production:
 *
 *   curveTolerance
 *   maxSegmentLength
 *
 * harus ditentukan berdasarkan kebutuhan precision
 * plotter / cutting system.
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
       CONSTANTS
       ======================================================== */

    const EPSILON =
        1e-9;


    const DEFAULT_OPTIONS = {

        tolerance:
            0.05,

        maxSegmentLength:
            2,

        maxDepth:
            12,

        minDepth:
            2

    };


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
       CLONE POINT
       ======================================================== */

    function point(
        x,
        y
    ) {

        return [

            num(x),

            num(y)

        ];

    }


    /* ========================================================
       DISTANCE
       ======================================================== */

    function distance(
        a,
        b
    ) {

        return Math.hypot(

            num(b[0]) -
            num(a[0]),

            num(b[1]) -
            num(a[1])

        );

    }


    /* ========================================================
       POINT TO LINE DISTANCE
       ======================================================== */

    function pointLineDistance(
        p,
        a,
        b
    ) {

        const dx =
            num(b[0]) -
            num(a[0]);


        const dy =
            num(b[1]) -
            num(a[1]);


        const lengthSquared =
            dx * dx +
            dy * dy;


        if (
            lengthSquared <=
            EPSILON
        ) {

            return distance(
                p,
                a
            );

        }


        const t =
            (
                (
                    num(p[0]) -
                    num(a[0])
                ) *
                dx

                +

                (
                    num(p[1]) -
                    num(a[1])
                ) *
                dy

            ) /
            lengthSquared;


        const clamped =
            Math.max(
                0,
                Math.min(
                    1,
                    t
                )
            );


        const projection = [

            num(a[0]) +
            dx *
            clamped,

            num(a[1]) +
            dy *
            clamped

        ];


        return distance(
            p,
            projection
        );

    }


    /* ========================================================
       LINEAR INTERPOLATION
       ======================================================== */

    function lerp(
        a,
        b,
        t
    ) {

        return [

            num(a[0]) +
            (
                num(b[0]) -
                num(a[0])
            ) *
            t,

            num(a[1]) +
            (
                num(b[1]) -
                num(a[1])
            ) *
            t

        ];

    }


    /* ========================================================
       QUADRATIC BEZIER
       ======================================================== */

    function quadraticAt(
        p0,
        p1,
        p2,
        t
    ) {

        const mt =
            1 - t;


        return [

            mt * mt *
            p0[0]

            +

            2 *
            mt *
            t *
            p1[0]

            +

            t * t *
            p2[0],

            mt * mt *
            p0[1]

            +

            2 *
            mt *
            t *
            p1[1]

            +

            t * t *
            p2[1]

        ];

    }


    /* ========================================================
       CUBIC BEZIER
       ======================================================== */

    function cubicAt(
        p0,
        p1,
        p2,
        p3,
        t
    ) {

        const mt =
            1 - t;


        return [

            mt * mt * mt *
            p0[0]

            +

            3 *
            mt * mt *
            t *
            p1[0]

            +

            3 *
            mt *
            t * t *
            p2[0]

            +

            t * t * t *
            p3[0],


            mt * mt * mt *
            p0[1]

            +

            3 *
            mt * mt *
            t *
            p1[1]

            +

            3 *
            mt *
            t * t *
            p2[1]

            +

            t * t * t *
            p3[1]

        ];

    }


    /* ========================================================
       QUADRATIC FLATNESS
       ======================================================== */

    function quadraticFlatness(
        p0,
        p1,
        p2
    ) {

        return pointLineDistance(
            p1,
            p0,
            p2
        );

    }


    /* ========================================================
       CUBIC FLATNESS
       ======================================================== */

    function cubicFlatness(
        p0,
        p1,
        p2,
        p3
    ) {

        return Math.max(

            pointLineDistance(
                p1,
                p0,
                p3
            ),

            pointLineDistance(
                p2,
                p0,
                p3
            )

        );

    }


    /* ========================================================
       QUADRATIC ADAPTIVE SUBDIVISION
       ======================================================== */

    function flattenQuadratic(
        p0,
        p1,
        p2,
        options = {}
    ) {

        const config = {

            ...DEFAULT_OPTIONS,

            ...options

        };


        const result = [
            point(
                p0[0],
                p0[1]
            )
        ];


        function recurse(
            a,
            b,
            c,
            depth
        ) {

            const flatness =
                quadraticFlatness(
                    a,
                    b,
                    c
                );


            const span =
                distance(
                    a,
                    c
                );


            const shouldStop =

                depth >=
                config.maxDepth

                ||

                (
                    depth >=
                    config.minDepth &&

                    flatness <=
                    config.tolerance &&

                    span <=
                    config.maxSegmentLength

                );


            if (
                shouldStop
            ) {

                result.push(

                    point(
                        c[0],
                        c[1]
                    )

                );

                return;

            }


            const ab =
                lerp(
                    a,
                    b,
                    0.5
                );


            const bc =
                lerp(
                    b,
                    c,
                    0.5
                );


            const mid =
                lerp(
                    ab,
                    bc,
                    0.5
                );


            recurse(
                a,
                ab,
                mid,
                depth + 1
            );


            recurse(
                mid,
                bc,
                c,
                depth + 1
            );

        }


        recurse(
            p0,
            p1,
            p2,
            0
        );


        return result;

    }


    /* ========================================================
       CUBIC ADAPTIVE SUBDIVISION
       ======================================================== */

    function flattenCubic(
        p0,
        p1,
        p2,
        p3,
        options = {}
    ) {

        const config = {

            ...DEFAULT_OPTIONS,

            ...options

        };


        const result = [
            point(
                p0[0],
                p0[1]
            )
        ];


        function recurse(
            a,
            b,
            c,
            d,
            depth
        ) {

            const flatness =
                cubicFlatness(
                    a,
                    b,
                    c,
                    d
                );


            const span =
                distance(
                    a,
                    d
                );


            const shouldStop =

                depth >=
                config.maxDepth

                ||

                (
                    depth >=
                    config.minDepth &&

                    flatness <=
                    config.tolerance &&

                    span <=
                    config.maxSegmentLength

                );


            if (
                shouldStop
            ) {

                result.push(

                    point(
                        d[0],
                        d[1]
                    )

                );

                return;

            }


            const ab =
                lerp(
                    a,
                    b,
                    0.5
                );


            const bc =
                lerp(
                    b,
                    c,
                    0.5
                );


            const cd =
                lerp(
                    c,
                    d,
                    0.5
                );


            const abc =
                lerp(
                    ab,
                    bc,
                    0.5
                );


            const bcd =
                lerp(
                    bc,
                    cd,
                    0.5
                );


            const mid =
                lerp(
                    abc,
                    bcd,
                    0.5
                );


            recurse(
                a,
                ab,
                abc,
                mid,
                depth + 1
            );


            recurse(
                mid,
                bcd,
                cd,
                d,
                depth + 1
            );

        }


        recurse(
            p0,
            p1,
            p2,
            p3,
            0
        );


        return result;

    }


    /* ========================================================
       POLYLINE FLATTEN
       ======================================================== */

    function flattenPolyline(
        points,
        options = {}
    ) {

        const config = {

            ...DEFAULT_OPTIONS,

            ...options

        };


        const output = [];


        if (
            !Array.isArray(
                points
            )
        ) {

            return output;

        }


        for (
            let i = 0;
            i < points.length - 1;
            i++
        ) {

            const a =
                point(
                    points[i][0],
                    points[i][1]
                );


            const b =
                point(
                    points[
                        i + 1
                    ][0],
                    points[
                        i + 1
                    ][1]
                );


            if (
                i === 0
            ) {

                output.push(
                    a
                );

            }


            const length =
                distance(
                    a,
                    b
                );


            const count =
                Math.max(

                    1,

                    Math.ceil(

                        length /
                        config.maxSegmentLength

                    )

                );


            for (
                let j = 1;
                j <= count;
                j++
            ) {

                const t =
                    j /
                    count;


                output.push(

                    lerp(
                        a,
                        b,
                        t
                    )

                );

            }

        }


        return output;

    }


    /* ========================================================
       SEGMENT TYPE
       ======================================================== */

    function normalizeSegment(
        segment
    ) {

        if (
            !segment ||
            typeof segment !==
                "object"
        ) {

            throw new Error(
                "Curve segment tidak valid."
            );

        }


        const type =
            String(
                segment.type ||
                "line"
            )
            .toLowerCase();


        switch (
            type
        ) {

            case "line":

                return {

                    type:
                        "line",

                    points: [

                        point(
                            segment.p0?.[0],
                            segment.p0?.[1]
                        ),

                        point(
                            segment.p1?.[0],
                            segment.p1?.[1]
                        )

                    ]

                };


            case "quadratic":

            case "quadratic-bezier":

                return {

                    type:
                        "quadratic",

                    points: [

                        point(
                            segment.p0?.[0],
                            segment.p0?.[1]
                        ),

                        point(
                            segment.p1?.[0],
                            segment.p1?.[1]
                        ),

                        point(
                            segment.p2?.[0],
                            segment.p2?.[1]
                        )

                    ]

                };


            case "cubic":

            case "cubic-bezier":

                return {

                    type:
                        "cubic",

                    points: [

                        point(
                            segment.p0?.[0],
                            segment.p0?.[1]
                        ),

                        point(
                            segment.p1?.[0],
                            segment.p1?.[1]
                        ),

                        point(
                            segment.p2?.[0],
                            segment.p2?.[1]
                        ),

                        point(
                            segment.p3?.[0],
                            segment.p3?.[1]
                        )

                    ]

                };


            default:

                throw new Error(

                    `Curve type "${type}" tidak didukung.`

                );

        }

    }


    /* ========================================================
       FLATTEN SEGMENT
       ======================================================== */

    function flattenSegment(
        segment,
        options = {}
    ) {

        const normalized =
            normalizeSegment(
                segment
            );


        switch (
            normalized.type
        ) {

            case "line":

                return flattenPolyline(

                    normalized.points,

                    options

                );


            case "quadratic":

                return flattenQuadratic(

                    normalized.points[0],

                    normalized.points[1],

                    normalized.points[2],

                    options

                );


            case "cubic":

                return flattenCubic(

                    normalized.points[0],

                    normalized.points[1],

                    normalized.points[2],

                    normalized.points[3],

                    options

                );


            default:

                throw new Error(
                    "Curve segment tidak dapat diflatten."
                );

        }

    }


    /* ========================================================
       FLATTEN PATH
       ======================================================== */

    function flattenPath(
        segments,
        options = {}
    ) {

        if (
            !Array.isArray(
                segments
            )
        ) {

            throw new Error(
                "Path segments harus berupa array."
            );

        }


        const output =
            [];


        segments.forEach(
            (
                segment,
                index
            ) => {

                const flattened =
                    flattenSegment(

                        segment,

                        options

                    );


                if (
                    index ===
                    0
                ) {

                    output.push(
                        ...flattened
                    );

                }
                else {

                    /*
                     * Avoid duplicating the shared
                     * starting point.
                     */

                    output.push(
                        ...flattened.slice(
                            1
                        )
                    );

                }

            }
        );


        return output;

    }


    /* ========================================================
       FLATTEN PIECE
       ======================================================== */

    function flattenPiece(
        piece,
        options = {}
    ) {

        if (
            Array.isArray(
                piece.curves
            )
        ) {

            return {

                ...piece,

                points:
                    flattenPath(

                        piece.curves,

                        options

                    ),

                metadata: {

                    ...(piece.metadata || {}),

                    curveFlattened:
                        true,

                    curveGeometryVersion:
                        VERSION

                }

            };

        }


        /*
         * If the piece already contains polygon points,
         * subdivide long straight edges only.
         */

        if (
            Array.isArray(
                piece.points
            )
        ) {

            return {

                ...piece,

                points:
                    flattenPolyline(

                        piece.points,

                        options

                    ),

                metadata: {

                    ...(piece.metadata || {}),

                    curveFlattened:
                        false,

                    curveGeometryVersion:
                        VERSION

                }

            };

        }


        throw new Error(

            `Piece "${piece.name || "unknown"}" ` +
            "tidak memiliki curves atau points."

        );

    }


    /* ========================================================
       FLATTEN PATTERN
       ======================================================== */

    function flattenPattern(
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
                "Pattern tidak valid."
            );

        }


        return {

            ...pattern,

            pieces:

                pattern.pieces.map(
                    piece =>

                        flattenPiece(
                            piece,
                            options
                        )

                ),

            metadata: {

                ...(pattern.metadata || {}),

                curveGeometry:
                    true,

                curveFlattened:
                    true,

                curveTolerance:
                    num(
                        options.tolerance,
                        DEFAULT_OPTIONS.tolerance
                    ),

                curveGeometryVersion:
                    VERSION

            }

        };

    }


    /* ========================================================
       ESTIMATE ERROR
       ======================================================== */

    function estimateQuadraticError(
        p0,
        p1,
        p2
    ) {

        return quadraticFlatness(

            p0,

            p1,

            p2

        );

    }


    function estimateCubicError(
        p0,
        p1,
        p2,
        p3
    ) {

        return cubicFlatness(

            p0,

            p1,

            p2,

            p3

        );

    }


    /* ========================================================
       VALIDATE FLATTENED PATH
       ======================================================== */

    function validateFlattenedPath(
        points
    ) {

        const errors =
            [];


        if (
            !Array.isArray(
                points
            ) ||
            points.length <
            2
        ) {

            errors.push(
                "Flattened path terlalu pendek."
            );


            return {

                valid:
                    false,

                errors

            };

        }


        points.forEach(
            (
                p,
                index
            ) => {

                if (
                    !Array.isArray(p) ||
                    p.length <
                    2 ||
                    !Number.isFinite(
                        Number(p[0])
                    ) ||
                    !Number.isFinite(
                        Number(p[1])
                    )
                ) {

                    errors.push(

                        `Point ${index + 1} invalid.`

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
       PUBLIC API
       ======================================================== */

    window.PatternMakerCurveGeometry = {

        VERSION,

        DEFAULT_OPTIONS,

        distance,

        pointLineDistance,

        quadraticAt,

        cubicAt,

        flattenQuadratic,

        flattenCubic,

        flattenPolyline,

        normalizeSegment,

        flattenSegment,

        flattenPath,

        flattenPiece,

        flattenPattern,

        estimateQuadraticError,

        estimateCubicError,

        validateFlattenedPath

    };


})();
```
