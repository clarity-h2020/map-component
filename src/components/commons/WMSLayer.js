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
                    if(i === 0) {
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
    log.warn('query variable %s not found', variable);
}

const EVENTS_RE = /^on(.+)$/i;

class WMSLayer extends MapLayer {
    legacyWMSLayer = undefined;

    createLeafletElement(props) {
        const { url, ...params } = props
        const { leaflet: _l, ...options } = this.getOptions(params)
        this.legacyWMSLayer = new LegacyWMSLayer(url, options);
        log.info(props.layers + ' created');
        return this.legacyWMSLayer.getLayer(props.layers);
    }

    updateLeafletElement(fromProps, toProps) {
        super.updateLeafletElement(fromProps, toProps)


        const { url: prevUrl, opacity: _po, zIndex: _pz, ...prevProps } = fromProps
        const { leaflet: _pl, ...prevParams } = this.getOptions(prevProps)
        const { url, opacity: _o, zIndex: _z, ...props } = toProps
        const { leaflet: _l, ...params } = this.getOptions(props)

        if (url !== prevUrl) {
            if (this.legacyWMSLayer) {
                this.legacyWMSLayer.setUrl(url)
            }

        }

        if (!isEqual(params, prevParams)) {
            if (this.legacyWMSLayer) {
                this.legacyWMSLayer.setParams(params)
            }
        }
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