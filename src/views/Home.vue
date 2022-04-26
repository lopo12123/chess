<script lang="ts" setup>
import { ref } from "vue";
import { ChessBoard, CountInfo, Levels, State } from "@/scripts";
import { Auto } from "@/scripts/auto";

// 初始化
const game = new ChessBoard()
const ai = new Auto()

// region 状态展示及结束判断
const initState = game.see()
const board = ref<State[][]>(initState[0])
const count = ref<CountInfo>(initState[1])
const judgeIfEnd = () => {
    const [ ifEnd, winner ] = game.doJudge()
    if(ifEnd) {
        // 提示并加锁
        alert(`game is over, winner is [${ winner }]`)
        selectLevel()
    }
}
// endregion

// 状态 - 待选择/待执行
const userState = ref<'toSelect' | 'toGo'>('toSelect')
// 当前回合角色
const currentPlayer = ref<Exclude<State, 'empty'>>(State.black)
// 拿起的点 - 高亮
const selected = ref<[ number, number ]>([ -100, -100 ])
// 点击格子
const clickBoard = (x: number, y: number) => {
    // 拿起
    if(board.value[y][x] === currentPlayer.value) {
        if(selected.value[0] === x && selected.value[1] === y) {
            selected.value = [ -100, -100 ]
            userState.value = 'toSelect'
        }
        else {
            selected.value = [ x, y ]
            userState.value = 'toGo'
        }
    }
    // 执行
    else if(board.value[y][x] === 'empty' && userState.value === 'toGo') {
        if(ifCopy(x, y)) game.doCopy(currentPlayer.value, [ x, y ])
        else if(ifJump(x, y)) game.doJump(currentPlayer.value, selected.value, [ x, y ])
        else return

        // 重置选中的棋子
        selected.value = [ -100, -100 ]
        // 换人
        currentPlayer.value = currentPlayer.value === State.black ? State.white : State.black
        // 更新状态
        ;[ board.value, count.value ] = game.see()
        judgeIfEnd()
        aiState.value = 'hide'
    }
}

// region ai
const aiState = ref<'show' | 'hide'>('hide')
const aiThink = ref<{ from: [ number, number ], to: [ number, number ], type: 'copy' | 'jump' }[]>([])
const askAi = () => {
    aiThink.value = ai.doAnalyse(board.value, currentPlayer.value).solutions
    aiState.value = 'show'
}
const letAi = () => {
    // 分析
    const best = ai.randomPick(ai.doAnalyse(board.value, currentPlayer.value).solutions)
    // 拿起
    clickBoard(...best.from)
    // 放下
    clickBoard(...best.to)
    aiState.value = 'hide'
}
// endregion

// region 开始
const level = ref(0)
const selectLevel = () => {
    if(level.value >= Levels.length) {
        alert('超出范围')
        return
    }
    game.doInit(Levels[level.value])
    userState.value = 'toSelect'
    currentPlayer.value = State.black
    selected.value = [ -100, -100 ]
    ;[ board.value, count.value ] = game.see()
}
selectLevel()
// endregion

// region 用于高亮判断
// 可跳点位 - 高亮判断
const ifJump = (x: number, y: number) => {
    return (Math.abs(x - selected.value[0]) < 3) && (Math.abs(y - selected.value[1]) < 3) && !ifCopy(x, y) && !ifSelf(x, y)
}
// 可复制点位 - 高亮判断
const ifCopy = (x: number, y: number) => {
    return (Math.abs(x - selected.value[0]) < 2) && (Math.abs(y - selected.value[1]) < 2) && !ifSelf(x, y)
}
// 选中点位 - 高亮判断
const ifSelf = (x: number, y: number) => {
    return (x === selected.value[0]) && (y === selected.value[1])
}
// endregion
</script>

<template>
    <div class="home">
        <div class="brief-container">
            <!-- region AI -->
            <div class="line">AI:</div>
            <div class="line">
                <button @click="askAi">提示</button>
                <button @click="letAi">执行</button>
            </div>
            <div class="ai-thinks" v-if="aiState==='show'">
                <div class="line" v-for="(solution, index) in aiThink" :key="'solution'+index">
                    <span :class="'hl-' + solution.type" style="margin-right: 5px;color: #777777">
                        {{ solution.type }}
                    </span>
                    (<span style="color: orange">{{ solution.from[0] }}</span>,
                    <span style="color: green">{{ solution.from[1] }}</span>)
                    to
                    (<span style="color: orange">{{ solution.to[0] }}</span>,
                    <span style="color: green">{{ solution.to[1] }}</span>)
                </div>
            </div>
            <!-- endregion -->

            <!-- region 指示当前 -->
            <div class="line">当前</div>
            <div class="line"><i :class="['label-icon', 'ceil_'+currentPlayer]"/></div>
            <!-- endregion -->

            <!-- region 选择 -->
            <div class="line">选择:</div>
            <div class="line">
                <select class="level-selector" v-model="level" @change="selectLevel">
                    <option value="0">lv.1</option>
                    <option value="1">lv.2</option>
                </select>
            </div>
            <!-- endregion -->

            <!-- region 统计 -->
            <div class="line">统计:</div>
            <div class="line"><i class="label-icon ceil_black"/>{{ count.black }}</div>
            <div class="line"><i class="label-icon ceil_white"/>{{ count.white }}</div>
            <div class="line"><i class="label-icon ceil"/>{{ count.empty }}</div>
            <!-- endregion -->

            <!-- region 图例 -->
            <div class="line">图例:</div>
            <div class="line"><i class="label-icon ceil hl-self"/>选择/取消选择</div>
            <div class="line"><i class="label-icon ceil hl-copy"/>复制</div>
            <div class="line"><i class="label-icon ceil hl-jump"/>跳跃</div>
            <!-- endregion -->
        </div>
        <div class="board-container">
            <div class="line">
                <div class="ceil_ceil"></div>
                <div class="ceil_ceil" v-for="(ceil_index) in board.length" :key="ceil_index">
                    {{ ceil_index - 1 }}
                </div>
            </div>
            <div class="line" v-for="(line, line_index) in board" :key="'line'+line_index">
                <div class="ceil_line">{{ line_index }}</div>
                <div v-for="(ceil, ceil_index) in line" :key="'column'+ceil_index"
                     :class="{
                        ['ceil_'+ceil]: true,
                        'hl-jump': ifJump(ceil_index, line_index) && board[line_index][ceil_index] === State.empty,
                        'hl-jump__disabled': ifJump(ceil_index, line_index) && board[line_index][ceil_index] !== State.empty,
                        'hl-copy': ifCopy(ceil_index, line_index) && board[line_index][ceil_index] === State.empty,
                        'hl-copy__disabled': ifCopy(ceil_index, line_index) && board[line_index][ceil_index] !== State.empty,
                        'hl-self': ifSelf(ceil_index, line_index),
                    }"
                     @click="clickBoard(ceil_index, line_index)">
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use "../styles/mixin";

.home {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    .brief-container {
        position: relative;
        width: 200px;
        height: 100%;

        .ai-thinks {
            @include mixin.scrollBarStyle();
            position: relative;
            width: 100%;
            max-height: 300px;
            overflow: hidden auto;
        }

        .line {
            position: relative;
            width: 100%;
            height: 30px;
            margin: 5px 0;
            display: flex;
            align-items: center;
            justify-content: flex-start;

            .label-icon {
                margin-right: 10px;
            }

            .level-selector {
                position: relative;
                width: 80px;
                height: 24px;
                margin-left: 5px;
                border: solid 1px #777777;
                outline: none;
                cursor: pointer;
            }
        }
    }

    .board-container {
        position: relative;
        width: calc(100% - 200px);
        height: 100%;

        .line {
            position: relative;
            width: 100%;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }
    }

    %ceil-base {
        position: relative;
        width: 28px;
        height: 28px;
        border: solid 1px #dddddd;
        user-select: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .ceil {
        @extend %ceil-base;
    }

    .ceil_line {
        @extend %ceil-base;
        border-color: transparent;
        color: green;
        font-size: 12px;
    }

    .ceil_ceil {
        @extend %ceil-base;
        border-color: transparent;
        color: orange;
        font-size: 12px;
    }

    .ceil_empty {
        @extend %ceil-base;
    }

    .ceil_white {
        @extend %ceil-base;
        cursor: pointer;

        &::before {
            content: '';
            width: 14px;
            height: 14px;
            border: solid 2px #777777;
            border-radius: 9px;
            background-color: #fefefe;
            display: inline-block;
        }

        &:hover {
            background-color: darkseagreen;
        }
    }

    .ceil_black {
        @extend %ceil-base;
        cursor: pointer;

        &::before {
            content: '';
            width: 14px;
            height: 14px;
            border: solid 2px #777777;
            border-radius: 9px;
            background-color: #777777;
            display: inline-block;
        }

        &:hover {
            background-color: darkseagreen;
        }
    }

    .hl-self {
        background-color: #43aba133;
    }

    .hl-jump {
        background-color: #00800066 !important;
        cursor: pointer;
    }

    .hl-jump__disabled {
        background-color: #00800033 !important;
        cursor: pointer;
    }

    .hl-copy {
        background-color: #ffa50066 !important;
        cursor: pointer;
    }

    .hl-copy__disabled {
        background-color: #ffa50033 !important;
        cursor: pointer;
    }
}
</style>