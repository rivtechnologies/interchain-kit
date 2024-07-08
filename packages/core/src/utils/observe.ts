export const createObservable = (object: any, onUpdate?: () => void) => {
    return new Proxy(object, {
        set(target, property, newValue, receiver) {
            onUpdate && onUpdate()
            return Reflect.set(target, property, newValue, receiver)
        },
        get(target, property, receiver) {
            return Reflect.get(target, property, receiver)
        }
    })
}