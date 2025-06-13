//=====================================================
//Esta clase representa una pieza de Tetris (tetrimino)
//Qué aprendés con esto:
//Cómo se estructura una clase y por qué se divide en métodos.
//Qué representa cada bloque del código dentro de un Tetris.
//Cómo se manejan movimientos, colisiones y rotaciones.
//Cómo interactúan las piezas con el tablero (Board).
//=====================================================
export class Piece {
    // Constructor: recibe las formas base, colores y el tablero donde se mueve
    constructor(tetriminosBase, coloresTetriminos, board) {
        this.tetriminosBase = tetriminosBase; // Diccionario con las formas de cada tipo de pieza (I, O, T...)
        this.coloresTetriminos = coloresTetriminos; // Diccionario con los colores de cada tipo
        this.board = board; // Referencia al tablero donde se moverá esta pieza
        this.reset(); // Inicializa una nueva pieza aleatoria
    }

    // Inicializa o reinicia la pieza con una nueva forma y posición
    reset() {
        const tipos = Object.keys(this.tetriminosBase); // Extrae los nombres de las piezas: ["I", "O", "T", ...]
        this.tipo = random(tipos); // Selecciona un tipo aleatorio
        this.rotacion = 0; // Comienza con la primera rotación (índice 0)
        this.formas = this.tetriminosBase[this.tipo]; // Guarda las rotaciones posibles para este tipo
        this.color = this.coloresTetriminos[this.tipo]; // Color asociado al tipo
        this.pos = createVector(3, -2); // Posición inicial de la pieza (centrado horizontal, fuera del tablero por arriba)
    }

    // Devuelve la forma actual de la pieza según la rotación
    formaActual() {
        return this.formas[this.rotacion]; // Devuelve la forma activa de la pieza (matriz de bloques)
    }

    // Dibuja la pieza en el canvas de p5.js
    dibujar() {
        for (let bloque of this.formaActual()) { // Recorre cada bloque (x, y) de la forma actual
            const x = this.pos.x + bloque[0]; // Calcula coordenada X absoluta en el tablero
            const y = this.pos.y + bloque[1]; // Calcula coordenada Y absoluta en el tablero
            if (y >= 0) { // No dibuja los bloques que están fuera del canvas por arriba
                const px = this.board.posicion.x + x * this.board.ladoCelda; // Coordenada X en píxeles
                const py = this.board.posicion.y + y * this.board.ladoCelda; // Coordenada Y en píxeles
                stroke(60); // Contorno gris
                fill(this.color); // Relleno con el color de la pieza
                rect(px, py, this.board.ladoCelda, this.board.ladoCelda); // Dibuja un rectángulo por bloque
            }
        }
    }

    // Mueve la pieza hacia abajo una celda
    moverAbajo() {
        this.pos.y++; // Baja la posición Y
        if (this.board.colisiona(this)) { // Si colisiona...
            this.pos.y--; // ...vuelve a subir
            this.board.fijarTetrimino(this); // Fija la pieza en el tablero (la pega)
            this.reset(); // Crea una nueva pieza
        }
    }

    // Mueve la pieza a la izquierda
    moverIzquierda() {
        this.pos.x--; // Mueve a la izquierda
        if (this.board.colisiona(this)) this.pos.x++; // Si colisiona, deshace el movimiento
    }

    // Mueve la pieza a la derecha
    moverDerecha() {
        this.pos.x++; // Mueve a la derecha
        if (this.board.colisiona(this)) this.pos.x--; // Si colisiona, deshace el movimiento
    }

    // Rota la pieza en sentido horario
    girar() {
        this.rotacion = (this.rotacion + 1) % this.formas.length; // Pasa a la siguiente rotación
        if (this.board.colisiona(this)) {
            this.rotacion = (this.rotacion - 1 + this.formas.length) % this.formas.length; // Si colisiona, vuelve a la rotación anterior
        }
    }

    // Baja la pieza hasta el fondo de una sola vez (caída instantánea)
    ponerEnElFondo() {
        while (!this.board.colisiona(this)) { // Mientras no colisione...
            this.pos.y++; // ...sigue bajando
        }
        this.pos.y--; // Da un paso atrás porque ya chocó
        this.board.fijarTetrimino(this); // Fija la pieza al tablero
        this.reset(); // Crea una nueva pieza
    }
}
