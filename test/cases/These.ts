import { def, Def, caseWhen, caseOf } from '../../src/tagged-union'

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

function mapThis<A, B, C>(these: These<A, C>, f: (a: A) => B): These<B, C> {
  return caseWhen(these, {
    This: a => This(f(a)),
    That: c => That(c),
    Both: ([a, b]) => Both(f(a), b)
  })
}

function mapThisWith<A, B, C>(f: (a: A) => B): (these: These<A, C>) => These<B, C> {
  return these =>
    caseWhen(these, {
      This: a => This<B, C>(f(a)),
      That: c => That<B, C>(c),
      Both: ([a, b]) => Both(f(a), b)
    })
}

function mapThatWith<A, B, C>(f: (a: B) => C): (these: These<A, B>) => These<A, C> {
  return these =>
    caseWhen(these, {
      This: a => This<A, C>(a),
      That: b => That<A, C>(f(b)),
      Both: ([a, b]) => Both(a, f(b))
    })
}
