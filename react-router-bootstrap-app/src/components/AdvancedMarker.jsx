import { useEffect, useRef } from 'react';

export default function AdvancedMarker({ map, position, title }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google || !window.google.maps || !window.google.maps.marker) return;

    const { AdvancedMarkerElement } = window.google.maps.marker;

    if (!markerRef.current) {
      markerRef.current = new AdvancedMarkerElement({
        map,
        position,
        title,
      });
    } else {
      markerRef.current.position = position;
      markerRef.current.title = title;
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [map, position, title]);

  return null;
}
