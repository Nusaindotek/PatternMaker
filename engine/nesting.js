/* =========================================================
   PatternMaker V1.6
   NESTING ENGINE
   ---------------------------------------------------------
   Fungsi:
   - menyusun pola di atas kain
   - menghitung kebutuhan panjang kain
   - memperhitungkan seam allowance
   - memperhitungkan jumlah pakaian
   - memperhitungkan jumlah potongan
   - memperhitungkan rotasi material
   - menjaga pola tidak saling bertabrakan
   - menghitung efisiensi layout
========================================================= */


/* =========================================================
   SAFE NUMBER
========================================================= */

function safeNumber(
  value,
  fallback = 0
) {

  const number =
    Number(value);


  if (
    !Number.isFinite(number)
  ) {

    return fallback;

  }


  return number;

}


/* =========================================================
   ROUND
========================================================= */

function round(
  value,
  digits = 2
) {

  const factor =
    Math.pow(
      10,
      digits
    );


  return Math.round(
    safeNumber(value) *
    factor
  ) / factor;

}


/* =========================================================
   NORMALIZE ROTATION
========================================================= */

function normalizeRotation(
  rotation
) {

  const value =
    safeNumber(
      rotation,
      0
    );


  const normalized =
    ((value % 360) + 360) % 360;


  return normalized;

}


/* =========================================================
   GET ROTATED DIMENSIONS
========================================================= */

function getRotatedDimensions(
  width,
  height,
  rotation
) {

  const normalized =
    normalizeRotation(
      rotation
    );


  /*
    90° dan 270°
    menukar width dan height.

    0° dan 180°
    dimensi tetap.
  */

  if (
    normalized === 90 ||
    normalized === 270
  ) {

    return {

      width:
        height,

      height:
        width

    };

  }


  return {

    width,

    height

  };

}


/* =========================================================
   GET ROTATION OPTIONS
========================================================= */

function getRotationOptions(
  piece,
  fabric
) {

  let rotations =
    Array.isArray(
      fabric.allowedRotation
    )

      ? [
          ...fabric.allowedRotation
        ]

      : [0];


  /*
    Jika piece sendiri memiliki
    aturan rotasi, gunakan aturan tersebut.
  */

  if (
    Array.isArray(
      piece.allowedRotation
    )
  ) {

    rotations =
      rotations.filter(

        rotation =>
          piece.allowedRotation.includes(
            rotation
          )

      );

  }


  /*
    Pastikan selalu ada minimal 0°.
  */

  if (
    rotations.length === 0
  ) {

    rotations = [0];

  }


  /*
    Normalisasi dan hapus duplikat.
  */

  rotations =
    [
      ...new Set(
        rotations.map(
          normalizeRotation
        )
      )
    ];


  return rotations;

}


/* =========================================================
   ADD SEAM ALLOWANCE
========================================================= */

export function addSeamAllowance(
  piece,
  seam = 1
) {

  const safeSeam =
    Math.max(
      0,
      safeNumber(
        seam,
        0
      )
    );


  const width =
    Math.max(
      0,
      safeNumber(
        piece.width,
        0
      )
    );


  const height =
    Math.max(
      0,
      safeNumber(
        piece.height,
        0
      )
    );


  return {

    ...piece,

    originalWidth:
      width,

    originalHeight:
      height,

    width:
      width +
      safeSeam * 2,

    height:
      height +
      safeSeam * 2,

    seam:
      safeSeam

  };

}


/* =========================================================
   PREPARE PIECES
========================================================= */

export function preparePieces(
  pieces,
  options = {}
) {

  if (
    !Array.isArray(pieces)
  ) {

    return [];

  }


  const seam =
    Math.max(
      0,
      safeNumber(
        options.seam,
        1
      )
    );


  const quantity =
    Math.max(
      1,
      Math.floor(
        safeNumber(
          options.quantity,
          1
        )
      )
    );


  const result = [];


  /*
    Setiap garment dibuat
    menjadi instance tersendiri.
  */

  for (
    let garment = 1;
    garment <= quantity;
    garment++
  ) {

    for (
      const piece of pieces
    ) {

      if (
        !piece
      ) {

        continue;

      }


      const pieceQuantity =
        Math.max(
          1,
          Math.floor(
            safeNumber(
              piece.quantity,
              1
            )
          )
        );


      for (
        let index = 1;
        index <= pieceQuantity;
        index++
      ) {

        const prepared =
          addSeamAllowance(
            piece,
            seam
          );


        result.push({

          ...prepared,

          id:
            `${piece.name || "Piece"}-` +
            `G${garment}-` +
            `${index}`,

          name:
            piece.name ||
            "Piece",

          garment,

          pieceIndex:
            index

        });

      }

    }

  }


  return result;

}


/* =========================================================
   PIECE AREA
========================================================= */

function getPieceArea(
  piece
) {

  return (

    Math.max(
      0,
      safeNumber(
        piece.width,
        0
      )
    )

    *

    Math.max(
      0,
      safeNumber(
        piece.height,
        0
      )
    )

  );

}


/* =========================================================
   SORT PIECES
========================================================= */

export function sortPieces(
  pieces,
  strategy = "area"
) {

  const result =
    [...pieces];


  if (
    strategy === "height"
  ) {

    return result.sort(

      (a, b) =>

        safeNumber(
          b.height
        )

        -

        safeNumber(
          a.height
        )

    );

  }


  if (
    strategy === "width"
  ) {

    return result.sort(

      (a, b) =>

        safeNumber(
          b.width
        )

        -

        safeNumber(
          a.width
        )

    );

  }


  /*
    Default:
    area terbesar dahulu.
  */

  return result.sort(

    (a, b) =>

      getPieceArea(b)

      -

      getPieceArea(a)

  );

}


/* =========================================================
   CHECK RECTANGLE OVERLAP
========================================================= */

export function rectanglesOverlap(
  a,
  b
) {

  const ax =
    safeNumber(a.x);


  const ay =
    safeNumber(a.y);


  const aw =
    safeNumber(a.width);


  const ah =
    safeNumber(a.height);


  const bx =
    safeNumber(b.x);


  const by =
    safeNumber(b.y);


  const bw =
    safeNumber(b.width);


  const bh =
    safeNumber(b.height);


  /*
    Jika hanya bersentuhan di tepi,
    dianggap TIDAK overlap.

    Ini penting supaya pola
    bisa berdampingan.
  */

  return !(
    ax + aw <= bx ||
    bx + bw <= ax ||
    ay + ah <= by ||
    by + bh <= ay
  );

}


/* =========================================================
   CHECK PLACEMENT COLLISION
========================================================= */

function hasCollision(
  candidate,
  placements
) {

  for (
    const placement of placements
  ) {

    if (
      rectanglesOverlap(
        candidate,
        placement
      )
    ) {

      return true;

    }

  }


  return false;

}


/* =========================================================
   CHECK WIDTH
========================================================= */

function fitsWidth(
  x,
  width,
  fabricWidth
) {

  return (
    x >= 0 &&
    width >= 0 &&
    x + width <= fabricWidth
  );

}


/* =========================================================
   FIND FIRST AVAILABLE POSITION
========================================================= */

function findPosition(
  piece,
  rotation,
  fabricWidth,
  placements,
  startY = 0,
  step = 0.5
) {

  const dimensions =
    getRotatedDimensions(

      safeNumber(
        piece.width
      ),

      safeNumber(
        piece.height
      ),

      rotation

    );


  const width =
    dimensions.width;


  const height =
    dimensions.height;


  /*
    Jika potongan lebih lebar
    daripada kain, posisi mustahil.
  */

  if (
    width > fabricWidth
  ) {

    return null;

  }


  /*
    Kandidat X.

    Kita tidak hanya mencoba
    dari kiri ke kanan.

    Kita juga mencoba posisi
    setelah setiap piece yang
    sudah terpasang.
  */

  const xCandidates = [

    0

  ];


  for (
    const placement of placements
  ) {

    xCandidates.push(

      safeNumber(
        placement.x
      )

      +

      safeNumber(
        placement.width
      )

    );

  }


  /*
    Hilangkan duplikat.
  */

  const uniqueX =
    [
      ...new Set(
        xCandidates.map(
          value =>
            round(
              value,
              3
            )
        )
      )
    ];


  /*
    Kandidat Y.

    Mulai dari startY,
    kemudian coba posisi
    di bawah setiap piece.
  */

  const yCandidates = [

    Math.max(
      0,
      startY
    )

  ];


  for (
    const placement of placements
  ) {

    yCandidates.push(

      safeNumber(
        placement.y
      )

      +

      safeNumber(
        placement.height
      )

    );

  }


  const uniqueY =
    [
      ...new Set(
        yCandidates.map(
          value =>
            round(
              value,
              3
            )
        )
      )
    ];


  /*
    Urutkan dari posisi paling atas.
  */

  uniqueY.sort(
    (a, b) => a - b
  );


  uniqueX.sort(
    (a, b) => a - b
  );


  /*
    Coba kombinasi X/Y.
  */

  for (
    const y of uniqueY
  ) {

    for (
      const x of uniqueX
    ) {

      if (
        !fitsWidth(
          x,
          width,
          fabricWidth
        )
      ) {

        continue;

      }


      const candidate = {

        x,

        y,

        width,

        height,

        rotation

      };


      if (
        !hasCollision(
          candidate,
          placements
        )
      ) {

        return candidate;

      }

    }

  }


  /*
    Jika belum ditemukan,
    lakukan scan vertikal.

    Ini membuat algoritma
    lebih tahan terhadap bentuk
    susunan yang tidak sederhana.
  */

  let maxY =
    startY;


  for (
    const placement of placements
  ) {

    maxY =
      Math.max(

        maxY,

        safeNumber(
          placement.y
        )

        +

        safeNumber(
          placement.height
        )

      );

  }


  /*
    Scan dalam interval.
  */

  for (
    let y = startY;
    y <= maxY + height + 100;
    y += step
  ) {

    for (
      const x of uniqueX
    ) {

      if (
        !fitsWidth(
          x,
          width,
          fabricWidth
        )
      ) {

        continue;

      }


      const candidate = {

        x,

        y,

        width,

        height,

        rotation

      };


      if (
        !hasCollision(
          candidate,
          placements
        )
      ) {

        return candidate;

      }

    }

  }


  return null;

}


/* =========================================================
   FIND BEST ROTATION + POSITION
========================================================= */

function findBestPlacement(
  piece,
  fabric,
  placements
) {

  const fabricWidth =
    Math.max(
      0,
      safeNumber(
        fabric.effectiveWidth,
        0
      )
    );


  if (
    fabricWidth <= 0
  ) {

    return null;

  }


  const rotations =
    getRotationOptions(
      piece,
      fabric
    );


  const candidates = [];


  for (
    const rotation of rotations
  ) {

    const position =
      findPosition(

        piece,

        rotation,

        fabricWidth,

        placements

      );


    if (
      !position
    ) {

      continue;

    }


    /*
      Score:

      1. posisi Y paling kecil
      2. kemudian X paling kecil
      3. kemudian area kosong paling kecil

      Tujuannya adalah membuat
      layout compact.
    */

    const score =

      position.y * 100000

      +

      position.x * 100

      +

      (
        position.width *
        position.height
      );


    candidates.push({

      ...position,

      score

    });

  }


  if (
    candidates.length === 0
  ) {

    return null;

  }


  candidates.sort(
    (a, b) =>
      a.score -
      b.score
  );


  return candidates[0];

}


/* =========================================================
   NEST PIECES
========================================================= */

export function nestPieces(
  pieces,
  fabric,
  options = {}
) {

  if (
    !fabric
  ) {

    throw new Error(
      "Data kain tidak tersedia."
    );

  }


  const fabricWidth =
    Math.max(
      0,
      safeNumber(
        fabric.effectiveWidth,
        0
      )
    );


  const availableLength =
    Math.max(
      0,
      safeNumber(
        fabric.length,
        0
      )
    );


  if (
    fabricWidth <= 0
  ) {

    throw new Error(
      "Lebar efektif kain tidak valid."
    );

  }


  /*
    Jika input pieces belum memiliki
    seam / garment instance,
    gunakan preparePieces().
  */

  let instances;


  if (
    options.prepared === true
  ) {

    instances =
      [...pieces];

  }

  else {

    instances =
      preparePieces(

        pieces,

        {

          seam:
            options.seam ?? 1,

          quantity:
            options.quantity ?? 1

        }

      );

  }


  /*
    Sort.
  */

  instances =
    sortPieces(
      instances,
      options.strategy ||
        "area"
    );


  const placements = [];


  const unplaced = [];


  /*
    Tempatkan setiap potongan.
  */

  for (
    const piece of instances
  ) {

    const placement =
      findBestPlacement(

        piece,

        fabric,

        placements

      );


    if (
      !placement
    ) {

      unplaced.push({

        ...piece,

        reason:
          "Tidak dapat ditempatkan."

      });


      continue;

    }


    placements.push({

      ...piece,

      x:
        placement.x,

      y:
        placement.y,

      width:
        placement.width,

      height:
        placement.height,

      rotation:
        placement.rotation

    });

  }


  /*
    Hitung panjang layout.
  */

  let usedLength = 0;


  for (
    const placement of placements
  ) {

    usedLength =
      Math.max(

        usedLength,

        safeNumber(
          placement.y
        )

        +

        safeNumber(
          placement.height
        )

      );

  }


  usedLength =
    round(
      usedLength,
      2
    );


  /*
    Apakah semua potongan berhasil?
  */

  const allPlaced =
    unplaced.length === 0;


  /*
    Apakah panjang kain cukup?
  */

  const fitsLength =
    availableLength > 0

      ? usedLength <=
        availableLength

      : false;


  /*
    Jika panjang kain belum diisi,
    kita tetap bisa menghitung
    kebutuhan kain.
  */

  const hasLengthInput =
    availableLength > 0;


  /*
    Area potongan.
  */

  const patternArea =
    placements.reduce(

      (
        total,
        placement
      ) => {

        return (

          total +

          (
            safeNumber(
              placement.width
            )

            *

            safeNumber(
              placement.height
            )

          )

        );

      },

      0

    );


  /*
    Area layout.
  */

  const layoutArea =

    fabricWidth *

    usedLength;


  /*
    Efisiensi.
  */

  const efficiency =

    layoutArea > 0

      ? (
          patternArea /
          layoutArea
        ) * 100

      : 0;


  /*
    Sisa kain.
  */

  const remainingLength =

    hasLengthInput

      ? Math.max(

          0,

          availableLength -
          usedLength

        )

      : 0;


  /*
    Kekurangan kain.
  */

  const shortage =

    hasLengthInput

      ? Math.max(

          0,

          usedLength -
          availableLength

        )

      : 0;


  /*
    Status.
  */

  let status;


  if (
    !allPlaced
  ) {

    status =
      "PIECE_TOO_LARGE";

  }

  else if (
    !hasLengthInput
  ) {

    status =
      "CALCULATED";

  }

  else if (
    fitsLength
  ) {

    status =
      "OPTIMAL";

  }

  else {

    status =
      "INSUFFICIENT_LENGTH";

  }


  return {

    /*
      Fabric
    */

    fabricWidth,

    availableLength,


    /*
      Layout
    */

    usedLength,

    remainingLength,

    shortage,


    /*
      Area
    */

    patternArea,

    layoutArea,

    efficiency:


      round(
        efficiency,
        2
      ),


    /*
      Status
    */

    status,

    fits:

      allPlaced &&
      (
        !hasLengthInput ||
        fitsLength
      ),


    allPlaced,


    /*
      Pieces
    */

    totalPieces:
      instances.length,

    placedPieces:
      placements.length,

    unplacedPieces:
      unplaced.length,


    placements,

    unplaced

  };

}


/* =========================================================
   GET BOUNDS
========================================================= */

export function getLayoutBounds(
  placements
) {

  if (
    !Array.isArray(
      placements
    ) ||
    placements.length === 0
  ) {

    return {

      minX: 0,

      minY: 0,

      maxX: 0,

      maxY: 0,

      width: 0,

      height: 0

    };

  }


  let minX =
    Infinity;


  let minY =
    Infinity;


  let maxX =
    -Infinity;


  let maxY =
    -Infinity;


  for (
    const piece of placements
  ) {

    const x =
      safeNumber(
        piece.x
      );


    const y =
      safeNumber(
        piece.y
      );


    const width =
      safeNumber(
        piece.width
      );


    const height =
      safeNumber(
        piece.height
      );


    minX =
      Math.min(
        minX,
        x
      );


    minY =
      Math.min(
        minY,
        y
      );


    maxX =
      Math.max(
        maxX,
        x + width
      );


    maxY =
      Math.max(
        maxY,
        y + height
      );

  }


  return {

    minX:
      round(
        minX,
        2
      ),

    minY:
      round(
        minY,
        2
      ),

    maxX:
      round(
        maxX,
        2
      ),

    maxY:
      round(
        maxY,
        2
      ),

    width:
      round(
        maxX - minX,
        2
      ),

    height:
      round(
        maxY - minY,
        2
      )

  };

}


/* =========================================================
   GET PLACEMENT SUMMARY
========================================================= */

export function getPlacementSummary(
  nesting
) {

  if (
    !nesting
  ) {

    return [];

  }


  if (
    !Array.isArray(
      nesting.placements
    )
  ) {

    return [];

  }


  return nesting.placements.map(

    piece => ({

      id:
        piece.id,

      name:
        piece.name,

      garment:
        piece.garment,

      pieceIndex:
        piece.pieceIndex,

      x:
        round(
          piece.x,
          2
        ),

      y:
        round(
          piece.y,
          2
        ),

      width:
        round(
          piece.width,
          2
        ),

      height:
        round(
          piece.height,
          2
        ),

      rotation:
        normalizeRotation(
          piece.rotation
        ),

      seam:
        round(
          piece.seam,
          2
        )

    })

  );

}


/* =========================================================
   GET NESTING SUMMARY
========================================================= */

export function getNestingSummary(
  nesting
) {

  if (
    !nesting
  ) {

    return null;

  }


  return {

    fabricWidth:
      round(
        nesting.fabricWidth,
        1
      ),

    availableLength:
      round(
        nesting.availableLength,
        1
      ),

    usedLength:
      round(
        nesting.usedLength,
        1
      ),

    remainingLength:
      round(
        nesting.remainingLength,
        1
      ),

    shortage:
      round(
        nesting.shortage,
        1
      ),

    efficiency:
      round(
        nesting.efficiency,
        1
      ),

    totalPieces:
      nesting.totalPieces,

    placedPieces:
      nesting.placedPieces,

    unplacedPieces:
      nesting.unplacedPieces,

    status:
      nesting.status,

    fits:
      nesting.fits

  };

}


/* =========================================================
   VALIDATE NESTING
========================================================= */

export function validateNesting(
  nesting
) {

  if (
    !nesting
  ) {

    return {

      valid:
        false,

      errors: [
        "Data nesting tidak tersedia."
      ]

    };

  }


  const errors = [];


  /*
    Cek setiap placement.
  */

  const placements =
    Array.isArray(
      nesting.placements
    )

      ? nesting.placements

      : [];


  /*
    Cek lebar.
  */

  for (
    const piece of placements
  ) {

    if (
      piece.x < 0
    ) {

      errors.push(

        `${piece.name} berada di luar ` +
        `batas kiri kain.`

      );

    }


    if (
      piece.x +
      piece.width >
      nesting.fabricWidth
    ) {

      errors.push(

        `${piece.name} melewati ` +
        `lebar kain.`

      );

    }


    if (
      piece.y < 0
    ) {

      errors.push(

        `${piece.name} memiliki posisi Y invalid.`

      );

    }

  }


  /*
    Cek collision.
  */

  for (
    let i = 0;
    i < placements.length;
    i++
  ) {

    for (
      let j = i + 1;
      j < placements.length;
      j++
    ) {

      if (
        rectanglesOverlap(
          placements[i],
          placements[j]
        )
      ) {

        errors.push(

          `Benturan antara ` +
          `${placements[i].name} dan ` +
          `${placements[j].name}.`

        );

      }

    }

  }


  return {

    valid:
      errors.length === 0,

    errors

  };

}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {

  addSeamAllowance,

  preparePieces,

  sortPieces,

  rectanglesOverlap,

  nestPieces,

  getLayoutBounds,

  getPlacementSummary,

  getNestingSummary,

  validateNesting

};
