/**
 * ============================================================
 * PATTERNMAKER UNIVERSAL
 * KODE 28 — engine/export-dxf.js
 * ============================================================
 *
 * DXF R12 EXPORTER
 *
 * Input:
 *   Production / Cutting Geometry
 *
 * Output:
 *   ASCII DXF R12
 *
 * Internal unit:
 *   cm
 *
 * Export unit:
 *   mm
 *
 * 1 cm = 10 mm
 *
 * ============================================================
 *
 * ENTITIES:
 *
 *   LWPOLYLINE
 *   LINE
 *   POINT
 *   TEXT
 *
 * ============================================================
 *
 * Default production export:
 *
 *   CUTTING BOUNDARY
 *   GRAINLINE
 *   NOTCH
 *   DRILL POINT
 *   LABEL
 *
 * ============================================================
 */

(function () {

    "use strict";


    /* ========================================================
       CONSTANTS
       ======================================================== */

    const CM_TO_MM =
        10;


    const DXF_VERSION =
        "AC1009";


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
       NUMBER FORMAT
       ======================================================== */

    function formatNumber(
        value
    ) {

        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            throw new Error(
                "Koordinat DXF tidak valid."
            );

        }


        /*
         * DXF menggunakan decimal text.
         */

        return number
            .toFixed(4)
            .replace(
                /0+$/,
                ""
            )
            .replace(
                /\.$/,
                ""
            );

    }


    /* ========================================================
       UNIT CONVERSION
       ======================================================== */

    function cmToMm(
        value
    ) {

        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {

            throw new Error(
                "Nilai CM tidak valid."
            );

        }


        return number *
            CM_TO_MM;

    }


    /* ========================================================
       POINT CONVERSION
       ======================================================== */

    function pointCmToMm(
        point
    ) {

        if (
            !Array.isArray(point) ||
            point.length < 2
        ) {

            throw new Error(
                "Point tidak valid untuk DXF."
            );

        }


        return {

            x:
                cmToMm(
                    point[0]
                ),

            y:
                cmToMm(
                    point[1]
                )

        };

    }


    /* ========================================================
       DXF SECTION
       ======================================================== */

    function dxfPair(
        code,
        value
    ) {

        return (

            String(code) +
            "\n" +
            String(value) +
            "\n"

        );

    }


    /* ========================================================
       HEADER
       ======================================================== */

    function createHeader(
        options = {}
    ) {

        let output =
            "";


        output +=
            dxfPair(
                0,
                "SECTION"
            );


        output +=
            dxfPair(
                2,
                "HEADER"
            );


        output +=
            dxfPair(
                9,
                "$ACADVER"
            );


        output +=
            dxfPair(
                1,
                DXF_VERSION
            );


        /*
         * INSUNITS = millimeters.
         *
         * AutoCAD DXF enum:
         * 4 = millimeters
         */

        output +=
            dxfPair(
                9,
                "$INSUNITS"
            );


        output +=
            dxfPair(
                70,
                4
            );


        /*
         * MEASUREMENT = metric.
         */

        output +=
            dxfPair(
                9,
                "$MEASUREMENT"
            );


        output +=
            dxfPair(
                70,
                1
            );


        output +=
            dxfPair(
                0,
                "ENDSEC"
            );


        return output;

    }


    /* ========================================================
       ENTITIES START
       ======================================================== */

    function createEntitiesHeader() {

        let output =
            "";


        output +=
            dxfPair(
                0,
                "SECTION"
            );


        output +=
            dxfPair(
                2,
                "ENTITIES"
            );


        return output;

    }


    /* ========================================================
       LAYER NAME
       ======================================================== */

    function normalizeLayer(
        value,
        fallback = "CUT"
    ) {

        if (
            !value
        ) {

            return fallback;

        }


        return String(
            value
        )
        .toUpperCase()
        .replace(
            /[^A-Z0-9_-]/g,
            "_"
        );

    }


    /* ========================================================
       LWPOLYLINE
       ======================================================== */

    function createLwPolyline(
        points,
        options = {}
    ) {

        if (
            !Array.isArray(points) ||
            points.length < 2
        ) {

            return "";

        }


        const layer =
            normalizeLayer(
                options.layer,
                "CUT"
            );


        const closed =
            options.closed !== false;


        let output =
            "";


        output +=
            dxfPair(
                0,
                "LWPOLYLINE"
            );


        output +=
            dxfPair(
                8,
                layer
            );


        output +=
            dxfPair(
                90,
                points.length
            );


        output +=
            dxfPair(
                70,
                closed
                    ? 1
                    : 0
            );


        points.forEach(
            point => {

                const converted =
                    pointCmToMm(
                        point
                    );


                output +=
                    dxfPair(
                        10,
                        formatNumber(
                            converted.x
                        )
                    );


                output +=
                    dxfPair(
                        20,
                        formatNumber(
                            converted.y
                        )
                    );

            }
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

        const a =
            pointCmToMm(
                start
            );


        const b =
            pointCmToMm(
                end
            );


        const layer =
            normalizeLayer(
                options.layer,
                "CONSTRUCTION"
            );


        let output =
            "";


        output +=
            dxfPair(
                0,
                "LINE"
            );


        output +=
            dxfPair(
                8,
                layer
            );


        output +=
            dxfPair(
                10,
                formatNumber(
                    a.x
                )
            );


        output +=
            dxfPair(
                20,
                formatNumber(
                    a.y
                )
            );


        output +=
            dxfPair(
                30,
                "0"
            );


        output +=
            dxfPair(
                11,
                formatNumber(
                    b.x
                )
            );


        output +=
            dxfPair(
                21,
                formatNumber(
                    b.y
                )
            );


        output +=
            dxfPair(
                31,
                "0"
            );


        return output;

    }


    /* ========================================================
       POINT
       ======================================================== */

    function createPoint(
        point,
        options = {}
    ) {

        const converted =
            pointCmToMm(
                point
            );


        const layer =
            normalizeLayer(
                options.layer,
                "DRILL"
            );


        let output =
            "";


        output +=
            dxfPair(
                0,
                "POINT"
            );


        output +=
            dxfPair(
                8,
                layer
            );


        output +=
            dxfPair(
                10,
                formatNumber(
                    converted.x
                )
            );


        output +=
            dxfPair(
                20,
                formatNumber(
                    converted.y
                )
            );


        output +=
            dxfPair(
                30,
                "0"
            );


        return output;

    }


    /* ========================================================
       TEXT
       ======================================================== */

    function createText(
        text,
        point,
        options = {}
    ) {

        const converted =
            pointCmToMm(
                point
            );


        const layer =
            normalizeLayer(
                options.layer,
                "LABEL"
            );


        const height =
            cmToMm(
                options.height ||
                2.5
            );


        let output =
            "";


        output +=
            dxfPair(
                0,
                "TEXT"
            );


        output +=
            dxfPair(
                8,
                layer
            );


        output +=
            dxfPair(
                10,
                formatNumber(
                    converted.x
                )
            );


        output +=
            dxfPair(
                20,
                formatNumber(
                    converted.y
                )
            );


        output +=
            dxfPair(
                30,
                "0"
            );


        output +=
            dxfPair(
                40,
                formatNumber(
                    height
                )
            );


        output +=
            dxfPair(
                1,
                String(
                    text
                )
            );


        return output;

    }


    /* ========================================================
       GRAINLINE
       ======================================================== */

    function createGrainline(
        grainline,
        options = {}
    ) {

        if (
            !Array.isArray(
                grainline
            ) ||
            grainline.length < 2
        ) {

            return "";

        }


        return createLine(

            grainline[0],

            grainline[1],

            {

                layer:
                    options.layer ||
                    "GRAINLINE"

            }

        );

    }


    /* ========================================================
       NOTCH
       ======================================================== */

    function createNotch(
        point,
        options = {}
    ) {

        const size =
            Number(
                options.size ||
                0.6
            );


        const x =
            Number(
                point[0]
            );


        const y =
            Number(
                point[1]
            );


        const a = [

            x - size,

            y - size

        ];


        const b = [

            x + size,

            y + size

        ];


        return createLine(

            a,

            b,

            {

                layer:
                    "NOTCH"

            }

        );

    }


    /* ========================================================
       PIECE BOUNDS
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

            minY - 2

        ];

    }


    /* ========================================================
       PIECE EXPORT
       ======================================================== */

    function exportPiece(
        piece,
        options = {}
    ) {

        let output =
            "";


        /*
         * CUTTING BOUNDARY
         */

        const cutPoints =

            piece.cutPoints &&
            piece.cutPoints.length >= 3

                ? piece.cutPoints

                : piece.points;


        output +=
            createLwPolyline(

                cutPoints,

                {

                    layer:
                        options.cutLayer ||
                        "CUT",

                    closed:
                        true

                }

            );


        /*
         * GRAINLINE
         */

        if (
            options.includeGrainline !==
            false &&
            piece.grainline &&
            piece.grainline.length >= 2
        ) {

            output +=
                createGrainline(

                    piece.grainline

                );

        }


        /*
         * NOTCHES
         */

        if (
            options.includeNotches !==
            false &&
            Array.isArray(
                piece.notches
            )
        ) {

            piece.notches.forEach(
                notch => {

                    output +=
                        createNotch(
                            notch
                        );

                }
            );

        }


        /*
         * DRILL POINTS
         */

        if (
            options.includeDrillPoints !==
            false &&
            Array.isArray(
                piece.drillPoints
            )
        ) {

            piece.drillPoints.forEach(
                point => {

                    output +=
                        createPoint(

                            point,

                            {

                                layer:
                                    "DRILL"

                            }

                        );

                }
            );

        }


        /*
         * LABEL
         */

        if (
            options.includeLabels !==
            false
        ) {

            const labelPosition =
                getPieceLabelPoint(
                    piece
                );


            output +=
                createText(

                    piece.label ||
                    piece.name ||
                    "PATTERN",

                    labelPosition,

                    {

                        layer:
                            "LABEL",

                        height:
                            options.labelHeight ||
                            2.5

                    }

                );

        }


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
                                "Geometry invalid."
                            );

                        }
                    );


            throw new Error(

                "DXF export dihentikan karena geometry " +
                "belum lulus validasi: " +

                messages.join(
                    " | "
                )

            );

        }


        return validation;

    }


    /* ========================================================
       BUILD DXF
       ======================================================== */

    function buildDXF(
        pattern,
        options = {}
    ) {

        validatePattern(
            pattern
        );


        let output =
            "";


        output +=
            createHeader(
                options
            );


        output +=
            createEntitiesHeader();


        pattern.pieces.forEach(
            piece => {

                output +=
                    exportPiece(

                        piece,

                        options

                    );

            }
        );


        output +=
            dxfPair(
                0,
                "ENDSEC"
            );


        output +=
            dxfPair(
                0,
                "EOF"
            );


        return output;

    }


    /* ========================================================
       BLOB
       ======================================================== */

    function createDXFBlob(
        pattern,
        options = {}
    ) {

        const dxf =
            buildDXF(
                pattern,
                options
            );


        return new Blob(

            [
                dxf
            ],

            {

                type:
                    "application/dxf"

            }

        );

    }


    /* ========================================================
       DOWNLOAD
       ======================================================== */

    function downloadDXF(
        pattern,
        filename =
            "PatternMaker-Pattern.dxf",
        options = {}
    ) {

        const blob =
            createDXFBlob(

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

            unit:
                "mm",

            sourceUnit:
                "cm"

        };

    }


    /* ========================================================
       EXPORT METADATA
       ======================================================== */

    function getExportInfo() {

        return {

            format:
                "DXF",

            version:
                "R12",

            dxfVersion:
                DXF_VERSION,

            sourceUnit:
                "cm",

            outputUnit:
                "mm",

            conversion:
                CM_TO_MM,

            layers: [

                "CUT",
                "GRAINLINE",
                "NOTCH",
                "DRILL",
                "LABEL"

            ]

        };

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.PatternMakerDXF = {

        cmToMm,

        pointCmToMm,

        createLwPolyline,

        createLine,

        createPoint,

        createText,

        createGrainline,

        createNotch,

        exportPiece,

        validatePattern,

        buildDXF,

        createDXFBlob,

        downloadDXF,

        getExportInfo

    };


})();
