const secret = process.env.JWT_SECRET;

if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET no está definido');
}

module.exports = { JWT_SECRET: secret || 'dev_only_secret' };
