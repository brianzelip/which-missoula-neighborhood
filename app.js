import { polygonContains } from 'https://cdn.skypack.dev/d3-polygon@3';

const dataAPI =
  'https://services.arcgis.com/HfwHS0BxZBQ1E5DY/arcgis/rest/services/PoliticalBoundaries_mso/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson';
const outputEl = document.querySelector('[data-output]');

async function fetchData(pos) {
  const response = await fetch(dataAPI);
  return response.json();
}

// Get the user's geolocation data and display the coordinates and altitude
// in outputEl
function geoSuccess(position) {
  const lat = position.coords.latitude;
  const long = position.coords.longitude;
  const coordsAsText = `${lat}, ${long}`;
  const point = [long, lat];

  // data.features.filter((feature) => {
  //   // Two feature types: polygon, multipolygon
  //   const isPolygon = feature.geometry.type === 'Polygon';
  //   const polygon = isPolygon
  //     ? feature.geometry.coordinates[0]
  //     : feature.geometry.coordinates[0][0];
  //   return polygonContains(polygon, point);
  // });

  fetch(dataAPI).then((response) => {
    response
      .json()
      .then((data) => {
        const features = data.features;
        const filteredFeatures = features.filter((feature) => {
          // Two feature types: polygon, multipolygon
          const isPolygon = feature.geometry.type === 'Polygon';
          const polygon = isPolygon
            ? feature.geometry.coordinates[0]
            : feature.geometry.coordinates[0][0];
          return polygonContains(polygon, point);
        });
        return filteredFeatures[0].properties['FeatureName'];
      })
      .then((name) => {
        const summary = `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}, Altitude: ${position.coords.altitude}`;
        const lat_long = `(${position.coords.latitude}, ${position.coords.longitude})`;
        const href = `https://duckduckgo.com/?q=${lat_long}`;
        const link = `<a style="display: block;" href="${href}">${lat_long}</a>`;
        const nameEl = `<h2>${name}</h2>`;
        outputEl.innerHTML = nameEl + summary + link;
      });
  });

  // fetchData().then((data) => console.log(data));
  // const summary = `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}, Altitude: ${position.coords.altitude}`;
  // const lat_long = `(${position.coords.latitude}, ${position.coords.longitude})`;
  // const href = `https://duckduckgo.com/?q=${lat_long}`;
  // const link = `<a style="display: block;" href="${href}">${lat_long}</a>`;

  // outputEl.innerHTML = summary + link;
}

// If the user denies geolocation, display an error message in outputEl.
function geoError(error) {
  outputEl.textContent = error.message;
}

// Get the user's geolocation data.
navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
