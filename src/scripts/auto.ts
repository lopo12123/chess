import { getOpponent, State } from "./index";

/**
 * @description 找出目标点位周围的所有空位
 */
const findEmptyAround = (board: State[][], pos: [ x: number, y: number ])
    : { copy: [ number, number ][], jump: [ number, number ][] } => {
    const res: { copy: [ number, number ][], jump: [ number, number ][] } = { copy: [], jump: [] }
    for (let y = Math.max(pos[1] - 2, 0); y <= Math.min(pos[1] + 2, board.length - 1); y++) {
        for (let x = Math.max(pos[0] - 2, 0); x <= Math.min(pos[0] + 2, board.length - 1); x++) {
            if(x === pos[0] && y === pos[1]) continue
            if(board[y][x] === State.empty) {
                (Math.abs(x - pos[0]) <= 1 && Math.abs(y - pos[1]) <= 1)
                    ? (res.copy.push([ x, y ]))
                    : (res.jump.push([ x, y ]))
            }
        }
    }
    return res
}

/**
 * @description 统计落子在pos能同化的数量
 */
const countAssimilate = (board: State[][], pos: [ x: number, y: number ], self: Exclude<State, State.empty>): number => {
    let count = 0
    for (let y = Math.max(pos[1] - 2, 0); y <= Math.min(pos[1] + 2, board.length - 1); y++) {
        for (let x = Math.max(pos[0] - 2, 0); x <= Math.min(pos[0] + 2, board.length - 1); x++) {
            if(board[y][x] === getOpponent(self)) count++
        }
    }
    return count
}

class Auto {
    readonly #size: number

    /**
     * @description 数组中随机取一项
     */
    static randomPick<T>(arr: T[]): T | null {
        if(arr.length === 0) return null
        return arr[~~(Math.random() * arr.length)]
    }

    /**
     * @description 数组中随机取一项
     */
    randomPick<T>(arr: T[]): T {
        return arr[~~(Math.random() * arr.length)]
    }

    constructor(size: number = 9) {
        this.#size = size
    }

    /**
     * @description 分析当前状态并得出得分最高的选择
     */
    doAnalyse(board: State[][], self: Exclude<State, State.empty>)
        : { solutions: { from: [ number, number ], to: [ number, number ], type: 'copy' | 'jump' }[], score: number } {
        const bestTillNow: {
            solutions: {
                from: [ number, number ],
                to: [ number, number ],
                type: 'copy' | 'jump'
            }[],
            score: number
        } = {
            solutions: [],
            score: -1,
        }

        for (let y = 0; y < this.#size; y++) {
            for (let x = 0; x < this.#size; x++) {
                if(board[y][x] === self) {
                    // 统计周围的空位
                    const emptyAround = findEmptyAround(board, [ x, y ])

                    // 统计空位复制的得分并选取最优
                    emptyAround.copy.forEach((copyPoint) => {
                        const copyScore = countAssimilate(board, copyPoint, self) + 1
                        if(copyScore > bestTillNow.score) {
                            bestTillNow.score = copyScore
                            bestTillNow.solutions = [ {
                                from: [ x, y ],
                                to: copyPoint,
                                type: 'copy'
                            } ]
                        }
                        else if(copyScore == bestTillNow.score) {
                            bestTillNow.solutions.push({
                                from: [ x, y ],
                                to: copyPoint,
                                type: 'copy'
                            })
                        }
                    })

                    // 统计空位跳跃的得分并取最优
                    emptyAround.jump.forEach((jumpPoint) => {
                        const jumpScore = countAssimilate(board, jumpPoint, self)
                        if(jumpScore > bestTillNow.score) {
                            bestTillNow.score = jumpScore
                            bestTillNow.solutions = [ {
                                from: [ x, y ],
                                to: jumpPoint,
                                type: 'jump'
                            } ]
                        }
                        else if(jumpScore === bestTillNow.score) {
                            bestTillNow.solutions.push({
                                from: [ x, y ],
                                to: jumpPoint,
                                type: 'jump'
                            })
                        }
                    })
                }
            }
        }

        return bestTillNow
    }
}

export {
    Auto
}