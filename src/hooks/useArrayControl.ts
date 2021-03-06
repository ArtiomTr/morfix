import get from 'lodash/get';

import { useMorfixContext } from './useMorfixContext';
import { MorfixErrors } from '../typings/MorfixErrors';
import { MorfixTouched } from '../typings/MorfixTouched';
import { useRefCallback } from '../utils/useRefCallback';

export type ArrayControl<V> = {
    setItem: (item: V, index: number) => void;
    setItems: (items: Array<V>) => void;
    push: Array<V>['push'];
    pop: Array<V>['pop'];
    shift: Array<V>['shift'];
    unshift: Array<V>['unshift'];
    swap: (firstIndex: number, secondIndex: number) => void;
    move: (from: number, to: number) => void;
    insert: (index: number, value: V) => void;
    removeAt: (index: number) => void;
};

export type ArrayControlConfig = {
    name: string;
};

export const useArrayControl = <V>({ name }: ArrayControlConfig): ArrayControl<V> => {
    const { values, errors: allErrors, touched: allTouched } = useMorfixContext();

    const setItems = (items: Array<V>) => values.setValue(name, items);
    const setTouched = (newTouched: Array<MorfixTouched<V>>) => allTouched.setValue(name, newTouched);
    const setErrors = (newErrors: Array<MorfixErrors<V>>) => allErrors.setValue(name, newErrors);

    const updateArray = <Output>(
        update: <T>(oldItems: Array<T>) => [Array<T>, Output],
        updateErrors: boolean | ((oldItems: MorfixErrors<Array<V>>, items: Array<V>) => Array<MorfixErrors<V>>),
        updateTouched: boolean | ((oldItems: MorfixTouched<Array<V>>, items: Array<V>) => Array<MorfixTouched<V>>)
    ): Output => {
        const items: Array<V> = get(values.values.current, name);
        const errors: MorfixErrors<Array<V>> = get(allErrors.values.current, name);
        const touched: MorfixTouched<Array<V>> = get(allTouched.values.current, name);

        const [newItems, output] = update(items);

        setItems(newItems);

        if (updateErrors && errors) {
            setErrors(typeof updateErrors === 'function' ? updateErrors(errors, items) : update(errors)[0]);
        }

        if (updateTouched && touched) {
            setTouched(typeof updateTouched === 'function' ? updateTouched(touched, items) : update(touched)[0]);
        }

        return output;
    };

    const setItem = useRefCallback((item: V, index: number) =>
        updateArray(
            <T>(items: Array<T>) => {
                items[index] = (item as unknown) as T;
                return [items, undefined];
            },
            false,
            false
        )
    );

    const push = useRefCallback((...newItems: Array<V>) =>
        updateArray(
            <T>(oldItems: Array<T>) => {
                const size = oldItems.push(...((newItems as unknown) as Array<T>));
                return [oldItems, size];
            },
            false,
            false
        )
    );

    const pop = useRefCallback(() =>
        updateArray(
            <T>(oldItems: Array<T>) => {
                const output = oldItems.pop();
                return [oldItems, (output as unknown) as V | undefined];
            },
            (errors, items) => {
                const index = items.length;
                errors.splice(index);
                return errors;
            },
            (touched, items) => {
                const index = items.length;
                touched.splice(index);
                return touched;
            }
        )
    );

    const removeAt = useRefCallback((index: number) =>
        updateArray(
            (items) => {
                items.splice(index, 1);
                return [items, undefined];
            },
            true,
            true
        )
    );

    const swap = useRefCallback((first: number, second: number) =>
        updateArray(
            (items) => {
                const a = items[first];
                items[first] = items[second];
                items[second] = a;
                return [items, undefined];
            },
            true,
            true
        )
    );

    const shift = useRefCallback(() =>
        updateArray(
            (items) => {
                const shiftedItem = items.shift();
                return [items, (shiftedItem as unknown) as V | undefined];
            },
            true,
            true
        )
    );

    const unshift = useRefCallback((newItem: V) =>
        updateArray(
            <T>(items: Array<T>) => {
                const newArrayLength = items.unshift((newItem as unknown) as T);
                return [items, newArrayLength];
            },
            (oldErrors) => {
                oldErrors.unshift((undefined as unknown) as MorfixErrors<V>);
                return oldErrors;
            },
            (oldTouched) => {
                oldTouched.unshift((undefined as unknown) as MorfixTouched<V>);
                return oldTouched;
            }
        )
    );

    const move = useRefCallback((from: number, to: number) =>
        updateArray(
            (items) => {
                const item = items[from];
                if (items.length <= to) {
                    items.push(...new Array(to - items.length + 1));
                }
                items.splice(from, 1);
                items.splice(to, 0, item);
                return [items, undefined];
            },
            true,
            true
        )
    );

    const insert = useRefCallback((index: number, value: V) =>
        updateArray(
            <T>(items: Array<T>) => {
                items.splice(index, 0, (value as unknown) as T);
                return [items, undefined];
            },
            (oldErrors) => {
                oldErrors.splice(index, 0, (undefined as unknown) as MorfixErrors<V>);
                return oldErrors;
            },
            (oldTouched) => {
                oldTouched.splice(index, 0, (undefined as unknown) as MorfixTouched<V>);
                return oldTouched;
            }
        )
    );

    return {
        setItems,
        setItem,
        push,
        pop,
        removeAt,
        swap,
        shift,
        unshift,
        move,
        insert
    };
};
