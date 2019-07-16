import React, { Component } from 'react';
import { Lapidary, StringOperations, NumericOperations, DateOperations } from 'lapidary';
import fetch from 'isomorphic-fetch';
import { defaultFacet, ImplicitEvaluationGenerator } from './lapidary-helpers';
import PeopleTable from './PeopleTable';
import LapidaryTree from './LapidaryTree';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import "./App.css";

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
  dateRegistered: {
    operations: DateOperations,
    objectKey: 'registered',
  },
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

  async componentDidMount() {
    let people = await fetch("https://raw.githubusercontent.com/jbccollins/lapidary/master/demo/src/people.json", {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });
    people = await people.json();
    this.lapidary = new Lapidary(people, facets, {defaultSuggestion: "Try first:=:James OR last:=:Collins", defaultFacet: defaultFacet });
    this.setState({ready: true, data: this.lapidary.items});
  }

  handleShowChart = () => {
    this.setState({showChart: true});
  }

  handleHideChart = () => {
    this.setState({showChart: false});
  }

  render () {
    const { ready, data, error, evaluationTree, showChart } = this.state;
    return (
      <div className='app'>
        {!ready &&
          <div className="loading-indicator">Loading Application Data...</div>
        }
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