export declare const splitBalanced: (input: string, split?: string, open?: string, close?: string, toggle?: string, escape?: string) => string[];
export declare const setIn: (target: {
    [key: string]: any;
}, keyPath: string[], value: any) => void;
export declare const getIn: (target: {
    [key: string]: any;
}, keyPath: string[]) => any;
export declare const parenthesesAreBalanced: (s: string) => boolean;
