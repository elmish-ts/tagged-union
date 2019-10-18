import * as Tagged from '../src/tagged-union'
import { pipe } from 'fp-ts/lib/pipeable'
import * as List from './cases/List'
import * as Either from './cases/Either'
import * as These from './cases/These'

describe(Tagged.def.name, () => {
  it('works', () => {
    expect(Tagged.def<Tagged.Def<'Tag', number>, 'Tag'>('Tag', 500)).toEqual({
      tag: 'Tag',
      Tag: 500
    })
    expect(Tagged.def<Tagged.Def<'Tag'>, 'Tag'>('Tag')).toEqual({ tag: 'Tag', Tag: 'Tag' })
  })
})

describe(Tagged.caseOf.name, () => {
  it('works for List<A>', () => {
    const ls: List.List<string> = List.singleton('hello')
    const case1: number = pipe(
      ls,
      Tagged.caseOf({
        Nil: () => 0,
        Cons: ([a, ls]) => 1
      })
    )

    const fallbackCase = pipe(
      ls,
      Tagged.caseOf({
        Nil: () => 'nil',
        _: () => 'fallback'
      })
    )

    expect(case1).toEqual(1)
    expect(fallbackCase).toEqual('fallback')
  })

  it('works for These<A,B>', () => {
    const these: These.These<string, number> = These.That(100)
    const case1: number = pipe(
      these,
      Tagged.caseOf({
        This: str => str.length,
        That: n => n,
        These: ([str, n]) => n
      })
    )

    const fallbackCase = pipe(
      these,
      Tagged.caseOf({
        This: str => str,
        _: () => 'fallback'
      })
    )

    expect(case1).toEqual(100)
    expect(fallbackCase).toEqual('fallback')
  })

  it('works for Either<L, R>', () => {
    const either: Either.Either<string, number> = Either.Right(100)
    const case1: number = pipe(
      either,
      Tagged.caseOf({
        Left: str => str.length,
        Right: n => n
      })
    )

    const fallbackCase = pipe(
      either,
      Tagged.caseOf({
        Left: str => str,
        _: () => 'fallback'
      })
    )

    expect(case1).toEqual(100)
    expect(fallbackCase).toEqual('fallback')
  })
})

describe(Tagged.caseWhen.name, () => {
  it('works for List<A>', () => {
    const ls: List.List<string> = List.singleton('hello')
    const case1: number = Tagged.caseWhen(ls, {
      Nil: () => 0,
      Cons: ([a, ls]) => 1
    })

    const fallbackCase = Tagged.caseWhen(ls, {
      Nil: () => 'nil',
      _: () => 'fallback'
    })

    expect(case1).toEqual(1)
    expect(fallbackCase).toEqual('fallback')
  })

  it('works for These<A,B>', () => {
    const these: These.These<string, number> = These.That(100)
    const case1: number = Tagged.caseWhen(these, {
      This: str => str.length,
      That: n => n,
      These: ([str, n]) => n
    })
    const fallbackCase = Tagged.caseWhen(these, {
      This: str => str,
      _: () => 'fallback'
    })

    expect(case1).toEqual(100)
    expect(fallbackCase).toEqual('fallback')
  })

  it('works for Either<L, R>', () => {
    const either: Either.Either<string, number> = Either.Right(100)
    const case1: number = Tagged.caseWhen(either, {
      Left: str => str.length,
      Right: n => n
    })

    const fallbackCase = Tagged.caseWhen(either, {
      Left: str => str,
      _: () => 'fallback'
    })

    expect(case1).toEqual(100)
    expect(fallbackCase).toEqual('fallback')
  })
})
