import * as Tagged from '../src/tagged-union'
import { pipe } from 'fp-ts/lib/pipeable'
import * as List from './cases/List'
import * as Either from './cases/Either'
import * as These from './cases/These'
import { Identity } from './cases/Identity'
import { Pair } from './cases/Pair'
import { TAG } from '../src/internal'

describe(Tagged.def.name, () => {
  it('works', () => {
    expect(Tagged.def('Tag', 500)).toEqual({
      [TAG]: 'Tag',
      Tag: [500]
    })
    expect(Tagged.def('Tag')).toEqual({
      [TAG]: 'Tag',
      Tag: []
    })
  })
})

describe(Tagged.caseOf.name, () => {
  it('works for List<A>', () => {
    const ls: List.List<string> = List.singleton('hello')
    const case1: number = pipe(
      ls,
      Tagged.caseOf({
        Nil: () => 0,
        Cons: ({ head, tail }) => 1
      })
    )

    const fallbackCase: string = pipe(
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
        Both: (str, n) => n
      })
    )

    const fallbackCase: string = pipe(
      these,
      Tagged.caseOf({
        That: that => These.That(that),
        _: () => These.This('hello')
      }),
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

    const fallbackCase: string = pipe(
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
      Cons: ({ head, tail }) => 1
    })

    const fallbackCase: string = Tagged.caseWhen(ls, {
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
      Both: (str, n) => n
    })
    const fallbackCase: string = Tagged.caseWhen(these, {
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

    const fallbackCase: string = Tagged.caseWhen(either, {
      Left: str => str,
      _: () => 'fallback'
    })

    expect(case1).toEqual(100)
    expect(fallbackCase).toEqual('fallback')
  })

  it('works for NewTypes', () => {
    type Id<A> = Tagged.Def<'Identity', [A]>
    function Id<A>(a: A): Id<A> {
      return Tagged.def('Identity', a)
    }

    const identity = Identity(100)
    const identityIdentity = Identity(identity)
    const identityId = Identity(Id('hello'))
    const pair = Pair(Either.Right<string, number>(100))(List.singleton('hello'))

    const identityCase = Tagged.caseWhen(identity, {
      Identity: x => x
    })
    const identityFallbackCase = Tagged.caseWhen(identity, {
      _: () => 'fallback'
    })
    const identityIdentityCase = Tagged.caseWhen(identityIdentity, {
      Identity: x => x
    })
    const identityIdentityFallbackCase = Tagged.caseWhen(identityIdentity, {
      _: () => 'fallback'
    })
    const identityIdCase = Tagged.caseWhen(identityId, {
      Identity: x => x
    })
    const identityIdFallbackCase = Tagged.caseWhen(identityId, {
      _: () => 'fallback'
    })

    const pairCase = Tagged.caseWhen(pair, {
      Pair: ({ first, second }) => first
    })

    const pairFallbackCase: string = Tagged.caseWhen(pair, {
      _: () => 'fallback'
    })

    expect(identityCase).toEqual(100)
    expect(identityFallbackCase).toEqual('fallback')
    expect(identityIdentityCase).toEqual(100)
    expect(identityIdentityFallbackCase).toEqual('fallback')
    expect(identityIdCase).toEqual(Id('hello'))
    expect(identityIdFallbackCase).toEqual('fallback')
    expect(pairCase).toEqual(Either.Right(100))
    expect(pairFallbackCase).toEqual('fallback')
  })
})

describe(Tagged.is.name, () => {
  it('works for List<A>', () => {
    const cons: List.List<string> = List.singleton('hello')
    const nil = List.Nil
    const consCase = Tagged.is(cons, 'Cons')
    const nilCase = Tagged.is(nil, 'Nil')
    expect(consCase).toEqual(true)
    expect(nilCase).toEqual(true)
  })

  it('works for These<A,B>', () => {
    expect(Tagged.is(These.That(100), 'That')).toEqual(true)
    expect(Tagged.is(These.That(100), 'This')).toEqual(false)
    expect(Tagged.is(These.That(100), 'Both')).toEqual(false)

    expect(Tagged.is(These.This(100), 'This')).toEqual(true)
    expect(Tagged.is(These.This(100), 'That')).toEqual(false)
    expect(Tagged.is(These.This(100), 'Both')).toEqual(false)

    expect(Tagged.is(These.Both(100, '100'), 'Both')).toEqual(true)
    expect(Tagged.is(These.Both(100, '100'), 'This')).toEqual(false)
    expect(Tagged.is(These.Both(100, '100'), 'That')).toEqual(false)
  })

  it('works for Either<L, R>', () => {
    expect(Tagged.is(Either.Left(1), 'Left')).toEqual(true)
    expect(Tagged.is(Either.Left(1), 'Right')).toEqual(false)

    expect(Tagged.is(Either.Right(1), 'Left')).toEqual(false)
    expect(Tagged.is(Either.Right(1), 'Right')).toEqual(true)
  })
})

describe(Tagged.unwrap.name, () => {
  it('works for Identity<A>', () => {
    expect(Tagged.unwrap(Identity('hello'))).toEqual('hello')
    expect(Tagged.unwrap(Identity(Identity('hello')))).toEqual(Identity('hello'))
  })

  it('works for Pair<A, B>', () => {
    expect(Tagged.unwrap(Pair(100)('hello'))).toEqual({ first: 100, second: 'hello' })
  })
})
