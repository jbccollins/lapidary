import { EvaluationTree, EvaluationTreeLeaf, Facets, Item } from './types';
import Lapidary from './lapidary';
export declare const traverseEvaluationTree: (item: Item, evalutionTree: EvaluationTree | EvaluationTreeLeaf | null, l: Lapidary) => boolean;
export declare const recursivelyGenerateEvaluators: (split: any, facets: Facets) => EvaluationTree | EvaluationTreeLeaf;
declare const generateEvaluationTree: (input: string, facets: Facets) => EvaluationTree | EvaluationTreeLeaf;
export { generateEvaluationTree };
