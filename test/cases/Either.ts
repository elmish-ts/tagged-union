import { def, Def, caseOf, caseWhen, match } from '../../src/tagged-union'
import { pipe } from 'fp-ts/lib/pipeable'

export type Either<L, R> = Def<'Left', L> | Def<'Right', R>

export function Left<L, R>(l: L): Either<L, R> {
  return def('Left', l)
}

export function Right<L, R>(r: R): Either<L, R> {
  return def('Right', r)
}

function fold<L, R, Ret>(onLeft: (l: L) => Ret, onRight: (r: R) => Ret) {
  return (e: Either<L, R>): Ret => {
    return pipe(
      e,
      caseOf({
        Left: onLeft,
        Right: onRight
      })
    )
  }
}

function map<L, A, B>(f: (r: A) => B) {
  return (e: Either<L, A>): Either<L, B> =>
    pipe(
      e,
      caseOf({
        Left: l => Left<L, B>(l),
        Right: r => Right<L, B>(f(r))
      })
    )
}

function applyTo<L, A, B>(fa: Either<L, A>) {
  return (fa2b: Either<L, (a: A) => B>): Either<L, B> =>
    pipe(
      fa2b,
      chain(f =>
        pipe(
          fa,
          map(f)
        )
      )
    )
}

function chain<L, A, B>(f: (r: A) => Either<L, B>) {
  return (e: Either<L, A>): Either<L, B> =>
    pipe(
      e,
      caseOf({
        Left: l => Left<L, B>(l),
        Right: r => f(r)
      })
    )
}
