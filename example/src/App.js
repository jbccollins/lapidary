/*
TODO: this is buggy. Check the chart:

`
NOT (first:=:2 OR first:=:3) AND first:=:"My Derpy Turtle" AND NOT age:>=:10
`
*/

import React, { Component } from 'react';
//import Fuse from 'fuse.js';
import { Lapidary, StringOperations, NumericOperations } from 'lapidary';
import './people';
//import './peoplesmall';
import { defaultFacet, ImplicitEvaluationGenerator } from './lapidary-helpers';
import PeopleTable from './PeopleTable';
import LapidaryTree from './LapidaryTree';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

const FIRST_NAME_FACET = {
  operations: StringOperations,
  objectKey: 'firstName'
};
const LAST_NAME_FACET = {
  operations: StringOperations,
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
    operations: NumericOperations,
    objectKey: 'balance'
  },
  age: {
    operations: NumericOperations,
    objectKey: 'age'
  },
  gender: {
    operations: StringOperations,
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
    data: [],
    error: false,
    evaluationTree: null,
    showChart: false,
  };

  handleFilterChange = (e) => {
    try {
      this.setState({
        data: this.lapidary.parseQuery(e.target.value),
        error: false,
        evaluationTree: this.lapidary.getEvaluationTree(e.target.value)
      });
    } catch(e) {
      this.setState({data: this.lapidary.items, error: e.message, evaluationTree: null})
    }
  }

  componentDidMount() {
    // var options = {
    //   keys: ['firstName', 'lastName'],
    //   id: '_id'
    // }
    // this.fuse = new Fuse(window.people, options)
    this.lapidary = new Lapidary(window.people, facets, {defaultSuggestion: "Try first:=:James OR last:=:Collins", defaultFacet: defaultFacet });
    this.setState({ready: true, data: this.lapidary.items});
  }

  handleShowChart = () => {
    console.log('ha')
    this.setState({showChart: true});
  }

  handleHideChart = () => {
    this.setState({showChart: false});
  }

  render () {
    const { ready, data, error, evaluationTree, showChart } = this.state;
    return (
      <div className='app'>
        {ready &&
          <div>
            <PeopleTable error={error} data={data} onShowChart={this.handleShowChart} onFilterChange={this.handleFilterChange}/>
          {showChart &&
            <Dialog
              open={showChart}
              onClose={this.handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">Chart View</DialogTitle>
              <DialogContent>
                <LapidaryTree evaluationTree={evaluationTree}/>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleHideChart} color="primary">
                  close
                </Button>
              </DialogActions>
            </Dialog>
          }
          </div>
        }
      </div>
    )
  }
}