import { def, Def, NewType, caseOf, caseWhen, is, unwrap, newtype } from '../../src/tagged-union'

type Identity<A> = NewType<'Identity', A>

export const Identity = <A>(a: A): Identity<A> => newtype('Identity', a)

export function map<A, B>(f: (a: A) => B): (data: Identity<A>) => Identity<B> {
  return data => Identity(f(unwrap(data)))
}
