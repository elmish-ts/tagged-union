type TypeError<T extends string, Culprit> = {
  readonly _id: unique symbol
  reason: T
  culprit: Culprit
}

type TagType = string | number | symbol

export const Unit: Unit = { tag: 'Unit' }
export interface Unit {
  readonly tag: 'Unit'
}

interface Tag<T extends TagType> {
  readonly tag: T
}

type Props<T extends TagType, Value> = {
  readonly [K in T]: Value
}

export type Def<T extends TagType, Value = Unit> = Tag<T> & Props<T, Value>

export function def<T extends TagType>(tag: T): Def<T, Unit>
export function def<T extends TagType, Val>(tag: T, value: Val): Def<T, Val>
export function def<T extends TagType, Val>(tag: T, value?: Val) {
  return value === undefined ? { tag, [tag]: Unit } : { tag, [tag]: value }
}

export type CaseOf<U extends Def<TagType, any>, R> = {
  readonly [K in U['tag']]: (val: Extract<U, { tag: K }>[K]) => R
}

export type Match<D extends Def<TagType, any>, R> =
  | CaseOf<D, R>
  | Partial<CaseOf<D, R>> & { readonly '*': (val: D) => R }
  | Partial<CaseOf<D, R>> & { readonly _: () => R }

type MatchReturn<D extends Def<TagType, any>, M extends Match<D, any>> = M extends Match<D, infer R>
  ? R
  : TypeError<'Invalid match config', M>
/**
 * Exhaustive pattern matching for tagged unions.
 * A data-last (i.e. pipeable) version of [caseWhen](#caseWhen)
 */
export function caseOf<U extends Def<TagType, any>, C extends CaseOf<U, any>>(cases: C) {
  return (data: U): C extends CaseOf<U, infer R> ? R : never => {
    return caseWhen(data, cases)
  }
}

/**
 * Exhaustive pattern matching for tagged unions
 */
export function caseWhen<D extends Def<TagType, any>, C extends CaseOf<D, any>>(
  data: D,
  cases: C
): C extends CaseOf<D, infer R> ? R : never {
  // @ts-ignore
  return cases[data.tag](data[data.tag])
}

/**
 * Pattern matching for tagged unions with fallback handler
 * A data-last (i.e. pipeable) version of [matchWhen](#matchWhen)
 */
export function match<D extends Def<TagType, unknown>, C extends Match<D, any>>(cases: C) {
  return (data: D): MatchReturn<D, C> => {
    return matchWhen(data, cases)
  }
}

/**
 * Pattern matching for tagged unions with fallback handler
 */
export function matchWhen<D extends Def<TagType, any>, C extends Match<D, any>>(
  data: D,
  cases: C
): MatchReturn<D, C> {
  const tag: D['tag'] = data.tag
  const val: D[D['tag']] = data[tag]
  const handler: undefined | C[D['tag']] = cases[tag]
  const catchAll: undefined | ((d: D) => MatchReturn<D, C>) = ((cases as unknown) as Partial<
    CaseOf<D, any>
  > & {
    readonly '*': (val: D) => MatchReturn<D, C>
  })['*']

  const fallback: undefined | (() => MatchReturn<D, C>) = ((cases as unknown) as Partial<
    CaseOf<D, any>
  > & { readonly _: () => MatchReturn<D, C> })['_']

  if (handler !== undefined) {
    // @ts-ignore
    return handler(val)
  } else {
    if (catchAll) {
      return catchAll(data)
    }

    return fallback()
  }
}
