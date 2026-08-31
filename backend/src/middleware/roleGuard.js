/**
 * Role-based access control middleware factory.
 * Usage: roleGuard('coop_admin') or roleGuard('worker', 'coop_admin')
 */
function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }
    next();
  };
}

module.exports = { roleGuard };
