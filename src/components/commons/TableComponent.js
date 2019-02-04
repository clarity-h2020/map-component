import React from "react";
import 'react-table/react-table.css'
import ReactTable from "react-table";



const buildRow = (row, i) => {
    let td = Object.keys(row).map((k, j) => {
      return <td key={j}>{row[k]}</td>  
    })
    return (
      <tr key={i}>{td}</tr>
    )
  }

  const buildHeader = (header) => {
    let th = header.map((k, j) => {
      return <th key={j}>{k}</th>  
    })
    return (
      <tr>{th}</tr>
    )
  }
  
const SimpleTableComponent = (props) => {
  const {data} = props
  return (
    <table className="table table-striped">
      <thead>
        {buildHeader(Object.keys(data[0]))}
      </thead>
      <tbody>
        {data.map(buildRow)}
      </tbody>
    </table>
   )
}

export default class TableComponent extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
      expanded: props.expanded
    };
  }

  render() {
      return (
        <div>
          <div>
            {this.props.header}
          </div>
          <br />
          <ReactTable
          data={this.props.data}
          columns={this.props.columns}
          defaultPageSize={10}
          pivotBy={this.props.pivotBy}
          expanded={this.state.expanded}
          />
          <br />
          <div>
            {this.props.footer}
          </div>
        </div>
          );
  }

}

//export default SimpleLegendTableComponent;