/* 
 * ***************************************************
 * 
 * cismet GmbH, Saarbruecken, Germany
 * 
 *               ... and it just works.
 * 
 * ***************************************************
 */

 // required because of https://github.com/clarity-h2020/simple-table-component/issues/4#issuecomment-595114163
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

 import { EMIKATHelpers } from 'csis-helpers-js';

test('[RELEASE] URL without EmikatId', () => {
	const url =
		'https://clarity.meteogrid.com/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=europe:HI_Tx75p-consecutive-max_historical_19710101-20001231_ensstd&bbox=2145500,982500,6606000,57065000&width=725&height=768&srs=EPSG:3035&format=image/png';
	const transformedUrl = EMIKATHelpers.addEmikatId(url, 'NO_ID');
	expect(url).toEqual(transformedUrl);
});

test('[RELEASE] URL with EmikatId', () => {
	/**
   * @type {String}
   */
	const url = `https://clarity.meteogrid.com/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=europe:HI_Tx75p-consecutive-max_historical_19710101-20001231_ensstd&bbox=2145500,982500,6606000,57065000&width=725&height=768&srs=EPSG:3035&format=image/png&EMIKAT_STUDY_ID=${EMIKATHelpers.EMIKAT_STUDY_ID}`;
	/**
   * @type {String}
   */
	const transformedUrl = EMIKATHelpers.addEmikatId(url, 31337);
	expect(url).not.toEqual(transformedUrl);
	expect(transformedUrl.includes('31337'));
});

test('[RELEASE] URL with EmikatId', () => {
	/**
   * @type {String}
   */
	const url = `https://service.emikat.at/geoserver/clarity/wms?CQL_FILTER=SZ_ID=${EMIKATHelpers.EMIKAT_STUDY_ID}`;
	/**
   * @type {String}
   */
	const transformedUrl = EMIKATHelpers.addEmikatId(url, 31337);
	expect(url).not.toEqual(transformedUrl);
	expect(transformedUrl.includes('$')).toBeFalsy();
	expect(transformedUrl.includes('31337')).toBeTruthy();
	expect(transformedUrl).toEqual('https://service.emikat.at/geoserver/clarity/wms?CQL_FILTER=SZ_ID=31337');
});
