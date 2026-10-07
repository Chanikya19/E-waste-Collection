import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db';
import { generateToken, requireAuth, AuthenticatedRequest } from '../auth';
import { User } from '../../src/types';

const router = Router();

// Zod schemas for strict validation
const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  role: z.enum(['citizen', 'staff', 'agency']).default('citizen'),
  centerId: z.string().optional(),
});

// Zod schemas for profile and password change
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New password and confirmation password do not match",
  path: ["confirmPassword"],
});

// Simple in-memory rate limiter for auth endpoints
const authAttempts = new Map<string, { count: number; resetTime: number }>();

function rateLimitAuth(req: Request, res: Response, next: () => void) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = authAttempts.get(ip) || { count: 0, resetTime: now + 60000 };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + 60000;
  }

  record.count += 1;
  authAttempts.set(ip, record);

  if (record.count > 15) {
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again in 1 minute.',
        details: [],
      }
    });
  }

  next();
}

// POST /api/auth/login
router.post('/login', rateLimitAuth, (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid login data supplied',
        details: parseResult.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      }
    });
  }

  const { email, password } = parseResult.data;

  // Search user by email (case-insensitive)
  const user = Array.from(db.users.values()).find(
    u => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
        details: [],
      }
    });
  }

  const passwordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordValid) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
        details: [],
      }
    });
  }

  const token = generateToken(user);
  const { passwordHash, ...safeUser } = user;

  res.json({
    message: 'Login successful',
    token,
    user: safeUser,
  });
});

// POST /api/auth/register
router.post('/register', rateLimitAuth, (req: Request, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid registration parameters',
        details: parseResult.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      }
    });
  }

  const data = parseResult.data;

  // Check duplicate email
  const existingUser = Array.from(db.users.values()).find(
    u => u.email.toLowerCase() === data.email.toLowerCase()
  );

  if (existingUser) {
    return res.status(409).json({
      error: {
        code: 'USER_ALREADY_EXISTS',
        message: 'An account with this email address already exists. Please log in.',
        details: [{ field: 'email', message: 'Email address already in use' }],
      }
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(data.password, salt);

  const newUser: User & { passwordHash: string } = {
    id: `usr-${Date.now()}`,
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    role: data.role,
    phone: data.phone || '',
    address: data.address || '',
    city: data.city || 'Metro City',
    centerId: data.centerId,
    ecoPoints: 50, // Welcome bonus points
    createdAt: new Date().toISOString(),
  };

  db.users.set(newUser.id, newUser);

  const token = generateToken(newUser);
  const { passwordHash: _, ...safeUser } = newUser;

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: safeUser,
  });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = db.users.get(userId);

  if (!user) {
    return res.status(404).json({
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User profile could not be found.',
        details: [],
      }
    });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const parseResult = updateProfileSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid profile details supplied.',
        details: parseResult.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      }
    });
  }

  const userId = req.user!.userId;
  const user = db.users.get(userId);

  if (!user) {
    return res.status(404).json({
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User account not found.',
        details: [],
      }
    });
  }

  const data = parseResult.data;
  user.name = data.name.trim();
  if (data.phone !== undefined) user.phone = data.phone.trim();
  if (data.address !== undefined) user.address = data.address.trim();
  if (data.city !== undefined) user.city = data.city.trim();

  db.users.set(userId, user);

  // Generate updated JWT with new profile information
  const token = generateToken(user);
  const { passwordHash, ...safeUser } = user;

  res.json({
    message: 'Profile updated successfully',
    token,
    user: safeUser,
  });
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const parseResult = changePasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: parseResult.error.issues[0]?.message || 'Invalid password parameters.',
        details: parseResult.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })),
      }
    });
  }

  const userId = req.user!.userId;
  const user = db.users.get(userId);

  if (!user) {
    return res.status(404).json({
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User account not found.',
        details: [],
      }
    });
  }

  const { currentPassword, newPassword } = parseResult.data;

  // Verify current password with bcrypt
  const isMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({
      error: {
        code: 'INCORRECT_CURRENT_PASSWORD',
        message: 'The current password you entered is incorrect.',
        details: [{ field: 'currentPassword', message: 'Current password verification failed' }],
      }
    });
  }

  // Hash new password using bcrypt
  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  db.users.set(userId, user);

  // Generate updated and re-validated JWT token
  const token = generateToken(user);
  const { passwordHash, ...safeUser } = user;

  res.json({
    message: 'Password changed successfully. Your authentication token has been securely refreshed.',
    token,
    user: safeUser,
  });
});

export default router;
