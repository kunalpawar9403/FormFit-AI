import { SubscriptionDAO, UserDAO } from '../models/store.js';

export async function getCurrentSubscription(req, res, next) {
  try {
    const activeSub = await SubscriptionDAO.findActiveByUserId(req.user.id);
    const allSubs = await SubscriptionDAO.findByUserId(req.user.id);

    return res.json({
      success: true,
      activeSubscription: activeSub,
      history: allSubs,
      userPlan: req.user.plan,
      status: req.user.subscriptionStatus,
      expiresAt: req.user.subscriptionEnd,
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelSubscription(req, res, next) {
  try {
    const activeSub = await SubscriptionDAO.findActiveByUserId(req.user.id);
    if (!activeSub) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found to cancel.',
      });
    }

    await SubscriptionDAO.updateStatus(activeSub._id, 'CANCELLED');
    await UserDAO.updateById(req.user.id, {
      subscriptionStatus: 'CANCELLED',
    });

    return res.json({
      success: true,
      message: 'Subscription renewal has been cancelled.',
    });
  } catch (err) {
    next(err);
  }
}
