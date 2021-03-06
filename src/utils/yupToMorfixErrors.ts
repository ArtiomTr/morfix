import get from 'lodash/get';
import set from 'lodash/set';
import toPath from 'lodash/toPath';
import { ValidationError } from 'yup';

import { getErrorPath } from '../constants';
import { MorfixErrors } from '../typings/MorfixErrors';

export const yupToMorfixErrors = <V>(yupError: ValidationError): MorfixErrors<V> => {
    const isArr = yupError.inner?.some((value) => !isNaN(+toPath(value.path)[0]));

    const errors: MorfixErrors<V> = isArr ? (([] as unknown) as MorfixErrors<V>) : ({} as MorfixErrors<V>);

    if (yupError.inner) {
        if (yupError.inner.length === 0) {
            set(errors, getErrorPath(yupError.path), yupError.message);
        }
        for (const error of yupError.inner) {
            if (!get(errors, error.path)) {
                set(errors, getErrorPath(error.path), error.message);
            }
        }
    }

    return errors;
};
