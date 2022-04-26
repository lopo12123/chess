import { getOpponent, State } from "./index";

class Auto {
    readonly #size: number

    constructor(size: number = 9) {
        this.#size = size
    }

    /**
     * @description 统计落子在pos能同化的数量
     */
    private countAssimilate(board: State[][], pos: [ x: number, y: number ], self: Exclude<State, State.empty>): number {
        let count = 0
        for (let y = Math.max(pos[1] - 2, 0); y <= Math.min(pos[1] + 2, this.#size - 1); y++) {
            for (let x = Math.max(pos[0] - 2, 0); x <= Math.min(pos[0] + 2, this.#size - 1); x++) {
                if(board[y][x] === getOpponent(self)) count++
            }
        }
        return count
    }

    /**
     * @description 找出目标点位周围的所有空位
     */
    private findEmptyAround(board: State[][], pos: [ x: number, y: number ])
        : { copy: [ number, number ][], jump: [ number, number ][] } {
        const res: { copy: [ number, number ][], jump: [ number, number ][] } = { copy: [], jump: [] }
        for (let y = Math.max(pos[1] - 2, 0); y <= Math.min(pos[1] + 2, this.#size - 1); y++) {
            for (let x = Math.max(pos[0] - 2, 0); x <= Math.min(pos[0] + 2, this.#size - 1); x++) {
                if(x === pos[0] && y === pos[1]) continue
                if(board[y][x] === State.empty) {
                    (Math.abs(x - pos[0]) <= 1 && Math.abs(y - pos[1]) <= 0)
                        ? (res.copy.push([ x, y ]))
                        : (res.jump.push([ x, y ]))
                }
            }
        }
        return res
    }

    /**
     * @description 分析当前状态并得出得分最高的选择
     */
    doAnalyse(board: State[][], self: Exclude<State, State.empty>)
        : { from: [ number, number ], to: [ number, number ], score: number, type: 'copy' | 'jump' } {
        const bestTillNow: {
            from: [ number, number ]
            to: [ number, number ]
            score: number,
            type: 'copy' | 'jump'
        } = {
            from: [ -1, -1 ],
            to: [ -1, -1 ],
            score: -1,
            type: 'copy'
        }

        for (let y = 0; y < this.#size; y++) {
            for (let x = 0; x < this.#size; x++) {
                if(board[y][x] === self) {
                    // 统计周围的空位
                    const emptyAround = this.findEmptyAround(board, [ x, y ])

                    // 统计空位复制的得分并选取最优
                    emptyAround.copy.forEach((copyPoint) => {
                        const copyScore = this.countAssimilate(board, copyPoint, self) * 2 + 1
                        if(copyScore > bestTillNow.score) {
                            bestTillNow.score = copyScore
                            bestTillNow.from = [ x, y ]
                            bestTillNow.to = copyPoint
                            bestTillNow.type = 'copy'
                        }
                    })

                    // 统计空位跳跃的得分并取最优
                    emptyAround.jump.forEach((jumpPoint) => {
                        const jumpScore = this.countAssimilate(board, jumpPoint, self) * 2
                        if(jumpScore > bestTillNow.score) {
                            bestTillNow.score = jumpScore
                            bestTillNow.from = [ x, y ]
                            bestTillNow.to = jumpPoint
                            bestTillNow.type = 'jump'
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