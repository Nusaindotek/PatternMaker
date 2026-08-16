```javascript
/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 72
 *
 * FILE:
 *   engine/production-geometry.js
 * ============================================================
 *
 * INTEGRATION:
 *
 *   Base Pattern
 *       ↓
 *   Curve Geometry
 *       ↓
 *   Polyline
 *       ↓
 *   True Polygon Offset
 *       ↓
 *   Production / Cutting Geometry
 *
 * ============================================================
 *
 * KODE 72 memperbaiki KODE 70 dengan:
 *
 * - support piece.curves
 * - flatten curve sebelum offset
 * - normalize closed path
 * - remove duplicate closing point
 * - preserve original base geometry
 * - true polygon seam offset
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const Curve =
        window.PatternMakerCurveGeometry;


    if (
        !Curve
    ) {

        throw new Error(
            "curve-geometry.js harus dimuat sebelum production-geometry.js."
        );

    }


    /* ========================================================
       VERSION
       ======================================================== */

    const VERSION =
        "FINAL-v1.2";


    /* ========================================================
       CONSTANTS
       ======================================================== */

    const EPSILON =
        1e-9;


    const DEFAULT_OPTIONS = {

        miterLimit:
            4,

        curveTolerance:
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
       POINTS
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
                    point?.[0]
                ),

                num(
                    point?.[1]
                )

            ]
        );

    }


    /* ========================================================
       DISTANCE
       ======================================================== */

    function distance(
        a,
        b
    ) {

        return Math.hypot(

            num(
                b?.[0]
            ) -
            num(
                a?.[0]
            ),

            num(
                b?.[1]
            ) -
            num(
                a?.[1]
            )

        );

    }


    /* ========================================================
       SIGNED AREA
       ======================================================== */

    function signedArea(
        points
    ) {

        if (
            !Array.isArray(
                points
            ) ||
            points.length <
            3
        ) {

            return 0;

        }


        let area =
            0;


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


            area +=

                num(
                    a[0]
                )
                *
                num(
                    b[1]
                )

                -

                num(
                    b[0]
                )
                *
                num(
                    a[1]
                );

        }


        return area / 2;

    }


    /* ========================================================
       BOUNDS
       ======================================================== */

    function getBounds(
        points
    ) {

        if (
            !Array.isArray(
                points
            ) ||
            points.length ===
            0
        ) {

            return {

                minX:
                    0,

                minY:
                    0,

                maxX:
                    0,

                maxY:
                    0,

                width:
                    0,

                height:
                    0

            };

        }


        const xs =
            points.map(
                point =>
                    num(
                        point[0]
                    )
            );


        const ys =
            points.map(
                point =>
                    num(
                        point[1]
                    )
            );


        const minX =
            Math.min(
                ...xs
            );


        const maxX =
            Math.max(
                ...xs
            );


        const minY =
            Math.min(
                ...ys
            );


        const maxY =
            Math.max(
                ...ys
            );


        return {

            minX,

            minY,

            maxX,

            maxY,

            width:
                maxX -
                minX,

            height:
                maxY -
                minY

        };

    }


    /* ========================================================
       VALIDATE POLYGON
       ======================================================== */

    function validatePolygon(
        points,
        options = {}
    ) {

        const config = {

            ...DEFAULT_OPTIONS,

            ...options

        };


        const errors =
            [];


        if (
            !Array.isArray(
                points
            )
        ) {

            errors.push(
                "Polygon points harus berupa array."
            );


            return {

                valid:
                    false,

                errors

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

                        `Point ${index + 1} memiliki ` +
                        "coordinate non-numeric."

                    );

                }

            }
        );


        /*
         * Edge validation.
         */

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


            if (
                distance(
                    a,
                    b
                ) <
                EPSILON
            ) {

                errors.push(

                    `Edge ${i} zero-length.`

                );

            }

        }


        /*
         * Polygon area.
         */

        if (
            Math.abs(
                signedArea(
                    points
                )
            ) <
            EPSILON
        ) {

            errors.push(
                "Polygon memiliki area mendekati nol."
            );

        }


        void config;


        return {

            valid:
                errors.length ===
                0,

            errors

        };

    }


    /* ========================================================
       OFFSET LINE
       ======================================================== */

    function createOffsetLine(
        a,
        b,
        side,
        offset
    ) {

        const dx =
            num(
                b[0]
            ) -
            num(
                a[0]
            );


        const dy =
            num(
                b[1]
            ) -
            num(
                a[1]
            );


        const length =
            Math.hypot(
                dx,
                dy
            );


        if (
            length <
            EPSILON
        ) {

            throw new Error(
                "Tidak dapat meng-offset zero-length edge."
            );

        }


        /*
         * Outward normal.
         */

        const nx =
            side *
            dy /
            length;


        const ny =
            side *
            -dx /
            length;


        return {

            a: [

                num(
                    a[0]
                ) +
                nx *
                offset,

                num(
                    a[1]
                ) +
                ny *
                offset

            ],

            b: [

                num(
                    b[0]
                ) +
                nx *
                offset,

                num(
                    b[1]
                ) +
                ny *
                offset

            ]

        };

    }


    /* ========================================================
       LINE INTERSECTION
       ======================================================== */

    function intersectInfiniteLines(
        lineA,
        lineB
    ) {

        const x1 =
            lineA.a[0];


        const y1 =
            lineA.a[1];


        const x2 =
            lineA.b[0];


        const y2 =
            lineA.b[1];


        const x3 =
            lineB.a[0];


        const y3 =
            lineB.a[1];


        const x4 =
            lineB.b[0];


        const y4 =
            lineB.b[1];


        const denominator =

            (
                x1 -
                x2
            )
            *
            (
                y3 -
                y4
            )

            -

            (
                y1 -
                y2
            )
            *
            (
                x3 -
                x4
            );


        if (
            Math.abs(
                denominator
            ) <
            EPSILON
        ) {

            return null;

        }


        const determinantA =

            x1 *
            y2

            -

            y1 *
            x2;


        const determinantB =

            x3 *
            y4

            -

            y3 *
            x4;


        const px =

            (

                determinantA *
                (
                    x3 -
                    x4
                )

                -

                (
                    x1 -
                    x2
                )
                *
                determinantB

            )

            /

            denominator;


        const py =

            (

                determinantA *
                (
                    y3 -
                    y4
                )

                -

                (
                    y1 -
                    y2
                )
                *
                determinantB

            )

            /

            denominator;


        return [

            px,

            py

        ];

    }


    /* ========================================================
       REMOVE DUPLICATE ADJACENT POINTS
       ======================================================== */

    function removeAdjacentDuplicates(
        points
    ) {

        const output =
            [];


        (
            points ||
            []
        )
        .forEach(
            point => {

                const previous =
                    output[
                        output.length - 1
                    ];


                if (
                    !previous ||
                    distance(
                        previous,
                        point
                    ) >
                    EPSILON
                ) {

                    output.push(

                        [
                            num(
                                point[0]
                            ),

                            num(
                                point[1]
                            )

                        ]

                    );

                }

            }
        );


        /*
         * Remove duplicated closing point.
         */

        if (
            output.length >
            2 &&
            distance(
                output[0],
                output[
                    output.length - 1
                ]
            ) <=
            EPSILON
        ) {

            output.pop();

        }


        return output;

    }


    /* ========================================================
       TRUE POLYGON OFFSET
       ======================================================== */

    function trueOffset(
        points,
        offset,
        options = {}
    ) {

        const config = {

            ...DEFAULT_OPTIONS,

            ...options

        };


        const source =
            removeAdjacentDuplicates(
                clonePoints(
                    points
                )
            );


        const validation =
            validatePolygon(
                source,
                config
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


        const distanceValue =
            num(
                offset
            );


        if (
            distanceValue <
            0
        ) {

            throw new Error(
                "Offset harus >= 0."
            );

        }


        if (
            distanceValue ===
            0
        ) {

            return source;

        }


        /*
         * CCW:
         * outward is right side.
         *
         * CW:
         * outward is left side.
         */

        const side =
            signedArea(
                source
            ) >= 0

                ? 1

                : -1;


        const lines =
            [];


        for (
            let i = 0;
            i < source.length;
            i++
        ) {

            lines.push(

                createOffsetLine(

                    source[i],

                    source[
                        (
                            i + 1
                        ) %
                        source.length
                    ],

                    side,

                    distanceValue

                )

            );

        }


        const result =
            [];


        const miterLimit =
            num(
                config.miterLimit,
                4
            );


        for (
            let i = 0;
            i < source.length;
            i++
        ) {

            const previous =
                lines[
                    (
                        i -
                        1 +
                        lines.length
                    ) %
                    lines.length
                ];


            const current =
                lines[i];


            const intersection =
                intersectInfiniteLines(

                    previous,

                    current

                );


            if (
                intersection
            ) {

                const miterLength =
                    distance(

                        source[i],

                        intersection

                    );


                if (
                    miterLength <=

                    distanceValue *
                    miterLimit

                ) {

                    result.push(
                        intersection
                    );


                    continue;

                }

            }


            /*
             * Miter limit fallback.
             */

            result.push(
                previous.b,
                current.a
            );

        }


        const cleaned =
            removeAdjacentDuplicates(
                result
            );


        const resultValidation =
            validatePolygon(
                cleaned,
                config
            );


        if (
            !resultValidation.valid
        ) {

            throw new Error(

                "True polygon offset menghasilkan " +
                "geometry invalid: " +

                resultValidation.errors.join(
                    " | "
                )

            );

        }


        return cleaned;

    }


    /* ========================================================
       PIECE GEOMETRY EXTRACTION
       ======================================================== */

    function getPiecePolyline(
        piece,
        options = {}
    ) {

        const curveOptions = {

            tolerance:

                num(
                    options.curveTolerance,
                    DEFAULT_OPTIONS.curveTolerance
                ),

            maxSegmentLength:

                num(
                    options.maxSegmentLength,
                    DEFAULT_OPTIONS.maxSegmentLength
                ),

            maxDepth:

                num(
                    options.maxDepth,
                    DEFAULT_OPTIONS.maxDepth
                ),

            minDepth:

                num(
                    options.minDepth,
                    DEFAULT_OPTIONS.minDepth
                )

        };


        /*
         * PRIMARY:
         *
         * Explicit curves.
         */

        if (
            Array.isArray(
                piece?.curves
            )
        ) {

            let polyline =
                Curve.flattenPath(

                    piece.curves,

                    curveOptions

                );


            polyline =
                removeAdjacentDuplicates(
                    polyline
                );


            return {

                points:
                    polyline,

                source:
                    "curve",

                flattened:
                    true,

                curveTolerance:
                    curveOptions.tolerance

            };

        }


        /*
         * SECONDARY:
         *
         * Existing polygon points.
         */

        if (
            Array.isArray(
                piece?.points
            )
        ) {

            let polyline =
                Curve.flattenPolyline(

                    piece.points,

                    curveOptions

                );


            polyline =
                removeAdjacentDuplicates(
                    polyline
                );


            return {

                points:
                    polyline,

                source:
                    "polygon",

                flattened:
                    false,

                curveTolerance:
                    curveOptions.tolerance

            };

        }


        /*
         * Legacy seam points fallback.
         */

        if (
            Array.isArray(
                piece?.seamPoints
            )
        ) {

            let polyline =
                Curve.flattenPolyline(

                    piece.seamPoints,

                    curveOptions

                );


            polyline =
                removeAdjacentDuplicates(
                    polyline
                );


            return {

                points:
                    polyline,

                source:
                    "seamPoints",

                flattened:
                    false,

                curveTolerance:
                    curveOptions.tolerance

            };

        }


        throw new Error(

            `Piece "${piece?.name || "unknown"}" ` +
            "tidak memiliki points, seamPoints, atau curves."

        );

    }


    /* ========================================================
       OFFSET PIECE
       ======================================================== */

    function offsetPiece(
        piece,
        seamAllowance,
        options = {}
    ) {

        const geometry =
            getPiecePolyline(

                piece,

                options

            );


        const cutPoints =
            trueOffset(

                geometry.points,

                seamAllowance,

                options

            );


        return {

            ...clone(
                piece
            ),

            /*
             * Base / sewing geometry.
             */

            points:
                clonePoints(
                    geometry.points
                ),

            seamPoints:
                clonePoints(
                    geometry.points
                ),

            /*
             * Production cutting boundary.
             */

            cutPoints,

            layer:
                "CUT",

            metadata: {

                ...(piece?.metadata || {}),

                productionGeometry:
                    true,

                seamAllowanceCm:
                    seamAllowance,

                seamStrategy:
                    "curve-flatten-true-polygon-offset",

                geometrySource:
                    geometry.source,

                curveFlattened:
                    geometry.flattened,

                curveTolerance:
                    geometry.curveTolerance,

                geometryVersion:
                    VERSION

            }

        };

    }


    /* ========================================================
       CREATE PRODUCTION PATTERN
       ======================================================== */

    function createProductionPattern(
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
                "Base pattern tidak valid."
            );

        }


        const seamAllowance =
            Math.max(

                0,

                num(

                    options.seamAllowance,

                    options.defaultSeam ||
                    0

                )

            );


        const pieces =
            pattern.pieces.map(
                piece =>

                    offsetPiece(

                        piece,

                        seamAllowance,

                        options

                    )

            );


        return {

            type:
                "production-pattern",

            engine:
                pattern.engine ||
                null,

            version:
                VERSION,

            pieces,

            metadata: {

                ...(pattern.metadata || {}),

                geometryType:
                    "PRODUCTION",

                productionGeometry:
                    true,

                seamStrategy:
                    "curve-flatten-true-polygon-offset",

                seamAllowanceCm:
                    seamAllowance,

                curveFlattened:
                    pieces.some(
                        piece =>
                            piece.metadata
                                ?.curveFlattened ===
                            true
                    ),

                curveTolerance:
                    num(

                        options.curveTolerance,

                        DEFAULT_OPTIONS.curveTolerance

                    ),

                maxSegmentLength:
                    num(

                        options.maxSegmentLength,

                        DEFAULT_OPTIONS.maxSegmentLength

                    ),

                miterLimit:
                    num(

                        options.miterLimit,

                        DEFAULT_OPTIONS.miterLimit

                    )

            }

        };

    }


    /* ========================================================
       APPLY SEAM
       ======================================================== */

    function applySeamAllowance(
        pattern,
        options = {}
    ) {

        return createProductionPattern(

            pattern,

            options

        );

    }


    /* ========================================================
       PRODUCTION VALIDATION
       ======================================================== */

    function validateProductionPattern(
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
            ) ||
            pattern.pieces.length ===
            0
        ) {

            errors.push(

                "Production pattern tidak memiliki pieces."

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

                const points =
                    piece.cutPoints ||
                    [];


                const validation =
                    validatePolygon(
                        points
                    );


                if (
                    !validation.valid
                ) {

                    errors.push(

                        `Piece ${index + 1}: ` +

                        validation.errors.join(
                            " | "
                        )

                    );

                }


                const seam =
                    num(

                        piece.metadata
                            ?.seamAllowanceCm,

                        null

                    );


                if (
                    seam === null ||
                    seam < 0
                ) {

                    errors.push(

                        `Piece ${index + 1} ` +
                        "seam allowance invalid."

                    );

                }


                if (
                    piece.metadata
                        ?.curveFlattened
                ) {

                    warnings.push(

                        `Piece ${index + 1} ` +
                        "menggunakan curve flattening."

                    );

                }

            }
        );


        return {

            valid:
                errors.length ===
                0,

            errors,

            warnings,

            summary: {

                pieceCount:
                    pattern.pieces.length

            }

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerProductionGeometry = {

        VERSION,

        DEFAULT_OPTIONS,

        clonePoints,

        distance,

        signedArea,

        getBounds,

        validatePolygon,

        createOffsetLine,

        intersectInfiniteLines,

        removeAdjacentDuplicates,

        trueOffset,

        getPiecePolyline,

        offsetPiece,

        createProductionPattern,

        applySeamAllowance,

        validateProductionPattern

    };


})();
```
