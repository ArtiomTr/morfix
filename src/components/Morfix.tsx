import React from 'react';

import { MorfixContextType, MorfixProvider } from './MorfixContext';
import { MorfixConfig, useMorfix } from '../hooks/useMorfix';

/**
 * This is main component. All fields should be inside this component.
 *
 * ## Example
 *
 * ```jsx live
 * <Morfix initialValues={{ hello: 'asdf' }}>
 *     <div></div>
 * </Morfix>
 * ```
 */
export const Morfix = <Values extends object>({
    children,
    ...config
}: MorfixConfig<Values> & { children: React.ReactNode | React.ReactNodeArray }) => {
    const morfixBag = useMorfix<Values>(config);

    return <MorfixProvider value={(morfixBag as unknown) as MorfixContextType<object>}>{children}</MorfixProvider>;
};
