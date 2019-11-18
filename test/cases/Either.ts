import { def as _, Def, caseOf, caseWhen } from '../../src/tagged-union'

export type Either<L, R> = Def<'Left', [L]> | Def<'Right', [R]>

export function Left<L, R = never>(l: L): Either<L, R> {
  return _('Left', l)
}

export function Right<L = never, R = unknown>(r: R): Either<L, R> {
  return _('Right', r)
}

function map<L, A, B>(f: (r: A) => B): (e: Either<L, A>) => Either<L, B> {
  return caseOf({
    Left: l => Left(l),
    Right: r => Right(f(r))
  })
}

function chain<L, A, B>(f: (r: A) => Either<L, B>): (e: Either<L, A>) => Either<L, B> {
  return caseOf({
    Left: l => Left(l),
    Right: r => f(r)
  })
}

function applyTo<L, A, B>(fa: Either<L, A>): (fa2b: Either<L, (a: A) => B>) => Either<L, B> {
  return caseOf({
    Left: l => Left(l),
    Right: a2b =>
      caseWhen(fa, {
        Left: l => Left(l),
        Right: r => Right(a2b(r))
      })
  })
}

function fold<L, R, Ret>(onLeft: (l: L) => Ret, onRight: (r: R) => Ret): (e: Either<L, R>) => Ret {
  return caseOf({
    Left: onLeft,
    Right: onRight
  })
}
