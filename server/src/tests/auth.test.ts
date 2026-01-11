import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/auth';
import { db } from '../db';
import * as authUtils from '../utils/auth';
import * as jwtUtils from '../utils/jwt';
import cookieParser from 'cookie-parser';

// Mock dependencies
vi.mock('../db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../utils/auth', () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

vi.mock('../utils/jwt', () => ({
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  setAuthCookies: vi.fn(),
  clearAuthCookies: vi.fn(),
}));

vi.mock('../utils/auditLog', () => ({
  logEvent: vi.fn(),
  AuditAction: {
    LOGIN_SUCCESS: 'auth.login.success',
    LOGIN_FAILURE: 'auth.login.failure',
    LOGOUT: 'auth.logout',
  },
}));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        role: 'user',
        failedLoginAttempts: 0,
        twoFactorEnabled: false,
        tokenVersion: 0,
      };

      // Mock DB chain
      const whereMock = vi.fn().mockResolvedValue([mockUser]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      const updateWhereMock = vi.fn().mockResolvedValue([]);
      const updateSetMock = vi.fn().mockReturnValue({ where: updateWhereMock });
      (db.update as any).mockReturnValue({ set: updateSetMock });

      const insertValuesMock = vi.fn().mockResolvedValue([]);
      (db.insert as any).mockReturnValue({ values: insertValuesMock });

      // Mock utils
      (authUtils.comparePassword as any).mockResolvedValue(true);
      (jwtUtils.generateAccessToken as any).mockReturnValue('access_token');
      (jwtUtils.generateRefreshToken as any).mockResolvedValue('refresh_token');

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(mockUser.email);
      expect(jwtUtils.setAuthCookies).toHaveBeenCalled();
    });

    it('should return 401 with invalid credentials', async () => {
      // Mock DB chain - user not found
      const whereMock = vi.fn().mockResolvedValue([]);
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      (db.select as any).mockReturnValue({ from: fromMock });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should lock account after 5 failed attempts', async () => {
        const mockUser = {
          id: 1,
          email: 'test@example.com',
          passwordHash: 'hashed_password',
          role: 'user',
          failedLoginAttempts: 4,
          twoFactorEnabled: false,
          tokenVersion: 0,
        };
  
        // Mock DB chain
        const whereMock = vi.fn().mockResolvedValue([mockUser]);
        const fromMock = vi.fn().mockReturnValue({ where: whereMock });
        (db.select as any).mockReturnValue({ from: fromMock });

        // Mock update for lock
        const updateWhereMock = vi.fn().mockResolvedValue([]);
        const updateSetMock = vi.fn().mockReturnValue({ where: updateWhereMock });
        (db.update as any).mockReturnValue({ set: updateSetMock });
  
        // Mock utils
        (authUtils.comparePassword as any).mockResolvedValue(false);
  
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword',
          });
  
        expect(response.status).toBe(401);
        expect(db.update).toHaveBeenCalled();
        // Verify lockUntil was set (checking the arguments passed to set)
        const setArgs = updateSetMock.mock.calls[0][0];
        expect(setArgs.failedLoginAttempts).toBe(5);
        expect(setArgs.lockUntil).toBeInstanceOf(Date);
      });
  });
});
