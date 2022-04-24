const enum State {
    'empty' = 'empty',
    'black' = 'black',
    'white' = 'white',
}

class ChessBoard {
    readonly #size: number
    readonly #board: State[][]  // y x

    private doAssimilate(state: State, center: [ number, number ]) {
        for (let i = Math.max(center[1] - 1, 0); i <= Math.min(center[1] + 1, this.#size - 1); i++) {
            for (let j = Math.max(center[0] - 1, 0); j <= Math.min(center[0] + 1, this.#size - 1); j++) {
                if(this.#board[i][j] !== undefined
                    && this.#board[i][j] !== State.empty
                    && this.#board[i][j] !== state) {
                    this.#board[i][j] = state
                }
            }
        }
    }

    constructor(size: number = 9) {
        this.#size = size
        this.#board = []
        for (let y = 0; y < size; y++) {
            this.#board[y] = []
            for (let x = 0; x < size; x++) {
                this.#board[y][x] = State.empty
            }
        }
    }

    /**
     * @description 在一些点位放置一些棋子 (无同化)
     */
    doPlace(state: Exclude<State, State.empty>, positions: [ number, number ][]) {
        positions.forEach((point) => {
            this.#board[point[1]][point[0]] = state
        })
    }

    doJump(state: Exclude<State, State.empty>, from: [ number, number ], to: [ number, number ]) {
        this.#board[from[1]][from[0]] = State.empty
        this.#board[to[1]][to[0]] = state
        this.doAssimilate(state, to)
    }

    doCopy(state: Exclude<State, State.empty>, to: [ number, number ]) {
        this.#board[to[1]][to[0]] = state
        this.doAssimilate(state, to)
    }

    see() {
        return JSON.parse(JSON.stringify(this.#board))
    }
}

export {
    State,
    ChessBoard
}