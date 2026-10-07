import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { requireAuth, AuthenticatedRequest, requireRole } from '../auth';
import { emitRequestCreated, emitStatusUpdated } from '../sockets';
import { PickupRequest, WasteCategory, PickupStatus } from '../../src/types';

const router = Router();

// Zod schema for creating a pickup
const createPickupSchema = z.object({
  categories: z.array(z.enum(['Laptop', 'Mobile Phone', 'Television', 'Battery', 'Appliances', 'Others'])).min(1, 'Please select at least one waste category'),
  estimatedItemsCount: z.number().min(1, 'Please specify at least 1 item').default(1),
  wasteDescription: z.string().min(3, 'Please provide a short description of the e-waste items'),
  photoUrl: z.string().optional(),
  
  pickupDate: z.string().min(1, 'Please select a pickup date'),
  preferredTimeSlot: z.string().min(1, 'Please select a preferred time slot'),
  preferredContact: z.string().default('Phone'),
  pickupType: z.enum(['Doorstep Pickup', 'Drop-off at Center']).default('Doorstep Pickup'),
  specialInstructions: z.string().optional(),
  
  addressLine: z.string().min(3, 'Address line is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pinCode: z.string().min(3, 'PIN / Postal code is required'),
  landmark: z.string().optional(),
  centerId: z.string().optional(),
});

// Zod schema for status update
const updateStatusSchema = z.object({
  status: z.enum(['REQUESTED', 'SCHEDULED', 'COLLECTED', 'RECYCLED', 'CANCELLED']),
  actualWeightKg: z.number().positive().optional(),
  pickupDate: z.string().optional(),
  preferredTimeSlot: z.string().optional(),
  staffNotes: z.string().optional(),
  materialsRecovered: z.object({
    metalsKg: z.number().min(0),
    plasticsKg: z.number().min(0),
    glassKg: z.number().min(0),
    hazardousKg: z.number().min(0),
  }).optional(),
});

// GET /api/pickups - Scoped by role
router.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const allPickups = Array.from(db.pickups.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let filteredPickups: PickupRequest[] = [];

  if (user.role === 'citizen') {
    // Citizen only sees their own requests
    filteredPickups = allPickups.filter(p => p.citizenId === user.userId);
  } else if (user.role === 'staff') {
    // Staff sees requests for their center, or all if no center specified
    if (user.centerId) {
      filteredPickups = allPickups.filter(p => p.centerId === user.centerId);
    } else {
      filteredPickups = allPickups;
    }
  } else if (user.role === 'agency') {
    // Agency Admin sees all requests across all centers
    filteredPickups = allPickups;
  }

  res.json({
    data: filteredPickups,
    count: filteredPickups.length,
  });
});

// GET /api/pickups/:id
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const pickup = db.pickups.get(req.params.id);

  if (!pickup) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Pickup request not found.',
        details: [],
      }
    });
  }

  // Strict role-based isolation check
  if (user.role === 'citizen' && pickup.citizenId !== user.userId) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'You are not authorized to view this pickup request.',
        details: [],
      }
    });
  }

  res.json({ data: pickup });
});

// POST /api/pickups - Citizen creates a pickup
router.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const parseResult = createPickupSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed for pickup request data',
        details: parseResult.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      }
    });
  }

  const data = parseResult.data;
  const dbUser = db.users.get(user.userId);

  // Assign nearest or matching center
  const allCenters = Array.from(db.centers.values());
  const selectedCenter = (data.centerId && db.centers.get(data.centerId)) || allCenters[0];

  // Generate unique tracking code e.g. EC-94830
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const trackingCode = `EC-${randomSuffix}`;

  const newPickup: PickupRequest = {
    id: `req-${Date.now()}`,
    trackingCode,
    citizenId: user.userId,
    citizenName: dbUser?.name || user.name || 'Eco Citizen',
    citizenEmail: dbUser?.email || user.email,
    citizenPhone: dbUser?.phone || '+1 (555) 234-5678',
    
    categories: data.categories as WasteCategory[],
    estimatedItemsCount: data.estimatedItemsCount,
    wasteDescription: data.wasteDescription,
    photoUrl: data.photoUrl,
    
    pickupDate: data.pickupDate,
    preferredTimeSlot: data.preferredTimeSlot,
    preferredContact: data.preferredContact,
    pickupType: data.pickupType,
    specialInstructions: data.specialInstructions,
    
    addressLine: data.addressLine,
    city: data.city,
    state: data.state,
    pinCode: data.pinCode,
    landmark: data.landmark,
    
    centerId: selectedCenter.id,
    centerName: selectedCenter.name,
    status: 'REQUESTED',
    serviceCharge: 0, // FREE
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.pickups.set(newPickup.id, newPickup);

  // Log activity
  db.activityLog.unshift({
    id: `act-${Date.now()}`,
    type: 'NEW_REQUEST',
    message: `New pickup #${newPickup.trackingCode} requested by ${newPickup.citizenName} for ${newPickup.categories.join(', ')}`,
    timestamp: new Date().toISOString(),
    requestId: newPickup.id,
  });

  // Emit real-time event to staff and agency
  emitRequestCreated(newPickup);

  res.status(201).json({
    message: 'Pickup request created successfully',
    data: newPickup,
  });
});

// PATCH /api/pickups/:id/status - Staff or Agency updates request status
router.patch('/:id/status', requireAuth, requireRole('staff', 'agency'), (req: AuthenticatedRequest, res: Response) => {
  const pickup = db.pickups.get(req.params.id);

  if (!pickup) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'Pickup request not found.',
        details: [],
      }
    });
  }

  const parseResult = updateStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed for status update',
        details: parseResult.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      }
    });
  }

  const { status, actualWeightKg, pickupDate, preferredTimeSlot, staffNotes, materialsRecovered } = parseResult.data;
  const previousStatus = pickup.status;

  pickup.status = status;
  pickup.updatedAt = new Date().toISOString();

  if (pickupDate) pickup.pickupDate = pickupDate;
  if (preferredTimeSlot) pickup.preferredTimeSlot = preferredTimeSlot;
  if (staffNotes) pickup.staffNotes = staffNotes;

  if (status === 'COLLECTED') {
    pickup.collectedAt = new Date().toISOString();
    if (actualWeightKg) {
      pickup.actualWeightKg = actualWeightKg;
    } else if (!pickup.actualWeightKg) {
      pickup.actualWeightKg = Number((pickup.estimatedItemsCount * 3.5).toFixed(1));
    }
  }

  if (status === 'RECYCLED') {
    pickup.recycledAt = new Date().toISOString();
    const weight = pickup.actualWeightKg || 12.0;

    if (materialsRecovered) {
      pickup.materialsRecovered = materialsRecovered;
    } else if (!pickup.materialsRecovered) {
      // Auto-compute estimated material recovery ratios based on e-waste averages
      pickup.materialsRecovered = {
        metalsKg: Number((weight * 0.35).toFixed(1)),
        plasticsKg: Number((weight * 0.42).toFixed(1)),
        glassKg: Number((weight * 0.18).toFixed(1)),
        hazardousKg: Number((weight * 0.05).toFixed(1)),
      };
    }

    // Award EcoPoints to citizen (10 points per kg)
    const pointsAwarded = Math.round(weight * 10);
    pickup.pointsAwarded = pointsAwarded;

    const citizen = db.users.get(pickup.citizenId);
    if (citizen) {
      citizen.ecoPoints = (citizen.ecoPoints || 0) + pointsAwarded;
    }
  }

  db.pickups.set(pickup.id, pickup);

  // Log activity
  db.activityLog.unshift({
    id: `act-${Date.now()}`,
    type: 'STATUS_CHANGE',
    message: `Pickup #${pickup.trackingCode} status updated from ${previousStatus} to ${pickup.status}`,
    timestamp: new Date().toISOString(),
    requestId: pickup.id,
  });

  // Emit real-time updates via Socket.IO
  emitStatusUpdated(pickup, previousStatus);

  res.json({
    message: `Pickup status updated to ${status}`,
    data: pickup,
  });
});

export default router;
