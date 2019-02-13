import { StringOperations, NumericOperations } from './operations';
import { EvaluationTree, EvaluationTreeLeaf, Item, Facets, Facet } from './types';
export default class Lapidary {
    items: Item[];
    facets: Facets;
    options: {
        [key: string]: any;
    };
    setInTransientContext: (keyPath: string[], value: any) => void;
    getInTransientContext: (keyPath: string[]) => any;
    setInPermanentContext: (keyPath: string[], value: any) => void;
    getInPermanentContext: (keyPath: string[]) => any;
    getEvaluationTree: (query: string) => EvaluationTree | EvaluationTreeLeaf;
    parseQuery: (query: string) => Item[];
    parseEvaluationTree: (evalutionTree: EvaluationTree | EvaluationTreeLeaf) => Item[];
    getSuggestions: (query: string, position: number) => string[];
    defaultFacet: (i: Item, s: string | number) => boolean;
    defaultSuggestion: string;
    getCurrentIndex: () => number;
    getFacet: (key: keyof Facets) => Facet;
    private permanentContext;
    private transientContext;
    private clearTransientContext;
    private currentIndex;
    private setCurrentIndex;
    constructor(items: Item[], facets: Facets, options: {
        defaultFacet: (i: Item, s: string | number) => boolean;
        aliases: {
            [key: string]: keyof Facets;
        };
        defaultSuggestion: string;
    });
}
export { StringOperations, NumericOperations, Lapidary };
