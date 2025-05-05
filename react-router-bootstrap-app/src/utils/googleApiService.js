export async function getAddressFromLatLng(lat, lng) {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
  
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      return false;
    }
  }
  