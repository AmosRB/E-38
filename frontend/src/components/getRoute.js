const axios = require('axios');

/**
 * מקבל נקודת התחלה lat, lng ומחזיר מערך של קואורדינטות לאורך מסלול של כ~5 ק״מ
 */
async function getRoute(lat, lng) {
  try {
    // בונים יעד אקראי בקרבת המקום (סטייה קטנה)
    const destLat = lat + (Math.random() - 0.5) * 0.05;
    const destLng = lng + (Math.random() - 0.5) * 0.05;

    const url = `http://router.project-osrm.org/route/v1/driving/${lng},${lat};${destLng},${destLat}?overview=full&geometries=geojson`;

    const response = await axios.get(url);
    const coordinates = response.data.routes[0].geometry.coordinates;

    // OSRM מחזיר [lng, lat], צריך להפוך ל [lat, lng]
    const route = coordinates.map(coord => [coord[1], coord[0]]);
    return route;
  } catch (error) {
    console.error('Failed to get route from OSRM:', error);
    // fallback למסלול קצר אקראי
    return [
      [lat, lng],
      [lat + 0.001, lng + 0.001],
      [lat + 0.002, lng + 0.002],
    ];
  }
}

module.exports = getRoute;
