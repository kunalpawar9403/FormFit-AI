import { verifyToken } from '../utils/jwt.js';
import { UserDAO } from '../models/store.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    let user = await UserDAO.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // Server-side Subscription Expiry Check
    if (
      user.subscriptionStatus === 'ACTIVE' &&
      user.subscriptionEnd &&
      new Date(user.subscriptionEnd) < new Date()
    ) {
      user = await UserDAO.updateById(user._id, {
        subscriptionStatus: 'EXPIRED',
        plan: 'FREE',
      });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionId: user.subscriptionId,
      subscriptionStart: user.subscriptionStart,
      subscriptionEnd: user.subscriptionEnd,
      createdAt: user.createdAt,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication verification failed.',
    });
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      req.user = null;
      return next();
    }

    let user = await UserDAO.findById(decoded.id);
    if (user) {
      if (
        user.subscriptionStatus === 'ACTIVE' &&
        user.subscriptionEnd &&
        new Date(user.subscriptionEnd) < new Date()
      ) {
        user = await UserDAO.updateById(user._id, {
          subscriptionStatus: 'EXPIRED',
          plan: 'FREE',
        });
      }

      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionId: user.subscriptionId,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        createdAt: user.createdAt,
      };
    } else {
      req.user = null;
    }
  } catch (e) {
    req.user = null;
  }
  next();
}
