const enum State {
    'empty' = 'empty',
    'black' = 'black',
    'white' = 'white',
}

type CountInfo = { [k in State]: number }

type InitState = { [k in Exclude<State, State.empty>]: [ number, number ][] }

const Levels: InitState[] = [
    {
        black: [ [ 0, 0 ], [ 8, 8 ] ],
        white: [ [ 0, 8 ], [ 8, 0 ] ]
    },
    {
        black: [ [ 0, 0 ], [ 0, 8 ], [ 8, 8 ], [ 8, 0 ] ],
        white: [ [ 0, 4 ], [ 8, 4 ], [ 4, 8 ], [ 4, 0 ] ]
    }
]
Object.freeze(Levels)

class ChessBoard {
    readonly #size: number
    readonly #board: State[][]  // y x
    readonly #count: CountInfo = {
        [State.empty]: 0,
        [State.black]: 0,
        [State.white]: 0
    }

    private doAssimilate(state: State, center: [ number, number ]) {
        for (let i = Math.max(center[1] - 1, 0); i <= Math.min(center[1] + 1, this.#size - 1); i++) {
            for (let j = Math.max(center[0] - 1, 0); j <= Math.min(center[0] + 1, this.#size - 1); j++) {
                if(this.#board[i][j] !== undefined
                    && this.#board[i][j] !== State.empty
                    && this.#board[i][j] !== state) {
                    this.#count[this.#board[i][j]]--
                    this.#count[state]++
                    this.#board[i][j] = state
                }
            }
        }
    }

    constructor(size: number = 9) {
        this.#size = size
        this.#board = []
        this.#count[State.empty] = size * size
        for (let y = 0; y < size; y++) {
            this.#board[y] = []
            for (let x = 0; x < size; x++) {
                this.#board[y][x] = State.empty
            }
        }
    }

    /**
     * @deprecated
     * @see doInit
     */
    doPlace(state: Exclude<State, State.empty>, positions: [ number, number ][]) {
        positions.forEach((point) => {
            this.#count[this.#board[point[1]][point[0]]]--
            this.#count[state]++

            this.#board[point[1]][point[0]] = state
        })
    }

    doInit(initState: InitState) {
        this.#count[State.empty] = this.#size * this.#size
        this.#count[State.black] = 0
        this.#count[State.white] = 0

        // reset border
        for (let y = 0; y < this.#size; y++) {
            this.#board[y] = []
            for (let x = 0; x < this.#size; x++) {
                this.#board[y][x] = State.empty
            }
        }
        // reset count

        // place specific place
        initState.black.forEach((point) => {
            this.#count[this.#board[point[1]][point[0]]]--
            this.#count[State.black]++

            this.#board[point[1]][point[0]] = State.black
        })
        initState.white.forEach((point) => {
            this.#count[this.#board[point[1]][point[0]]]--
            this.#count[State.white]++

            this.#board[point[1]][point[0]] = State.white
        })
    }

    doJump(state: Exclude<State, State.empty>, from: [ number, number ], to: [ number, number ]) {
        this.#board[from[1]][from[0]] = State.empty
        this.#board[to[1]][to[0]] = state
        this.doAssimilate(state, to)
    }

    doCopy(state: Exclude<State, State.empty>, to: [ number, number ]) {
        this.#board[to[1]][to[0]] = state
        this.#count.empty--
        this.#count[state]++
        this.doAssimilate(state, to)
    }

    doJudge(): [ boolean, State ] {
        if(this.#count[State.empty] === 0) {
            return [ true, this.#count[State.black] > this.#count[State.white] ? State.black : State.white ]
        }
        return [ false, State.empty ]
    }

    see(): [ State[][], CountInfo ] {
        return [
            JSON.parse(JSON.stringify(this.#board)),
            JSON.parse(JSON.stringify(this.#count))
        ]
    }
}

export type {
    CountInfo,
}
export {
    Levels,
    State,
    ChessBoard
}