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
    
    console.log(process.env); 
    console.log('public url: "', process.env.PUBLIC_URL+'"'); 
    console.log('THIS_SUCKS: ', process.env.THIS_SUCKS); 
    console.log('REACT_APP_THIS_SUCKS: ', process.env.REACT_APP_THIS_SUCKS); 
    return (
        <main> 
          <BrowserRouter>
            <Switch>
              <Route exact path="/" component={GenericMap} />
              
              <Route path="/CharacteriseHazardMap/" component={CharacteriseHazardMap} />
              <Route path={`${process.env.PUBLIC_URL}/CharacteriseHazardMapTest/`} component={CharacteriseHazardMap} />
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