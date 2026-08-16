```javascript
/**
 * ============================================================
 * PATTERMAKER UNIVERSAL
 * BASELINE FINAL v1
 * KODE 76
 *
 * FILE:
 *   engine/nesting-engine.js
 * ============================================================
 *
 * RESPONSIBILITY:
 *
 *   CUTTING PIECES
 *       ↓
 *   NESTING
 *       ↓
 *   MARKER
 *       ↓
 *   EFFICIENCY
 *
 * ============================================================
 *
 * IMPORTANT:
 *
 * Nesting engine TIDAK mengubah bentuk asli piece.
 *
 * Ia hanya menghasilkan:
 *
 * - rotation
 * - translation
 * - placement
 *
 * Geometry asli tetap berada pada:
 *
 *   piece.cutPoints
 *
 * ============================================================
 *
 * BASELINE STRATEGY:
 *
 *   deterministic row / strip nesting
 *
 * Supports:
 *
 * - material width
 * - material length
 * - rotation rules
 * - grainline restrictions
 * - spacing
 * - piece collision
 * - marker bounds
 * - efficiency
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
       EPSILON
       ======================================================== */

    const EPSILON =
        1e-7;


    /* ========================================================
       DEFAULT OPTIONS
       ======================================================== */

    const DEFAULT_OPTIONS = {

        materialWidth:
            140,

        spacing:
            0.5,

        allowRotation90:
            true,

        allowFlip:
            false,

        respectGrainline:
            true,

        startMargin:
            0,

        endMargin:
            0,

        maxSearchRows:
            10000

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


        return Number.isFinite(n)
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
       POINT CLONE
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
                    point[0]
                ),

                num(
                    point[1]
                )

            ]
        );

    }


    /* ========================================================
       VERSIONED ID
       ======================================================== */

    function makePlacementId(
        piece,
        index
    ) {

        return (

            String(
                piece?.name ||
                "PIECE"
            )

            +

            "-"

            +

            String(
                index + 1
            )

        );

    }


    /* ========================================================
       GET CUT POINTS
       ======================================================== */

    function getCutPoints(
        piece
    ) {

        const points =
            piece?.cutPoints ||
            piece?.points ||
            [];


        if (
            !Array.isArray(
                points
            ) ||
            points.length <
            3
        ) {

            throw new Error(

                `Piece "${piece?.name || "unknown"}" ` +
                "tidak memiliki cutPoints valid."

            );

        }


        return clonePoints(
            points
        );

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
       AREA
       ======================================================== */

    function polygonArea(
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


        return Math.abs(
            area / 2
        );

    }


    /* ========================================================
       ROTATE 90
       ======================================================== */

    function rotate90(
        points
    ) {

        return points.map(
            (
                [
                    x,
                    y
                ]
            ) => [

                -y,

                x

            ]
        );

    }


    /* ========================================================
       NORMALIZE ORIGIN
       ======================================================== */

    function normalizeToOrigin(
        points
    ) {

        const bounds =
            getBounds(
                points
            );


        return points.map(
            (
                [
                    x,
                    y
                ]
            ) => [

                x -
                bounds.minX,

                y -
                bounds.minY

            ]
        );

    }


    /* ========================================================
       ROTATION CANDIDATE
       ======================================================== */

    function buildCandidate(
        points,
        rotation
    ) {

        let transformed =
            clonePoints(
                points
            );


        if (
            rotation ===
            90
        ) {

            transformed =
                rotate90(
                    transformed
                );

        }


        transformed =
            normalizeToOrigin(
                transformed
            );


        const bounds =
            getBounds(
                transformed
            );


        return {

            rotation,

            points:
                transformed,

            bounds,

            area:
                polygonArea(
                    transformed
                )

        };

    }


    /* ========================================================
       ROTATION CANDIDATES
       ======================================================== */

    function getRotationCandidates(
        piece,
        options
    ) {

        const points =
            getCutPoints(
                piece
            );


        const candidates = [

            buildCandidate(
                points,
                0
            )

        ];


        if (
            options.allowRotation90
        ) {

            candidates.push(

                buildCandidate(
                    points,
                    90
                )

            );

        }


        return candidates;

    }


    /* ========================================================
       TRANSLATE
       ======================================================== */

    function translatePoints(
        points,
        dx,
        dy
    ) {

        return points.map(
            (
                [
                    x,
                    y
                ]
            ) => [

                x +
                dx,

                y +
                dy

            ]
        );

    }


    /* ========================================================
       POINT IN POLYGON
       ======================================================== */

    function pointInPolygon(
        point,
        polygon
    ) {

        let inside =
            false;


        const x =
            num(
                point[0]
            );


        const y =
            num(
                point[1]
            );


        for (
            let i = 0,
            j = polygon.length - 1;

            i < polygon.length;

            j = i++
        ) {

            const xi =
                num(
                    polygon[i][0]
                );


            const yi =
                num(
                    polygon[i][1]
                );


            const xj =
                num(
                    polygon[j][0]
                );


            const yj =
                num(
                    polygon[j][1]
                );


            const intersect =

                (
                    (
                        yi >
                        y
                    )
                    !==
                    (
                        yj >
                        y
                    )
                )

                &&

                (
                    x
                    <

                    (
                        xj -
                        xi
                    )
                    *

                    (
                        y -
                        yi
                    )
                    /

                    (
                        yj -
                        yi
                    )

                    +

                    xi

                );


            if (
                intersect
            ) {

                inside =
                    !inside;

            }

        }


        return inside;

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
                b[1] -
                a[1]
            )
            *
            (
                c[0] -
                b[0]
            )

            -

            (
                b[0] -
                a[0]
            )
            *
            (
                c[1] -
                b[1]
            );


        if (
            Math.abs(
                value
            ) <=
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

            b[0] <=
            Math.max(
                a[0],
                c[0]
            ) +
            EPSILON

            &&

            b[0] >=
            Math.min(
                a[0],
                c[0]
            ) -
            EPSILON

            &&

            b[1] <=
            Math.max(
                a[1],
                c[1]
            ) +
            EPSILON

            &&

            b[1] >=
            Math.min(
                a[1],
                c[1]
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
       POLYGON INTERSECTION
       ======================================================== */

    function polygonsIntersect(
        polygonA,
        polygonB
    ) {

        const boundsA =
            getBounds(
                polygonA
            );


        const boundsB =
            getBounds(
                polygonB
            );


        /*
         * Fast bounds rejection.
         */

        if (

            boundsA.maxX <
            boundsB.minX

            ||

            boundsA.minX >
            boundsB.maxX

            ||

            boundsA.maxY <
            boundsB.minY

            ||

            boundsA.minY >
            boundsB.maxY

        ) {

            return false;

        }


        /*
         * Edge collision.
         */

        for (
            let i = 0;
            i < polygonA.length;
            i++
        ) {

            const a1 =
                polygonA[i];


            const a2 =
                polygonA[
                    (
                        i + 1
                    )
                    %
                    polygonA.length
                ];


            for (
                let j = 0;
                j < polygonB.length;
                j++
            ) {

                const b1 =
                    polygonB[j];


                const b2 =
                    polygonB[
                        (
                            j + 1
                        )
                        %
                        polygonB.length
                    ];


                if (
                    segmentsIntersect(
                        a1,
                        a2,
                        b1,
                        b2
                    )
                ) {

                    return true;

                }

            }

        }


        /*
         * Containment test.
         */

        if (
            pointInPolygon(
                polygonA[0],
                polygonB
            )
        ) {

            return true;

        }


        if (
            pointInPolygon(
                polygonB[0],
                polygonA
            )
        ) {

            return true;

        }


        return false;

    }


    /* ========================================================
       GRAINLINE
       ======================================================== */

    function getGrainAngle(
        piece
    ) {

        const grainline =
            piece?.grainline;


        if (
            !Array.isArray(
                grainline
            ) ||
            grainline.length <
            2
        ) {

            return null;

        }


        const a =
            grainline[0];


        const b =
            grainline[
                grainline.length - 1
            ];


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


        if (
            Math.hypot(
                dx,
                dy
            ) <=
            EPSILON
        ) {

            return null;

        }


        return Math.atan2(
            dy,
            dx
        );

    }


    /* ========================================================
       ROTATION VALIDATION
       ======================================================== */

    function isRotationAllowed(
        piece,
        rotation,
        options
    ) {

        if (
            !options.respectGrainline
        ) {

            return true;

        }


        const grainAngle =
            getGrainAngle(
                piece
            );


        /*
         * No grainline:
         * rotation remains unrestricted.
         */

        if (
            grainAngle ===
            null
        ) {

            return true;

        }


        /*
         * With a defined grainline,
         * 90° is not allowed by default.
         *
         * A future bias/grain policy can expand
         * this logic.
         */

        if (
            rotation ===
            90
        ) {

            return false;

        }


        return true;

    }


    /* ========================================================
       PLACE AT POSITION
       ======================================================== */

    function placeCandidate(
        candidate,
        x,
        y
    ) {

        const points =
            translatePoints(

                candidate.points,

                x,

                y

            );


        const bounds =
            getBounds(
                points
            );


        return {

            ...candidate,

            x,

            y,

            points,

            bounds

        };

    }


    /* ========================================================
       COLLISION CHECK
       ======================================================== */

    function collides(
        candidate,
        placements,
        spacing
    ) {

        const expandedCandidateBounds = {

            minX:
                candidate.bounds.minX -
                spacing,

            minY:
                candidate.bounds.minY -
                spacing,

            maxX:
                candidate.bounds.maxX +
                spacing,

            maxY:
                candidate.bounds.maxY +
                spacing

        };


        for (
            const placement
            of placements
        ) {

            const bounds =
                placement.bounds;


            /*
             * Fast bounds test.
             */

            if (

                expandedCandidateBounds.maxX <
                bounds.minX

                ||

                expandedCandidateBounds.minX >
                bounds.maxX

                ||

                expandedCandidateBounds.maxY <
                bounds.minY

                ||

                expandedCandidateBounds.minY >
                bounds.maxY

            ) {

                continue;

            }


            /*
             * For spacing, use translated polygons.
             * This baseline uses bounds pre-check plus
             * actual polygon collision.
             */

            if (
                polygonsIntersect(

                    candidate.points,

                    placement.points

                )
            ) {

                return true;

            }

        }


        return false;

    }


    /* ========================================================
       CANDIDATE SCORE
       ======================================================== */

    function scoreCandidate(
        candidate
    ) {

        /*
         * Primary objective:
         *
         * minimize bottom edge.
         *
         * Secondary:
         *
         * minimize x.
         */

        return {

            y:
                candidate.bounds.maxY,

            x:
                candidate.bounds.maxX

        };

    }


    /* ========================================================
       COMPARE CANDIDATES
       ======================================================== */

    function isBetterCandidate(
        candidate,
        currentBest
    ) {

        if (
            !currentBest
        ) {

            return true;

        }


        const a =
            scoreCandidate(
                candidate
            );


        const b =
            scoreCandidate(
                currentBest
            );


        if (
            a.y <
            b.y -
            EPSILON
        ) {

            return true;

        }


        if (
            Math.abs(
                a.y -
                b.y
            ) <=
            EPSILON
        ) {

            return (
                a.x <
                b.x
            );

        }


        return false;

    }


    /* ========================================================
       PIECE ORDER
       ======================================================== */

    function sortPieces(
        pieces
    ) {

        return pieces
            .map(
                (
                    piece,
                    index
                ) => ({

                    piece,

                    originalIndex:
                        index,

                    area:
                        polygonArea(
                            getCutPoints(
                                piece
                            )
                        )

                })
            )
            .sort(
                (
                    a,
                    b
                ) =>

                    b.area -
                    a.area

            );

    }


    /* ========================================================
       FIND PLACEMENT
       ======================================================== */

    function findPlacement(
        piece,
        placements,
        options,
        currentMaxY
    ) {

        const spacing =
            Math.max(
                0,
                num(
                    options.spacing
                )
            );


        const width =
            num(
                options.materialWidth
            );


        if (
            width <=
            0
        ) {

            throw new Error(
                "materialWidth harus > 0."
            );

        }


        const candidates =
            getRotationCandidates(

                piece,

                options

            )
            .filter(
                candidate =>

                    isRotationAllowed(

                        piece,

                        candidate.rotation,

                        options

                    )

            );


        let best =
            null;


        for (
            const candidate
            of candidates
        ) {

            /*
             * Reject pieces wider than material.
             */

            if (
                candidate.bounds.width >
                width -
                options.startMargin -
                options.endMargin
            ) {

                continue;

            }


            /*
             * Search horizontal positions.
             */

            const horizontalStep =
                Math.max(

                    0.5,

                    Math.min(

                        2,

                        candidate.bounds.width /
                        4

                    )

                );


            const maxX =
                width -
                candidate.bounds.width -
                options.endMargin;


            /*
             * Try y levels beginning from
             * the current marker height.
             */

            const maxRows =
                Math.max(
                    1,
                    options.maxSearchRows
                );


            const rowHeight =
                Math.max(

                    0.5,

                    candidate.bounds.height +
                    spacing

                );


            for (
                let row = 0;
                row < maxRows;
                row++
            ) {

                const y =
                    options.startMargin
                    +

                    Math.max(
                        0,
                        currentMaxY
                    )

                    +

                    row *
                    rowHeight;


                /*
                 * Scan left-to-right.
                 */

                for (
                    let x =
                        options.startMargin;

                    x <=
                    maxX +
                    EPSILON;

                    x +=
                    horizontalStep
                ) {

                    const placed =
                        placeCandidate(

                            candidate,

                            x,

                            y

                        );


                    if (
                        placed.bounds.maxX >
                        width -
                        options.endMargin +
                        EPSILON
                    ) {

                        continue;

                    }


                    if (
                        collides(

                            placed,

                            placements,

                            spacing

                        )
                    ) {

                        continue;

                    }


                    if (
                        isBetterCandidate(

                            placed,

                            best

                        )
                    ) {

                        best =
                            placed;

                    }

                }


                /*
                 * If we already found a placement
                 * on this row, no need to continue
                 * infinitely downward.
                 */

                if (
                    best &&
                    best.bounds.maxY <=
                    y +
                    rowHeight
                ) {

                    break;

                }

            }

        }


        return best;

    }


    /* ========================================================
       NEST
       ======================================================== */

    function nest(
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
                "Production pattern tidak valid."
            );

        }


        const config = {

            ...DEFAULT_OPTIONS,

            ...options

        };


        if (
            config.materialWidth <=
            0
        ) {

            throw new Error(
                "materialWidth harus > 0."
            );

        }


        const sourcePieces =
            sortPieces(
                pattern.pieces
            );


        const placements =
            [];


        let currentMaxY =
            config.startMargin;


        const unplaced =
            [];


        sourcePieces.forEach(
            (
                entry
            ) => {

                const placement =
                    findPlacement(

                        entry.piece,

                        placements,

                        config,

                        currentMaxY

                    );


                if (
                    !placement
                ) {

                    unplaced.push({

                        piece:
                            entry.piece,

                        originalIndex:
                            entry.originalIndex,

                        reason:
                            "Tidak dapat ditempatkan " +
                            "pada material width."

                    });


                    return;

                }


                placement.id =
                    makePlacementId(

                        entry.piece,

                        entry.originalIndex

                    );


                placement.originalIndex =
                    entry.originalIndex;


                placement.name =
                    entry.piece.name ||
                    placement.id;


                placement.metadata = {

                    ...(entry.piece.metadata || {}),

                    nesting:
                        true,

                    nestingVersion:
                        VERSION,

                    rotation:
                        placement.rotation,

                    translation: {

                        x:
                            placement.x,

                        y:
                            placement.y

                    }

                };


                placements.push(
                    placement
                );


                currentMaxY =
                    Math.max(

                        currentMaxY,

                        placement.bounds.maxY

                    );

            }
        );


        /*
         * Marker length:
         */

        const markerLength =
            Math.max(

                0,

                currentMaxY +
                config.endMargin

            );


        /*
         * Fabric occupied area.
         */

        const materialArea =
            config.materialWidth *
            markerLength;


        const pieceArea =
            placements.reduce(

                (
                    total,
                    placement
                ) =>

                    total +
                    placement.area,

                0

            );


        const efficiency =

            materialArea >
            EPSILON

                ? (

                    pieceArea /
                    materialArea

                  ) *
                  100

                : 0;


        return {

            type:
                "marker",

            version:
                VERSION,

            placements,

            unplaced,

            marker: {

                width:
                    config.materialWidth,

                length:
                    markerLength,

                area:
                    materialArea,

                pieceArea,

                efficiency:

                    Math.round(
                        efficiency *
                        1000
                    ) / 1000

            },

            metadata: {

                source:
                    pattern.metadata?.source ||
                    null,

                engine:
                    pattern.engine ||
                    null,

                unit:
                    pattern.metadata?.unit ||
                    "cm",

                strategy:
                    "deterministic-row-nesting",

                rotation90:
                    config.allowRotation90,

                grainlineRespect:
                    config.respectGrainline,

                spacing:
                    config.spacing

            }

        };

    }


    /* ========================================================
       VALIDATE NESTING
       ======================================================== */

    function validateNesting(
        result
    ) {

        const errors =
            [];

        const warnings =
            [];


        if (
            !result ||
            !result.marker
        ) {

            errors.push(
                "Nesting result tidak valid."
            );


            return {

                valid:
                    false,

                errors,

                warnings

            };

        }


        if (
            result.marker.width <=
            0
        ) {

            errors.push(
                "Marker width invalid."
            );

        }


        if (
            result.marker.length <=
            0
        ) {

            errors.push(
                "Marker length invalid."
            );

        }


        if (
            result.marker.efficiency <
            0
        ) {

            errors.push(
                "Efficiency tidak boleh negatif."
            );

        }


        if (
            result.marker.efficiency >
            100
        ) {

            warnings.push(

                "Efficiency > 100%; " +
                "cek geometry atau area."

            );

        }


        if (
            Array.isArray(
                result.unplaced
            ) &&
            result.unplaced.length
        ) {

            errors.push(

                `${result.unplaced.length} piece ` +
                "tidak berhasil ditempatkan."

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
       SUMMARY
       ======================================================== */

    function getSummary(
        result
    ) {

        return {

            placed:
                result?.placements
                    ?.length ||
                0,

            unplaced:
                result?.unplaced
                    ?.length ||
                0,

            markerWidth:
                result?.marker
                    ?.width ||
                0,

            markerLength:
                result?.marker
                    ?.length ||
                0,

            pieceArea:
                result?.marker
                    ?.pieceArea ||
                0,

            markerArea:
                result?.marker
                    ?.area ||
                0,

            efficiency:
                result?.marker
                    ?.efficiency ||
                0

        };

    }


    /* ========================================================
       DEBUG
       ======================================================== */

    function debug(
        pattern,
        options = {}
    ) {

        const result =
            nest(
                pattern,
                options
            );


        const validation =
            validateNesting(
                result
            );


        console.group(
            "PatternMaker Nesting Engine"
        );


        console.log(
            "Version:",
            VERSION
        );


        console.log(
            "Result:",
            result
        );


        console.log(
            "Validation:",
            validation
        );


        console.log(
            "Summary:",
            getSummary(
                result
            )
        );


        console.groupEnd();


        return result;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerNestingEngine = {

        VERSION,

        DEFAULT_OPTIONS,

        getBounds,

        polygonArea,

        rotate90,

        normalizeToOrigin,

        polygonsIntersect,

        getGrainAngle,

        getRotationCandidates,

        validateNesting,

        getSummary,

        nest,

        debug

    };


})();
```
