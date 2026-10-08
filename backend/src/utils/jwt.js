import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'formfit_dev_jwt_secret_super_secure_key_2026';
const JWT_EXPIRES_IN = '7d';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
