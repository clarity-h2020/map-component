import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
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
    return (
      <main>
        <BrowserRouter>
          <Switch>
            <Route exact path={process.env.PUBLIC_URL} component={GenericMap} />
            <Route exact path={`${process.env.PUBLIC_URL}/GenericMap/`} component={GenericMap} />
            <Route exact path={`${process.env.PUBLIC_URL}/ResourcePreviewMap/`} component={GenericMap} />
            <Route exact path={`${process.env.PUBLIC_URL}/DataPackagePreviewMap/`} component={GenericMap} />
            <Route exact path={`${process.env.PUBLIC_URL}/StudyPreviewMap/`} component={GenericMap} />
            <Route exact path={`${process.env.PUBLIC_URL}/CharacteriseHazardMap/`} component={CharacteriseHazardMap} />
            <Route exact path={`${process.env.PUBLIC_URL}/ExposureMap/`} component={ExposureMap} />
            <Route exact path={`${process.env.PUBLIC_URL}/HazardLocalEffectsMap/`} component={HazardLocalEffectsMap} />
            <Route exact path={`${process.env.PUBLIC_URL}/RiskAndImpactMap/`} component={RiskAndImpactMap} />
            <Route exact path={`${process.env.PUBLIC_URL}/VulnerabilityMap/`} component={VulnerabilityMap} />
            <Route exact path={`${process.env.PUBLIC_URL}/StudyArea/`} component={StudyArea} />
            <Route component={GenericMap} />
          </Switch>
        </BrowserRouter>
      </main>
    );
  }
}