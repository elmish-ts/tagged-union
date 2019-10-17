import { TaggedUnionMember } from 'typelevel-ts'

/**
 * Utility for defining variants of tagged sum types
 *
 * @param Tag a string literal type used to name/tag the variant being defined
 * @param Value (optional) the type of the value of the variant being defined. Defaults to Tag.
 *
 * @definition
 * ```ts
 * export type Def<Tag extends string, Value = Tag> =
 *   { readonly tag: Tag } & { readonly [K in Tag]: Value }
 * ```
 *
 * @example
 * ```ts
 * type Maybe<A> =
 *   | Def<'Nothing'>
 *   | Def<'Just', A>
 * ```
 *
 * Which is literally equivalent to
 *
 * ```ts
 * type Maybe<A> =
 *   | { tag: 'Nothing', Nothing: 'Nothing' }
 *   | { tag: 'Just', Just: A }
 *
 * ```
 */
export type Def<Tag extends string, Value = Tag> = { readonly tag: Tag } & {
  readonly [K in Tag]: Value
}

/**
 * Constructs a tagged variant.
 * Used to define nullary* data constructors for tagged sum variants.
 *
 * * _"nullary" meaning "arity zero", or not needing any arguments_
 *
 * @example
 * ```ts
 * type Maybe<A> =
 *   | Def<'Nothing'>
 *   | Def<'Just', A>
 *
 * const Nothing: Maybe<never> = def('Nothing')
 * const Just = <A>(a: A): Maybe<A> def('Just', a)
 *
 * const maybeString: Maybe<string> = Nothing
 * ```
 */
export function def<D extends Def<string, unknown>, T extends D['tag']>(
  tag: Def<string, unknown> extends D ? never : T
): Def<T, T> extends D ? D : Def<T, T>

/**
 * Constructs a tagged variant parameterized by some type.
 * Used to define n-arity* data constructors for tagged sum variants.
 *
 * * _"n-arity" meaning it requires some number of arguments to construct_
 *
 * @example
 * ```ts
 * type Maybe<A> =
 *   | Def<'Nothing'>
 *   | Def<'Just', A>
 *
 * const Nothing: Maybe<never> = def('Nothing')
 * const Just = <A>(a: A): Maybe<A> def('Just', a)
 *
 * const maybeString: Maybe<string> = Just("hello")
 * ```
 */
export function def<D extends Def<string, unknown>, T extends D['tag']>(
  tag: Def<string, unknown> extends D ? never : T,
  value: TaggedUnionMember<D, 'tag', T>[T]
): D

export function def<D extends Def<string, unknown>, T extends D['tag']>(
  tag: Def<string, unknown> extends D ? never : T,
  value?: TaggedUnionMember<D, 'tag', T>[T]
) {
  return value === undefined ? { tag, [tag]: tag } : { tag, [tag]: value }
}

type CaseOf<U extends Def<string, unknown>, R> = {
  readonly [K in U['tag']]: (val: Extract<U, { tag: K }>[K]) => R
}

type CaseReturn<D extends Def<string, unknown>, C extends CaseOf<D, unknown>> = C extends CaseOf<
  D,
  infer R
>
  ? R
  : never

/**
 * Exhaustive pattern matching for tagged unions.
 * A data-last (i.e. pipeable) version of [caseWhen](#caseWhen)
 *
 * @example
 * ```ts
 * type List<A> =
 *   | Def<'Nil'>
 *   | Def<'Cons', [A, List<A>]>
 *
 * const ls: List<string> = List.singleton('hello')
 * const num: number = pipe(
 *   ls,
 *   caseOf({
 *     Nil: () => 0,
 *     Cons: ([a, ls]) => 1
 *   })
 * )
 *
 * expect(num).toEqual(1)
 * ```
 *
 * @param D a tagged variant against which to pattern match
 * @param C an object/struct defining how to handle all possible variants of the tagged sum
 */
export function caseOf<D extends Def<string, unknown>, C extends CaseOf<D, unknown>>(
  cases: C
): (data: D) => CaseReturn<D, C> {
  return data => caseWhen(data, cases)
}

/**
 * Exhaustive pattern matching for tagged unions
 *
 * @example
 * ```ts
 * type List<A> =
 *   | Def<'Nil'>
 *   | Def<'Cons', [A, List<A>]>
 *
 * const ls: List<string> = List.singleton('hello')
 * const num: number = caseWhen(ls, {
 *   Nil: () => 0,
 *   Cons: ([a, ls]) => 1
 * })
 *
 * expect(num).toEqual(1)
 * ```
 *
 * @param D a tagged variant against which to pattern match
 * @param C an object/struct defining how to handle all possible variants of the tagged sum
 */
export function caseWhen<D extends Def<string, unknown>, C extends CaseOf<D, unknown>>(
  data: D,
  cases: C
): CaseReturn<D, C> {
  // @ts-ignore
  return cases[data.tag](data[data.tag])
}

type Match<D extends Def<string, unknown>, R> =
  | CaseOf<D, R>
  | Partial<CaseOf<D, R>> & { readonly '*': (val: D) => R }
  | Partial<CaseOf<D, R>> & { readonly _: () => R }

type MatchReturn<D extends Def<string, unknown>, M extends Match<D, unknown>> = M extends Match<
  D,
  infer R
>
  ? R
  : never

/**
 * Pattern matching for tagged unions with fallback handler.
 * A data-last (i.e. pipeable) version of [matchWhen](#matchWhen)
 *
 * @example
 * ```ts
 * type List<A> =
 *   | Def<'Nil'>
 *   | Def<'Cons', [A, List<A>]>
 *
 * const ls: List<string> = List.singleton('hello')
 * const num: number = pipe(
 *   ls,
 *   match({
 *     Nil: () => 0,
 *     Cons: ([a, ls]) => 1
 *   })
 * )
 *
 * const catchAllCase = pipe(
 *   ls,
 *   match({
 *     '*': x => x
 *   })
 * )
 *
 * const fallbackCase = pipe(
 *   ls,
 *   match({
 *     _: () => 'fallback'
 *   })
 * )
 *
 * expect(num).toEqual(1)
 * expect(catchAllCase).toBe(ls)
 * expect(fallbackCase).toEqual('fallback')
 * ```
 */
export function match<D extends Def<string, unknown>, C extends Match<D, unknown>>(
  cases: C
): (data: D) => MatchReturn<D, C> {
  return data => matchWhen(data, cases)
}

/**
 * Pattern matching for tagged unions with fallback handler.
 *
 * @example
 * ```ts
 * type List<A> =
 *   | Def<'Nil'>
 *   | Def<'Cons', [A, List<A>]>
 *
 * const ls: List<string> = List.singleton('hello')
 * const num: number = matchWhen(ls, {
 *   Nil: () => 0,
 *   Cons: ([a, ls]) => 1
 * })
 *
 * const catchAllCase = matchWhen(ls, {
 *   '*': x => x
 * })
 *
 * const fallbackCase = matchWhen(ls, {
 *   _: () => 'fallback'
 * })
 *
 * expect(num).toEqual(1)
 * expect(catchAllCase).toBe(ls)
 * expect(fallbackCase).toEqual('fallback')
 * ```
 */
export function matchWhen<D extends Def<string, unknown>, C extends Match<D, unknown>>(
  data: D,
  cases: C
): MatchReturn<D, C> {
  const tag: D['tag'] = data.tag
  const val: D[D['tag']] = data[tag]
  const handler: undefined | C[D['tag']] = cases[tag]
  const catchAll: undefined | ((d: D) => MatchReturn<D, C>) = ((cases as unknown) as Partial<
    CaseOf<D, unknown>
  > & {
    readonly '*': (val: D) => MatchReturn<D, C>
  })['*']

  const fallback: undefined | (() => MatchReturn<D, C>) = ((cases as unknown) as Partial<
    CaseOf<D, unknown>
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
