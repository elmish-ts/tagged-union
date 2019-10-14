import { def, Def, caseOf, caseWhen, match, matchWhen } from '../../src/tagged-union'
import { pipe } from 'fp-ts/lib/pipeable'

export type These<A, B> = Def<'This', A> | Def<'That', B> | Def<'These', [A, B]>

export const This = <A, B>(a: A): These<A, B> => def('This', a)
export const That = <A, B>(b: B): These<A, B> => def('That', b)
export const These = <A, B>(a: A, b: B): These<A, B> => def('These', [a, b] as [A, B])
