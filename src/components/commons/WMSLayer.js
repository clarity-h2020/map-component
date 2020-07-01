import { MapLayer, withLeaflet } from 'react-leaflet';
import * as WMS from 'leaflet.wms';
import isEqual from 'fast-deep-equal'
import log from 'loglevel';

log.enableAll();

const LegacyWMSLayer = WMS.Source.extend({
    'onRemove': function () {
        log.debug('onRemove');
        var subLayers = Object.keys(this._subLayers).join(",");
        if (!this._map) {
            return
        }
        if (subLayers) {
            log.debug('remove ' + subLayers);
            this._overlay.remove();
        }
    },
    'parseFeatureInfo': function (result, url) {
        // Hook to handle parsing AJAX response
        if (result && result === "error") {
            // AJAX failed, possibly due to CORS issues.
            // Try loading content in <iframe>.
            result = "<iframe src='" + url + "' style='border:none'>";
        }


        const layerName = getQueryVariable(url, 'layers');
        log.debug(`getFeatureInfo called for layer ${layerName} from ${url}`);
        var html = `<b>${layerName}</b><br>`;

        /*const study_variant = getQueryVariable(url, 'study_variant');
        html += study_variant ? `Study Variant: ${study_variant}<br>` : '';
        const time_period = getQueryVariable(url, 'time_period');
        html += time_period ? `Timeperiod: ${time_period}<br>` : '';
        const emissions_scenario =  getQueryVariable(url, 'emissions_scenario');
        html += emissions_scenario ? `Emissions Scenario: ${emissions_scenario}<br>` : '';
        const event_frequency =  getQueryVariable(url, 'event_frequency');
        html += event_frequency ? `Event Frequency: ${event_frequency}<br>` : '';
        html += '<br>'*/

        if (result) {
            try {
                const featureInfo = JSON.parse(result);

                if (featureInfo.features && featureInfo.features.length === 1 && featureInfo.features[0].properties) {
                    html += '<ul style="list-style: none;">'
                    const properties = featureInfo.features[0].properties;
                    var i = 0;
                    for (var property in properties) {
                        if (Object.prototype.hasOwnProperty.call(properties, property)) {
                            if (property !== 'BBOX' && property !== 'bbox') {
                                if (property !== 'GRAY_INDEX') {
                                    html += `<li>${property}: ${properties[property]}</li>`;
                                } else {
                                    html += `<li>value: ${properties[property]}</li>`;
                                }
                                i++;
                            }
                        }
                    }
                    if (i === 0) {
                        html += '<i>no values at selected location</i>';
                    }
                    html += '</ul>'
                } else {
                    html += '<i>no values at selected location</i>';
                }

            } catch (error) {
                log.error(`error parsing JSON from ${url}`, error);
                log.debug(result);
                html += 'SERVER ERROR: <i>invalid response, cannot show values.';
            }
        } else {
            html += '<i>no values at selected location</i>';
        }

        return html;
    }
});

/**
 * 
 * @param {*} variable 
 */
function getQueryVariable(url, variable) {
    var vars = url.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    log.warn(`query ${variable} not found`);
    return null;
}

const EVENTS_RE = /^on(.+)$/i;

class WMSLayer extends MapLayer {
    legacyWMSLayer = undefined;

    createLeafletElement(props) {
        const { url, ...params } = props
        const { leaflet: _l, ...options } = this.getOptions(params)
        const legacyWMSLayer = new LegacyWMSLayer(url, options).getLayer(props.layers);
        log.info(props.layers + ' created');
        return legacyWMSLayer;
    }

    updateLeafletElement(fromProps, toProps) {
        super.updateLeafletElement(fromProps, toProps)

        const { url: prevUrl, opacity: _po, zIndex: _pz, ...prevProps } = fromProps
        const { leaflet: _pl, ...prevParams } = this.getOptions(prevProps)
        const { url, opacity: _o, zIndex: _z, ...props } = toProps
        const { leaflet: _l, ...params } = this.getOptions(props)

        //log.debug('updating params ' + props.layers);

        if (url !== prevUrl) {
            this.leafletElement._source._overlay._overlay.setUrl(url);
        }

        if (!isEqual(params, prevParams)) {
            // don't ask  why...  the design of this component is somewhat awkward
            this.leafletElement._source._overlay.setParams(params);
            log.debug(props.layers + ' identify: ' + params.identify);
        }

        log.info(props.layers + ' updated');
    }

    getOptions(params) {
        const superOptions = super.getOptions(params)
        return Object.keys(superOptions).reduce((options, key) => {
            if (!EVENTS_RE.test(key)) {
                options[key] = superOptions[key]
            }
            return options
        }, {})
    }
}

export default withLeaflet(WMSLayer);