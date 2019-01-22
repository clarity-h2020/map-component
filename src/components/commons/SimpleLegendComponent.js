import React from "react";
import 'react-table/react-table.css'


const buildRow = (value) => {
  return (
    <tr key={value.name} className='legend-row' style={{backgroundColor: value.color}}><td key={value.name+value.color}>{value.name}</td></tr>
  )
  }

  
const SimpleLegendComponent = (props) => {
  const {data} = props
  return (
    <table className="table table-striped">
      <thead>
      <tr className='legend-head'><th>Legend</th></tr>
      </thead>
      <tbody>
        {data.map(buildRow)}
      </tbody>
    </table>
   )
}

export default SimpleLegendComponent;