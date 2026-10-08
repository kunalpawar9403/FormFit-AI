import bcrypt from 'bcryptjs';
import { UserDAO } from '../models/store.js';
import { signToken } from '../utils/jwt.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await UserDAO.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserDAO.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      plan: 'FREE',
      subscriptionStatus: 'INACTIVE',
    });

    const token = signToken({ id: user._id, email: user.email });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    let user = await UserDAO.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check subscription expiry
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

    const token = signToken({ id: user._id, email: user.email });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionId: user.subscriptionId,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  return res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}
