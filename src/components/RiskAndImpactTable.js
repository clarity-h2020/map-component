import React from "react";
import ReactDOM from 'react-dom';
import TableComponent from './commons/TableComponent';




export default class RiskAndImpactTable extends React.Component {
    constructor(props) {
     super(props);
     this.state = {
       data: [
         {
            hazard: 'HW',
            elementAtRisk: "Population",
            vulnerabilityClasses: "Age group 0-14",
            unit: "pop/km2",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          },
          {
            hazard: 'HW',
            elementAtRisk: "Population",
            vulnerabilityClasses: "Age group 15-64",
            unit: "pop/km2",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          },
          {
            hazard: 'HW',
            elementAtRisk: "Population",
            vulnerabilityClasses: ">65",
            unit: "pop/km2",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          },
          {
            hazard: 'FL',
            elementAtRisk: "Population",
            vulnerabilityClasses: "Age group 0-14",
            unit: "pop/km2",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          },
          {
            hazard: 'FL',
            elementAtRisk: "Population",
            vulnerabilityClasses: "Age group 15-64",
            unit: "pop/km2",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          },
          {
            hazard: 'FL',
            elementAtRisk: "Population",
            vulnerabilityClasses: ">65",
            unit: "pop/km2",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          },
          {
            hazard: 'FL',
            elementAtRisk: "Buildings",
            vulnerabilityClasses: "Continuous Residential (S.L. > 80%)",
            unit: "m3/m2",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          },
          {
            hazard: 'FL',
            elementAtRisk: "Buildings",
            vulnerabilityClasses: "Med-Hi Density Discontinuous Res. (30% < S.L. < 80%)",
            unit: "m3/m2",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          },
          {
            hazard: 'FL',
            elementAtRisk: "Buildings",
            vulnerabilityClasses: "Low Density Discontinuous Res. (S.L. < 30%)",
            unit: "m3/m2",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          },
          {
            hazard: 'FL',
            elementAtRisk: "Buildings",
            vulnerabilityClasses: "Non Residential",
            unit: "m3/m2",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          },
          {
            hazard: 'FL',
            elementAtRisk: "Infrastructure",
            vulnerabilityClasses: "Roads",
            unit: "ml",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          },
          {
            hazard: 'FL',
            elementAtRisk: "Infrastructure",
            vulnerabilityClasses: "Railways",
            unit: "ml",
            d1: "1",
            d2: "3",
            d3: "2",
            d4: "3"
          }
        ],
        columns:  [{
          Header: 'Hazards',
          id: 'Hazards',
          accessor: 'hazard' 
        }, {
          Header: 'Element at risk (Exposure)',
          id: 'ElementAtRisk',
          accessor: 'elementAtRisk',
        }, {
          Header: 'Vulnerability classes',
          accessor: 'vulnerabilityClasses',
        }, {
          Header: 'Unit',
          accessor: 'unit',
        }, {
          Header: 'Damage Classes',
          columns: [{
            Header: 'D1',
            accessor: 'd1' 
          }, {
            Header: 'D2',
            accessor: 'd2' 
          }, {
            Header: 'D3',
            accessor: 'd3' 
          }, {
            Header: 'D4',
            accessor: 'd4' 
          }]
        }],
        expanded: ["Hazards", "ElementAtRisk"],
        pivot: ["Hazards", "ElementAtRisk"]
      };
    }
  
    render() {
        const header = "The following table and the associated chart show the development of different categories' elements for several scenarios. There are always 3 scenarios considered: 1) the current today's rate development, 2) low rate development and 3) high rate development for the selected time period. The values will be used in assessing the vulnarability, risk and impact in the next steps.";
        return (
          <div>
            <div>
            <h1>Risik estimates/assessments for all hazards and exposure elements</h1>
            </div>
            <div>
              <TableComponent
              data={this.state.data}
              columns={this.state.columns}
//              pivotBy={this.state.pivot} //{["Hazards", "ElementAtRisk"]}
//              expanded={["Hazards", "ElementAtRisk"]}
              />
            </div>
          </div>
            );
    }
  
  }



//const RiskAndImpactTable = () => {
//    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/05-RA-03-table.png' />);
//};


//export default RiskAndImpactTable;

if (document.getElementById('risk-and impact-table-container') != null) {
    ReactDOM.render(<RiskAndImpactTable />, document.getElementById('risk-and impact-table-container'));
    document.getElementById('risk-and impact-table-container').style.width = "100%";
}