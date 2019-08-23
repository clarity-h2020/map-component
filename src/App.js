import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import GenericMap from "./components/GenericMap";
import CharacteriseHazardMap from "./components/CharacteriseHazardMap";
import ExposureMap from "./components/ExposureMap";
import HazardLocalEffectsMap from "./components/HazardLocalEffectsMap";
import RiskAndImpactMap from "./components/RiskAndImpactMap";
import StudyArea from "./components/StudyArea";
import VulnerabilityMap from "./components/VulnerabilityMap";
//import ReactLoading from "react-loading";

/**
 * @class
 */
export default class App extends React.Component {

  render() {
    return (
        <main>
          <BrowserRouter>
            <Switch>
              <Route exact path="/" component={GenericMap} />
              <Route exact path="/CharacteriseHazardMap/" component={CharacteriseHazardMap} />
              <Route exact path="/ExposureMap/" component={ExposureMap} />
              <Route exact path="/HazardLocalEffectsMap/" component={HazardLocalEffectsMap} />
              <Route exact path="/StudyArea/" component={StudyArea} />
              <Route exact path="/RiskAndImpactMap/" component={RiskAndImpactMap} />
              <Route exact path="/VulnerabilityMap/" component={VulnerabilityMap} />
              <Route component={GenericMap} />
            </Switch>
          </BrowserRouter>
        </main>
    );
  }
}