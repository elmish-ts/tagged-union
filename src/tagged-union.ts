import { TaggedUnionMember } from 'typelevel-ts'

type TagProp = 'tag'
const TAG_PROP: TagProp = 'tag'

/**
 * @name Def<Tag extends string, Value = Tag>
 * Utility for defining variants of tagged sum types
 *
 * @param Tag a string literal type used to name/tag the variant being defined
 * @param Value (optional) the type of the value of the variant being defined. Defaults to `Tag`.
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
 * is literally equivalent to
 *
 * ```ts
 * type Maybe<A> =
 *   | { tag: 'Nothing', Nothing: 'Nothing' }
 *   | { tag: 'Just', Just: A }
 *
 * ```
 */
export type Def<Tag extends string, Value = Tag> = { readonly [TAG_PROP]: Tag } & {
  readonly [K in Tag]: Value
}

type ExhaustiveCaseOf<U extends Def<string, unknown>, R> = {
  readonly [K in U[TagProp]]: (val: Extract<U, { tag: K }>[K]) => R
}

/**
 * A struct of tag-handler pairs, where the handler function
 * receives whatever value (if any) is associated with the
 * given tag.
 *
 */
export type CaseOfStruct<D extends Def<string, unknown>, R> =
  | ExhaustiveCaseOf<D, R>
  | Partial<ExhaustiveCaseOf<D, R>> & FallbackMatch<R>

type FallbackMatch<R> = { readonly _: () => R }

/**
 * Whatever type is returned from all case expressions
 */
export type CaseOfReturn<
  D extends Def<string, unknown>,
  M extends CaseOfStruct<D, unknown>
> = M extends CaseOfStruct<D, infer R> ? R : unknown

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
export function def<D extends Def<string, unknown>, T extends D[TagProp]>(
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
export function def<D extends Def<string, unknown>, T extends D[TagProp]>(
  tag: Def<string, unknown> extends D ? never : T,
  value: TaggedUnionMember<D, TagProp, T>[T]
): D

export function def<D extends Def<string, unknown>, T extends D[TagProp]>(
  tag: Def<string, unknown> extends D ? never : T,
  value?: TaggedUnionMember<D, TagProp, T>[T]
) {
  return value === undefined ? { tag, [tag]: tag } : { tag, [tag]: value }
}

/**
 * A curried, data-last (i.e. pipeable) version of [caseWhen](#caseWhen)
 *
 * Pattern matching for tagged unions. Supply a struct of tag-handler pairs
 * to handle each case of the tagged sum. Use the `_` pattern to provide a
 * fallback handler if you don't want to handle every variant of the union.
 *
 * @example
 * ```ts
 * type List<A> =
 *   | Def<'Nil'>
 *   | Def<'Cons', [A, List<A>]>
 *
 * const ls: List<string> = List.singleton('hello')
 *
 * const num: number = pipe(
 *   ls,
 *   caseOf({
 *     Nil: () => 0,
 *     Cons: ([a, ls]) => 1
 *   })
 * )
 *
 * const fallbackCase = pipe(
 *   ls,
 *   caseOf({
 *     Cons: ([a, as]) => a,
 *     _: () => 'fallback'
 *   })
 * )
 *
 * expect(num).toEqual(1)
 * expect(fallbackCase).toEqual('fallback')
 * ```
 *
 * @param D a tagged variant against which to pattern match
 * @param C an object/struct defining how to handle all possible variants of the tagged sum
 */
export function caseOf<D extends Def<string, unknown>, C extends CaseOfStruct<D, unknown>>(
  cases: C extends ExhaustiveCaseOf<D, infer R> & FallbackMatch<infer R>
    ? ExhaustiveCaseOf<D, R>
    : C
): (data: D) => CaseOfReturn<D, C> {
  return data => caseWhen(data, cases)
}

/**
 * Pattern matching for tagged unions. Supply a struct of tag-handler pairs
 * to handle each case of the tagged sum. Use the `_` pattern to provide a
 * fallback handler if you don't want to handle every variant of the union.
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
 * const fallbackCase = caseWhen(ls, {
 *   Cons: ([a, as]) => a,
 *   _: () => 'fallback'
 * })
 *
 * expect(num).toEqual(1)
 * expect(fallbackCase).toEqual('fallback')
 * ```
 *
 * @param D a tagged variant against which to pattern match
 * @param C an object/struct defining how to handle all possible variants of the tagged sum
 */
export function caseWhen<D extends Def<string, unknown>, C extends CaseOfStruct<D, unknown>>(
  data: D,
  cases: C extends ExhaustiveCaseOf<D, infer R> & FallbackMatch<infer R>
    ? ExhaustiveCaseOf<D, R>
    : C
): CaseOfReturn<D, C> {
  const tag: D[TagProp] = data[TAG_PROP]
  const val: D[D[TagProp]] = data[tag]
  // @ts-ignore
  const handler: undefined | C[D[TagProp]] = cases[tag]

  const fallback: undefined | (() => CaseOfReturn<D, C>) = ((cases as unknown) as Partial<
    ExhaustiveCaseOf<D, unknown>
  > & { readonly _: () => CaseOfReturn<D, C> })['_']

  if (handler !== undefined) {
    // @ts-ignore
    return handler(val)
  } else {
    return fallback()
  }
}
