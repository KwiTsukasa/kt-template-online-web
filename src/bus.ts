// 为保持和vue2版本中使用bus一致，emit,on,off前面都加了$
export class Bus {
    list: Record<string, Array<(...params: any) => void>> = {}
    constructor() {
        // 收集订阅信息,调度中心
        this.list = {};
    }

    // 订阅
    /**
     * 同名事件会把回调追加到订阅列表，后续发布按登记顺序通知所有监听者。
     * @param name - 回调要监听的事件键。
     * @param fn - 事件发布时接收负载的监听回调。
     */
    $on(name: string, fn: (...params: any) => void) {
        this.list[name] = this.list[name] || [];
        this.list[name].push(fn);
    }

    // 发布
    /**
     * 指定事件存在订阅者时逐一投递负载，无人订阅时保持总线状态不变。
     * @param name - 要通知的事件键。
     * @param data - 每个监听回调接收的事件负载。
     */
    $emit(name: string, data: any) {
        if (this.list[name]) {
            this.list[name].forEach((fn) => {
                fn(data);
            });
        }
    }

    // 取消订阅
    /**
     * 在 `Bus` 中，删除指定事件的全部订阅者；事件不存在时保持总线不变。
     * @param name - 用于定位或命名目标资源的名称。
     */
    $off(name: string) {
        if (this.list[name]) {
            delete this.list[name];
        }
    }
}
export default new Bus();
