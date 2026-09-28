import { useState, useEffect } from 'react';

// Delays a value until it stops changing for `delay` ms. Used for search inputs
// so typing fires one query instead of one per keystroke.
export function useDebouncedValue<T>(value: T, delay = 400): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}
