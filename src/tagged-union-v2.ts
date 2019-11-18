import { AnyTup, UnionToIntersection, Brand, BRAND, AnyTuple, PrettifyIntersection } from './internal'
import * as Tag from './tagged-union'

interface Generic<T extends string> {
  tag: T
}

type _ = never

function Generic<T extends string>(tag: T): Generic<T> {
  return { tag }
}

interface TypeVariables {
  A: Generic<'A'>
  B: Generic<'B'>
  C: Generic<'C'>
  D: Generic<'D'>
  E: Generic<'E'>
  F: Generic<'F'>
  G: Generic<'G'>
  H: Generic<'H'>
  I: Generic<'I'>
  J: Generic<'J'>
  K: Generic<'K'>
  L: Generic<'L'>
  M: Generic<'M'>
  N: Generic<'N'>
  O: Generic<'O'>
  P: Generic<'P'>
  Q: Generic<'Q'>
  R: Generic<'R'>
  S: Generic<'S'>
  T: Generic<'T'>
  U: Generic<'U'>
  V: Generic<'V'>
  W: Generic<'W'>
  Y: Generic<'Y'>
  X: Generic<'X'>
  Z: Generic<'Z'>
}

interface TypeParameters<
  A = never,
  B = never,
  C = never,
  D = never,
  E = never,
  F = never,
  G = never,
  H = never,
  I = never,
  J = never,
  K = never,
  L = never,
  M = never,
  N = never,
  O = never,
  P = never,
  Q = never,
  R = never,
  S = never,
  T = never,
  U = never,
  V = never,
  W = never,
  Y = never,
  X = never,
  Z = never
> {
  A: A
  B: B
  C: C
  D: D
  E: E
  F: F
  G: G
  H: H
  I: I
  J: J
  K: K
  L: L
  M: M
  N: N
  O: O
  P: P
  Q: Q
  R: R
  S: S
  T: T
  U: U
  V: V
  W: W
  Y: Y
  X: X
  Z: Z
}

const A = Generic('A')
const B = Generic('B')
const C = Generic('C')
const D = Generic('D')
const E = Generic('E')
const F = Generic('F')
const G = Generic('G')
const H = Generic('H')
const I = Generic('I')
const J = Generic('J')
const K = Generic('K')
const L = Generic('L')
const M = Generic('M')
const N = Generic('N')
const O = Generic('O')
const P = Generic('P')

type MapGenericTokenToTypeVar<Tokens extends AnyTup, TypeParams extends AnyTuple> = PrettifyIntersection<
  UnionToIntersection<
    {
      [K in Extract<keyof Tokens, keyof TypeParams>]: number extends K ? never : Tokens[K] extends Generic<infer Tag> ? { [P in Tag]: TypeParams[K] } : never
    }[Extract<keyof Tokens, keyof TypeParams>]
  >
>

type X = MapGenericTokenToTypeVar<[Generic<'Hi'>, Generic<'Hi'>], ['hi', 'hey', 300]>

type Go<TVars extends Generic<string>[]> = TVars extends Array<Generic<infer Tag>> ? Tag : never

type Data<Name extends string, Variants extends object> = { [BRAND]: Name } & UnionToIntersection<
  {
    [K in keyof Variants]: Variants[K] extends Of<infer Values>
      ? {
          [P in K]: Values extends AnyTuple
            ? <A = _, B = _, C = _, D = _, E = _, F = _, G = _, H = _, I = _, J = _, K = _, L = _, M = _, N = _, O = _, P = _, Q = _, R = _, S = _, T = _, U = _, V = _, W = _, Y = _, X = _, Z = _>(
                ...params: SwapTypeVars<Values, TypeParameters<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, Y, X, Z>>
              ) => Type<Name, TypeParameters<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, Y, X, Z>, Variants>
            : never
        }
      : {
          [P in K]: never
        }
  }[keyof Variants]
>

type SwapTypeVars<CtorParams extends AnyTup, TypeParams extends object> = AnyTuple &
  {
    [Ix in keyof CtorParams]: CtorParams[Ix] extends Generic<infer Tag> ? (Tag extends keyof TypeParams ? TypeParams[Tag] : never) : CtorParams[Ix]
  }

type Type<Name extends string, TypeParams extends object, Variants extends object> = {
  [BRAND]: Name
} & {
  [K in keyof Variants]: Variants[K] extends Of<infer Values> ? Tag.Def<K, SwapTypeVars<Values, TypeParams>> : Tag.Def<K, AnyTup>
}[keyof Variants]

type GenericDataDef<Name extends string, Definition extends object> = (
  a: TypeVariables['A'],
  b: TypeVariables['B'],
  c: TypeVariables['C'],
  d: TypeVariables['D'],
  e: TypeVariables['E'],
  f: TypeVariables['F'],
  g: TypeVariables['G'],
  h: TypeVariables['H'],
  i: TypeVariables['I'],
  j: TypeVariables['J'],
  k: TypeVariables['K'],
  l: TypeVariables['L'],
  m: TypeVariables['M'],
  n: TypeVariables['N'],
  o: TypeVariables['O'],
  p: TypeVariables['P']
) => DataDef<Definition>

type DataDef<D extends object> = {
  [K in keyof D]: D[K] extends Of<infer Params> ? D[K] : Of<AnyTup>
}

function data<N extends string, D extends object>(name: N, definition: GenericDataDef<N, D>): Data<N, ReturnType<typeof definition>> {
  const variants = definition(A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P)
  const keys = Object.keys(variants) as Array<keyof typeof variants>
  const ctors = (keys
    // @ts-ignore
    .map(k => ({ [k]: (...params: (typeof variants)[typeof k]) => Tag.def(k, ...variants[k]) }))
    .reduce((prev, curr) => ({ ...prev, ...curr })) as unknown) as Data<N, typeof variants>

  return ctors
}

type Of<Params extends AnyTup> = (...params: Params) => { [BRAND]: 'Of' } & Params

function Of<Params extends AnyTup = []>(): Of<Params> {
  return (...params) => params as ReturnType<Of<Params>>
}

const Either = data('Either', (a, b) => ({
  Left: Of<[typeof a]>(),
  Right: Of<[typeof b]>()
}))

const Route = data('Route', b => ({
  Home: Of(),
  User: Of<[number]>()
}))

const z = Route.User(1)
const x = Either.Left(1)
const w = Either.Right(new Date())

const y = Tag.caseWhen(x, {
  Left: x => x,
  Right: y => y
  // _: () => 33
})
