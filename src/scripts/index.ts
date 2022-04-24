const enum State {
    'empty' = 'empty',
    'black' = 'black',
    'white' = 'white',
}

class ChessBoard {
    readonly #board: State[][]  // y x

    private assimilate(to: State, pos: [ number, number ]) {
        for (let i = pos[1] - 1; i <= pos[1] + 1; i++) {
            for (let j = pos[0] - 1; j <= pos[0] + 1; j++) {
                if(this.#board[i][j] !== undefined
                    && this.#board[i][j] !== State.empty
                    && this.#board[i][j] !== to) {
                    this.#board[i][j] = to
                }
            }
        }
    }

    constructor(size: number = 9) {
        this.#board = []
        for (let y = 0; y < size; y++) {
            this.#board[y] = []
            for (let x = 0; x < size; x++) {
                this.#board[y][x] = State.empty
            }
        }
    }

    place(state: Exclude<State, State.empty>, positions: [ number, number ][]) {
        positions.forEach((point) => {
            this.#board[point[1]][point[0]] = state
        })
    }

    go(user: State) {

    }

    see() {
        return JSON.parse(JSON.stringify(this.#board))
    }
}

export {
    State,
    ChessBoard
}