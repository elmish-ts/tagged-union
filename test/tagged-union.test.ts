import * as Tagged from '../src/tagged-union'
import { pipe } from 'fp-ts/lib/pipeable'
import * as List from './cases/List'
import * as Either from './cases/Either'
import * as These from './cases/These'

describe(Tagged.def.name, () => {
  it('works', () => {
    expect(Tagged.def('Tag', 500)).toEqual({ tag: 'Tag', Tag: 500 })
    expect(Tagged.def('Tag')).toEqual({ tag: 'Tag', Tag: Tagged.Unit })
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

    expect(case1).toEqual(1)
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

    expect(case1).toEqual(100)
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

    expect(case1).toEqual(100)
  })
})

describe(Tagged.caseWhen.name, () => {
  it('works for List<A>', () => {
    const ls: List.List<string> = List.singleton('hello')
    const case1: number = Tagged.caseWhen(ls, {
      Nil: () => 0,
      Cons: ([a, ls]) => 1
    })

    expect(case1).toEqual(1)
  })

  it('works for These<A,B>', () => {
    const these: These.These<string, number> = These.That(100)
    const case1: number = Tagged.caseWhen(these, {
      This: str => str.length,
      That: n => n,
      These: ([str, n]) => n
    })

    expect(case1).toEqual(100)
  })

  it('works for Either<L, R>', () => {
    const either: Either.Either<string, number> = Either.Right(100)
    const case1: number = Tagged.caseWhen(either, {
      Left: str => str.length,
      Right: n => n
    })

    expect(case1).toEqual(100)
  })
})

describe(Tagged.match.name, () => {
  it('works for List<A>', () => {
    const ls: List.List<string> = List.singleton('hello')
    const case1: number = pipe(
      ls,
      Tagged.match({
        Nil: () => 0,
        Cons: ([a, ls]) => 1
      })
    )
    const catchAllCase = pipe(
      ls,
      Tagged.match({
        '*': x => x
      })
    )
    const fallbackCase = pipe(
      ls,
      Tagged.match({
        _: () => 'fallback'
      })
    )

    expect(case1).toEqual(1)
    expect(catchAllCase).toBe(ls)
    expect(fallbackCase).toEqual('fallback')
  })

  it('works for These<A,B>', () => {
    const these: These.These<string, number> = These.That(100)
    const case1: number = pipe(
      these,
      Tagged.match({
        This: str => str.length,
        That: n => n,
        These: ([str, n]) => n
      })
    )
    const catchAllCase = pipe(
      these,
      Tagged.match({
        '*': x => x
      })
    )
    const fallbackCase = pipe(
      these,
      Tagged.match({
        _: () => 'fallback'
      })
    )

    expect(case1).toEqual(100)
    expect(catchAllCase).toBe(these)
    expect(fallbackCase).toEqual('fallback')
  })

  it('works for Either<L, R>', () => {
    const either: Either.Either<string, number> = Either.Right(100)
    const case1: number = pipe(
      either,
      Tagged.match({
        Left: str => str.length,
        Right: n => n
      })
    )
    const catchAllCase = pipe(
      either,
      Tagged.match({
        '*': x => x
      })
    )
    const fallbackCase = pipe(
      either,
      Tagged.match({
        _: () => 'fallback'
      })
    )

    expect(case1).toEqual(100)
    expect(catchAllCase).toBe(either)
    expect(fallbackCase).toEqual('fallback')
  })
})

describe(Tagged.matchWhen.name, () => {
  it('works for List<A>', () => {
    const ls: List.List<string> = List.singleton('hello')
    const case1: number = Tagged.matchWhen(ls, {
      Nil: () => 0,
      Cons: ([a, ls]) => 1
    })
    const catchAllCase = Tagged.matchWhen(ls, {
      '*': x => x
    })
    const fallbackCase = Tagged.matchWhen(ls, {
      _: () => 'fallback'
    })

    expect(case1).toEqual(1)
    expect(catchAllCase).toBe(ls)
    expect(fallbackCase).toEqual('fallback')
  })

  it('works for These<A,B>', () => {
    const these: These.These<string, number> = These.That(100)
    const case1: number = Tagged.matchWhen(these, {
      This: str => str.length,
      That: n => n,
      These: ([str, n]) => n
    })
    const catchAllCase = Tagged.matchWhen(these, {
      '*': x => x
    })
    const fallbackCase = Tagged.matchWhen(these, {
      _: () => 'fallback'
    })

    expect(case1).toEqual(100)
    expect(catchAllCase).toBe(these)
    expect(fallbackCase).toEqual('fallback')
  })

  it('works for Either<L, R>', () => {
    const either: Either.Either<string, number> = Either.Right(100)
    const case1: number = Tagged.matchWhen(either, {
      Left: str => str.length,
      Right: n => n
    })
    const catchAllCase = Tagged.matchWhen(either, {
      '*': x => x
    })
    const fallbackCase = Tagged.matchWhen(either, {
      _: () => 'fallback'
    })

    expect(case1).toEqual(100)
    expect(catchAllCase).toBe(either)
    expect(fallbackCase).toEqual('fallback')
  })
})
