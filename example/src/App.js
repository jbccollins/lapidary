import React, { Component } from 'react';
import lapidary from 'lapidary';
import './people';
import { defaultFacet, ImplicitEvaluationGenerator } from './lapidary-helpers';

const FIRST_NAME_FACET = {
  operations: lapidary.StringOperations,
  objectKey: 'firstName'
};
const LAST_NAME_FACET = {
  operations: lapidary.StringOperations,
  objectKey: 'lastName'
};

/*
  Turning facets access a function might be useful to help reduce duplications of aliases.
  Make a "get" function and use a switch statement like
  case firstName:
  case first:
    return {operations: ..., objectkey: ....}
 */

const facets = {
  firstName: FIRST_NAME_FACET,
  first: FIRST_NAME_FACET,
  lastName: LAST_NAME_FACET,
  last: LAST_NAME_FACET,
  balance: {
    operations: lapidary.NumericOperations,
    objectKey: 'balance'
  },
  age: {
    operations: lapidary.NumericOperations,
    objectKey: 'age'
  },
  gender: {
    operations: lapidary.StringOperations,
    objectKey: 'gender'
  },
  is: {
    operations: {
      "": ImplicitEvaluationGenerator
    },
    objectKey: ''
  }
}

export default class App extends Component {
  state = {
    ready: false,
  };
  componentDidMount() {
    this.l = new lapidary(window.people, facets, {defaultSuggestion: "Try first:=:James OR last:=:Collins", defaultFacet: defaultFacet });
    this.setState({ready: true});
  }
  render () {
    console.log(this.l);
    return (
      <div className='app'>
        it works i guess
      </div>
    )
  }
}