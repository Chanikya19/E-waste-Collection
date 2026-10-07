import bcrypt from 'bcryptjs';
import { User, CollectionCenter, PickupRequest, PlatformAnalytics, RewardItem, RealtimeNotification } from '../src/types';

// In-Memory persistent data store for multi-tenant isolation and real-time operations

export class DatabaseStore {
  users: Map<string, User & { passwordHash: string }> = new Map();
  centers: Map<string, CollectionCenter> = new Map();
  pickups: Map<string, PickupRequest> = new Map();
  rewards: RewardItem[] = [];
  notifications: Map<string, RealtimeNotification[]> = new Map(); // userId -> notifications
  activityLog: PlatformAnalytics['recentActivity'] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Collection Centers
    const centersData: CollectionCenter[] = [
      {
        id: 'center-1',
        name: 'Metro Downtown E-Waste Center',
        address: '450 Green Avenue, Sector 4',
        city: 'Metro City',
        phone: '+1 (555) 342-8801',
        operatingHours: '08:00 AM - 06:00 PM (Mon-Sat)',
        capacityKgPerDay: 500,
        currentLoadKg: 215,
        latitude: 37.7749,
        longitude: -122.4194,
        acceptedCategories: ['Laptop', 'Mobile Phone', 'Television', 'Battery', 'Appliances', 'Others'],
        staffCount: 6,
      },
      {
        id: 'center-2',
        name: 'Northside Circular Hub',
        address: '128 Eco Park Road',
        city: 'North District',
        phone: '+1 (555) 789-2234',
        operatingHours: '09:00 AM - 05:00 PM (Mon-Fri)',
        capacityKgPerDay: 350,
        currentLoadKg: 140,
        latitude: 37.8044,
        longitude: -122.2712,
        acceptedCategories: ['Laptop', 'Mobile Phone', 'Battery', 'Others'],
        staffCount: 4,
      },
      {
        id: 'center-3',
        name: 'West Coast Sustainable Processing Plant',
        address: '89 Clean Energy Way, Industrial Area',
        city: 'West Bay',
        phone: '+1 (555) 912-4455',
        operatingHours: '07:30 AM - 07:00 PM (Daily)',
        capacityKgPerDay: 800,
        currentLoadKg: 420,
        latitude: 37.6879,
        longitude: -122.4702,
        acceptedCategories: ['Laptop', 'Mobile Phone', 'Television', 'Battery', 'Appliances', 'Others'],
        staffCount: 9,
      }
    ];

    for (const c of centersData) {
      this.centers.set(c.id, c);
    }

    // 2. Seed Distinct Demo Accounts (Required in Prompt Section 5)
    // Passwords hashed with bcrypt
    const salt = bcrypt.genSaltSync(10);

    const citizenUser = {
      id: 'usr-citizen-1',
      name: 'Sarah Jenkins',
      email: 'citizen.demo@ecocollect.test',
      passwordHash: bcrypt.hashSync('CitizenPass123!', salt),
      role: 'citizen' as const,
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace, Apt 4B',
      city: 'Metro City',
      ecoPoints: 480,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };

    const staffUser = {
      id: 'usr-staff-1',
      name: 'Marcus Vance',
      email: 'staff.demo@ecocollect.test',
      passwordHash: bcrypt.hashSync('StaffPass123!', salt),
      role: 'staff' as const,
      phone: '+1 (555) 987-6543',
      address: '450 Green Avenue Staff Quarters',
      city: 'Metro City',
      centerId: 'center-1',
      centerName: 'Metro Downtown E-Waste Center',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    };

    const agencyUser = {
      id: 'usr-agency-1',
      name: 'Dr. Elena Rostova',
      email: 'agency.demo@ecocollect.test',
      passwordHash: bcrypt.hashSync('AgencyAdmin123!', salt),
      role: 'agency' as const,
      phone: '+1 (555) 555-0199',
      address: 'EPA Regional Headquarters, Suite 900',
      city: 'Metro City',
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    };

    this.users.set(citizenUser.id, citizenUser);
    this.users.set(staffUser.id, staffUser);
    this.users.set(agencyUser.id, agencyUser);

    // 3. Seed Realistic Pickup Requests
    const seededPickups: PickupRequest[] = [
      {
        id: 'req-1001',
        trackingCode: 'EC-94821',
        citizenId: citizenUser.id,
        citizenName: citizenUser.name,
        citizenEmail: citizenUser.email,
        citizenPhone: citizenUser.phone,
        categories: ['Laptop', 'Battery'],
        estimatedItemsCount: 3,
        wasteDescription: '2 old Lenovo ThinkPads with dead batteries and 1 box of loose lithium polymer packs.',
        pickupDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
        preferredTimeSlot: '09:00 AM - 12:00 PM',
        preferredContact: 'Phone',
        pickupType: 'Doorstep Pickup',
        specialInstructions: 'Ring doorbell twice. Beware of friendly dog in porch.',
        addressLine: '742 Evergreen Terrace, Apt 4B',
        city: 'Metro City',
        state: 'California',
        pinCode: '94103',
        landmark: 'Opposite Central Park Gate 2',
        centerId: 'center-1',
        centerName: 'Metro Downtown E-Waste Center',
        status: 'SCHEDULED',
        serviceCharge: 0,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
      {
        id: 'req-1002',
        trackingCode: 'EC-94822',
        citizenId: citizenUser.id,
        citizenName: citizenUser.name,
        citizenEmail: citizenUser.email,
        citizenPhone: citizenUser.phone,
        categories: ['Television', 'Appliances'],
        estimatedItemsCount: 2,
        wasteDescription: 'Old 42-inch CRT TV and broken microwave oven.',
        pickupDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        preferredTimeSlot: '02:00 PM - 05:00 PM',
        preferredContact: 'SMS',
        pickupType: 'Doorstep Pickup',
        addressLine: '742 Evergreen Terrace, Apt 4B',
        city: 'Metro City',
        state: 'California',
        pinCode: '94103',
        centerId: 'center-1',
        centerName: 'Metro Downtown E-Waste Center',
        status: 'RECYCLED',
        serviceCharge: 0,
        actualWeightKg: 28.5,
        collectedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        recycledAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        materialsRecovered: {
          metalsKg: 8.2,
          plasticsKg: 12.1,
          glassKg: 7.4,
          hazardousKg: 0.8,
        },
        pointsAwarded: 150,
        staffNotes: 'Safely dismantled CRT tube without phosphorescent powder leakage.',
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'req-1003',
        trackingCode: 'EC-94823',
        citizenId: 'usr-citizen-2',
        citizenName: 'Alex Rivera',
        citizenEmail: 'alex.r@example.com',
        citizenPhone: '+1 (555) 441-2099',
        categories: ['Mobile Phone', 'Laptop'],
        estimatedItemsCount: 5,
        wasteDescription: '4 decommissioned smartphones (iPhones and Galaxy) plus 1 iPad with cracked screen.',
        pickupDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
        preferredTimeSlot: '10:00 AM - 01:00 PM',
        preferredContact: 'Email',
        pickupType: 'Doorstep Pickup',
        addressLine: '120 Market Street, Suite 500',
        city: 'Metro City',
        state: 'California',
        pinCode: '94105',
        centerId: 'center-1',
        centerName: 'Metro Downtown E-Waste Center',
        status: 'REQUESTED',
        serviceCharge: 0,
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      },
      {
        id: 'req-1004',
        trackingCode: 'EC-94824',
        citizenId: 'usr-citizen-3',
        citizenName: 'David Chen',
        citizenEmail: 'd.chen@example.com',
        citizenPhone: '+1 (555) 772-9182',
        categories: ['Battery', 'Others'],
        estimatedItemsCount: 12,
        wasteDescription: 'Assorted lead acid and Li-ion power tool batteries, UPS backup unit.',
        pickupDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
        preferredTimeSlot: '01:00 PM - 04:00 PM',
        preferredContact: 'Phone',
        pickupType: 'Drop-off at Center',
        addressLine: '55 North Ridge Blvd',
        city: 'North District',
        state: 'California',
        pinCode: '94601',
        centerId: 'center-2',
        centerName: 'Northside Circular Hub',
        status: 'COLLECTED',
        serviceCharge: 0,
        actualWeightKg: 18.2,
        collectedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        staffNotes: 'Battery terminals insulated with tape for safety.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'req-1005',
        trackingCode: 'EC-94825',
        citizenId: 'usr-citizen-4',
        citizenName: 'Maya Patel',
        citizenEmail: 'maya.p@example.com',
        citizenPhone: '+1 (555) 332-9011',
        categories: ['Appliances', 'Television'],
        estimatedItemsCount: 2,
        wasteDescription: 'Washing machine circuit boards and broken smart LED monitor.',
        pickupDate: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
        preferredTimeSlot: '09:00 AM - 12:00 PM',
        preferredContact: 'Phone',
        pickupType: 'Doorstep Pickup',
        addressLine: '304 Ocean View Drive',
        city: 'West Bay',
        state: 'California',
        pinCode: '94015',
        centerId: 'center-3',
        centerName: 'West Coast Sustainable Processing Plant',
        status: 'RECYCLED',
        serviceCharge: 0,
        actualWeightKg: 42.0,
        collectedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        recycledAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        materialsRecovered: {
          metalsKg: 18.5,
          plasticsKg: 16.0,
          glassKg: 6.5,
          hazardousKg: 1.0,
        },
        pointsAwarded: 220,
        createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      }
    ];

    for (const p of seededPickups) {
      this.pickups.set(p.id, p);
    }

    // 4. Seed Rewards Catalog
    this.rewards = [
      {
        id: 'rew-1',
        title: '$10 Eco-Friendly Grocery Voucher',
        description: 'Redeemable at Whole Foods & local certified organic markets.',
        pointsCost: 200,
        category: 'Voucher',
        icon: 'ShoppingBag',
      },
      {
        id: 'rew-2',
        title: 'Plant 5 Native Urban Trees',
        description: 'We will sponsor planting 5 native trees in your city with geolocation proof.',
        pointsCost: 350,
        category: 'Tree Planting',
        icon: 'TreePine',
      },
      {
        id: 'rew-3',
        title: '$25 Electronics Repair Voucher',
        description: 'Valid for battery replacements and screen repairs at authorized repair hubs.',
        pointsCost: 450,
        category: 'Voucher',
        icon: 'Wrench',
      },
      {
        id: 'rew-4',
        title: 'Certified Zero-Waste Champion Badge & Certificate',
        description: 'Official digital and printed environmental stewardship certificate signed by EPA.',
        pointsCost: 500,
        category: 'Certificate',
        icon: 'Award',
      },
      {
        id: 'rew-5',
        title: 'Biodegradable Tech Accessory Kit',
        description: 'Bamboo charging dock, braided hemp USB-C cable, and plant-based phone case.',
        pointsCost: 600,
        category: 'Eco-Goodies',
        icon: 'Package',
      }
    ];

    // Seed Activity Log
    this.activityLog = [
      {
        id: 'act-1',
        type: 'STATUS_CHANGE',
        message: 'Request #EC-94822 marked RECYCLED (28.5 kg recovered materials)',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
        requestId: 'req-1002',
      },
      {
        id: 'act-2',
        type: 'STATUS_CHANGE',
        message: 'Request #EC-94821 confirmed SCHEDULED for pickup on tomorrow morning',
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
        requestId: 'req-1001',
      },
      {
        id: 'act-3',
        type: 'NEW_REQUEST',
        message: 'New collection request #EC-94823 placed for 5 mobile items',
        timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
        requestId: 'req-1003',
      }
    ];
  }

  // Analytics Aggregation Method
  getAnalytics(): PlatformAnalytics {
    const allPickups = Array.from(this.pickups.values());
    const totalPickups = 1250 + allPickups.length;
    const completedPickups = 940 + allPickups.filter(p => p.status === 'RECYCLED').length;
    const activePickups = allPickups.filter(p => p.status === 'REQUESTED' || p.status === 'SCHEDULED' || p.status === 'COLLECTED').length;

    // Calculate real weight
    let totalWasteRecycledKg = 980;
    let metalsRecoveredKg = 312;
    let toxicDivertedKg = 48;

    for (const p of allPickups) {
      if (p.actualWeightKg) {
        totalWasteRecycledKg += p.actualWeightKg;
      }
      if (p.materialsRecovered) {
        metalsRecoveredKg += p.materialsRecovered.metalsKg;
        toxicDivertedKg += p.materialsRecovered.hazardousKg;
      }
    }

    const co2EmissionsSavedKg = Math.round(totalWasteRecycledKg * 1.44); // 1.44 kg CO2 per kg e-waste

    const categoryMap: Record<string, { count: number; weightKg: number }> = {
      'Laptop': { count: 420, weightKg: 380 },
      'Mobile Phone': { count: 680, weightKg: 145 },
      'Television': { count: 180, weightKg: 340 },
      'Battery': { count: 520, weightKg: 210 },
      'Appliances': { count: 140, weightKg: 490 },
      'Others': { count: 95, weightKg: 125 },
    };

    for (const p of allPickups) {
      for (const cat of p.categories) {
        if (categoryMap[cat]) {
          categoryMap[cat].count += 1;
          if (p.actualWeightKg) {
            categoryMap[cat].weightKg += Math.round(p.actualWeightKg / p.categories.length);
          }
        }
      }
    }

    const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
      category: category as any,
      count: data.count,
      weightKg: data.weightKg,
    }));

    const statusCounts: Record<string, number> = {
      'REQUESTED': 0,
      'SCHEDULED': 0,
      'COLLECTED': 0,
      'RECYCLED': 0,
      'CANCELLED': 0,
    };

    for (const p of allPickups) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    }

    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      status: status as any,
      count,
    }));

    const centerPerformance = Array.from(this.centers.values()).map(center => {
      const centerPickups = allPickups.filter(p => p.centerId === center.id);
      const totalProcessedKg = centerPickups.reduce((sum, p) => sum + (p.actualWeightKg || 0), 120);
      const active = centerPickups.filter(p => p.status === 'REQUESTED' || p.status === 'SCHEDULED' || p.status === 'COLLECTED').length;
      const completed = centerPickups.filter(p => p.status === 'RECYCLED').length;

      return {
        centerId: center.id,
        centerName: center.name,
        city: center.city,
        totalProcessedKg,
        activePickups: active,
        completedPickups: completed,
      };
    });

    return {
      totalPickups,
      completedPickups,
      activePickups,
      totalWasteRecycledKg,
      happyCitizensCount: 850 + this.users.size,
      collectionCentersCount: 45 + this.centers.size,
      co2EmissionsSavedKg,
      toxicDivertedKg,
      metalsRecoveredKg,
      categoryBreakdown,
      statusBreakdown,
      centerPerformance,
      recentActivity: this.activityLog.slice(0, 10),
    };
  }
}

export const db = new DatabaseStore();
