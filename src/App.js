import React from "react";
import { Route, Switch, BrowserRouter} from "react-router-dom";
import { createBrowserHistory } from 'history';
import GenericMap from "./components/GenericMap";
import CharacteriseHazardMap from "./components/CharacteriseHazardMap";
import ExposureMap from "./components/ExposureMap";
import HazardLocalEffectsMap from "./components/HazardLocalEffectsMap";
import RiskAndImpactMap from "./components/RiskAndImpactMap";
import StudyArea from "./components/StudyArea";
import VulnerabilityMap from "./components/VulnerabilityMap";
//import ReactLoading from "react-loading";

export const history = createBrowserHistory({
  basename: process.env.PUBLIC_URL
});

/**
 * @class
 */
export default class App extends React.Component {

  render() {
    console.log(history.location.pathname);
    return (
        <main>
          <BrowserRouter>
            <Switch>
              <Route exact path={`${history.location.pathname}`} component={GenericMap} />
              <Route exact path={`${history.location.pathname}/CharacteriseHazardMap`} component={CharacteriseHazardMap} />
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