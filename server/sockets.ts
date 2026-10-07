import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken, TokenPayload } from './auth';
import { PickupRequest, PlatformAnalytics, RealtimeNotification } from '../src/types';
import { db } from './db';

let ioInstance: SocketIOServer | null = null;

export function setupSockets(io: SocketIOServer) {
  ioInstance = io;

  // Socket middleware for JWT handshake authentication
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      // Allow unauthenticated connection for public stats stream if needed, or authenticate if provided
      return next();
    }

    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error('Authentication failed: Invalid socket token'));
    }

    (socket as any).user = payload;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const user: TokenPayload | undefined = (socket as any).user;

    if (user) {
      // Join user specific room
      socket.join(`user:${user.userId}`);
      socket.join(`role:${user.role}`);

      // Role specific room joins
      if (user.role === 'citizen') {
        socket.join(`citizen:${user.userId}`);
      } else if (user.role === 'staff' && user.centerId) {
        socket.join(`staff:${user.centerId}`);
        socket.join('staff:all');
      } else if (user.role === 'agency') {
        socket.join('agency:admin');
      }
    }

    // Public room for real-time live tickers
    socket.join('public:stream');

    socket.on('disconnect', () => {
      // Clean disconnect
    });

    socket.on('error', (err) => {
      console.error('Socket error on client:', socket.id, err);
      socket.emit('error', { message: 'A real-time socket communication error occurred' });
    });
  });
}

export function emitRequestCreated(pickup: PickupRequest) {
  if (!ioInstance) return;

  // 1. Notify the assigned center's staff
  ioInstance.to(`staff:${pickup.centerId}`).emit('request:created', pickup);
  ioInstance.to('staff:all').emit('request:created', pickup);

  // 2. Notify agency admins
  ioInstance.to('agency:admin').emit('request:created', pickup);

  // 3. Send updated analytics to agency
  const analytics = db.getAnalytics();
  ioInstance.to('agency:admin').emit('analytics:updated', analytics);
  ioInstance.to('public:stream').emit('public:statsUpdated', {
    totalPickups: analytics.totalPickups,
    totalWasteRecycledKg: analytics.totalWasteRecycledKg,
    happyCitizensCount: analytics.happyCitizensCount,
  });

  // 4. Send notification to citizen
  const notification: RealtimeNotification = {
    id: `notif-${Date.now()}`,
    title: 'Pickup Scheduled',
    message: `Your pickup request #${pickup.trackingCode} was received and assigned to ${pickup.centerName}.`,
    type: 'success',
    timestamp: new Date().toISOString(),
    requestId: pickup.id,
  };
  ioInstance.to(`citizen:${pickup.citizenId}`).emit('notification:new', notification);
}

export function emitStatusUpdated(pickup: PickupRequest, previousStatus: string) {
  if (!ioInstance) return;

  const payload = {
    requestId: pickup.id,
    trackingCode: pickup.trackingCode,
    status: pickup.status,
    previousStatus,
    updatedAt: pickup.updatedAt,
    pickup,
  };

  // 1. Notify the citizen who owns the request
  ioInstance.to(`citizen:${pickup.citizenId}`).emit('request:statusUpdated', payload);

  // 2. Notify staff members
  ioInstance.to(`staff:${pickup.centerId}`).emit('request:statusUpdated', payload);
  ioInstance.to('staff:all').emit('request:statusUpdated', payload);

  // 3. Notify agency dashboard
  ioInstance.to('agency:admin').emit('request:statusUpdated', payload);

  // 4. Send notification to citizen
  let notifMsg = `Your pickup #${pickup.trackingCode} is now ${pickup.status}.`;
  if (pickup.status === 'SCHEDULED') {
    notifMsg = `Pickup #${pickup.trackingCode} scheduled for ${pickup.pickupDate} (${pickup.preferredTimeSlot}).`;
  } else if (pickup.status === 'COLLECTED') {
    notifMsg = `Pickup #${pickup.trackingCode} collected (${pickup.actualWeightKg || 'standard'} kg). Processing for recycling!`;
  } else if (pickup.status === 'RECYCLED') {
    notifMsg = `🎉 Waste from #${pickup.trackingCode} was responsibly recycled! You earned ${pickup.pointsAwarded || 50} EcoPoints.`;
  }

  const notification: RealtimeNotification = {
    id: `notif-${Date.now()}`,
    title: `Status: ${pickup.status}`,
    message: notifMsg,
    type: pickup.status === 'RECYCLED' ? 'success' : 'info',
    timestamp: new Date().toISOString(),
    requestId: pickup.id,
  };
  ioInstance.to(`citizen:${pickup.citizenId}`).emit('notification:new', notification);

  // 5. Update agency analytics
  const analytics = db.getAnalytics();
  ioInstance.to('agency:admin').emit('analytics:updated', analytics);
  ioInstance.to('public:stream').emit('public:statsUpdated', {
    totalPickups: analytics.totalPickups,
    totalWasteRecycledKg: analytics.totalWasteRecycledKg,
    happyCitizensCount: analytics.happyCitizensCount,
  });
}
