export type UserRole = 'citizen' | 'staff' | 'agency';

export type PickupStatus = 'REQUESTED' | 'SCHEDULED' | 'COLLECTED' | 'RECYCLED' | 'CANCELLED';

export type WasteCategory = 'Laptop' | 'Mobile Phone' | 'Television' | 'Battery' | 'Appliances' | 'Others';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  centerId?: string; // For staff members
  centerName?: string;
  ecoPoints?: number;
  createdAt: string;
}

export interface CollectionCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  operatingHours: string;
  capacityKgPerDay: number;
  currentLoadKg: number;
  latitude: number;
  longitude: number;
  acceptedCategories: WasteCategory[];
  staffCount: number;
}

export interface PickupRequest {
  id: string;
  trackingCode: string;
  citizenId: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone: string;
  
  // Step 1: Waste Details
  categories: WasteCategory[];
  estimatedItemsCount: number;
  wasteDescription: string;
  photoUrl?: string;
  
  // Step 2: Pickup Details
  pickupDate: string;
  preferredTimeSlot: string; // e.g. "09:00 AM - 12:00 PM"
  preferredContact: string; // e.g. "Phone", "Email", "SMS"
  pickupType: 'Doorstep Pickup' | 'Drop-off at Center';
  specialInstructions?: string;
  
  // Step 3: Address Details
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  landmark?: string;
  
  // Center Assignment & Staff Actions
  centerId: string;
  centerName: string;
  status: PickupStatus;
  
  // Processing Metrics (Step 4 & Staff)
  serviceCharge: number; // 0 for FREE
  actualWeightKg?: number;
  collectedAt?: string;
  recycledAt?: string;
  materialsRecovered?: {
    metalsKg: number;
    plasticsKg: number;
    glassKg: number;
    hazardousKg: number;
  };
  pointsAwarded?: number;
  staffNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface PlatformAnalytics {
  totalPickups: number;
  completedPickups: number;
  activePickups: number;
  totalWasteRecycledKg: number;
  happyCitizensCount: number;
  collectionCentersCount: number;
  co2EmissionsSavedKg: number;
  toxicDivertedKg: number;
  metalsRecoveredKg: number;
  categoryBreakdown: { category: WasteCategory; count: number; weightKg: number }[];
  statusBreakdown: { status: PickupStatus; count: number }[];
  centerPerformance: {
    centerId: string;
    centerName: string;
    city: string;
    totalProcessedKg: number;
    activePickups: number;
    completedPickups: number;
  }[];
  recentActivity: {
    id: string;
    type: 'NEW_REQUEST' | 'STATUS_CHANGE' | 'RECYCLING_LOGGED';
    message: string;
    timestamp: string;
    requestId?: string;
  }[];
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'Voucher' | 'Eco-Goodies' | 'Tree Planting' | 'Certificate';
  icon: string;
}

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
  requestId?: string;
}
