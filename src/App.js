import React from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import CharacteriseHazardMap from "./components/CharacteriseHazardMap";
import ExposureMap from "./components/ExposureMap";
import HazardLocalEffectsMap from "./components/HazardLocalEffectsMap";
import RiskAndImpactMap from "./components/RiskAndImpactMap";
import StudyArea from "./components/StudyArea";
import VulnerabilityMap from "./components/VulnerabilityMap";
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
              <Route exact path="/" component={CharacteriseHazardMap} />
              <Route exact path="/CharacteriseHazardMap/" component={CharacteriseHazardMap} />
              <Route exact path="/ExposureMap/" component={ExposureMap} />
              <Route exact path="/HazardLocalEffectsMap/" component={HazardLocalEffectsMap} />
              <Route exact path="/StudyArea/" component={StudyArea} />
              <Route exact path="/RiskAndImpactMap/" component={RiskAndImpactMap} />
              <Route exact path="/VulnerabilityMap/" component={VulnerabilityMap} />

              <Route component={CharacteriseHazardMap} />
            </Switch>
            </BrowserRouter>
          </main>
        </div>
      );
    }
}