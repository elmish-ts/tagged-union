import { def, Def, caseOf } from '../../src/tagged-union'

export type List<A> = Def<'Nil'> | Def<'Cons', [A, List<A>]>

export const Nil: List<never> = def('Nil')
export const Cons = <A>(a: A) => (ls: List<A>): List<A> => def('Cons', [a, ls])

export function singleton<A>(a: A): List<A> {
  return Cons(a)(Nil)
}

export function map<A, B>(f: (a: A) => B): (ls: List<A>) => List<B> {
  return caseOf({
    Nil: () => Nil,
    Cons: ([a, as]) => Cons(f(a))(map(f)(as))
  })
}

export function foldl<B>(b: B) {
  return <A>(f: (b: B) => (a: A) => B): ((ls: List<A>) => B) =>
    caseOf({
      Nil: () => b,
      Cons: ([aa, as]) => foldl(f(b)(aa))(f)(as)
    })
}

export function foldr<B>(b: B) {
  return <A>(f: (a: A) => (b: B) => B): ((ls: List<A>) => B) =>
    caseOf({
      Nil: () => b,
      Cons: ([aa, as]) => f(aa)(foldr(b)(f)(as))
    })
}
