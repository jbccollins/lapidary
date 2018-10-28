import Lapidary from './lapidary';
/*** TYPES ***/
export declare type FilterEvaluator = (item: Item, l: Lapidary) => boolean;
export declare type FilterGenerator = (facetKey: keyof Facets, expression: any) => FilterEvaluator;
export declare type Facets = {
    [key: string]: Facet;
};
export declare type Facet = {
    operations: OperationMapping;
    objectKey: string;
};
export declare type EvaluationTree = {
    left: EvaluationTree | EvaluationTreeLeaf | null;
    right: EvaluationTree | EvaluationTreeLeaf | null;
    invert: boolean;
    joinType: string | null;
};
export declare type EvaluationTreeLeaf = {
    filterEvaluator: FilterEvaluator;
    raw: string;
};
export declare type Item = {
    [k in keyof Facets]: any;
};
export declare type ImplicitComparator = (expression: string, item: Item, l: Lapidary) => boolean;
/*** END TYPES ***/
/*** INTERFACES ***/
export interface OperationMapping {
    [key: string]: FilterGenerator;
}
/*** END INTERFACES ***/
