import Lapidary, { Item, Facets, StringOperations } from '../src/lapidary'
import { STRING } from '../src/constants'

const items: Item[] = [
  {
    name: 'War and Peace'
  },
  {
    name: 'Harry Potter and the Sorcerers Stone'
  }
]

const facets: Facets = {
  name: {
    operations: StringOperations
    //evaluationGenerator: StringEqualityEvaluationGenerator
    //evaluator: (item: Item, self: Lapidary, evaluatorContext) => (item.name === evaluatorContext.name)
  }
}

const context = {}
describe('Instantiation', () => {
  it('Lapidary is instantiable', () => {
    expect(new Lapidary(items, facets, context)).toBeInstanceOf(Lapidary)
  })
})
describe('String Queries', () => {
  it('Returns all results given an empty query string', () => {
    const lapidary = new Lapidary(items, facets, context)
    const results = lapidary.parseQuery('')
    expect(results).toEqual(items)
  }),
    it('Returns one result given a single queried name', () => {
      const lapidary = new Lapidary(items, facets, context)
      const results = lapidary.parseQuery('name:="War and Peace"')
      expect(results).toEqual([{ name: 'War and Peace' }])
    }),
    it('fails given invalid name - BASIC', () => {
      const lapidary = new Lapidary(items, facets, context)
      expect(lapidary.parseQuery('derp:="War and Peace"')).toThrow()
    })
})
