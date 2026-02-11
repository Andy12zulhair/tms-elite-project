
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

interface MapViewProps {
  markers: Array<{
    id: string;
    position: [number, number];
    label: string;
    type: 'driver' | 'origin' | 'destination';
  }>;
}

const MapView: React.FC<MapViewProps> = ({ markers }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      if (!leafletInstance.current) {
        leafletInstance.current = L.map(mapRef.current).setView([-6.2088, 106.8456], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(leafletInstance.current);
      }

      const map = leafletInstance.current;

      // Clear existing markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      const bounds: L.LatLngExpression[] = [];

      markers.forEach((m) => {
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg ${
              m.type === 'driver' ? 'bg-blue-500' : m.type === 'origin' ? 'bg-green-500' : 'bg-red-500'
            }">
              <div class="w-2 h-2 rounded-full bg-white"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        L.marker(m.position, { icon })
          .addTo(map)
          .bindPopup(`<b>${m.label}</b><br/>${m.type.toUpperCase()}`);

        bounds.push(m.position);
      });

      if (bounds.length > 0) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50] });
      }

      setIsLoading(false);
      setMapError(null);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to load map. Please refresh the page.');
      setIsLoading(false);
    }

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [markers]);

  if (mapError) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-red-500 mb-2">{mapError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="h-full w-full min-h-[400px]" />;
};

export default MapView;
