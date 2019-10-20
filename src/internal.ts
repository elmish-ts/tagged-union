export const TAG: unique symbol = '@elmish-ts/tagged-union' as any
export type Unit = {
  readonly [TAG]: 'Unit'
  readonly Unit: {}
}
export const Unit: Unit = {
  [TAG]: 'Unit',
  Unit: {}
}
