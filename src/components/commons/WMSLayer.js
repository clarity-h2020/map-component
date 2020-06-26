import { MapLayer, withLeaflet } from "react-leaflet";
import * as WMS from "leaflet.wms";
import isEqual from 'fast-deep-equal'
import log from 'loglevel';

log.enableAll();

const LegacyWMSLayer = WMS.Source.extend({
    onRemove: function () {
        log.debug('onRemove');
        var subLayers = Object.keys(this._subLayers).join(",");
        if (!this._map) {
            return
        }
        if (subLayers) {
            log.debug('remove ' + subLayers);
            this._overlay.remove();
        }
    }
});

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

        log.debug('updateLeafletElement');

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