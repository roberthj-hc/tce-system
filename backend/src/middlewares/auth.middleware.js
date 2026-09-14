const jwt = require('jsonwebtoken');

function verifyAdmin(req, res, next) {
  if (req.user.role_id !== 1) {
    return res.status(403).json({ error: 'Access denied: Admins only' });
  }
  next();
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'my_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = {
  verifyToken,
  verifyAdmin
};
