# @elmish-ts/tagged-union

Define tagged unions a little more concisely and get pattern matching for free.

## Install

```sh
npm install @elmish-ts/tagged-union
```

## Compatibility

Currently tested against TypeScript v3.5.1. Higher versions should be fine, lower versions may require you to provide more type annotations, or they may not work at all.

## Docs

Documentation is built from `master` and hosted here:
https://elmish-ts.github.io/tagged-union/

## Description & Usage

Typically defining and working with a tagged sum (a.k.a. "discriminated union") in TypeScript is done by defining unions of record/struct types directly, which requires you to think about some minutiae every time you want to define one:

- what should the "discriminant" field be called?
- what other fields should each variant have?
- does it matter if multiple variants have any field names in common? (yes)

And then when you want to start working with values that inhabit your tagged union, the most straightforward way to do so is to use `switch () {}` statements, switching on the discriminant field. Switch statements work fine, but you need make sure you take steps to ensure TypeScript enforces exhaustiveness checking so you handle all variants of the union. Also, folks who like functional programming tend to prefer expressions over statements, so it's a little irksome to use switch statements when handling tagged sums.

Here's an example of defining the well know `Maybe<A>` type using the typical method:

```ts
type Maybe<A> =
  | { tag: 'Nothing' }
  | { tag: 'Just', Just: A }

const Nothing: Maybe<never> = {
  tag: 'Nothing'
}
const Just = <A>(a: A): Maybe<A> =>
  { tag: 'Just', Just: a }

function map<A>(ma: Maybe<A>, fn: (a: A) => B): Maybe<B> {
  switch (ma.tag) {
    case "Nothing":
      return Nothing

    case 'Just':
      return Just(fn(ma.Just))
  }
}
```

With this library, we can do the same thing like this:

```ts
import { Def, def, caseWhen } from '@elmish-ts/tagged-union'

type Maybe<A> =
  | Def<'Nothing'>
  | Def<'Just', A>

const Nothing: Maybe<never> = def('Nothing')
const Just = <A>(a: A): Maybe<A> => def('Just', a)

function map<A>(ma: Maybe<A>, fn: (a: A) => B): Maybe<B> {
  return caseWhen(ma, {
    Nothing: () => Nothing
    Just: a => Just(fn(a))
  })
}
```

Additionally, you can use an underscore fallback pattern `_` if you want handle only some variants explicitly, and handle the rest with a fallback value.

```ts
type These<A, B> = Def<'This', A> | Def<'That', B> | Def<'Both', [A, B]>

const This = <A, B = never>(a: A): These<A, B> => def('This', a)
const That = <A = never, B = unknown>(b: B): These<A, B> => def('That', b)
const Both = <A, B>(a: A, b: B): These<A, B> => def('Both', [a, b])

function getBothOr<A, B>(fallback: [A, B]): (these: These<A, B>) => [A, B] {
  return caseOf({
    Both: both => both,
    _: () => fallback
  })
}
```

Pattern matching is made possible by the functions `caseOf` and `caseWhen`. `caseOf` is curried and takes data last in order to be usable in a point-free fashion in functional pipelines. `caseWhen` takes the data first and is not curried. Otherwise, they work the same.

## Other Examples

### Lists

```ts
type List<A> = Def<'Nil'> | Def<'Cons', [A, List<A>]>

const Nil: List<never> = def('Nil')
const Cons = <A>(a: A, ls: List<A>): List<A> => def('Cons', [a, ls] as [A, List<A>])

function map<A, B>(f: (a: A) => B): (ls: List<A>) => List<B> {
  return caseOf({
    Nil: () => Nil,
    Cons: ([a, as]) => Cons(f(a), map(f)(as))
  })
}
```

### Either<L, R>

```ts
type Either<L, R> = Def<'Left', L> | Def<'Right', R>

function Left<L, R = never>(l: L): Either<L, R> {
  return def('Left', l)
}

function Right<L = never, R = unknown>(r: R): Either<L, R> {
  return def('Right', r)
}

function map<L, A, B>(f: (r: A) => B): (e: Either<L, A>): Either<L, B> {
  return caseOf({
    Left: l => Left(l),
    Right: r => Right(f(r))
  })
}
```
