Map Component [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3958827.svg)](https://doi.org/10.5281/zenodo.3958827)
-------------

The Map Component is a reusable, flexible and highly configurable Building Block meant to be used throughout CSIS. It is an embeddable component that can be easily adapted to different parts of the common CSIS UI. The core functionality of this component is visualization of different maps and layers following to the [EU-GL](https://myclimateservices.eu/en/about) process model. 

![image](https://user-images.githubusercontent.com/1788226/88938909-2ff11200-d286-11ea-84f8-84316ded0d87.png)

## Implementation 

Specialised maps for EU-GL Steps EE, HC, HC-LE, RA/IA and AAOP are implemented as separate components. The main components are:

### GenericEmikatClient

A Generic EMIKAT Client that communicates with the [EMIKAT API](https://service.emikat.at/EmiKat/swagger/index.html) and accepts as *render prop* an arbitrary JSX Component that is able to understand the EMIKAT Data Format and visualises the data retrieved by the client component, e.g. the `<GenericEmikatTable>`. It accepts furthermore `emikatParameters` props which control how the EMIKAT *template URL* is parameterised. 

Example *template URL* and the *parameterised URL* for Hazard with Local Effects for study with id `3189`: 

- `https://service.emikat.at/EmiKatTst/api/scenarios/${EMIKATHelpers.EMIKAT_STUDY_ID}/feature/${emikatView}/table/data?rownum=${EMIKATHelpers.ROWNUM}&filter=SZ_ID=${EMIKATHelpers.EMIKAT_STUDY_ID}`
- https://service.emikat.at/EmiKatTst/api/scenarios/3189/feature/view.2974/table/data?rownum=1000&filter=SZ_ID=3189

The related *response* (excerpt):

```JSON
{
  "name": "MAP Local Effects- Mean, UTCI and Apperent Temperature, Discomfort level",
  "description": "Display of Mean, UTCI and Apperent Temperature and Discomfort level for different Scenarios",
  "columnnames": [
    "GRID_ID",
    "MULTIPOLYGON",
    "STUDY_VARIANT",
    "TIME_PERIOD",
    "EMISSIONS_SCENARIO",
    "EVENT_FREQUENCY",
    "T_MRT",
    "T_UTCI",
    "T_A",
    "DISCOMFORT_LEVEL",
    "SZM_SZENARIO_REF"
  ],
  "rows": [
    {
      "rownum": 0,
      "values": [
        "500mE55225N17605",
        "POLYGON ((5522500 1760500, 5523000 1760500, 5523000 1761000, 5522500 1761000, 5522500 1760500))",
        "BASELINE",
        "20110101-20401231",
        "rcp26",
        "Rare",
        69.03435672650336,
        54.30440831904718,
        37.40195635643778,
        5,
        3189
      ]
    },
```

All EMIKAT Service Endpoints including some examples are listed [here](https://github.com/clarity-h2020/csis/wiki/Services-endpoints-(used-by-CSIS)).

### DownloadButton
The DownloadButton is a component similar to the `GenericEmikatClient`, except that it provides an UI for selecting the format of the data retrieved from EMIKAT API and forces the browser to download the data instead of forwarding it to a separate render component.

![image](https://user-images.githubusercontent.com/1788226/88928208-d33b2a80-d278-11ea-8009-e2aea56ce2af.png)

While specialised tables may modify the response, e.g. by reformatting data or hiding columns, the DownloadButton just downloads the unprocessed data received from EMIKAT API. Furthermore, the query parameter / prop `rownum` that controls the maximum number of rows shown in a table is not recognized by the DownloadButton, it requests by default 25.000 rows.

### GenericEmikatTable
A Generic Table Component based on [ReactTable](https://www.npmjs.com/package/react-table) v6.0 that understand the JSON format of the [EMIKAT API](https://service.emikat.at/EmiKat/swagger/index.html). It uses [csis-helpers-js](https://github.com/clarity-h2020/csis-helpers-js/) to translate the proprietary EMIKAT JSON format into a tabular format understood by ReactTable. It is the 'base class' of more specific tables like the `ExposureTable`. Specific tables can provide their own `generateColumns` and `resolveData` functions as props that control which columns are shown and how the data is formatted. 

### ParameterSelectionComponent

The Parameter Selection Component can wrap an `EmikatClientComponent` and a `DownloadButton` Component as *render props* and add a user interface for selection parameters related to a *scenario*, in particular `time_period`, `emissions_scenario` and `event_frequency`. The Parameter Selection Component thereby changes the respective `emikatParameters` props of the wrapped components. These props are used to parameterise the API template URL. More information on EMIKAT API parameters can be found in [EMIKATHelpers.js](https://github.com/clarity-h2020/csis-helpers-js/blob/dev/src/lib/EMIKATHelpers.js).

![image](https://user-images.githubusercontent.com/1788226/88928088-aa1a9a00-d278-11ea-99f3-9ce9a2c1796d.png)

### Specialised Tables

Specialised Tables that implement some custom formatting of row values and custom selection of columns (not all of them are interesting for end users) are: 

#### [CharacteriseHazardTable](https://github.com/clarity-h2020/simple-table-component/blob/dev/src/components/CharacteriseHazardTable.js)

[CharacteriseHazardTable](https://csis-dev.myclimateservice.eu/apps/simple-table-component/build/CharacteriseHazardTable/?host=https://csis-dev.myclimateservice.eu&study_uuid=3d8327f4-c47f-4c9e-bbc3-fb9018ea9607&study_area=POLYGON((23.555632%2046.059224,23.555632%2046.085305,23.60095%2046.085305,23.60095%2046.059224,23.555632%2046.059224))&emikat_id=3209&datapackage_uuid=2434ce93-93d4-4ca2-8618-a2de768d3f16&time_period=Baseline&emissions_scenario=Baseline&event_frequency=Frequent) for reference Study "[Advanced Screening Alba Iulia](https://csis-dev.myclimateservice.eu/study/33)" (CSIS ID: 33, EMIKAT ID: 3209):

![image](https://user-images.githubusercontent.com/1788226/88927322-89057980-d277-11ea-82ac-e9578ffbf200.png)

#### [HazardLocalEffectsTable](https://github.com/clarity-h2020/simple-table-component/blob/dev/src/components/HazardLocalEffectsTable.js)

[CharacteriseHazardTable](https://csis-dev.myclimateservice.eu/apps/simple-table-component/build/HazardLocalEffectsTable/?host=https://csis-dev.myclimateservice.eu&study_uuid=3d8327f4-c47f-4c9e-bbc3-fb9018ea9607&study_area=POLYGON((23.555632%2046.059224,23.555632%2046.085305,23.60095%2046.085305,23.60095%2046.059224,23.555632%2046.059224))&emikat_id=3209&datapackage_uuid=2434ce93-93d4-4ca2-8618-a2de768d3f16&time_period=Baseline&emissions_scenario=Baseline&event_frequency=Frequent) for reference Study "[Advanced Screening Alba Iulia](https://csis-dev.myclimateservice.eu/study/33)" (CSIS ID: 33, EMIKAT ID: 3209):

![image](https://user-images.githubusercontent.com/1788226/88927879-61fb7780-d278-11ea-8c99-d6452cfffbee.png)

#### [ExposureTable](https://github.com/clarity-h2020/simple-table-component/blob/dev/src/components/ExposureTable.js)

[ExposureTable](https://csis-dev.myclimateservice.eu/apps/simple-table-component/build/ExposureTable/?host=https://csis-dev.myclimateservice.eu&study_uuid=3d8327f4-c47f-4c9e-bbc3-fb9018ea9607&study_area=POLYGON((23.555632%2046.059224,23.555632%2046.085305,23.60095%2046.085305,23.60095%2046.059224,23.555632%2046.059224))&emikat_id=3209&datapackage_uuid=2434ce93-93d4-4ca2-8618-a2de768d3f16&time_period=Baseline&emissions_scenario=Baseline&event_frequency=Frequent) for reference Study "[Advanced Screening Alba Iulia](https://csis-dev.myclimateservice.eu/study/33)" (CSIS ID: 33, EMIKAT ID: 3209):

![image](https://user-images.githubusercontent.com/1788226/88927778-3aa4aa80-d278-11ea-8238-f035eb02397d.png)

#### [RiskAndImpactTable](https://github.com/clarity-h2020/simple-table-component/blob/dev/src/components/RiskAndImpactTable.js)

[RiskAndImpactTable](https://csis-dev.myclimateservice.eu/apps/simple-table-component/build/RiskAndImpactTable/?host=https://csis-dev.myclimateservice.eu&study_uuid=3d8327f4-c47f-4c9e-bbc3-fb9018ea9607&study_area=POLYGON((23.555632%2046.059224,23.555632%2046.085305,23.60095%2046.085305,23.60095%2046.059224,23.555632%2046.059224))&emikat_id=3209&datapackage_uuid=2434ce93-93d4-4ca2-8618-a2de768d3f16&time_period=Baseline&emissions_scenario=Baseline&event_frequency=Frequent) for reference Study "[Advanced Screening Alba Iulia](https://csis-dev.myclimateservice.eu/study/33)" (CSIS ID: 33, EMIKAT ID: 3209):

![image](https://user-images.githubusercontent.com/1788226/88921697-3fb12c00-d26f-11ea-9fc4-e6d796074151.png)

#### [AdaptationOptionsAppraisalTable](https://github.com/clarity-h2020/simple-table-component/blob/dev/src/components/AdaptationOptionsAppraisalTable.js)

[AdaptationOptionsAppraisalTable](https://csis-dev.myclimateservice.eu/apps/simple-table-component/build/AdaptationOptionsAppraisalTable/?host=https://csis-dev.myclimateservice.eu&study_uuid=3d8327f4-c47f-4c9e-bbc3-fb9018ea9607&study_area=POLYGON((23.555632%2046.059224,23.555632%2046.085305,23.60095%2046.085305,23.60095%2046.059224,23.555632%2046.059224))&emikat_id=3209&datapackage_uuid=2434ce93-93d4-4ca2-8618-a2de768d3f16&time_period=Baseline&emissions_scenario=Baseline&event_frequency=Frequent) for reference Study "[Advanced Screening Alba Iulia](https://csis-dev.myclimateservice.eu/study/33)" (CSIS ID: 33, EMIKAT ID: 3209):

![image](https://user-images.githubusercontent.com/1788226/88926864-ddf4c000-d276-11ea-903f-374bee50de0e.png)

Same as RiskAndImpactTable. In addition shows also Adaptation Scenarios.

## Tests

The same Unit Tests as for [csis-helpers-js](https://github.com/clarity-h2020/csis-helpers-js/#tests) are performed. UI Integration Tests are implemented with help of [cypress.io](https://www.cypress.io/) in repository [csis-technical-validation](https://github.com/clarity-h2020/csis-technical-validation).

Apart from that, the different table components can be manually tested locally with `yarn start`. Although they are served from localhost, the user must be logged-in in either [csis](https://csis.myclimateservice.eu/) or [csis-dev](https://csis-dev.myclimateservice.eu/).  

Example URL for testing HazardLocalEffectsTable locally against study `3183` and Baseline Scenario:

`http://localhost:3000/HazardLocalEffectsTable/?host=https://csis-dev.myclimateservice.eu&study_uuid=9359e741-df40-4bcd-9faf-2093b499c65c&study_area=POLYGON%20((16.346111%2048.223997,%2016.346111%2048.238634,%2016.376667%2048.238634,%2016.376667%2048.223997,%2016.346111%2048.223997))&emikat_id=3183&datapackage_uuid=2434ce93-93d4-4ca2-8618-a2de768d3f16&time_period=Baseline&emissions_scenario=Baseline&event_frequency=Rare`

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

The **dev** branch is automatically built on [cismet CI](https://ci.cismet.de/view/CLARITY/job/simple-table-component/) based on [this](https://github.com/clarity-h2020/simple-table-component/blob/dev/Jenkinsfile) pipeline definition. 

### Dependencies 

Dependencies can be easily upgraded with [npm-upgrade](https://www.npmjs.com/package/npm-upgrade):

``npx npm-upgrade``

The advantage over `yarn upgrade` is that that `package.json` is updated with the new dependency version.

### Deployment on CSIS

Although Simple Table Component is integrated in [CI](https://ci.cismet.de/view/CLARITY/job/simple-table-component/), deployment on CSIS is not automated. The following manual steps are required on `cisis-dev.ait.ac.at` and `cisis.ait.ac.at`:

```sh
sudo su docker
cd /docker/100-csis/drupal-data/web/apps/simple-table-component/

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

The different tables are selected by the corresponding route, e.g. `/AdaptationOptionsAppraisalTable` for the AdaptationOptionsAppraisalTable. The query parameters supported by the table are:

- `host` CSIS API host (e.g. https://csis.myclimateservice.eu/)
- `emikat_id` internal EMIKAT Study id (e.g. 3209)
- `rownum` number of rows requested from EMIKAT API (default: 3000)
- `time_period` (e.g. Baseline)
- `emissions_scenario` (e.g. Baseline)
- `event_frequency` (e.g. Frequent)

Query parameters are mapped to respective props in [App.js](https://github.com/clarity-h2020/simple-table-component/blob/dev/src/App.js). For more information on query parameters refer to [CSISHelpers.defaultQueryParams](https://github.com/clarity-h2020/csis-helpers-js/blob/dev/src/lib/CSISHelpers.js#L43) and for props to [GenericEmikatClient.propTypes](https://github.com/clarity-h2020/simple-table-component/blob/dev/src/components/commons/GenericEmikatClient.js#L97) and [ParameterSelectionComponent.propTypes](https://github.com/clarity-h2020/simple-table-component/blob/dev/src/components/commons/ParameterSelectionComponent.js#L158).

### Integration in CSIS

The application is integrated as *"Extended iFrame"* in [CSIS Drupal System](https://csis-dev.myclimateservice.eu/). The respective Drupal *Nodes* that contains the [iFrame](https://csis-dev.myclimateservice.eu/apps/simple-table-component/build/) are listed [here](https://csis-dev.myclimateservice.eu/admin/content?title=Table+Component&type=extended_iframe&status=1&langcode=All).

The application is configured via the aforementioned query parameters. The query parameters are extracted by [csis_iframe_connector.js](https://github.com/clarity-h2020/csis-helpers-module/blob/dev/js/csis_iframe_connector.js) from the `studyInfo` object which is injected into the main Drupal CSIS Website via the [CSIS Helpers Drupal Module](https://github.com/clarity-h2020/csis-helpers-module/), in particular by [StudyInfoGenerator.php](https://github.com/clarity-h2020/csis-helpers-module/blob/dev/src/Utils/StudyInfoGenerator.php).

The *"Extended iFrame"* nodes  are used in several [EU-GL Step Templates](https://csis-dev.myclimateservice.eu/admin/content?title=Template&type=gl_step&status=1&langcode=All) as **[Extended iFrame] Table Application**, e.g. in EU-GL Steps Impact/Risk Assessment and Adaptation Options Appraisal.

## License
 
MIT © [cismet GmbH](https://github.com/cismet)