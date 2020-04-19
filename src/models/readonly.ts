export type DeepReadonly<T> = T extends
    | string
    | number
    | boolean
    | undefined
    | null
    ? T
    : T extends Array<infer I>
    ? ReadonlyArray<DeepReadonly<I>>
    : { readonly [P in keyof T]: DeepReadonly<T[P]> };
