import { polygonContains } from 'https://cdn.skypack.dev/d3-polygon@3';

const dataAPI =
  'https://services.arcgis.com/HfwHS0BxZBQ1E5DY/arcgis/rest/services/PoliticalBoundaries_mso/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';
const outputEl = document.querySelector('[data-output]');

function geoSuccess(position) {
  const lat = position.coords.latitude;
  const long = position.coords.longitude;
  const alt = position.coords.altitude;
  const lat_long = `(${lat}, ${long})`;
  const point = [long, lat];

  fetch(dataAPI).then((response) => {
    response
      .json()
      .then((data) => {
        const features = data.features;
        const neighborhood = features.filter((feature) => {
          // Two feature types: polygon, multipolygon
          const polygon =
            feature.geometry.type === 'Polygon'
              ? feature.geometry.coordinates[0]
              : feature.geometry.coordinates[0][0];

          return polygonContains(polygon, point);
        });

        return neighborhood[0].properties['FeatureName'];
      })
      .then((name) => {
        const nameEl = `<h2>${name}</h2>`;
        const summary = `
        <ul>
          <li>Latitude: ${lat}</li>
          <li>Longitude: ${long}</li>
          <li>Altitude: ${alt}</li>
        </ul>`;
        const href = `https://duckduckgo.com/?q=${lat_long}`;
        const link = `<a style="display: block;" href="${href}">${lat_long}</a>`;

        outputEl.innerHTML = nameEl + summary + link;
      });
  });
}

function geoError(error) {
  outputEl.textContent = error.message;
}

navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
