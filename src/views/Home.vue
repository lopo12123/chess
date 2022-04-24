<script lang="ts" setup>
import { computed, ref } from "vue";
import { ChessBoard, State } from "@/scripts";

// 初始化
const game = new ChessBoard()
game.doPlace('black', [ [ 0, 0 ], [ 8, 8 ] ])
game.doPlace('white', [ [ 0, 8 ], [ 8, 0 ], ])

// 状态展示
const board = ref<State[][]>(game.see())

// 状态 - 待选择/待执行
const userState = ref<'toSelect' | 'toGo'>('toSelect')
// 当前回合角色
const currentPlayer = ref<Exclude<State, 'empty'>>('black')
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
        currentPlayer.value = currentPlayer.value === 'black' ? 'white' : 'black'
        // 更新状态
        board.value = game.see()
    }
}

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
</script>

<template>
    <div class="home">
        <div class="brief-container">
            <div class="line">当前: <i :class="['label-icon', 'ceil_'+currentPlayer]"/></div>
            <br>
            <div class="line">图例:</div>
            <div class="line"><i class="label-icon ceil hl-self"/>选择/取消选择</div>
            <div class="line"><i class="label-icon ceil hl-copy"/>复制</div>
            <div class="line"><i class="label-icon ceil hl-jump"/>跳跃</div>
        </div>
        <div class="board-container">
            <div class="line"
                 v-for="(line, line_index) in board" :key="'line'+line_index">
                <div v-for="(ceil, ceil_index) in line" :key="'column'+ceil_index"
                     :class="{
                        ['ceil_'+ceil]: true,
                        'hl-jump': ifJump(ceil_index, line_index),
                        'hl-copy': ifCopy(ceil_index, line_index),
                        'hl-self': ifSelf(ceil_index, line_index),
                    }"
                     @click="clickBoard(ceil_index, line_index)">
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
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

        &:hover::before {
            background-color: brown;
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
    }

    .hl-self {
        background-color: #43aba133;
    }

    .hl-jump {
        background-color: #00800033 !important;
        cursor: pointer;
    }

    .hl-copy {
        background-color: #ffa50033 !important;
        cursor: pointer;
    }
}
</style>