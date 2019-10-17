import { def, Def, caseOf, caseWhen, match, matchWhen } from '../../src/tagged-union'
import { pipe } from 'fp-ts/lib/pipeable'

export type These<A, B> = Def<'This', A> | Def<'That', B> | Def<'These', [A, B]>

export const This = <A, B>(a: A): These<A, B> => def('This', a)
export const That = <A, B>(b: B): These<A, B> => def('That', b)
export const These = <A, B>(a: A, b: B): These<A, B> => def('These', [a, b] as [A, B])

function mapThis<A, B, C>(these: These<A, C>, f: (a: A) => B): These<B, C> {
  return caseWhen(these, {
    This: a => This<B, C>(f(a)),
    That: c => That<B, C>(c),
    These: ([a, b]) => These(f(a), b)
  })
}

function mapThisWith<A, B, C>(f: (a: A) => B): (these: These<A, C>) => These<B, C> {
  return these =>
    caseWhen(these, {
      This: a => This<B, C>(f(a)),
      That: c => That<B, C>(c),
      These: ([a, b]) => These(f(a), b)
    })
}

function mapThatWith<A, B, C>(f: (a: B) => C): (these: These<A, B>) => These<A, C> {
  return these =>
    caseWhen(these, {
      This: a => This<A, C>(a),
      That: b => That<A, C>(f(b)),
      These: ([a, b]) => These(a, f(b))
    })
}
