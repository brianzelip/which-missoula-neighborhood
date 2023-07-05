import { polygonContains } from 'https://cdn.skypack.dev/d3-polygon@3';
import * as ls from './localStorage.js';

const dataAPI =
  'https://services.arcgis.com/HfwHS0BxZBQ1E5DY/arcgis/rest/services/PoliticalBoundaries_mso/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';
const outputEl = document.querySelector('[data-output]');

navigator.geolocation.getCurrentPosition(geoSuccess, geoError);

/**
 * geoSuccess
 * @description Fetch external or local data, find neighborhood, update DOM,
 * set local data
 * @param {object} position - GeolocationPosition
 */
async function geoSuccess(position) {
  const lat = position.coords.latitude;
  const long = position.coords.longitude;
  const alt = position.coords.altitude;
  const point = [long, lat];

  let hoods;

  if (!ls.isAvailable() || !ls.get('NEIGHBORHOODSv1')) {
    const response = await fetch(dataAPI);
    hoods = await response.json();
  } else {
    hoods = JSON.parse(ls.get('NEIGHBORHOODSv1'));
  }

  const name = findHood(hoods, point);

  updateDOM(name, lat, long, alt);

  if (ls.isAvailable() && !ls.get('NEIGHBORHOODSv1')) {
    ls.set('NEIGHBORHOODSv1', JSON.stringify(hoods));
  }
}

function geoError(error) {
  outputEl.textContent = error.message;
}

/**
 * findHood
 * @param {object} data - GeoJSON data
 * @param {array} point - [long, lat]
 * @returns {string|Array|undefined}
 */
function findHood(data, point) {
  const hoods = data.features;
  const hood = hoods.filter((feature) => {
    // Two feature types: polygon, multipolygon
    const polygon =
      feature.geometry.type === 'Polygon'
        ? feature.geometry.coordinates[0]
        : feature.geometry.coordinates[0][0];

    return polygonContains(polygon, point);
  });

  if (hood.length === 1) {
    return hood[0].properties['FeatureName'];
  } else if (hood.length > 1) {
    return hood.map((h) => h.properties['FeatureName']); // multiple matches
  } else {
    return undefined; // no matches
  }
}

/**
 * updateDOM
 * @description Update DOM with neighborhood and position data
 * @param {string|Array|undefined} name name of neighborhood(s)
 * @param {string} lat latitude
 * @param {string} long longitude
 * @param {string} alt altitude
 */
function updateDOM(name, lat, long, alt) {
  const lat_long = `(${lat}, ${long})`;
  let nameEl;

  if (!name) {
    nameEl = `<h2>It appears you aren't in Missoula 🙃🏔️🌲🐻</h2>`;
  } else if (Array.isArray(name)) {
    nameEl = `<h2>${name.join(' or ')}</h2>`;
  } else if (typeof name === 'string') {
    nameEl = `<h2>${name}</h2>`;
  }

  const summary = `
  <ul>
    <li>Latitude: ${lat}</li>
    <li>Longitude: ${long}</li>
    <li>Altitude: ${alt}</li>
  </ul>`;
  const href = `https://duckduckgo.com/?q=${lat_long}`;
  const link = `<a style="display: block;" href="${href}">${lat_long}</a>`;

  outputEl.innerHTML = nameEl + summary + link;
}
