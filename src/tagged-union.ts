import { TaggedUnionMember, Exact } from 'typelevel-ts'
import { TAG, AnyTup, NoUnion, StringLitToSymbol, Brand } from './internal'

type TagType = string | number | symbol
/**
 * Utility for defining variants of tagged sum types
 *
 * @param Tag a string literal type used to name/tag the variant being defined
 * @param Values (optional) a tuple of type parameters. Defaults to [] (unit)
 *
 * @definition
 *
 * export type Def<Tag extends TagType, Values extends AnyTup = []>> =
 *   { readonly [TAG]: Tag } & { readonly [K in Tag]: Values }
 *
 *
 * @example
 *
 * import { Def } from '@elmish-ts/tagged-union'
 *
 * type Maybe<A> =
 *   | Def<'Nothing'>
 *   | Def<'Just', [A]>
 *
 *
 * // is literally equivalent to
 *
 *
 * type Maybe<A> =
 *   | { tag: 'Nothing', Nothing: [] }
 *   | { tag: 'Just', Just: [A] }
 *
 *
 *
 * @since 2.0.0
 */
export type Def<T extends TagType, V extends AnyTup = []> = Tag<T> & Wrapper<T, V>

type Tag<T extends TagType> = { readonly [TAG]: T }
type Wrapper<T extends TagType, V extends AnyTup> = {
  readonly [K in StringLitToSymbol<Exclude<T, number | symbol>>]: V
}

type GetValuesPropSymbolForDef<D extends Def<TagType, AnyTup>> = D extends Def<infer Tag, AnyTup>
  ? StringLitToSymbol<Exclude<Tag, number | symbol>>
  : never
type GetValues<D extends Def<TagType, AnyTup>> = D extends Def<TagType, infer Values>
  ? Values
  : never
type GetTag<D extends Def<TagType, AnyTup>> = D extends Def<infer Tag, AnyTup> ? Tag : never
/**
 * A struct of tag-handler pairs, where the handler function
 * receives whatever values (if any) is associated with the
 * given tag.
 *
 * @since 1.0.0
 */
export type CaseOfStruct<D extends Def<TagType, AnyTup>, R> =
  | ExhaustiveCaseOfStruct<D, R>
  | PartialCaseOfStruct<D, R>

type ExhaustiveCaseOfStruct<U extends Def<TagType, AnyTup>, R> = {
  readonly [K in U[typeof TAG]]: (
    ...val: Extract<U, Def<K, AnyTup>>[StringLitToSymbol<Exclude<K, number | symbol>>]
  ) => R
}

type PartialCaseOfStruct<D extends Def<TagType, AnyTup>, R> = FallbackMatch<R> &
  Partial<ExhaustiveCaseOfStruct<D, R>>

type FallbackMatch<R> = { readonly _: () => R }

/**
 * A struct of tag-handler pairs, where the handler function
 * receives whatever values (if any) is associated with the
 * given tag. Enforces that all cases are covered and that
 * no excess properties are present.
 *
 * @since 1.0.1
 */
export type StrictCaseOfStruct<
  D extends Def<TagType, any>,
  C extends CaseOfStruct<any, any>
> = C extends ExhaustiveCaseOfStruct<D, infer R> & FallbackMatch<infer R>
  ? ExhaustiveCaseOfStruct<D, R>
  : C extends ExhaustiveCaseOfStruct<D, infer R>
  ? Exact<ExhaustiveCaseOfStruct<D, R>, C>
  : C

/**
 * Infers whatever type is returned from all case expressions
 *
 * @since 1.0.0
 */
export type CaseOfReturn<
  D extends Def<TagType, AnyTup>,
  M extends CaseOfStruct<D, unknown>
> = M extends CaseOfStruct<D, infer R> ? R : unknown

/**
 * Constructs a tagged variant.
 * Used to define nullary* data constructors for tagged sum variants.
 *
 * * _"nullary" meaning "arity zero", or not needing any arguments_
 *
 * @example
 *
 * import { Def, def } from '@elmish-ts/tagged-union'
 *
 * type Maybe<A> =
 *   | Def<'Nothing'>
 *   | Def<'Just', [A]>
 *
 * const Nothing: Maybe<never> = def('Nothing')
 * const Just = <A>(a: A): Maybe<A> => def('Just', a)
 *
 * const maybeString: Maybe<string> = Nothing
 *
 *
 * @since 2.0.0
 */
export function def<D extends Def<TagType, AnyTup>, T extends D[typeof TAG]>(
  tag: string extends T ? never : T
): D extends Def<TagType, AnyTup> ? Def<T, []> : Def<T, []> extends D ? D : Def<T, []>

/**
 * Constructs a tagged variant parameterized by some type.
 * Used to define n-arity* data constructors for tagged sum variants.
 *
 * * _"n-arity" meaning it requires some number of arguments to construct_
 *
 * @example
 *
 * import { Def, def } from '@elmish-ts/tagged-union'
 *
 * type Maybe<A> =
 *   | Def<'Nothing'>
 *   | Def<'Just', [A]>
 *
 * const Nothing: Maybe<never> = def('Nothing')
 * const Just = <A>(a: A): Maybe<A> => def('Just', a)
 *
 * const maybeString: Maybe<string> = Just("hello")
 *
 *
 * @since 2.0.0
 */
export function def<
  D extends Def<TagType, AnyTup>,
  T extends D[typeof TAG],
  V extends Def<TagType, AnyTup> extends D
    ? AnyTup
    : GetValues<TaggedUnionMember<D, typeof TAG, GetTag<D>>>
>(
  tag: string extends T ? never : T,
  ...values: V
): Def<TagType, AnyTup> extends D ? Def<typeof tag, typeof values> : D

export function def<
  D extends Def<TagType, AnyTup>,
  T extends D[typeof TAG],
  V extends Def<TagType, AnyTup> extends D
    ? AnyTup
    : GetValues<TaggedUnionMember<D, typeof TAG, GetTag<D>>>
>(tag: string extends T ? never : T, ...values: V) {
  return {
    [TAG]: tag,
    [tag]: values
  }
}

/**
 * A curried, data-last (i.e. pipeable) version of [caseWhen](#caseWhen)
 *
 * Pattern matching for tagged unions. Supply a struct of tag-handler pairs
 * to handle each case of the tagged sum. Use the `_` pattern to provide a
 * fallback handler if you don't want to handle every variant of the union.
 *
 * @example
 *
 * import { Def, def, caseOf } from '@elmish-ts/tagged-union'
 * import { pipe } from 'fp-ts/lib/pipeable'
 *
 *  export type List<A> =
 *   | Def<'Nil'>
 *   | Def<'Cons', [MoreList<A>]>
 *
 * interface MoreList<A> {
 *   head: A
 *   tail: List<A>
 * }
 *
 * export const Nil: List<never> = def('Nil')
 * export const Cons = <A>(a: A) => (ls: List<A>): List<A> =>
 *   def('Cons', { head: a, tail: ls })
 *
 * const ls: List<string> = Cons('hello')(Nil)
 *
 * const num: number = pipe(
 *   ls,
 *   caseOf({
 *     Nil: () => 0,
 *     Cons: ({head, tail}) => head.length
 *   })
 * )
 *
 * const fallbackCase = pipe(
 *   ls,
 *   caseOf({
 *     Cons: ({head, tail}) => head,
 *     _: () => 'fallback'
 *   })
 * )
 *
 * // expect(num).toEqual('hello'.length)
 * // expect(fallbackCase).toEqual('fallback')
 *
 *
 * @param D a tagged variant against which to pattern match
 * @param C an object/struct defining how to handle all possible variants of the tagged sum
 *
 * @since 2.0.0
 */
export function caseOf<D extends Def<TagType, AnyTup>, C extends CaseOfStruct<D, unknown>>(
  cases: StrictCaseOfStruct<D, C>
): (data: D) => CaseOfReturn<D, C> {
  return data => caseWhen(data, cases)
}

/**
 * Pattern matching for tagged unions. Supply a struct of tag-handler pairs
 * to handle each case of the tagged sum. Use the `_` pattern to provide a
 * fallback handler if you don't want to handle every variant of the union.
 *
 * @example
 *
 * import { Def, def, caseWhen } from '@elmish-ts/tagged-union'
 * import { pipe } from 'fp-ts/lib/pipeable'
 *
 * export type List<A> =
 *   | Def<'Nil'>
 *   | Def<'Cons', [MoreList<A>]>
 *
 * interface MoreList<A> {
 *   head: A
 *   tail: List<A>
 * }
 *
 * export const Nil: List<never> = def('Nil')
 * export const Cons = <A>(a: A) => (ls: List<A>): List<A> =>
 *   def('Cons', { head: a, tail: ls })
 *
 * const ls: List<string> = Cons('hello')(Nil)
 *
 * const num: number = caseWhen(ls, {
 *   Nil: () => 0,
 *   Cons: ({head, tail}) => head.length
 * })
 *
 * const fallbackCase = caseWhen(ls, {
 *   Cons: ({head, tail}) => head,
 *   _: () => 'fallback'
 * })
 *
 * // expect(num).toEqual('hello'.length)
 * // expect(fallbackCase).toEqual('fallback')
 *
 *
 * @param D a tagged variant against which to pattern match
 * @param C an object/struct defining how to handle all possible variants of the tagged sum
 *
 * @since 2.0.0
 */
export function caseWhen<D extends Def<TagType, AnyTup>, C extends CaseOfStruct<D, unknown>>(
  data: D,
  cases: StrictCaseOfStruct<D, C>
): CaseOfReturn<D, C> {
  if (Object.keys(cases).length === 1) {
    if (isPartialCaseOfStruct<D, CaseOfReturn<D, C>>(cases)) {
      return (cases['_'] as () => CaseOfReturn<D, C>)()
    }

    const caseTag: D[typeof TAG] = Object.keys(cases)[0]

    try {
      const dataTag: D[typeof TAG] = data[TAG]
      const vals: D[GetValuesPropSymbolForDef<D>] = data[dataTag as GetValuesPropSymbolForDef<D>]
      const handler: undefined | ((...v: typeof vals) => any) = cases[dataTag]
      if (typeof handler === 'function') {
        return handler(...vals)
      }
      return ((cases[caseTag] as unknown) as (v: D) => CaseOfReturn<D, C>)(data)
    } catch {
      return ((cases[caseTag] as unknown) as (v: D) => CaseOfReturn<D, C>)(data)
    }
  }
  if (isPartialCaseOfStruct<D, CaseOfReturn<D, C>>(cases)) {
    const tag: D[typeof TAG] = data[TAG]
    const vals: D[GetValuesPropSymbolForDef<D>] = data[tag as GetValuesPropSymbolForDef<D>]
    const handler:
      | undefined
      | ((
          ...vals: Extract<D, Def<D[typeof TAG], AnyTup>>[GetValuesPropSymbolForDef<D>]
        ) => CaseOfReturn<D, C>) = cases[tag]
    const fallback: () => CaseOfReturn<D, C> = cases['_']

    if (isCaseHandler<D[GetValuesPropSymbolForDef<D>], CaseOfReturn<D, C>>(handler, ...vals)) {
      return handler(...vals)
    } else {
      return fallback()
    }
  }
  const tag: D[typeof TAG] = data[TAG]
  const vals: D[GetValuesPropSymbolForDef<D>] = data[tag as GetValuesPropSymbolForDef<D>]
  const handler = (cases[tag] as unknown) as (...v: typeof vals) => CaseOfReturn<D, C>

  return handler(...vals)
}

export function is<D extends Def<TagType, AnyTup>, T extends D[typeof TAG]>(
  data: D,
  tag: T
): data is Extract<D, { [TAG]: T }> {
  return data[TAG] === tag
}

export function unwrap<Tag extends TagType, Val>(
  data: NewType<Tag, Val>
): GetValues<EnforceNewType<Tag, Val>>[0] {
  return data
}

export type EnforceNewType<T extends TagType, V> = string extends T
  ? NewTypeError<'No variants could be found for this type'>
  : NoUnion<T> extends never
  ? NewTypeError
  : Def<T, [V]>

export type NewType<T extends TagType, V> = Brand<
  'NewType',
  Def<T, [V extends Def<T, AnyTup> ? never : V]>
>

type NewTypeError<
  Reason = 'You can only unwrap tagged data types that have exactly one variant and one field. Use caseOf or caseWhen instead.'
> = Def<never, [never]> & Def<never, [Reason]>

export function newtype<
  N extends NewType<string, any>,
  T extends NewType<string, any> extends N ? string : N[typeof TAG],
  V extends NewType<string, any> extends N
    ? unknown
    : (GetValues<N>[0] extends Def<T, AnyTup> ? never : GetValues<N>[0])
>(tag: T, value: V): NewType<string, any> extends N ? NewType<T, V> : N {
  // @ts-ignore
  return value
}
// string extends GetTag<D> ? never : NoUnion<GetTag<D>>
type Identity<A> = NewType<'Identity', A>
const Identity = <A>(a: A): Identity<A> => newtype('Identity', a)

type Id<A> = Def<'Identity', [A]>
function Id<A>(a: A): Id<A> {
  return def('Identity', a)
}
const id = Id(100)

const identity = Identity(id)
// const y = newtype('hello', 'hi')

// const z = caseWhen(identity, {
//   Identity: x => x
// })

// ----------------------------------------------

function isPartialCaseOfStruct<D extends Def<TagType, AnyTup>, R>(
  v: unknown
): v is PartialCaseOfStruct<D, R> {
  return typeof v === 'object' && typeof (v as any)['_'] === 'function'
}

function isCaseHandler<T extends AnyTup, R>(f: unknown, ...v: T): f is (...val: T) => R {
  if (typeof f === 'function') {
    try {
      f(v)
      return true
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else {
    return false
  }
}
