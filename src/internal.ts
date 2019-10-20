/** @ignore */
export const TAG: unique symbol = '@elmish-ts/tagged-union' as any
/** @ignore */
export type Unit = {
  readonly [TAG]: 'Unit'
  readonly Unit: {}
}
/** @ignore */
export const Unit: Unit = {
  [TAG]: 'Unit',
  Unit: {}
}
