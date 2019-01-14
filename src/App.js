import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import CharacteriseHazardMap from "./components/CharacteriseHazardMap";
import CharacteriseHazardTable from "./components/CharacteriseHazardTable";
import ExposureMap from "./components/ExposureMap";
import ExposureTable from "./components/ExposureTable";
import HazardLocalEffectsMap from "./components/HazardLocalEffectsMap";
import HazardLocalEffectsTable from "./components/HazardLocalEffectsTable";
import RiskAndImpactMap from "./components/RiskAndImpactMap";
import RiskAndImpactTable from "./components/RiskAndImpactTable";
import StudyArea from "./components/StudyArea";
import VulnerabilityMap from "./components/VulnerabilityMap";
import VulnerabilityTable from "./components/VulnerabilityTable";
//import ReactLoading from "react-loading";

export default class App extends React.Component {
  constructor() {
    super();
  }

  componentWillMount() {
//    console.log("............................................................................................")
//    console.log("....................... TopicMaps Wuppertal ("+getTopicMapVersion()+")")
//    console.log("....................... BuildNumber: "+getTopicMapHash())
//    console.log("............................................................................................")
    
//    persistStore(store, null, () => {
//      let thisHere = this;
//      setTimeout(() => {
//        thisHere.setState({ rehydrated: true });
//      }, 1);
//    });
  }

  render() {
      return (
        <div>
          <main>
          <BrowserRouter>
            <Switch>
              <Route exact path="/" component={RiskAndImpactTable} />
              <Route exact path="/CharacteriseHazardMap/" component={CharacteriseHazardMap} />
              <Route exact path="/CharacteriseHazardTable/" component={CharacteriseHazardTable} />
              <Route exact path="/ExposureMap/" component={ExposureMap} />
              <Route exact path="/ExposureTable/" component={ExposureTable} />
              <Route exact path="/HazardLocalEffectsMap/" component={HazardLocalEffectsMap} />
              <Route exact path="/HazardLocalEffectsTable/" component={HazardLocalEffectsTable} />
              <Route exact path="/StudyArea/" component={StudyArea} />
              <Route exact path="/RiskAndImpactMap/" component={RiskAndImpactMap} />
              <Route exact path="/RiskAndImpactTable/" component={RiskAndImpactTable} />
              <Route exact path="/VulnerabilityMap/" component={VulnerabilityMap} />
              <Route exact path="/VulnerabilityTable/" component={VulnerabilityTable} />

              <Route component={RiskAndImpactTable} />
            </Switch>
            </BrowserRouter>
          </main>
        </div>
      );
    }
}