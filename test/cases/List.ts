import { def, Def, caseOf } from '../../src/tagged-union'

export type List<A> = Def<'Nil'> | Def<'Cons', MoreList<A>>
interface MoreList<A> {
  head: A
  tail: List<A>
}

export const Nil: List<never> = def('Nil')
export const Cons = <A>(a: A) => (ls: List<A>): List<A> => def('Cons', { head: a, tail: ls })

export function singleton<A>(a: A): List<A> {
  return Cons(a)(Nil)
}

export function map<A, B>(f: (a: A) => B): (ls: List<A>) => List<B> {
  return caseOf({
    Nil: () => Nil,
    Cons: ({ head, tail }) => Cons(f(head))(map(f)(tail))
  })
}

export function foldl<B>(b: B) {
  return <A>(f: (b: B) => (a: A) => B): ((ls: List<A>) => B) =>
    caseOf({
      Nil: () => b,
      Cons: ({ head, tail }) => foldl(f(b)(head))(f)(tail)
    })
}

export function foldr<B>(b: B) {
  return <A>(f: (a: A) => (b: B) => B): ((ls: List<A>) => B) =>
    caseOf({
      Nil: () => b,
      Cons: ({ head, tail }) => f(head)(foldr(b)(f)(tail))
    })
}
