<template>
    <div class="app">
        <div class="banner">
            a banner, but no thing to show.
        </div>
        <div class="main">
            <router-view/>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.app {
    position: relative;
    width: 100%;
    height: 100%;

    .banner {
        position: relative;
        width: 100%;
        height: 60px;
        border-bottom: solid 1px #cccccc;
    }

    .main {
        position: relative;
        width: 100%;
        height: calc(100% - 61px);
    }
}
</style>
