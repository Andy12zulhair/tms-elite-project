import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const FleetMap = ({ vehicles }) => {
  const centerPosition: LatLngTuple = [-6.200000, 106.816666];

  return (
    <div className="h-96 w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 z-0">
      <MapContainer
        center={centerPosition}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {vehicles && vehicles.map((vehicle, index) => (
          vehicle.latitude && vehicle.longitude ? (
            <Marker
              key={index}
              position={[vehicle.latitude, vehicle.longitude]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{vehicle.plat_no}</h3>
                  <p className="text-sm text-gray-600">{vehicle.type}</p>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${vehicle.status === 'available' ? 'bg-green-500' :
                    vehicle.status === 'maintenance' ? 'bg-red-500' : 'bg-blue-500'
                    }`}>
                    {vehicle.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
};

export default FleetMap;