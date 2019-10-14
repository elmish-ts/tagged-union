import { def, Def, caseOf, caseWhen, match } from '../../src/tagged-union'
import { pipe } from 'fp-ts/lib/pipeable'

export type List<A> = Def<'Nil'> | Def<'Cons', [A, List<A>]>

export const Nil: List<never> = def('Nil')
export const Cons = <A>(a: A, ls: List<A>): List<A> => def('Cons', [a, ls] as [A, List<A>])

export function singleton<A>(a: A): List<A> {
  return Cons(a, Nil)
}

export function cons<A>(a: A, ls: List<A>): List<A> {
  return caseWhen(ls, {
    Nil: () => Cons(a, Nil),
    Cons: ([aa, as]) => Cons(a, Cons(aa, as))
  })
}

export function map<A, B>(f: (a: A) => B) {
  return (ls: List<A>): List<B> =>
    caseWhen(ls, {
      Nil: () => Nil,
      Cons: ([a, as]) => Cons(f(a), map(f)(as))
    })
}

export function foldl<B>(b: B) {
  return <A>(f: (b: B) => (a: A) => B) => (ls: List<A>): B =>
    caseWhen(ls, {
      Nil: () => b,
      Cons: ([aa, as]) => foldl(f(b)(aa))(f)(as)
    })
}

export function foldr<B>(b: B) {
  return <A>(f: (a: A) => (b: B) => B) => (ls: List<A>): B =>
    caseWhen(ls, {
      Nil: () => b,
      Cons: ([aa, as]) => f(aa)(foldr(b)(f)(as))
    })
}
