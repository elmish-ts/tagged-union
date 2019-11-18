import { newtype, NewType, caseOf, caseWhen, is, unwrap } from '../../src/tagged-union'

type Pair<A, B> = NewType<'Pair', { first: A; second: B }>

export const Pair = <A>(first: A) => <B>(second: B): Pair<A, B> =>
  newtype('Pair', { first, second })

export function mapFirst<A, B, C>(f: (a: A) => B): (data: Pair<A, C>) => Pair<B, C> {
  return data => {
    const { first, second } = unwrap(data)
    return Pair(f(first))(second)
  }
}
