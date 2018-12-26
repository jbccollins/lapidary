const DUPLICATE = 'duplicate'
const DUPE = 'dupe'

const isDuplicate = (parameters, item, l) => {
  if (!l.getInPermanentContext([DUPLICATE])) {
    let name = "";
    const duplicateContext = {};
    for (let i = 0; i < l.items.length; i++) {
      name = l.items[i].firstName + l.items[i].lastName;
      if (duplicateContext[name]) {
        continue;
      }
      if (i < l.items.length){
        for (let j = i + 1; j < l.items.length; j++) {
          if (l.items[j].firstName + l.items[j].lastName === name) {
            duplicateContext[name] = true;
          }
        }
      }
    }
    l.setInPermanentContext([DUPLICATE], duplicateContext);
  }
  return l.getInPermanentContext([DUPLICATE, item.firstName + item.lastName]) === true;
};

const ExistentialComparator = (parameters, item, l) => {
  switch (parameters) {
    case DUPLICATE:
    case DUPE:
      return isDuplicate(parameters, item, l);
    default:
      throw new Error(`Invalid parameters "${parameters}" given to ExistentialComparator "is"`);
  }
};

const ImplicitEvaluationGenerator = (facetKey, parameters) => {
  return (item, l) => {
    switch (facetKey) {
      case "is":
        return ExistentialComparator(parameters, item, l);
      default:
        throw new Error('Unknown usage of ImplicitEvaluationGenerator');
    }
  }
};

const defaultFacet = (i, v) => {
  return (i.firstName.toLowerCase() + " " + i.lastName.toLowerCase()).indexOf(String(v).toLowerCase()) > -1;
}

export {defaultFacet, ImplicitEvaluationGenerator};