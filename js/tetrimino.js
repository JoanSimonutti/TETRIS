// ==========================
// IMPORTACIÓN DE CLASES
// ==========================
let coloresTetriminos = {}; // Se inicializa en setup()

class Tetrimino {
    constructor() {
        this.reset();
    }

    reset() {
        const tipos = Object.keys(tetriminosBase);
        this.tipo = random(tipos);
        this.rotacion = 0;
        this.formas = tetriminosBase[this.tipo];
        this.color = coloresTetriminos[this.tipo]; // Usamos el color fijo
        this.pos = createVector(3, -2);
    }

    formaActual() {
        return this.formas[this.rotacion];
    }

    dibujar() {
        for (let bloque of this.formaActual()) {
            const x = this.pos.x + bloque[0];
            const y = this.pos.y + bloque[1];
            if (y >= 0) {
                const px = tablero.posición.x + x * tablero.lado_celda;
                const py = tablero.posición.y + y * tablero.lado_celda;
                stroke(60);
                fill(this.color);
                rect(px, py, tablero.lado_celda, tablero.lado_celda);
            }
        }
    }

    moverAbajo() {
        this.pos.y++;
        if (tablero.colisiona(this)) {
            this.pos.y--;
            tablero.fijarTetrimino(this);
            this.reset();
        }
    }

    moverIzquierda() {
        this.pos.x--;
        if (tablero.colisiona(this)) this.pos.x++;
    }

    moverDerecha() {
        this.pos.x++;
        if (tablero.colisiona(this)) this.pos.x--;
    }

    girar() {
        this.rotacion = (this.rotacion + 1) % this.formas.length;
        if (tablero.colisiona(this)) {
            this.rotacion = (this.rotacion - 1 + this.formas.length) % this.formas.length;
        }
    }

    ponerEnElFondo() {
        while (!tablero.colisiona(this)) {
            this.pos.y++;
        }
        this.pos.y--;
        tablero.fijarTetrimino(this);
        this.reset();
    }
}

function crearMapeoBaseTetriminos() {
    tetriminosBase = {
        I: [
            [[0, 1], [1, 1], [2, 1], [3, 1]],
            [[2, 0], [2, 1], [2, 2], [2, 3]]
        ],
        O: [
            [[1, 0], [2, 0], [1, 1], [2, 1]]
        ],
        T: [
            [[1, 0], [0, 1], [1, 1], [2, 1]],
            [[1, 0], [1, 1], [2, 1], [1, 2]],
            [[0, 1], [1, 1], [2, 1], [1, 2]],
            [[1, 0], [0, 1], [1, 1], [1, 2]]
        ],
        L: [
            [[0, 0], [0, 1], [1, 1], [2, 1]],
            [[1, 0], [2, 0], [1, 1], [1, 2]],
            [[0, 1], [1, 1], [2, 1], [2, 2]],
            [[1, 0], [1, 1], [0, 2], [1, 2]]
        ],
        J: [
            [[2, 0], [0, 1], [1, 1], [2, 1]],
            [[1, 0], [1, 1], [1, 2], [2, 2]],
            [[0, 1], [1, 1], [2, 1], [0, 2]],
            [[0, 0], [1, 0], [1, 1], [1, 2]]
        ],
        S: [
            [[1, 0], [2, 0], [0, 1], [1, 1]],
            [[1, 0], [1, 1], [2, 1], [2, 2]]
        ],
        Z: [
            [[0, 0], [1, 0], [1, 1], [2, 1]],
            [[2, 0], [1, 1], [2, 1], [1, 2]]
        ]
    };
}
