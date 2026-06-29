import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bursali-oto-super-secret-enterprise-key-2026'
);

/**
 * Creates an encrypted JWT token
 * @param {Object} payload 
 * @returns {Promise<string>}
 */
export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Token expires in 24 hours
    .sign(JWT_SECRET);
}

/**
 * Verifies the JWT token
 * @param {string} token 
 * @returns {Promise<Object|null>}
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the current session from cookies
 * @returns {Promise<Object|null>}
 */
export async function getSession() {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  
  return await verifyToken(token);
}

/**
 * Hash a plain text password
 * @param {string} password 
 * @returns {string}
 */
export function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

/**
 * Compare password with hash
 * @param {string} password 
 * @param {string} hash 
 * @returns {boolean}
 */
export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}
