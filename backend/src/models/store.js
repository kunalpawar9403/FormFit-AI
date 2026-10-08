import mongoose from 'mongoose';
import { isDbConnected } from '../config/db.js';

// Mongoose Schemas
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    authProvider: { type: String, default: 'local' },
    plan: { type: String, enum: ['FREE', 'PRO', 'BUSINESS'], default: 'FREE' },
    subscriptionStatus: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'],
      default: 'INACTIVE',
    },
    subscriptionId: { type: String, default: null },
    subscriptionStart: { type: Date, default: null },
    subscriptionEnd: { type: Date, default: null },
  },
  { timestamps: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
    razorpaySubscriptionId: { type: String, default: null },
    plan: { type: String, enum: ['FREE', 'PRO', 'BUSINESS'], default: 'PRO' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'],
      default: 'ACTIVE',
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const usageSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    feature: { type: String, required: true },
    count: { type: Number, default: 1 },
    period: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  },
  { timestamps: true }
);

const presetSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    format: { type: String, default: 'JPG' },
    minFileSize: { type: Number, default: 0 },
    maxFileSize: { type: Number, default: 100 },
    configuration: { type: Object, default: {} },
  },
  { timestamps: true }
);

export const MongoUserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const MongoSubscriptionModel = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema);
export const MongoUsageModel = mongoose.models.Usage || mongoose.model('Usage', usageSchema);
export const MongoPresetModel = mongoose.models.Preset || mongoose.model('Preset', presetSchema);

// In-Memory fallback store
const memoryUsers = new Map();
const memorySubscriptions = new Map();
const memoryUsages = [];
const memoryPresets = new Map();

function generateId() {
  return 'id_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// User Data Access
export const UserDAO = {
  async findByEmail(email) {
    if (isDbConnected()) {
      return await MongoUserModel.findOne({ email: email.toLowerCase().trim() });
    }
    const lower = email.toLowerCase().trim();
    for (const u of memoryUsers.values()) {
      if (u.email === lower) return { ...u };
    }
    return null;
  },

  async findById(id) {
    if (isDbConnected()) {
      return await MongoUserModel.findById(id);
    }
    const u = memoryUsers.get(id);
    return u ? { ...u } : null;
  },

  async create(userData) {
    if (isDbConnected()) {
      return await MongoUserModel.create(userData);
    }
    const _id = generateId();
    const now = new Date();
    const newUser = {
      _id,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      passwordHash: userData.passwordHash,
      authProvider: userData.authProvider || 'local',
      plan: userData.plan || 'FREE',
      subscriptionStatus: userData.subscriptionStatus || 'INACTIVE',
      subscriptionId: userData.subscriptionId || null,
      subscriptionStart: userData.subscriptionStart || null,
      subscriptionEnd: userData.subscriptionEnd || null,
      createdAt: now,
      updatedAt: now,
    };
    memoryUsers.set(_id, newUser);
    return { ...newUser };
  },

  async updateById(id, updateData) {
    if (isDbConnected()) {
      return await MongoUserModel.findByIdAndUpdate(id, updateData, { new: true });
    }
    const existing = memoryUsers.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    memoryUsers.set(id, updated);
    return { ...updated };
  },
};

// Subscription Data Access
export const SubscriptionDAO = {
  async create(subData) {
    if (isDbConnected()) {
      return await MongoSubscriptionModel.create(subData);
    }
    const _id = generateId();
    const now = new Date();
    const record = {
      _id,
      ...subData,
      createdAt: now,
      updatedAt: now,
    };
    memorySubscriptions.set(_id, record);
    return { ...record };
  },

  async findByUserId(userId) {
    if (isDbConnected()) {
      return await MongoSubscriptionModel.find({ userId }).sort({ createdAt: -1 });
    }
    const results = [];
    for (const s of memorySubscriptions.values()) {
      if (s.userId === userId) results.push({ ...s });
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },

  async findActiveByUserId(userId) {
    if (isDbConnected()) {
      return await MongoSubscriptionModel.findOne({
        userId,
        status: 'ACTIVE',
        endDate: { $gt: new Date() },
      }).sort({ createdAt: -1 });
    }
    const now = new Date();
    const userSubs = await this.findByUserId(userId);
    return userSubs.find((s) => s.status === 'ACTIVE' && new Date(s.endDate) > now) || null;
  },

  async updateStatus(id, status) {
    if (isDbConnected()) {
      return await MongoSubscriptionModel.findByIdAndUpdate(id, { status }, { new: true });
    }
    const sub = memorySubscriptions.get(id);
    if (!sub) return null;
    sub.status = status;
    sub.updatedAt = new Date();
    memorySubscriptions.set(id, sub);
    return { ...sub };
  },
};

// Usage Data Access
export const UsageDAO = {
  async increment(userId, feature, count = 1) {
    const period = new Date().toISOString().slice(0, 10);
    if (isDbConnected()) {
      return await MongoUsageModel.findOneAndUpdate(
        { userId, feature, period },
        { $inc: { count } },
        { upsert: true, new: true }
      );
    }
    let record = memoryUsages.find(
      (u) => u.userId === userId && u.feature === feature && u.period === period
    );
    if (record) {
      record.count += count;
      record.updatedAt = new Date();
    } else {
      record = {
        _id: generateId(),
        userId,
        feature,
        count,
        period,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryUsages.push(record);
    }
    return { ...record };
  },

  async getSummary(userId) {
    const period = new Date().toISOString().slice(0, 10);
    if (isDbConnected()) {
      return await MongoUsageModel.find({ userId, period });
    }
    return memoryUsages.filter((u) => u.userId === userId && u.period === period);
  },
};

// Preset Data Access
export const PresetDAO = {
  async findByUserId(userId) {
    if (isDbConnected()) {
      return await MongoPresetModel.find({ userId }).sort({ createdAt: -1 });
    }
    const results = [];
    for (const p of memoryPresets.values()) {
      if (p.userId === userId) results.push({ ...p });
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },

  async countByUserId(userId) {
    if (isDbConnected()) {
      return await MongoPresetModel.countDocuments({ userId });
    }
    let c = 0;
    for (const p of memoryPresets.values()) {
      if (p.userId === userId) c++;
    }
    return c;
  },

  async create(data) {
    if (isDbConnected()) {
      return await MongoPresetModel.create(data);
    }
    const _id = generateId();
    const now = new Date();
    const item = {
      _id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    memoryPresets.set(_id, item);
    return { ...item };
  },

  async delete(userId, presetId) {
    if (isDbConnected()) {
      return await MongoPresetModel.findOneAndDelete({ _id: presetId, userId });
    }
    const item = memoryPresets.get(presetId);
    if (item && item.userId === userId) {
      memoryPresets.delete(presetId);
      return item;
    }
    return null;
  },
};
