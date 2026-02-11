
export enum UserRole {
  ADMIN = 'Admin',
  DISPATCHER = 'Dispatcher',
  MANAGER = 'Manager'
}

export enum VehicleStatus {
  AVAILABLE = 'Available',
  MAINTENANCE = 'Maintenance',
  IN_TRANSIT = 'In Transit'
}

export enum DriverStatus {
  ACTIVE = 'Active',
  IDLE = 'Idle',
  OFF_DUTY = 'Off Duty'
}

export enum ShipmentStatus {
  CREATED = 'Created',
  ASSIGNED = 'Assigned',
  PICKED_UP = 'Picked Up',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  POD_UPLOADED = 'POD Uploaded'
}

export interface Vehicle {
  id: string;
  platNo: string;
  type: 'Blind Van' | 'CDE' | 'CDD' | 'Wingbox';
  capacity: number;
  fuelConsumption: string;
  status: VehicleStatus;
  lastMaintenance: string;
  nextMaintenance: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  simType: string;
  rating: number;
  status: DriverStatus;
  currentLocation?: [number, number];
}

export interface Order {
  id: string;
  itemDetail: string;
  origin: string;
  originCoords: [number, number];
  destination: string;
  destCoords: [number, number];
  weight: number;
  volume: number;
  status: ShipmentStatus;
}

export interface Shipment {
  id: string;
  orderId: string;
  driverId: string;
  vehicleId: string;
  status: ShipmentStatus;
  startTime: string;
  estimatedDelivery: string;
}

export interface FinanceRecord {
  id: string;
  shipmentId: string;
  type: 'Toll' | 'Fuel' | 'Parking' | 'Other';
  amount: number;
  date: string;
  description: string;
}
