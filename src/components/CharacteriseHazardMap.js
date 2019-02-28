import React from "react";
import ReactDOM from 'react-dom';
import MapComponent from './commons/MapComponent';
import Wkt from 'wicket';
import turf from 'turf';

//const CharacteriseHazardMap = () => {
//    return (<img width={1058} height={578} src='../../../../../../modules/custom/map-component/src/img/CharacteriseHazard.png' />);
//};

export default class CharacteriseHazardMap extends React.Component {
  constructor(props) {
    super(props);
    var geom  = { "type": "Polygon",
      "coordinates": [
          [[30, 10], [40, 40], [20, 40], [10, 20], [30, 10]]
      ]
    };
    const corner1 = [39.853294, 13.305573];
    const corner2 = [41.853294, 15.305573];
    this.state ={
      baseLayers: [
        {
          name: 'tile-texture-1',
          title: 'OpenStreetMap'
        }
      ],
      checkedBaseLayer: 'tile-texture-1',
      overlays: [
        {
          checked: false,
          groupTitle: "Heat Wave",
          name: "Heat_Waves_1971_-_2001",
          title: "Heat Waves 1971 - 2001 RCP26",
          layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_historical_r12i1p1_SMHI-RCA4_v1_day_19710101-20001231_netcdf3",
          url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
        },
        {
          checked:false,
          groupTitle:"Heat Wave",
          name:"Heat_Waves_2011_-_2040",
          title:"Heat Waves 2011 - 2040 RCP26",
          layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp26_r12i1p1_SMHI-RCA4_v1_day_20110101-20401231_netcdf3",
          url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
        },
        {
          checked:false,
          groupTitle:"Heat Wave",
          name:"Heat_Waves_2041_-_2070",
          title:"Heat Waves 2041 - 2070 RCP26",
          layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp26_r12i1p1_SMHI-RCA4_v1_day_20410101-20701231_netcdf3",
          url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
        },
        {
          checked:false,
          groupTitle:"Heat Wave",
          name:"Heat_Waves_2071_-_2100",
          title:"Heat Waves 2071 - 2100 RCP26",
          layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp26_r12i1p1_SMHI-RCA4_v1_day_20710101-21001231_netcdf3",
          url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
        },
        {
          checked:false,
          groupTitle:"Heat Wave",
          name:"Heat_Waves_2011_-_2040_rcp_45",
          title:"Heat_Waves 2011 - 2040 RCP45",
          layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp45_r12i1p1_SMHI-RCA4_v1_day_20110101-20401231_netcdf3",
          url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
        },
        {
          checked:false,
          groupTitle:"Heat Wave",
          name:"Heat_Waves_2041_-_2070_rcp_45",
          title:"Heat_Waves 2041 - 2070 RCP45",
          layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp45_r12i1p1_SMHI-RCA4_v1_day_20410101-20701231_netcdf3",
          url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
        },
        {
          checked:false,
          groupTitle:"Heat Wave",
          name:"Heat_Waves_2071_-_2100_rcp_45",
          title:"Heat_Waves 2071 - 2100 RCP45",
          layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp45_r12i1p1_SMHI-RCA4_v1_day_20710101-21001231_netcdf3",
          url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
        },
        {
          checked:false,
          groupTitle:"Heat Wave",
          name:"Heat_Waves_2011_-_2040_rcp_85",
          title:"Heat_Waves 2011 - 2040 RCP85",
          layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp85_r12i1p1_SMHI-RCA4_v1_day_20110101-20401231_netcdf3",
          url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
        },
        {
          checked:false,
          groupTitle:"Heat Wave",
          name:"Heat_Waves_2041_-_2070_rcp_85",
          title:"Heat_Waves 2041 - 2070 RCP85",
          layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp85_r12i1p1_SMHI-RCA4_v1_day_20410101-20701231_netcdf3",
          url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
        },
        {
          checked:false,
          groupTitle:"Heat Wave",
          name:"Heat_Waves_2071_-_2100_rcp_85",
          title:"Heat_Waves 2071 - 2100 RCP85",
          layers: "clarity:Tx75p_consecutive_max_EUR-11_ICHEC-EC-EARTH_rcp85_r12i1p1_SMHI-RCA4_v1_day_20710101-21001231_netcdf3",
          url: "https://clarity.meteogrid.com/geoserver/clarity/wms"
        }
      ],
      tileLayerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      maps: [
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'http://www.google.cn/maps/vt?lyrs=s@189&gl=tr&x={x}&y={y}&z={z}',
        'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      bounds: [corner1, corner2],
      countryPolygon: {
        "type": "Feature",
        "properties": {
            "popupContent": "country",
            "style": {
                weight: 2,
                color: "black",
                opacity: 0.3,
                fillColor: "#ff0000",
                fillOpacity: 0.1
            }
        },
        "geometry": geom
      }
    };
  }  

  setStudyURL(id, hostName) {
    this.setState({
        studyId: id,
        hname: hostName
    });
    const comp = this;
    fetch(hostName + '/jsonapi/group/study?filter[id][condition][path]=id&filter[id][condition][operator]=%3D&filter[id][condition][value]=' + id, {credentials: 'include'})
    .then((resp) => resp.json())
    .then(function(data) {
      var wktVar = new Wkt.Wkt();
      if (data.data[0] != null) {
        comp.setUUId(data.data[0].id)
      }
      if (data.data[0].attributes.field_area != null && data.data[0].attributes.field_area.value != null) {
        wktVar.read(data.data[0].attributes.field_area.value);
        comp.setStudyAreaGeom(JSON.stringify(wktVar.toJson()));
      }
    })
    .catch(function(error) {
      console.log(JSON.stringify(error));
    });         
  }

  getTokenUrl() {
    return this.state.hname + '/rest/session/token';
  }

  setUUId(id) {
    this.setState({
      uuid: id
    });
  }

  setStudyAreaGeom(geome) {
    if (geome != null) {
        var study = {
          "type": "Feature",
          "properties": {
              "popupContent": "study",
              "style": {
                  weight: 2,
                  color: "black",
                  opacity: 0.3,
                  fillColor: "#ff0000",
                  fillOpacity: 0.1
              }
          },
          "geometry": JSON.parse(geome)
        };
        this.setState({
          studyAreaPolygon: null
        });
        this.setState({
          studyAreaPolygon: study,
          bounds: this.getBoundsFromArea(JSON.parse(geome))
        });
    }
  }

  getBoundsFromArea(area) {
    const bboxArray = turf.bbox(area);
    const corner1 = [bboxArray[1], bboxArray[0]];
    const corner2 = [bboxArray[3], bboxArray[2]];
    var bounds = [corner1, corner2];

    return bounds;
  }


  render() {
    window.specificMapComponent = this;

    return (
      <MapComponent 
      bounds={this.state.bounds}
      baseLayers={this.state.baseLayers}
      checkedBaseLayer={this.state.checkedBaseLayer}
      exclusiveGroups={{}}
      overlays={this.state.overlays}
      tileLayerUrl={this.state.tileLayerUrl}
      studyAreaPolygon={this.state.studyAreaPolygon}
      maps={this.state.maps} />
    );
  }
};
  
//export default CharacteriseHazardMap;

if (document.getElementById('characteriseHazard-map-container') != null) {
    ReactDOM.render(<CharacteriseHazardMap />, document.getElementById('characteriseHazard-map-container'));
    document.getElementById('characteriseHazard-map-container').style.width = "100%";
    document.getElementById('characteriseHazard-map-container').style.height = "500px";
  }