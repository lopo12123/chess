const enum State {
    'empty' = 'empty',
    'black' = 'black',
    'white' = 'white',
}

/**
 * @description 获取对手
 */
const getOpponent = (self: Exclude<State, State.empty>): Exclude<State, State.empty> => {
    return self === State.black ? State.white : State.black
}

type CountInfo = { [k in State]: number }

type InitState = { [k in Exclude<State, State.empty>]: [ x: number, y: number ][] }

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

    /**
     * @description 判断某一点周围距离2(含)以内是否存在目标
     */
    private ifAroundExist(target: State, pos: [ x: number, y: number ]): boolean {
        for (let y = Math.max(pos[1] - 2, 0); y <= Math.min(pos[1] + 2, this.#size - 1); y++) {
            for (let x = Math.max(pos[0] - 2, 0); x < Math.min(pos[0] + 2, this.#size - 1); x++) {
                if(this.#board[y][x] === target) return true
            }
        }
        return false
    }

    /**
     * @description 判断是否被全封闭
     */
    private stillLive(): [ black: boolean, white: boolean ] {
        let [ black, white ] = [ false, false ]
        for (let y = 0; y < this.#size; y++) {
            for (let x = 0; x < this.#size; x++) {
                if(this.#board[y][x] === State.empty) {
                    if(!black && this.ifAroundExist(State.black, [ x, y ])) black = true
                    if(!white && this.ifAroundExist(State.white, [ x, y ])) white = true
                }
            }
        }
        return [ black, white ]
    }

    /**
     * @description 同化
     */
    private doAssimilate(state: State, center: [ x: number, y: number ]): void {
        for (let y = Math.max(center[1] - 1, 0); y <= Math.min(center[1] + 1, this.#size - 1); y++) {
            for (let x = Math.max(center[0] - 1, 0); x <= Math.min(center[0] + 1, this.#size - 1); x++) {
                if(this.#board[y][x] !== undefined
                    && this.#board[y][x] !== State.empty
                    && this.#board[y][x] !== state) {
                    this.#count[this.#board[y][x]]--
                    this.#count[state]++
                    this.#board[y][x] = state
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
     * @description 传入黑白的坐标数组, 对board进行初始化
     */
    doInit(initState: InitState): void {
        // reset count
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

    /**
     * @description 执行跳跃(上下左右前进2) 并执行同化
     */
    doJump(state: Exclude<State, State.empty>, from: [ x: number, y: number ], to: [ x: number, y: number ]): void {
        this.#board[from[1]][from[0]] = State.empty
        this.#board[to[1]][to[0]] = state
        this.doAssimilate(state, to)
    }

    /**
     * @description 执行复制(距离1任意空位新增一个同类) 并执行同化
     */
    doCopy(state: Exclude<State, State.empty>, to: [ x: number, y: number ]): void {
        this.#board[to[1]][to[0]] = state
        this.#count.empty--
        this.#count[state]++
        this.doAssimilate(state, to)
    }

    /**
     * @description 判断是否结束(结束则找出胜者)
     */
    doJudge(): [ ifEnd: boolean, winner: State ] {
        // 如果已经全部占满则必定结束
        if(this.#count[State.empty] === 0) return [ true, this.#count[State.black] > this.#count[State.white] ? State.black : State.white ]
        // 如果一方没有子则必定结束
        else if(this.#count[State.black] === 0) return [ true, State.white ]
        else if(this.#count[State.white] === 0) return [ true, State.black ]
        // 如果一方被全部封闭则必定结束
        else {
            const [ black, white ] = this.stillLive()
            if(!black) return [ true, State.white ]
            else if(!white) return [ true, State.black ]
        }
        // 都不满足则没有结束
        return [ false, State.empty ]
    }

    /**
     * @description 返回当前board和统计信息的快照(深拷贝)
     */
    see(): [ board: State[][], count: CountInfo ] {
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
    getOpponent,
    ChessBoard
}