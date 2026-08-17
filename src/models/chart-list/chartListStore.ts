import { defineStore } from "pinia"

export const useChartListStore = defineStore('chartList', {
    state: () => ({ searchValue: '', chartList: [], loading: false }),
    getters: {
        // double: (state) => state.count * 2,
    },
    actions: {
        /**
         * 在 `useChartListStore.actions` 中，保留图表列表 Store 的空动作接口，当前实现不会修改任何状态。
         */
        increment() {
            // this.count++
        },
    },
})