export function requirePro(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_REQUIRED',
      message: 'Authentication required to access Pro features.',
    });
  }

  const isPro =
    (req.user.plan === 'PRO' || req.user.plan === 'BUSINESS') &&
    req.user.subscriptionStatus === 'ACTIVE';

  if (!isPro) {
    return res.status(403).json({
      success: false,
      code: 'PRO_REQUIRED',
      message: 'Active Pro subscription required to access this feature.',
      plan: req.user.plan,
      subscriptionStatus: req.user.subscriptionStatus,
    });
  }

  next();
}
