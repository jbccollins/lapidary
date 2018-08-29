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
  it('succeeds given empty query string - BASIC', () => {
    const lapidary = new Lapidary(items, facets, context)
    lapidary.parseQuery('')
    expect(lapidary).toBeInstanceOf(Lapidary)
  }),
    it('succeeds given valid name - BASIC', () => {
      const lapidary = new Lapidary(items, facets, context)
      lapidary.parseQuery('name:="War and Peace"')
      expect(lapidary).toBeInstanceOf(Lapidary)
    }),
    it('fails given invalid name - BASIC', () => {
      const lapidary = new Lapidary(items, facets, context)
      lapidary.parseQuery('derp:="War and Peace"')
      expect(lapidary).toBeInstanceOf(Lapidary)
    })
})
