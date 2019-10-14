# @elmish-ts/tagged-union

Define tagged unions a little more concisely and get pattern matching for free

## Examples

### Lists

```ts
type List<A> = Def<'Nil'> | Def<'Cons', [A, List<A>]>

const Nil: List<never> = def('Nil')
const Cons = <A>(a: A, ls: List<A>): List<A> => def('Cons', [a, ls] as [A, List<A>])

function map<A, B>(f: (a: A) => B) {
  return (ls: List<A>): List<B> =>
    caseWhen(ls, {
      Nil: () => Nil,
      Cons: ([a, as]) => Cons(f(a), map(f)(as))
    })
}
```

### Either<L, R>

```ts
type Either<L, R> = Def<'Left', L> | Def<'Right', R>

function Left<L, R>(l: L): Either<L, R> {
  return def('Left', l)
}

function Right<L, R>(r: R): Either<L, R> {
  return def('Right', r)
}

function map<L, A, B>(f: (r: A) => B) {
  return (e: Either<L, A>): Either<L, B> =>
    caseWhen(e, {
      Left: l => Left<L, B>(l),
      Right: r => Right<L, B>(f(r))
    })
}
```
