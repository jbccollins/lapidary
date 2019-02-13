import React from 'react';
import PropTypes from 'prop-types';
import Tree from 'react-d3-tree';
// let data = {
// 	name: 'Parent',
// 	children: [{
// 		name: 'Child One'
// 	}, {
// 		name: 'Child Two'
// 	}]
// };

const transformEvaluationTree = evaluationTree => {
  if (!evaluationTree) {
    return null;
  }
  const { left, right, invert, joinType, raw, filterEvaluator } = evaluationTree;
  const isLeaf = typeof filterEvaluator === "function";
  
  if (isLeaf) {
    return ({name: raw ? raw : 'TRUE'})
  }
  // Filter falsy children
  const children = [left, right].filter(i => i);
  const name = `${joinType}${invert ? ' NOT' : ''}`;
  return ({
    name: name,
    children: children.map(c => transformEvaluationTree(c))
  });
}

const svgSquare = {
  shape: 'rect',
  shapeProps: {
    width: 80,
    height: 20,
    x: -40,
    y: -10,
  }
}

class LapidaryTree extends React.Component {

  render() {
    const { evaluationTree } = this.props;
    const data = transformEvaluationTree(evaluationTree);
    console.log(data);
    return(
      <div style={{width: "522px", height: "400px"}}>
        <Tree
          translate={{x: 261, y: 20}}
          textLayout={{textAnchor: "start", x: 0, y: 10, transform: undefined }}
          data={data ? data : [{name: "no query"}]}
          orientation="vertical"
          nodeSvgShape={svgSquare}
          styles={{
            links: {},
            nodes: {
              node: {
                circle: {
                  fill: "#0f52ba",
                  stroke: "none",
                },
                name: {
                  textAnchor: "middle",
                  fill: "white",
                  stroke: "none",
                  transform: "translateY(-10px)",
                  fontWeight: "300",
                },
                attributes: {},
              },
              leafNode: {
                circle: {
                  display: "none"
                },
                name: {
                  fill: "#0f52ba",
                  stroke: "none",
                  textAnchor: "middle"
                },
                attributes: {},
              },
            },
          }}
          />
      </div>
    );
  }
}

LapidaryTree.propTypes = {
  evaluationTree: PropTypes.object,
};

export default LapidaryTree;

/*
first:=:james AND NOT last:=:collins

(first:=:james AND age:>=:20) (NOT last:=:terp) OR last:contains:r

*/