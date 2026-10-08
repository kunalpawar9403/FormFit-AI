import { PresetDAO } from '../models/store.js';

const FREE_USER_PRESET_LIMIT = 5;

export async function getPresets(req, res, next) {
  try {
    const presets = await PresetDAO.findByUserId(req.user.id);
    return res.json({
      success: true,
      presets,
      limit: req.user.plan === 'PRO' ? null : FREE_USER_PRESET_LIMIT,
      isPro: req.user.plan === 'PRO' && req.user.subscriptionStatus === 'ACTIVE',
    });
  } catch (err) {
    next(err);
  }
}

export async function createPreset(req, res, next) {
  try {
    const isPro = req.user.plan === 'PRO' && req.user.subscriptionStatus === 'ACTIVE';

    if (!isPro) {
      const currentCount = await PresetDAO.countByUserId(req.user.id);
      if (currentCount >= FREE_USER_PRESET_LIMIT) {
        return res.status(403).json({
          success: false,
          code: 'PRESET_LIMIT_EXCEEDED',
          message: `Free plan is limited to ${FREE_USER_PRESET_LIMIT} custom presets. Upgrade to Pro for unlimited presets.`,
        });
      }
    }

    const { name, width, height, format, minFileSize, maxFileSize, configuration } = req.body;

    if (!name || !width || !height) {
      return res.status(400).json({
        success: false,
        message: 'Name, width, and height are required for a preset.',
      });
    }

    const newPreset = await PresetDAO.create({
      userId: req.user.id,
      name: name.trim(),
      width: parseInt(width, 10),
      height: parseInt(height, 10),
      format: format || 'JPG',
      minFileSize: parseInt(minFileSize, 10) || 0,
      maxFileSize: parseInt(maxFileSize, 10) || 100,
      configuration: configuration || {},
    });

    return res.status(201).json({
      success: true,
      preset: newPreset,
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePreset(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await PresetDAO.delete(req.user.id, id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Preset not found or not authorized to delete.',
      });
    }
    return res.json({
      success: true,
      message: 'Preset removed successfully.',
    });
  } catch (err) {
    next(err);
  }
}
