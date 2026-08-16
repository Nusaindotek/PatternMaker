```javascript
/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 70
 *
 * FILE:
 *   engine/production-geometry.js
 *
 * PURPOSE:
 *   TRUE POLYGON SEAM OFFSET
 * ============================================================
 *
 * FLOW:
 *
 * BASE PATTERN
 *      ↓
 * TRUE POLYGON OFFSET
 *      ↓
 * CUTTING GEOMETRY
 *
 * ============================================================
 *
 * IMPORTANT
 *
 * This replaces the old radial compatibility strategy
 * for production geometry.
 *
 * The algorithm:
 *
 * 1. Determine polygon orientation.
 * 2. Offset every edge by the requested distance.
 * 3. Intersect adjacent offset edges.
 * 4. Use miter joins where possible.
 * 5. Limit extreme miters with a configurable miter limit.
 *
 * This implementation is designed for POLYGONAL geometry.
 *
 * Curved Bézier/SVG curves are not flattened here.
 * They require a dedicated curve-offset stage.
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

    const EPSILON =
        1e-9;


    const DEFAULT_OPTIONS = {

        miterLimit:
            4,

        minimumEdgeLength:
            0.000001

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
       CLONE POINTS
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

                (
                    num(
                        a?.[0]
                    ) *
                    num(
                        b?.[1]
                    )
                )

                -

                (
                    num(
                        b?.[0]
                    ) *
                    num(
                        a?.[1]
                    )
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
                        point?.[0]
                    )
            );


        const ys =
            points.map(
                point =>
                    num(
                        point?.[1]
                    )
            );


        const minX =
            Math.min(
                ...xs
            );


        const minY =
            Math.min(
                ...ys
            );


        const maxX =
            Math.max(
                ...xs
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
       POINT VALIDATION
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
                    !Array.isArray(
                        point
                    ) ||
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

                        `Point ${index + 1} ` +
                        "mengandung coordinate non-numeric."

                    );

                }

            }
        );


        if (
            errors.length
        ) {

            return {

                valid:
                    false,

                errors

            };

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


            const length =
                Math.hypot(

                    num(
                        b[0]
                    ) -
                    num(
                        a[0]
                    ),

                    num(
                        b[1]
                    ) -
                    num(
                        a[1]
                    )

                );


            if (
                length <
                config.minimumEdgeLength
            ) {

                errors.push(

                    `Edge ${i} terlalu pendek atau zero-length.`

                );

            }

        }


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


        return {

            valid:
                errors.length ===
                0,

            errors

        };

    }


    /* ========================================================
       LINE
       ======================================================== */

    function createOffsetLine(
        a,
        b,
        side,
        distance
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
                "Tidak dapat membuat offset dari zero-length edge."
            );

        }


        /*
         * Unit outward normal.
         *
         * side:
         *
         *   +1 = right side
         *   -1 = left side
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
                distance,

                num(
                    a[1]
                ) +
                ny *
                distance

            ],

            b: [

                num(
                    b[0]
                ) +
                nx *
                distance,

                num(
                    b[1]
                ) +
                ny *
                distance

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
            ) *
            (
                y3 -
                y4
            )

            -

            (
                y1 -
                y2
            ) *
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

            (
                x1 *
                y2
            )

            -

            (
                y1 *
                x2
            );


        const determinantB =

            (
                x3 *
                y4
            )

            -

            (
                y3 *
                x4
            );


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
                ) *
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
                ) *
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
       TRUE POLYGON OFFSET
       ======================================================== */

    function trueOffset(
        points,
        distance,
        options = {}
    ) {

        const config = {

            ...DEFAULT_OPTIONS,

            ...options

        };


        const validation =
            validatePolygon(
                points,
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


        const d =
            num(
                distance
            );


        if (
            d < 0
        ) {

            throw new Error(
                "Offset distance harus >= 0."
            );

        }


        if (
            d === 0
        ) {

            return clonePoints(
                points
            );

        }


        const source =
            clonePoints(
                points
            );


        /*
         * Orientation:
         *
         * CCW:
         *   outward = right
         *
         * CW:
         *   outward = left
         */

        const signed =
            signedArea(
                source
            );


        const side =
            signed >= 0

                ? 1

                : -1;


        const offsetLines =
            [];


        for (
            let i = 0;
            i < source.length;
            i++
        ) {

            const a =
                source[i];


            const b =
                source[
                    (
                        i + 1
                    ) %
                    source.length
                ];


            offsetLines.push(

                createOffsetLine(

                    a,

                    b,

                    side,

                    d

                )

            );

        }


        const output =
            [];


        for (
            let i = 0;
            i < source.length;
            i++
        ) {

            const previous =
                offsetLines[
                    (
                        i -
                        1 +
                        source.length
                    ) %
                    source.length
                ];


            const current =
                offsetLines[
                    i
                ];


            const intersection =
                intersectInfiniteLines(

                    previous,

                    current

                );


            if (
                intersection
            ) {

                const distanceFromOriginal =
                    Math.hypot(

                        intersection[0] -
                        source[i][0],

                        intersection[1] -
                        source[i][1]

                    );


                /*
                 * Miter limit.
                 *
                 * When the corner is too sharp,
                 * use the two offset endpoints instead
                 * of producing a huge spike.
                 */

                if (
                    distanceFromOriginal <=
                    d *
                    config.miterLimit
                ) {

                    output.push(

                        intersection

                    );

                    continue;

                }

            }


            /*
             * Parallel or excessive-miter fallback:
             *
             * insert both adjacent offset endpoints.
             */

            output.push(

                previous.b,

                current.a

            );

        }


        /*
         * Remove near-duplicate adjacent vertices.
         */

        const cleaned =
            [];


        output.forEach(
            point => {

                const previous =
                    cleaned[
                        cleaned.length - 1
                    ];


                if (
                    !previous ||
                    Math.hypot(

                        previous[0] -
                        point[0],

                        previous[1] -
                        point[1]

                    ) >
                    EPSILON
                ) {

                    cleaned.push(

                        [

                            Number(
                                point[0]
                            ),

                            Number(
                                point[1]
                            )

                        ]

                    );

                }

            }
        );


        /*
         * Remove duplicate closing point.
         */

        if (
            cleaned.length > 2 &&
            Math.hypot(

                cleaned[0][0] -
                cleaned[
                    cleaned.length - 1
                ][0],

                cleaned[0][1] -
                cleaned[
                    cleaned.length - 1
                ][1]

            ) <=
            EPSILON
        ) {

            cleaned.pop();

        }


        const finalValidation =
            validatePolygon(
                cleaned,
                config
            );


        if (
            !finalValidation.valid
        ) {

            throw new Error(

                "Hasil true polygon offset tidak valid: " +

                finalValidation.errors.join(
                    " | "
                )

            );

        }


        return cleaned;

    }


    /* ========================================================
       OFFSET PIECE
       ======================================================== */

    function offsetPiece(
        piece,
        seamAllowance,
        options = {}
    ) {

        const basePoints =

            piece?.seamPoints ||

            piece?.points ||


            piece?.cutPoints ||

            [];


        const cutPoints =
            trueOffset(

                basePoints,

                seamAllowance,

                options

            );


        return {

            ...clone(
                piece
            ),

            points:
                clonePoints(
                    basePoints
                ),

            seamPoints:
                clonePoints(
                    basePoints
                ),

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
                    "true-polygon-offset",

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
                    "true-polygon-offset",

                seamAllowanceCm:
                    seamAllowance,

                miterLimit:
                    num(
                        options.miterLimit,
                        DEFAULT_OPTIONS.miterLimit
                    )

            }

        };

    }


    /* ========================================================
       APPLY SEAM ALLOWANCE
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
       VALIDATE PRODUCTION PATTERN
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
                            ?.seamAllowanceCm

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

        signedArea,

        getBounds,

        validatePolygon,

        createOffsetLine,

        intersectInfiniteLines,

        trueOffset,

        offsetPiece,

        createProductionPattern,

        applySeamAllowance,

        validateProductionPattern

    };


})();
```
