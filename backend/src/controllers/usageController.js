import { UsageDAO } from '../models/store.js';

export async function getUsage(req, res, next) {
  try {
    const summary = await UsageDAO.getSummary(req.user.id);
    const totalProcessed = summary.reduce((acc, curr) => acc + (curr.count || 0), 0);

    return res.json({
      success: true,
      period: new Date().toISOString().slice(0, 10),
      totalProcessed,
      maxProQuota: 500, // Pro tier generous batch limit per month/cycle
      breakdown: summary,
    });
  } catch (err) {
    next(err);
  }
}

export async function trackUsage(req, res, next) {
  try {
    const { feature = 'general_processing', count = 1 } = req.body;
    const updated = await UsageDAO.increment(req.user.id, feature, parseInt(count, 10) || 1);

    return res.json({
      success: true,
      usage: updated,
    });
  } catch (err) {
    next(err);
  }
}
