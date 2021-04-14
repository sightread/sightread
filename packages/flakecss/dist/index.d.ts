import { CSSProperties } from 'react';
declare type StyleObjectValues = CSSProperties | {
    [selectorKey: string]: CSSProperties;
};
declare type StyleObject = {
    [selectorKey: string]: StyleObjectValues;
};
declare type StringMap = {
    [selectorKey: string]: string;
};
export declare function css(styleObject: StyleObject): StringMap;
export declare function extractCss(): string;
export declare function compileCss(styleObj: StyleObject): {
    classes: StringMap;
    styleHtml: string;
};
export declare const FLAKE_STYLE_ID = "FLAKE_CSS";
export declare const mediaQuery: {
    up: (bp: number) => string;
    down: (bp: number) => string;
    between: (min: number, max: number) => string;
};
export {};
