import { ref, watch, getCurrentInstance, ExtractPropTypes } from "vue";

type EmitFn = (event: string, ...args: any[]) => void

/**
 * 通过监听本地引用向组件派发 update 事件，使指定属性具备双向模型写入能力。
 * @param props - 提供模型初始值的只读组件属性集合。
 * @param key - 要绑定的属性名，省略时使用 modelValue。
 * @param emit - 可选的组件事件派发器；省略时回退当前组件实例的 emit。
 * @returns 以属性当前值初始化、写入时触发对应 update 事件的 Vue 引用。
 */
function useModel(props: Readonly<ExtractPropTypes<{ [k: string]: StringConstructor }>>, key = "modelValue", emit?: EmitFn) {
    const proxy = ref(props[key]);
    const _emit = emit || getCurrentInstance()?.emit;
    watch(
        () => proxy.value,
        (v) => _emit && _emit(`update:${key}`, v)

    );
    return proxy;
}

export default useModel 