import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useRef, useState } from 'react';

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '400px',
  marginTop: '1rem',
};

export default function InventoryMap({ locations }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['marker'], // must be static to avoid reloading
  });

  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  const parsedLocations = locations
    .map((loc) => {
      const [lat, lng] = loc.location.split(',').map((coord) => parseFloat(coord.trim()));
      return { lat, lng, name: loc.location_name };
    })
    .filter((loc) => !isNaN(loc.lat) && !isNaN(loc.lng));

  const center = parsedLocations.length > 0 ? parsedLocations[0] : { lat: 0, lng: 0 };

  useEffect(() => {
    if (!isLoaded || !mapInstance || !parsedLocations.length) return;

    const addAdvancedMarkers = async () => {
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
      
      parsedLocations.forEach((loc) => {
        const marker = new AdvancedMarkerElement({
          position: { lat: loc.lat, lng: loc.lng },
          map: mapInstance,
          title: loc.name,
        });
      });
    };

    addAdvancedMarkers();
  }, [isLoaded, mapInstance, parsedLocations]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={center}
      zoom={12}
      options={{ mapId: '15eaad764306adc0' }}
      onLoad={async (map) => {
        const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
        const bounds = new window.google.maps.LatLngBounds();
      
        inventories.forEach(inv => {
          const { lat, lng } = parseLatLng(inv.location);
          bounds.extend({ lat, lng });
      
          const marker = new AdvancedMarkerElement({
            map,
            position: { lat, lng },
            title: inv.location_name, // optional hover title
          });
      
          // Add a click listener to each marker
          marker.addListener('click', () => {
            window.alert(`Location: ${inv.location_name}`);
          });
        });
      
        map.fitBounds(bounds);
      }}
    />
  );
}
