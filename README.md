Map Component [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3958827.svg)](https://doi.org/10.5281/zenodo.3958827)
-------------

The Map Component is a reusable, flexible and highly configurable Building Block meant to be used throughout CSIS. It is an embeddable component that can be easily adapted to different parts of the common CSIS UI. The core functionality of this component is visualization of different maps and layers following to the [EU-GL](https://myclimateservices.eu/en/about) process model. 

![image](https://user-images.githubusercontent.com/1788226/88938909-2ff11200-d286-11ea-84f8-84316ded0d87.png)

## Implementation 

Specialised maps for EU-GL Steps EE, HC, HC-LE, RA/IA and AAOP are implemented as separate components. The main components are:

### BasicMap

This is the basic class of all specialised map classes. It implements the common way to extract the layers from the CSIS Study. In fact, it is a wrapper component for a component that controls an actual mapping component implementation (e.g a `react-leaflet` map). In principle it transforms the [CSIS Drupal JSON format](https://raw.githubusercontent.com/clarity-h2020/map-component/dev/src/__fixtures__/dataPackage.json) into a simple internal layer definition format (see example below) that is understood by a JSX Component (e.g. `<LeafletMap>`) that renders the actual map, e.g. a leaflet-based map.

```JSON
[ {
    "checked": false,
    "groupTitle": "Backgrounds",
    "layers": "Boundary,Footprint,Image",
    "name": "Digital_Elevation Model",
    "style": ",",
    "title": "Digital Elevation Model",
    "url": "https://copernicus.discomap.eea.europa.eu/arcgis/services/GioLandPublic/DEM/MapServer/WmsServer?"
  }, 
...
]
```

The component processes the `query parameters` and, with help of [csis-helpers-js](https://github.com/clarity-h2020/csis-helpers-js/), prepares *Background layers*, *Overlay Layers* and respective *Layer Groups* based on [Data Package Resources](https://csis-dev.myclimateservice.eu/maintenance/resources) either from a single resource (query parameter `resource_uuid`) or from a set of resources contained in a [Data Package](https://csis-dev.myclimateservice.eu/maintenance/datapackages) associated with a [Study](https://csis-dev.myclimateservice.eu/maintenance/studies) and retrieved from the [CSIS Drupal API](https://csis-dev.myclimateservice.eu/jsonapi/node/data_package_metadata/c14febe8-0251-4808-8970-dcfdb1255cf9?include=field_resource_tags,field_references,field_resource_tags.field_var_meaning2) (query parameters `study_uuid` or `datapackage_uuid`). 

Thereby, [Template Resources](https://github.com/clarity-h2020/data-package/wiki/Template-Resources) are expanded into several layers according to the scenario definition (`time_period`, `emissions_scenarios` and `event_frequency`) provided via query parameters. Only those resources are considered that are associated with a specific [Taxonomy](https://csis-dev.myclimateservice.eu/admin/structure/taxonomy) term, in general a term from the [EU-GL Taxonomy](https://csis.myclimateservice.eu/admin/structure/taxonomy/manage/eu_gl/overview) like [Hazard Characterization](https://csis.myclimateservice.eu/taxonomy/eu-gl/hazard-characterization). The taxonomy as well as the specific term  are  either specified via query parameters `overlayLayersTagType` and `overlayLayersTagName` or are pre-set in a specialised Map like the `<CharacteriseHazardMap>`. 

The categorisation of layers into different *Layer Groups* (Backgrounds, CLARITY Backgrounds, etc.), which is a feature of [react-leaflet-grouped-layer-control](https://github.com/clarity-h2020/react-leaflet-grouped-layer-control), is also controlled via taxonomy terms (e.g. from the [Hazards](https://csis.myclimateservice.eu/admin/structure/taxonomy/manage/hazards/overview) that are either provided via query parameters (e.g. `&grouping_tag=taxonomy_term--hazards`) or also pre-set in a specialised map (`<CharacteriseHazardMap>`).

![image](https://user-images.githubusercontent.com/1788226/89038500-c08c2880-d340-11ea-8562-b0f260c97afa.png)

### Leaflet Map

A common map component based on [ReactLeaflet](https://react-leaflet.js.org/) v2.7 that understand the JSON layer definition format created by a `<BasicMap>`. It is mainly responsible for creating `<WMSTileLayer>` and `<WMSLayer>` components from the JSON objects received via props `overlays` and `exclusiveGroups`. "[Exclusive Groups](https://github.com/ismyrnow/leaflet-groupedlayercontrol#leaflet-groupedlayercontrol)" are a feature of [react-leaflet-grouped-layer-control](https://github.com/clarity-h2020/react-leaflet-grouped-layer-control).

### WMS Layer

 `<WMSLayer>` is a react wrapper for [leaflet.wms](https://github.com/heigeo/leaflet.wms), an all-in-one WMS plugin for Leaflet. In contrast to leaflet's built-in `<WMSTileLayer>`, it support the WMS `getFeatureInfo` operation which is used to show a popup of layer properties on the map. 

![image](https://user-images.githubusercontent.com/1788226/89039654-bd923780-d342-11ea-8516-1ba9d9acc80c.png)

### Generic Map (Synchronised Maps)

`<GenericMap>` extends `<BasicMap>` and is actual *base class* of all specialised map classes. Unless the [Simple Table Component](https://github.com/clarity-h2020/simple-table-component), the Map Component does not use functional components but classes. In addition to `<BasicMap>`, it adds the possibility to show two synchronised <LeafletMap> components side-by-side with help of [Leaflet.Sync](https://github.com/jieter/Leaflet.Sync):

![sync-map](https://user-images.githubusercontent.com/1788226/89040494-2af29800-d344-11ea-93fc-32aff87342ba.gif)

Whether the generic or a specialised map is rendered as two synchronised maps is controlled via the `isSynchronised` prop. Furthermore, [App.js](https://github.com/clarity-h2020/map-component/blob/dev/src/App.js) defines separate routes for synchronised and non-synchronised maps, e.g. `/CharacteriseHazardMap/` and `/SynchronisedCharacteriseHazardMap/`.

### Specialised Maps

For convenience, specialised Maps currently offer just EU-GL-specific pre-sets of the query parameters and props, respectively, accepted by <BasicMap>. The following specialised maps are currently available:

- [\<CharacteriseHazardMap\>](https://github.com/clarity-h2020/map-component/blob/dev/src/components/CharacteriseHazardMap.js)
- [\<ExposureMap\>](https://github.com/clarity-h2020/map-component/blob/dev/src/components/ExposureMap.js)
- [\<HazardLocalEffectsMap\>](https://github.com/clarity-h2020/map-component/blob/dev/src/components/HazardLocalEffectsMap.js)
- [\<RiskAndImpactMap\>](https://github.com/clarity-h2020/map-component/blob/dev/src/components/RiskAndImpactMap.js)

#### Study Area Map

`<StudyArea>` is used by Drupal to show and edit the study area. As the functionality is quite different from the other maps and since it requires more interaction with the Drupal API, it is not derived from `<BasicMap>`. Since it is integrated into CSIS Drupal with help of  [React Mount Node](https://www.drupal.org/project/reactjs_mount), it is developed in a [separate branch](https://github.com/clarity-h2020/map-component/compare/bug/87_improve_edit_mode_of_study_area) and deployed independently of master / dev branches. 

![image](https://user-images.githubusercontent.com/1788226/89042304-fd5b1e00-d346-11ea-8fcd-78082e5e1845.png)

## Tests

The same Unit Tests as for [csis-helpers-js](https://github.com/clarity-h2020/csis-helpers-js/#tests) are performed. UI Integration Tests are implemented with help of [cypress.io](https://www.cypress.io/) in repository [csis-technical-validation](https://github.com/clarity-h2020/csis-technical-validation).

Apart from that, the different map components can be manually tested locally with `yarn start`. Although they are served from localhost, the user must be logged-in in either [csis](https://csis.myclimateservice.eu/) or [csis-dev](https://csis-dev.myclimateservice.eu/).  

Example URL for testing a synchronised '<CharacteriseHazardMap>' locally against Study "[Urban heat screening Vienna North](https://csis-dev.myclimateservice.eu/study/25/)" with baseline scenario:

`http://localhost:3000/SynchronisedCharacteriseHazardMap/?host=https://csis-dev.myclimateservice.eu&study_uuid=9359e741-df40-4bcd-9faf-2093b499c65c&study_area=POLYGON%20((16.346111%2048.223997,%2016.346111%2048.238634,%2016.376667%2048.238634,%2016.376667%2048.223997,%2016.346111%2048.223997))&emikat_id=3183&datapackage_uuid=2434ce93-93d4-4ca2-8618-a2de768d3f16&time_period=Baseline&emissions_scenario=Baseline&event_frequency=Rare&grouping_tag=taxonomy_term--hazards`

## Installation

### Development Environment

The application has been bootstrapped with [create-react-app](https://github.com/facebook/create-react-app) and uses the built-in build process . Node **v12.x** and yarn **v1.x** has to be installed locally.

### Building

Building and installing the app is straightforward:

```sh
yarn install
yarn build
yarn test
```

The **dev** branch is automatically built on [cismet CI](https://ci.cismet.de/view/CLARITY/job/map-component/) based on [this](https://github.com/clarity-h2020/map-component/blob/dev/Jenkinsfile) pipeline definition. 

### Dependencies 

Dependencies can be easily upgraded with [npm-upgrade](https://www.npmjs.com/package/npm-upgrade):

``npx npm-upgrade``

The advantage over `yarn upgrade` is that that `package.json` is updated with the new dependency version.

### Deployment on CSIS

Although Map Component is integrated in [CI](https://ci.cismet.de/view/CLARITY/job/simple-table-component/), deployment on CSIS is not automated. The following manual steps are required on `cisis-dev.ait.ac.at` and `cisis.ait.ac.at`.

### Study Area Map

// TODO: @therter

### Map Component

```sh
sudo su docker
cd /docker/100-csis/drupal-data/web/apps/map-component/

# reset yarn.lock
git reset --hard

# pull dev or master branch
git pull

# install latest dependencies (may update yarn.lock)
yarn install --network-concurrency 1

# build the app
yarn build

# clear drupal cache
docker exec --user 999 csis-drupal drush cr
```
Note: Commonly on DEV the `dev` branch and on master the `master`  branch is used. 

## Usage

### Query Parameters

Unless the [Scenario Analysis Component](https://github.com/clarity-h2020/scenario-analysis), this component does not use [seamless.js](https://github.com/travist/seamless.js/) to communicate with the [CSIS Drupal System](https://csis.myclimateservice.eu/) when embedded as iFrame. Instead, it can be configured by query parameters. Main reasons are that bidirectional communication between iFrame and main site is not required and that query parameters allow the app to be tested independently of CSIS.

The different maps are selected by the corresponding route defined in [App.js](https://github.com/clarity-h2020/map-component/blob/dev/src/App.js#L28), e.g. `/SynchronisedCharacteriseHazardMap` for a  synchronised `<CharacteriseHazardMap>`. The query parameters supported by <BasicMap> are:

- `host` CSIS API host (e.g. https://csis.myclimateservice.eu/)
- `emikat_id` internal EMIKAT Study id (e.g. 3209)
- `time_period` (e.g. Baseline)
- `emissions_scenario` (e.g. Baseline)
- `event_frequency` (e.g. Frequent)
- `study_uuid` Drual internal uuid of the study
- `study_area` study area WKT for setting the initial map bbox
- `datapackage_uuid` Drual internal uuid of the data package
- `clarityBackgroundLayersTagType` taxonomy for selecting Background Layers
- `clarityBackgroundLayersTagName` taxonomy term for selecting Background Layers
- `clarityBackgroundLayersGroupName` name of the Background Layers Group
- `overlayLayersGroupName` taxonomy for selecting Overlay Layers, e.g. EU-GL taxonomy
- `overlayLayersTagType` taxonomy term for selecting Overlay Layers, e.g. EU-GL Hazard Characterisation
- `overlayLayersTagName` name of the Overlay Layers Group, e.g. Hazards
- `overlayLayersGroupingTagType` taxonomy for selecting the name of Overlay Layers subgroups, e.g. Hazards

Query parameters are processed in [BasicMap.js](https://raw.githubusercontent.com/clarity-h2020/map-component/dev/src/components/commons/BasicMap.js). For more information on query parameters refer to [CSISHelpers.defaultQueryParams](https://github.com/clarity-h2020/csis-helpers-js/blob/dev/src/lib/CSISHelpers.js#L43).

### Integration in CSIS

#### Map Component

The application is integrated as *"Extended iFrame"* in [CSIS Drupal System](https://csis-dev.myclimateservice.eu/). The respective Drupal *Nodes* that contain the [iFrame](https://csis-dev.myclimateservice.eu/apps/map-component/build/) are listed [here](https://csis-dev.myclimateservice.eu/admin/content?title=Map+Component&type=extended_iframe&status=1&langcode=All).

The application is configured via the aforementioned query parameters. The query parameters are extracted by [csis_iframe_connector.js](https://github.com/clarity-h2020/csis-helpers-module/blob/dev/js/csis_iframe_connector.js) from the `studyInfo` object which is injected into the main Drupal CSIS Website via the [CSIS Helpers Drupal Module](https://github.com/clarity-h2020/csis-helpers-module/), in particular by [StudyInfoGenerator.php](https://github.com/clarity-h2020/csis-helpers-module/blob/dev/src/Utils/StudyInfoGenerator.php).

The *"Extended iFrame"* nodes  are used in several [EU-GL Step Templates](https://csis-dev.myclimateservice.eu/admin/content?title=Template&type=gl_step&status=1&langcode=All) as **[Extended iFrame] Map Application**, e.g. in EU-GL Steps Impact/Risk Assessment and Adaptation Options Appraisal.

#### Study Area Map

The application is integrated as *"React Mount Node"* in [CSIS Drupal System](https://csis-dev.myclimateservice.eu/). The respective Drupal *Node* is the "[Map Component: Study Area](https://csis-dev.myclimateservice.eu/node/119/edit). It is only used as default value of `field_study_area_map` in the [Study Group Type](https://csis-dev.myclimateservice.eu/admin/group/types/manage/study/fields/group.study.field_study_area_map).

## License
 
MIT © [cismet GmbH](https://github.com/cismet)