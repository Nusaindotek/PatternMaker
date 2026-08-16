/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 35 — engine/nesting-engine.js
 * ============================================================
 *
 * MARKER / NESTING ENGINE v1
 *
 * Tujuan:
 *
 *   cuttingPattern
 *        ↓
 *   marker layout
 *        ↓
 *   fabric utilization
 *
 * Engine ini TIDAK mengubah cuttingPattern.
 *
 * ============================================================
 *
 * FITUR v1
 *
 * - Fabric width
 * - Fabric length
 * - Gap antar piece
 * - Rotation 0 / 180
 * - Grainline restriction dasar
 * - Piece quantity
 * - Deterministic placement
 * - Bounds checking
 * - Utilization calculation
 *
 * ============================================================
 *
 * BATASAN v1
 *
 * Ini adalah nesting engine dasar berbasis bounding-box.
 * Ia bukan true polygon nesting optimizer.
 *
 * Jadi hasilnya:
 *
 *   VALID untuk layout dasar
 *   BUKAN jaminan marker industri optimum
 *
 * Tahap berikutnya dapat mengganti placement algorithm
 * tanpa mengubah API engine.
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const ProductionGeometry =
        window.PatternMakerProductionGeometry;


    const ProductionValidator =
        window.PatternMakerProductionValidator;


    if (
        !ProductionGeometry
    ) {

        throw new Error(
            "production-geometry.js belum tersedia."
        );

    }


    if (
        !ProductionValidator
    ) {

        throw new Error(
            "production-validator.js belum tersedia."
        );

    }


    /* ========================================================
       DEFAULT CONFIGURATION
       ======================================================== */

    const DEFAULTS = {

        fabricWidth:
            150,

        fabricLength:
            300,

        gap:
            1,

        edgeMargin:
            1,

        allowRotation:
            true,

        rotationStep:
            180,

        respectGrainline:
            true,

        allowFlip:
            false,

        strategy:
            "shelf",

        startX:
            1,

        startY:
            1

    };


    /* ========================================================
       HELPERS
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


    function round(
        value
    ) {

        return Math.round(
            Number(value) *
            1000
        ) / 1000;

    }


    function mergeOptions(
        options = {}
    ) {

        return {

            ...DEFAULTS,

            ...options

        };

    }


    /* ========================================================
       CUT POINTS
       ======================================================== */

    function getCutPoints(
        piece
    ) {

        if (
            piece?.cutPoints &&
            Array.isArray(
                piece.cutPoints
            ) &&
            piece.cutPoints.length >= 3
        ) {

            return piece.cutPoints;

        }


        if (
            piece?.points &&
            Array.isArray(
                piece.points
            ) &&
            piece.points.length >= 3
        ) {

            return piece.points;

        }


        return [];

    }


    /* ========================================================
       BOUNDS
       ======================================================== */

    function getPieceBounds(
        piece,
        points = null
    ) {

        const source =
            points ||
            getCutPoints(
                piece
            );


        if (
            source.length < 3
        ) {

            return null;

        }


        return ProductionGeometry.getBounds(
            source
        );

    }


    /* ========================================================
       ROTATE POINTS
       ======================================================== */

    function rotatePoints180(
        points
    ) {

        if (
            !Array.isArray(points)
        ) {

            return [];

        }


        return points.map(
            point => [

                -Number(
                    point[0]
                ),

                -Number(
                    point[1]
                )

            ]
        );

    }


    /* ========================================================
       NORMALIZE TO LOCAL ORIGIN
       ======================================================== */

    function normalizePoints(
        points
    ) {

        const bounds =
            ProductionGeometry.getBounds(
                points
            );


        return points.map(
            point => [

                round(
                    Number(point[0]) -
                    Number(bounds.minX)
                ),

                round(
                    Number(point[1]) -
                    Number(bounds.minY)
                )

            ]
        );

    }


    /* ========================================================
       GRAINLINE DIRECTION
       ======================================================== */

    function getGrainDirection(
        piece
    ) {

        const grainline =
            piece?.grainline;


        if (
            !Array.isArray(
                grainline
            ) ||
            grainline.length < 2
        ) {

            return null;

        }


        const dx =
            Number(
                grainline[1][0]
            ) -
            Number(
                grainline[0][0]
            );


        const dy =
            Number(
                grainline[1][1]
            ) -
            Number(
                grainline[0][1]
            );


        if (
            Math.abs(dx) < 0.000001 &&
            Math.abs(dy) < 0.000001
        ) {

            return null;

        }


        return {

            dx,

            dy

        };

    }


    /* ========================================================
       ROTATION CANDIDATES
       ======================================================== */

    function getRotationCandidates(
        piece,
        options
    ) {

        const config =
            mergeOptions(
                options
            );


        /*
         * Grainline restriction.
         *
         * v1 hanya mengenali:
         *
         *   0
         *   180
         *
         * untuk piece yang mempunyai grainline.
         */

        if (
            config.respectGrainline &&
            getGrainDirection(piece)
        ) {

            return [0];

        }


        if (
            !config.allowRotation
        ) {

            return [0];

        }


        return [0, 180];

    }


    /* ========================================================
       TRANSFORM POINTS
       ======================================================== */

    function transformPoints(
        points,
        rotation
    ) {

        let output =
            points;


        if (
            Number(rotation) ===
            180
        ) {

            output =
                rotatePoints180(
                    output
                );

        }


        return normalizePoints(
            output
        );

    }


    /* ========================================================
       ROTATED GRAINLINE
       ======================================================== */

    function transformGrainline(
        grainline,
        rotation,
        originalPoints,
        transformedPoints
    ) {

        if (
            !Array.isArray(
                grainline
            ) ||
            grainline.length < 2
        ) {

            return null;

        }


        let points = [

            grainline[0],
            grainline[1]

        ];


        if (
            Number(rotation) ===
            180
        ) {

            points =
                rotatePoints180(
                    points
                );

        }


        const originalBounds =
            ProductionGeometry.getBounds(
                Number(rotation) === 180
                    ? rotatePoints180(
                        originalPoints
                    )
                    : originalPoints
            );


        return points.map(
            point => [

                round(
                    Number(point[0]) -
                    Number(originalBounds.minX)
                ),

                round(
                    Number(point[1]) -
                    Number(originalBounds.minY)
                )

            ]
        );

    }


    /* ========================================================
       CANDIDATE CREATION
       ======================================================== */

    function createCandidate(
        piece,
        rotation
    ) {

        const originalPoints =
            getCutPoints(
                piece
            );


        if (
            originalPoints.length < 3
        ) {

            return null;

        }


        const transformedPoints =
            transformPoints(
                originalPoints,
                rotation
            );


        const bounds =
            getPieceBounds(
                piece,
                transformedPoints
            );


        if (
            !bounds
        ) {

            return null;

        }


        return {

            rotation,

            points:
                transformedPoints,

            width:
                round(
                    bounds.width
                ),

            height:
                round(
                    bounds.height
                ),

            grainline:
                transformGrainline(

                    piece.grainline,

                    rotation,

                    originalPoints,

                    transformedPoints

                )

        };

    }


    /* ========================================================
       CANDIDATES
       ======================================================== */

    function createCandidates(
        piece,
        options
    ) {

        const rotations =
            getRotationCandidates(
                piece,
                options
            );


        return rotations
            .map(
                rotation =>
                    createCandidate(
                        piece,
                        rotation
                    )
            )
            .filter(
                Boolean
            );

    }


    /* ========================================================
       INTERSECTION / RECTANGLE
       ======================================================== */

    function rectanglesOverlap(
        a,
        b,
        gap = 0
    ) {

        return !(
            (
                a.x +
                a.width +
                gap
            ) <= b.x

            ||

            (
                b.x +
                b.width +
                gap
            ) <= a.x

            ||

            (
                a.y +
                a.height +
                gap
            ) <= b.y

            ||

            (
                b.y +
                b.height +
                gap
            ) <= a.y
        );

    }


    /* ========================================================
       PLACEMENT VALIDATION
       ======================================================== */

    function fitsFabric(
        placement,
        config
    ) {

        return (

            placement.x >=
                config.edgeMargin

            &&

            placement.y >=
                config.edgeMargin

            &&

            (
                placement.x +
                placement.width
            ) <=
                (
                    config.fabricWidth -
                    config.edgeMargin
                )

            &&

            (
                placement.y +
                placement.height
            ) <=
                (
                    config.fabricLength -
                    config.edgeMargin
                )

        );

    }


    function overlapsPlaced(
        placement,
        placed,
        gap
    ) {

        return placed.some(
            other =>
                rectanglesOverlap(

                    placement,

                    other,

                    gap

                )
        );

    }


    /* ========================================================
       CREATE PIECE INSTANCE
       ======================================================== */

    function expandPieceQuantities(
        pattern
    ) {

        const result =
            [];


        (
            pattern?.pieces ||
            []
        )
        .forEach(
            (
                piece,
                pieceIndex
            ) => {

                const quantity =
                    Math.max(

                        1,

                        Math.round(
                            num(
                                piece.quantity,
                                1
                            )
                        )

                    );


                for (
                    let i = 0;
                    i < quantity;
                    i++
                ) {

                    result.push({

                        piece,

                        sourceIndex:
                            pieceIndex,

                        instanceIndex:
                            i,

                        id:
                            `${piece.name || "piece"}-${pieceIndex + 1}-${i + 1}`

                    });

                }

            }
        );


        return result;

    }


    /* ========================================================
       SORT PIECES
       ======================================================== */

    function sortInstances(
        instances
    ) {

        return [
            ...instances
        ]
        .sort(
            (
                a,
                b
            ) => {

                const aPoints =
                    getCutPoints(
                        a.piece
                    );


                const bPoints =
                    getCutPoints(
                        b.piece
                    );


                const aBounds =
                    getPieceBounds(
                        a.piece,
                        aPoints
                    );


                const bBounds =
                    getPieceBounds(
                        b.piece,
                        bPoints
                    );


                const aArea =
                    aBounds
                        ? (
                            aBounds.width *
                            aBounds.height
                        )
                        : 0;


                const bArea =
                    bBounds
                        ? (
                            bBounds.width *
                            bBounds.height
                        )
                        : 0;


                return bArea -
                    aArea;

            }
        );

    }


    /* ========================================================
       CANDIDATE PLACEMENT
       ======================================================== */

    function findPlacement(
        instance,
        placed,
        config
    ) {

        const candidates =
            createCandidates(

                instance.piece,

                config

            );


        if (
            !candidates.length
        ) {

            return null;

        }


        /*
         * Shelf strategy.
         *
         * Candidate positions consist of:
         *
         * 1. Current cursor
         * 2. Right side of every placed item
         * 3. Next row beneath every placed item
         */

        const positions =
            [];


        positions.push({

            x:
                config.startX,

            y:
                config.startY

        });


        placed.forEach(
            placedItem => {

                positions.push({

                    x:
                        placedItem.x +
                        placedItem.width +
                        config.gap,

                    y:
                        placedItem.y

                });


                positions.push({

                    x:
                        placedItem.x,

                    y:
                        placedItem.y +
                        placedItem.height +
                        config.gap

                });


                positions.push({

                    x:
                        placedItem.x +
                        placedItem.width +
                        config.gap,

                    y:
                        placedItem.y +
                        placedItem.height +
                        config.gap

                });

            }
        );


        let best =
            null;


        candidates.forEach(
            candidate => {

                positions.forEach(
                    position => {

                        const placement = {

                            x:
                                round(
                                    position.x
                                ),

                            y:
                                round(
                                    position.y
                                ),

                            width:
                                candidate.width,

                            height:
                                candidate.height,

                            rotation:
                                candidate.rotation,

                            points:
                                candidate.points,

                            grainline:
                                candidate.grainline

                        };


                        if (
                            !fitsFabric(
                                placement,
                                config
                            )
                        ) {

                            return;

                        }


                        if (
                            overlapsPlaced(

                                placement,

                                placed,

                                config.gap

                            )
                        ) {

                            return;

                        }


                        /*
                         * Score:
                         *
                         * lower y first,
                         * then lower x.
                         */

                        const score =

                            (
                                placement.y *
                                100000
                            )

                            +

                            placement.x;


                        if (
                            !best ||
                            score <
                            best.score
                        ) {

                            best = {

                                placement,

                                score

                            };

                        }

                    }
                );

            }
        );


        return best
            ? best.placement
            : null;

    }


    /* ========================================================
       PLACE INSTANCE
       ======================================================== */

    function placeInstance(
        instance,
        placed,
        config
    ) {

        const placement =
            findPlacement(

                instance,

                placed,

                config

            );


        if (
            !placement
        ) {

            return null;

        }


        return {

            id:
                instance.id,

            sourceIndex:
                instance.sourceIndex,

            instanceIndex:
                instance.instanceIndex,

            name:
                instance.piece.name,

            type:
                instance.piece.type,

            quantity:
                instance.piece.quantity,

            x:
                placement.x,

            y:
                placement.y,

            width:
                placement.width,

            height:
                placement.height,

            rotation:
                placement.rotation,

            points:

                placement.points.map(
                    point => [

                        round(
                            point[0] +
                            placement.x
                        ),

                        round(
                            point[1] +
                            placement.y
                        )

                    ]
                ),

            grainline:

                placement.grainline

                    ? placement.grainline.map(
                        point => [

                            round(
                                point[0] +
                                placement.x
                            ),

                            round(
                                point[1] +
                                placement.y
                            )

                        ]
                    )

                    : null,

            sourcePiece:
                instance.piece

        };

    }


    /* ========================================================
       NEST
       ======================================================== */

    function createNest(
        pattern,
        options = {}
    ) {

        const config =
            mergeOptions(
                options
            );


        /*
         * Validate source first.
         */

        const validation =
            ProductionValidator
                .validateForProduction(

                    pattern,

                    {

                        requireCutPoints:
                            true,

                        requireSeam:
                            true

                    }

                );


        if (
            !validation.valid
        ) {

            throw new Error(

                "Nesting dihentikan karena " +
                "cutting pattern belum valid."

            );

        }


        const instances =
            sortInstances(
                expandPieceQuantities(
                    pattern
                )
            );


        const placed =
            [];


        const unplaced =
            [];


        instances.forEach(
            instance => {

                const placement =
                    placeInstance(

                        instance,

                        placed,

                        config

                    );


                if (
                    placement
                ) {

                    placed.push(
                        placement
                    );

                }
                else {

                    unplaced.push(

                        instance

                    );

                }

            }
        );


        /*
         * Required marker length
         */

        let usedLength =
            0;


        placed.forEach(
            item => {

                usedLength =
                    Math.max(

                        usedLength,

                        item.y +
                        item.height +
                        config.edgeMargin

                    );

            }
        );


        usedLength =
            Math.max(
                usedLength,
                config.edgeMargin
            );


        /*
         * Fabric area.
         */

        const fabricArea =

            config.fabricWidth *
            usedLength;


        /*
         * Bounding-box used area.
         */

        const pieceArea =
            placed.reduce(

                (
                    total,
                    item
                ) =>

                    total +
                    (
                        item.width *
                        item.height
                    ),

                0

            );


        const utilization =
            fabricArea > 0

                ? (
                    pieceArea /
                    fabricArea
                ) *
                100

                : 0;


        return {

            type:
                "marker",

            version:
                "1.0",

            strategy:
                config.strategy,

            fabric: {

                width:
                    round(
                        config.fabricWidth
                    ),

                length:
                    round(
                        usedLength
                    ),

                suppliedLength:
                    round(
                        config.fabricLength
                    )

            },

            spacing: {

                pieceGap:
                    round(
                        config.gap
                    ),

                edgeMargin:
                    round(
                        config.edgeMargin
                    )

            },

            pieces:
                placed,

            unplaced,

            complete:
                unplaced.length === 0,

            utilization:
                round(
                    utilization
                ),

            metadata: {

                unit:
                    "cm",

                scale:
                    1,

                source:
                    "cuttingPattern",

                generatedAt:
                    new Date()
                        .toISOString(),

                algorithm:
                    "bounding-box-shelf-v1"

            }

        };

    }


    /* ========================================================
       VALIDATE NEST
       ======================================================== */

    function validateNest(
        nest
    ) {

        const errors =
            [];


        const warnings =
            [];


        if (
            !nest
        ) {

            errors.push(
                "Nest belum tersedia."
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
                nest.pieces
            )
        ) {

            errors.push(
                "Nest tidak memiliki pieces."
            );

        }


        /*
         * Bounds.
         */

        const fabricWidth =
            Number(
                nest.fabric?.width
            );


        const fabricLength =
            Number(
                nest.fabric?.length
            );


        (
            nest.pieces ||
            []
        )
        .forEach(
            piece => {

                const maxX =
                    piece.x +
                    piece.width;


                const maxY =
                    piece.y +
                    piece.height;


                if (
                    maxX >
                    fabricWidth +
                    0.000001
                ) {

                    errors.push(

                        `Piece "${piece.name}" ` +
                        "melewati lebar kain."

                    );

                }


                if (
                    maxY >
                    fabricLength +
                    0.000001
                ) {

                    errors.push(

                        `Piece "${piece.name}" ` +
                        "melewati panjang marker."

                    );

                }

            }
        );


        /*
         * Rectangle overlaps.
         */

        const pieces =
            nest.pieces ||
            [];


        for (
            let i = 0;
            i < pieces.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < pieces.length;
                j++
            ) {

                if (
                    rectanglesOverlap(

                        pieces[i],

                        pieces[j],

                        -0.000001

                    )
                ) {

                    errors.push(

                        `Overlap: ${pieces[i].name} ` +
                        `vs ${pieces[j].name}.`

                    );

                }

            }

        }


        if (
            nest.unplaced &&
            nest.unplaced.length
        ) {

            warnings.push({

                message:
                    `${nest.unplaced.length} piece ` +
                    "belum dapat ditempatkan."

            });

        }


        return {

            valid:
                errors.length === 0,

            errors,

            warnings

        };

    }


    /* ========================================================
       UTILIZATION
       ======================================================== */

    function calculateUtilization(
        nest
    ) {

        if (
            !nest
        ) {

            return 0;

        }


        return round(
            num(
                nest.utilization,
                0
            )
        );

    }


    /* ========================================================
       MARKER SUMMARY
       ======================================================== */

    function getSummary(
        nest
    ) {

        return {

            pieceCount:
                nest?.pieces?.length ||
                0,

            unplacedCount:
                nest?.unplaced?.length ||
                0,

            complete:
                Boolean(
                    nest?.complete
                ),

            fabricWidth:
                round(
                    nest?.fabric?.width ||
                    0
                ),

            usedLength:
                round(
                    nest?.fabric?.length ||
                    0
                ),

            utilization:
                calculateUtilization(
                    nest
                ),

            unit:
                nest?.metadata?.unit ||
                "cm",

            scale:
                nest?.metadata?.scale ||
                1

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    const NestingEngine = {

        id:
            "nesting",

        label:
            "PatternMaker Nesting / Marker Engine",

        version:
            "1.0",

        defaults:
            DEFAULTS,

        createNest,

        validateNest,

        calculateUtilization,

        getSummary,

        getCutPoints,

        getPieceBounds,

        expandPieceQuantities

    };


    /* ========================================================
       GLOBAL
       ======================================================== */

    window.PatternMakerNestingEngine =
        NestingEngine;


})();
