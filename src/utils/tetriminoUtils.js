// Exportamos la función para poder usarla en otros archivos con `import`
export function crearMapeoBaseTetriminos() {
    // Devolvemos un objeto con las 7 piezas del Tetris.
    // Cada pieza está representada por un arreglo de "rotaciones".
    // Cada rotación es un arreglo de coordenadas relativas (x, y) para sus bloques.

    return {
        I: [ // Pieza en línea recta
            [[0, 1], [1, 1], [2, 1], [3, 1]], // Horizontal
            [[2, 0], [2, 1], [2, 2], [2, 3]]  // Vertical
        ],
        O: [ // Pieza cuadrada (no rota)
            [[1, 0], [2, 0], [1, 1], [2, 1]]
        ],
        T: [ // Pieza en forma de T
            [[1, 0], [0, 1], [1, 1], [2, 1]], // Rotación 0
            [[1, 0], [1, 1], [2, 1], [1, 2]], // Rotación 1
            [[0, 1], [1, 1], [2, 1], [1, 2]], // Rotación 2
            [[1, 0], [0, 1], [1, 1], [1, 2]]  // Rotación 3
        ],
        L: [ // Pieza tipo L
            [[0, 0], [0, 1], [1, 1], [2, 1]],
            [[1, 0], [2, 0], [1, 1], [1, 2]],
            [[0, 1], [1, 1], [2, 1], [2, 2]],
            [[1, 0], [1, 1], [0, 2], [1, 2]]
        ],
        J: [ // Pieza tipo J (como L pero invertida)
            [[2, 0], [0, 1], [1, 1], [2, 1]],
            [[1, 0], [1, 1], [1, 2], [2, 2]],
            [[0, 1], [1, 1], [2, 1], [0, 2]],
            [[0, 0], [1, 0], [1, 1], [1, 2]]
        ],
        S: [ // Pieza tipo S
            [[1, 0], [2, 0], [0, 1], [1, 1]],
            [[1, 0], [1, 1], [2, 1], [2, 2]]
        ],
        Z: [ // Pieza tipo Z (espejo de la S)
            [[0, 0], [1, 0], [1, 1], [2, 1]],
            [[2, 0], [1, 1], [2, 1], [1, 2]]
        ]
    };
}

/*
¿Qué estás aprendiendo con esto?
- Que las piezas se definen en coordenadas relativas.
- Que cada pieza tiene entre 1 y 4 rotaciones posibles.
- Que este archivo representa la “geometría base” de todo el Tetris.
*/