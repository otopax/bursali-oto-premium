import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Kurumsal standart (OWASP önerisi)

/**
 * Kullanıcı şifresini güvenli bir şekilde hash'ler.
 * @param {string} password - Düz metin şifre
 * @returns {Promise<string>} - Hash'lenmiş şifre
 */
export async function hashPassword(password) {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Girilen şifrenin veritabanındaki hash ile eşleşip eşleşmediğini kontrol eder.
 * @param {string} password - Düz metin şifre (kullanıcının girdiği)
 * @param {string} hash - Veritabanındaki hashlenmiş şifre
 * @returns {Promise<boolean>} - Eşleşiyorsa true
 */
export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
}
