
import { Vehicle, Driver, Order, VehicleStatus, DriverStatus, ShipmentStatus } from './types';

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'V1', platNo: 'B 1234 ABC', type: 'Wingbox', capacity: 20000, fuelConsumption: '1:4', status: VehicleStatus.AVAILABLE, lastMaintenance: '2023-12-01', nextMaintenance: '2024-06-01' },
  { id: 'V2', platNo: 'B 5678 DEF', type: 'CDD', capacity: 4000, fuelConsumption: '1:8', status: VehicleStatus.IN_TRANSIT, lastMaintenance: '2023-11-15', nextMaintenance: '2024-05-15' },
  { id: 'V3', platNo: 'B 9012 GHI', type: 'CDE', capacity: 2000, fuelConsumption: '1:10', status: VehicleStatus.MAINTENANCE, lastMaintenance: '2024-01-10', nextMaintenance: '2024-02-10' },
  { id: 'V4', platNo: 'D 4321 XYZ', type: 'Blind Van', capacity: 800, fuelConsumption: '1:12', status: VehicleStatus.AVAILABLE, lastMaintenance: '2024-01-05', nextMaintenance: '2024-07-05' },
];

export const MOCK_DRIVERS: Driver[] = [
  { id: 'D1', name: 'Budi Santoso', phone: '08123456789', simType: 'B1 Umum', rating: 4.8, status: DriverStatus.ACTIVE, currentLocation: [-6.2088, 106.8456] },
  { id: 'D2', name: 'Slamet Rahardjo', phone: '08129876543', simType: 'B2 Umum', rating: 4.5, status: DriverStatus.IDLE },
  { id: 'D3', name: 'Andi Wijaya', phone: '08134455667', simType: 'A', rating: 4.9, status: DriverStatus.OFF_DUTY },
];

export const MOCK_ORDERS: Order[] = [
  { 
    id: 'ORD-001', 
    itemDetail: 'Electronic Components', 
    origin: 'Tangerang', 
    originCoords: [-6.1783, 106.6319], 
    destination: 'Bandung', 
    destCoords: [-6.9175, 107.6191], 
    weight: 500, 
    volume: 2, 
    status: ShipmentStatus.IN_TRANSIT 
  },
  { 
    id: 'ORD-002', 
    itemDetail: 'Medical Supplies', 
    origin: 'Jakarta Pusat', 
    originCoords: [-6.1751, 106.8650], 
    destination: 'Surabaya', 
    destCoords: [-7.2575, 112.7521], 
    weight: 1200, 
    volume: 5, 
    status: ShipmentStatus.CREATED 
  },
];
