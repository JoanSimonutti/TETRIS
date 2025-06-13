// src/Piece.js

export class Piece {
    constructor(tetriminosBase, coloresTetriminos, board) {
        this.tetriminosBase = tetriminosBase;
        this.coloresTetriminos = coloresTetriminos;
        this.board = board;
        this.reset();
    }

    reset() {
        const tipos = Object.keys(this.tetriminosBase);
        this.tipo = random(tipos);
        this.rotacion = 0;
        this.formas = this.tetriminosBase[this.tipo];
        this.color = this.coloresTetriminos[this.tipo];
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
                const px = this.board.posicion.x + x * this.board.ladoCelda;
                const py = this.board.posicion.y + y * this.board.ladoCelda;
                stroke(60);
                fill(this.color);
                rect(px, py, this.board.ladoCelda, this.board.ladoCelda);
            }
        }
    }

    moverAbajo() {
        this.pos.y++;
        if (this.board.colisiona(this)) {
            this.pos.y--;
            this.board.fijarTetrimino(this);
            this.reset();
        }
    }

    moverIzquierda() {
        this.pos.x--;
        if (this.board.colisiona(this)) this.pos.x++;
    }

    moverDerecha() {
        this.pos.x++;
        if (this.board.colisiona(this)) this.pos.x--;
    }

    girar() {
        this.rotacion = (this.rotacion + 1) % this.formas.length;
        if (this.board.colisiona(this)) {
            this.rotacion = (this.rotacion - 1 + this.formas.length) % this.formas.length;
        }
    }

    ponerEnElFondo() {
        while (!this.board.colisiona(this)) {
            this.pos.y++;
        }
        this.pos.y--;
        this.board.fijarTetrimino(this);
        this.reset();
    }
}
