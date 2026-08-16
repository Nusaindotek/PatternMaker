/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 30 — engine/export-plotter.js
 * ============================================================
 *
 * PLT / HPGL EXPORTER
 *
 * Input:
 *   Cutting Geometry
 *
 * Output:
 *   HPGL / PLT
 *
 * Internal geometry:
 *   cm
 *
 * HPGL default:
 *   40 plotter units / mm
 *
 * sehingga:
 *
 *   1 mm = 40 HPGL units
 *   1 cm = 400 HPGL units
 *
 * ============================================================
 *
 * COMMANDS:
 *
 *   IN  = Initialize
 *   SP  = Select Pen
 *   PU  = Pen Up
 *   PD  = Pen Down
 *
 * Default:
 *
 *   CUT       → pen 1
 *   GRAINLINE → pen 2
 *   NOTCH     → pen 3
 *   DRILL     → pen 4
 *
 * ============================================================
 *
 * CATATAN:
 *
 * Karena implementasi HPGL berbeda antar plotter/driver,
 * unitsPerMm, pen mapping, origin dan page behavior
 * dibuat configurable.
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       DEPENDENCY
       ======================================================== */

    const ProductionValidator =
        window.PatternMakerProductionValidator;


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

        unitsPerMm:
            40,

        penCut:
            1,

        penGrainline:
            2,

        penNotch:
            3,

        penDrill:
            4,

        penLabel:
            5,

        includeGrainline:
            true,

        includeNotches:
            true,

        includeDrillPoints:
            true,

        includeLabels:
            false,

        /*
         * HPGL origin.
         */

        originX:
            0,

        originY:
            0,

        /*
         * Y orientation.
         *
         * false:
         * preserve Cartesian-like Y direction.
         *
         * true:
         * flip Y for device coordinate system.
         */

        flipY:
            false,

        /*
         * Initialize plotter.
         */

        initialize:
            true,

        /*
         * Reset pen at end.
         */

        resetPen:
            true,

        /*
         * Final command.
         */

        terminate:
            true

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
            Number(value)
        );

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
       CM → HPGL
       ======================================================== */

    function cmToHpgl(
        value,
        options = {}
    ) {

        const config =
            mergeOptions(
                options
            );


        return round(

            Number(value) *
            10 *
            config.unitsPerMm

        );

    }


    /* ========================================================
       POINT → HPGL
       ======================================================== */

    function pointToHpgl(
        point,
        options = {}
    ) {

        if (
            !Array.isArray(point) ||
            point.length < 2
        ) {

            throw new Error(
                "Point HPGL tidak valid."
            );

        }


        const config =
            mergeOptions(
                options
            );


        let x =
            cmToHpgl(
                point[0],
                config
            );


        let y =
            cmToHpgl(
                point[1],
                config
            );


        if (
            config.flipY
        ) {

            y =
                -y;

        }


        x +=
            num(
                config.originX,
                0
            );


        y +=
            num(
                config.originY,
                0
            );


        return {

            x:
                round(x),

            y:
                round(y)

        };

    }


    /* ========================================================
       HPGL COMMAND
       ======================================================== */

    function command(
        code,
        value = ""
    ) {

        return (

            String(code) +
            String(value) +
            ";"

        );

    }


    /* ========================================================
       COORDINATE PAIR
       ======================================================== */

    function coordinate(
        point,
        options = {}
    ) {

        const converted =
            pointToHpgl(
                point,
                options
            );


        return (

            String(
                converted.x
            ) +

            "," +

            String(
                converted.y
            )

        );

    }


    /* ========================================================
       PEN SELECT
       ======================================================== */

    function selectPen(
        pen
    ) {

        const value =
            Math.max(
                0,
                Math.round(
                    num(
                        pen,
                        1
                    )
                )
            );


        return command(
            "SP",
            value
        );

    }


    /* ========================================================
       PEN UP
       ======================================================== */

    function penUp(
        point,
        options = {}
    ) {

        return (

            command(
                "PU",
                coordinate(
                    point,
                    options
                )
            )

        );

    }


    /* ========================================================
       PEN DOWN
       ======================================================== */

    function penDown(
        points,
        options = {}
    ) {

        if (
            !Array.isArray(points) ||
            !points.length
        ) {

            return "";

        }


        let output =
            "";


        output +=
            command(
                "PD",
                points
                    .map(
                        point =>
                            coordinate(
                                point,
                                options
                            )
                    )
                    .join(",")
            );


        return output;

    }


    /* ========================================================
       POLYLINE
       ======================================================== */

    function createPolyline(
        points,
        options = {}
    ) {

        if (
            !Array.isArray(points) ||
            points.length < 2
        ) {

            return "";

        }


        const config =
            mergeOptions(
                options
            );


        let output =
            "";


        output +=
            penUp(
                points[0],
                config
            );


        output +=
            penDown(
                points,
                config
            );


        /*
         * Close polygon.
         *
         * Cutting boundary should be closed.
         */

        if (
            config.closed !== false &&
            points.length >= 3
        ) {

            output +=
                command(
                    "PD",
                    coordinate(
                        points[0],
                        config
                    )
                );

        }


        output +=
            command(
                "PU"
            );


        return output;

    }


    /* ========================================================
       LINE
       ======================================================== */

    function createLine(
        start,
        end,
        options = {}
    ) {

        if (
            !start ||
            !end
        ) {

            return "";

        }


        const config =
            mergeOptions(
                options
            );


        let output =
            "";


        output +=
            penUp(
                start,
                config
            );


        output +=
            penDown(
                [
                    end
                ],
                config
            );


        output +=
            command(
                "PU"
            );


        return output;

    }


    /* ========================================================
       NOTCH
       ======================================================== */

    function createNotch(
        point,
        options = {}
    ) {

        if (
            !Array.isArray(point)
        ) {

            return "";

        }


        const config =
            mergeOptions(
                options
            );


        const size =
            num(
                config.notchSize,
                0.6
            );


        const a = [

            point[0] -
            size,

            point[1] -
            size

        ];


        const b = [

            point[0] +
            size,

            point[1] +
            size

        ];


        return createLine(

            a,

            b,

            config

        );

    }


    /* ========================================================
       DRILL POINT
       ======================================================== */

    function createDrillPoint(
        point,
        options = {}
    ) {

        if (
            !Array.isArray(point)
        ) {

            return "";

        }


        const config =
            mergeOptions(
                options
            );


        /*
         * HPGL does not provide a universal
         * filled point primitive.
         *
         * We make a tiny cross marker.
         */

        const size =
            num(
                config.drillSize,
                0.7
            );


        const horizontalA = [

            point[0] -
            size,

            point[1]

        ];


        const horizontalB = [

            point[0] +
            size,

            point[1]

        ];


        const verticalA = [

            point[0],

            point[1] -
            size

        ];


        const verticalB = [

            point[0],

            point[1] +
            size

        ];


        let output =
            "";


        output +=
            createLine(

                horizontalA,

                horizontalB,

                config

            );


        output +=
            createLine(

                verticalA,

                verticalB,

                config

            );


        return output;

    }


    /* ========================================================
       PIECE LABEL
       ======================================================== */

    function getPieceLabelPoint(
        piece
    ) {

        if (
            piece.bounds
        ) {

            return [

                (
                    Number(
                        piece.bounds.minX
                    ) +

                    Number(
                        piece.bounds.maxX
                    )
                ) / 2,

                Number(
                    piece.bounds.minY
                ) - 2

            ];

        }


        const points =
            piece.points || [];


        if (
            !points.length
        ) {

            return [
                0,
                0
            ];

        }


        let minX =
            Infinity;

        let maxX =
            -Infinity;

        let minY =
            Infinity;


        points.forEach(
            point => {

                minX =
                    Math.min(
                        minX,
                        point[0]
                    );


                maxX =
                    Math.max(
                        maxX,
                        point[0]
                    );


                minY =
                    Math.min(
                        minY,
                        point[1]
                    );

            }
        );


        return [

            (
                minX +
                maxX
            ) / 2,

            minY -
            2

        ];

    }


    /* ========================================================
       SIMPLE TEXT LABEL
       ======================================================== */

    function createLabel(
        text,
        point,
        options = {}
    ) {

        /*
         * HPGL text support varies considerably.
         *
         * The feature is therefore OFF by default.
         *
         * When enabled, use:
         *
         *     LBtext\x03
         *
         * with an explicit ETX termination character.
         */

        const config =
            mergeOptions(
                options
            );


        if (
            config.includeLabels !==
            true
        ) {

            return "";

        }


        if (
            !text
        ) {

            return "";

        }


        const coordinateText =
            coordinate(
                point,
                config
            );


        let output =
            "";


        output +=
            penUp(
                point,
                config
            );


        output +=
            command(
                "LB",
                String(text) +
                "\x03"
            );


        output +=
            command(
                "PU"
            );


        return output;

    }


    /* ========================================================
       PIECE BOUNDARY
       ======================================================== */

    function getCutPoints(
        piece
    ) {

        if (
            piece.cutPoints &&
            Array.isArray(
                piece.cutPoints
            ) &&
            piece.cutPoints.length >= 3
        ) {

            return piece.cutPoints;

        }


        if (
            piece.points &&
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
       EXPORT PIECE
       ======================================================== */

    function exportPiece(
        piece,
        options = {}
    ) {

        const config =
            mergeOptions(
                options
            );


        const points =
            getCutPoints(
                piece
            );


        if (
            points.length < 3
        ) {

            throw new Error(

                `Piece "${piece?.name || "unknown"}" ` +
                "tidak memiliki cut geometry."

            );

        }


        let output =
            "";


        /*
         * CUTTING BOUNDARY
         */

        output +=
            selectPen(
                config.penCut
            );


        output +=
            createPolyline(

                points,

                {

                    ...config,

                    closed:
                        true

                }

            );


        /*
         * GRAINLINE
         */

        if (
            config.includeGrainline &&
            Array.isArray(
                piece.grainline
            ) &&
            piece.grainline.length >= 2
        ) {

            output +=
                selectPen(
                    config.penGrainline
                );


            output +=
                createLine(

                    piece.grainline[0],

                    piece.grainline[1],

                    config

                );

        }


        /*
         * NOTCH
         */

        if (
            config.includeNotches &&
            Array.isArray(
                piece.notches
            )
        ) {

            output +=
                selectPen(
                    config.penNotch
                );


            piece.notches.forEach(
                notch => {

                    output +=
                        createNotch(

                            notch,

                            config

                        );

                }
            );

        }


        /*
         * DRILL
         */

        if (
            config.includeDrillPoints &&
            Array.isArray(
                piece.drillPoints
            )
        ) {

            output +=
                selectPen(
                    config.penDrill
                );


            piece.drillPoints.forEach(
                point => {

                    output +=
                        createDrillPoint(

                            point,

                            config

                        );

                }
            );

        }


        /*
         * LABEL
         */

        if (
            config.includeLabels
        ) {

            output +=
                selectPen(
                    config.penLabel
                );


            const labelPoint =
                getPieceLabelPoint(
                    piece
                );


            output +=
                createLabel(

                    piece.label ||
                    piece.name ||
                    "PATTERN",

                    labelPoint,

                    config

                );

        }


        /*
         * Safe final pen-up.
         */

        output +=
            command(
                "PU"
            );


        return output;

    }


    /* ========================================================
       VALIDATE BEFORE EXPORT
       ======================================================== */

    function validatePattern(
        pattern
    ) {

        if (
            !pattern
        ) {

            throw new Error(
                "Pattern belum tersedia."
            );

        }


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

            const messages =
                validation.errors
                    .slice(
                        0,
                        5
                    )
                    .map(
                        error => {

                            if (
                                typeof error ===
                                "string"
                            ) {

                                return error;

                            }


                            return (

                                error.message ||
                                error.check ||
                                "Production geometry invalid."

                            );

                        }
                    );


            throw new Error(

                "PLT export dihentikan karena " +
                "geometry belum lulus validasi: " +

                messages.join(
                    " | "
                )

            );

        }


        return validation;

    }


    /* ========================================================
       HEADER
       ======================================================== */

    function createHeader(
        options = {}
    ) {

        const config =
            mergeOptions(
                options
            );


        let output =
            "";


        if (
            config.initialize
        ) {

            output +=
                command(
                    "IN"
                );

        }


        /*
         * Select default cut pen.
         */

        output +=
            selectPen(
                config.penCut
            );


        output +=
            command(
                "PU"
            );


        return output;

    }


    /* ========================================================
       FOOTER
       ======================================================== */

    function createFooter(
        options = {}
    ) {

        const config =
            mergeOptions(
                options
            );


        let output =
            "";


        output +=
            command(
                "PU"
            );


        if (
            config.resetPen
        ) {

            output +=
                selectPen(
                    0
                );

        }


        if (
            config.terminate
        ) {

            /*
             * HPGL files do not require EOF in
             * the same sense as DXF. A final semicolon
             * terminated command is sufficient.
             */

            output +=
                "\n";

        }


        return output;

    }


    /* ========================================================
       BUILD HPGL
       ======================================================== */

    function buildHPGL(
        pattern,
        options = {}
    ) {

        const config =
            mergeOptions(
                options
            );


        validatePattern(
            pattern
        );


        let output =
            "";


        output +=
            createHeader(
                config
            );


        pattern.pieces.forEach(
            piece => {

                output +=
                    exportPiece(

                        piece,

                        config

                    );

            }
        );


        output +=
            createFooter(
                config
            );


        return output;

    }


    /* ========================================================
       BLOB
       ======================================================== */

    function createHPGLBlob(
        pattern,
        options = {}
    ) {

        const hpgl =
            buildHPGL(
                pattern,
                options
            );


        return new Blob(

            [
                hpgl
            ],

            {

                type:
                    "application/octet-stream"

            }

        );

    }


    /* ========================================================
       DOWNLOAD
       ======================================================== */

    function downloadHPGL(
        pattern,
        filename =
            "PatternMaker-Pattern.plt",
        options = {}
    ) {

        const blob =
            createHPGLBlob(

                pattern,

                options

            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            filename;


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },

            1000

        );


        return {

            success:
                true,

            filename,

            format:
                "HPGL / PLT",

            sourceUnit:
                "cm",

            plotterUnit:
                "HPGL",

            unitsPerMm:
                mergeOptions(
                    options
                ).unitsPerMm

        };

    }


    /* ========================================================
       EXPORT INFORMATION
       ======================================================== */

    function getExportInfo(
        options = {}
    ) {

        const config =
            mergeOptions(
                options
            );


        return {

            format:
                "PLT / HPGL",

            sourceUnit:
                "cm",

            millimetersPerCm:
                10,

            unitsPerMm:
                config.unitsPerMm,

            hpglUnitsPerCm:
                config.unitsPerMm *
                10,

            defaultPens: {

                cut:
                    config.penCut,

                grainline:
                    config.penGrainline,

                notch:
                    config.penNotch,

                drill:
                    config.penDrill,

                label:
                    config.penLabel

            },

            yFlipped:
                config.flipY

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerPlotter = {

        DEFAULTS,

        cmToHpgl,

        pointToHpgl,

        command,

        coordinate,

        selectPen,

        penUp,

        penDown,

        createPolyline,

        createLine,

        createNotch,

        createDrillPoint,

        createLabel,

        exportPiece,

        validatePattern,

        createHeader,

        createFooter,

        buildHPGL,

        createHPGLBlob,

        downloadHPGL,

        getExportInfo

    };


})();
