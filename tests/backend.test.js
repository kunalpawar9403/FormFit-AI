import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../backend/server.js';
import http from 'http';
import { UserDAO } from '../backend/src/models/store.js';

let server;
let baseUrl = '';

describe('Backend SaaS APIs — Auth, Subscriptions & Limits', () => {
  before(async () => {
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    try {
      const mongoose = (await import('mongoose')).default;
      if (mongoose?.connection?.readyState) {
        await mongoose.disconnect();
      }
    } catch (e) {}
  });

  let authToken = '';
  let registeredUserId = '';

  test('GET /api/health returns 200 and server status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.service, 'FormFit AI Pro SaaS Engine');
  });

  test('POST /api/auth/register creates a new user and returns JWT token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Applicant Tester',
        email: 'applicant.test@formfit.ai',
        password: 'password123',
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.email, 'applicant.test@formfit.ai');
    assert.strictEqual(data.user.plan, 'FREE');
    assert.strictEqual(data.user.subscriptionStatus, 'INACTIVE');

    authToken = data.token;
    registeredUserId = data.user.id;
  });

  test('POST /api/auth/register prevents duplicate email registration', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Guy',
        email: 'applicant.test@formfit.ai',
        password: 'anotherpassword',
      }),
    });

    assert.strictEqual(res.status, 409);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /already exists/i);
  });

  test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'applicant.test@formfit.ai',
        password: 'password123',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
  });

  test('POST /api/auth/login rejects invalid credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'applicant.test@formfit.ai',
        password: 'wrongpassword',
      }),
    });

    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
  });

  test('GET /api/auth/me returns authenticated user details', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.email, 'applicant.test@formfit.ai');
    assert.strictEqual(data.user.plan, 'FREE');
  });

  test('POST /api/payment/create-order creates Razorpay test order for authenticated user', async () => {
    const res = await fetch(`${baseUrl}/api/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ planId: 'pro_monthly' }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.order.id);
    assert.strictEqual(data.order.amount, 49900);
  });

  test('POST /api/payment/verify-payment activates Pro subscription and updates user in MongoDB', async () => {
    const res = await fetch(`${baseUrl}/api/payment/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        razorpay_order_id: 'order_test_SAMPLE123',
        razorpay_payment_id: 'pay_test_SAMPLE456',
        razorpay_signature: 'sig_test_SAMPLE789',
        planId: 'pro_monthly',
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.plan, 'PRO');
    assert.strictEqual(data.user.subscriptionStatus, 'ACTIVE');
    assert.ok(data.subscription._id);
  });

  test('GET /api/auth/me now reflects verified PRO entitlement from backend', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.plan, 'PRO');
    assert.strictEqual(data.user.subscriptionStatus, 'ACTIVE');
  });

  test('GET /api/subscription/current returns active subscription details', async () => {
    const res = await fetch(`${baseUrl}/api/subscription/current`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.userPlan, 'PRO');
    assert.strictEqual(data.status, 'ACTIVE');
    assert.ok(data.activeSubscription);
  });

  test('POST /api/presets creates synced cloud preset for Pro user', async () => {
    const res = await fetch(`${baseUrl}/api/presets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: 'Custom Pro Portal',
        width: 600,
        height: 600,
        format: 'JPG',
        minFileSize: 20,
        maxFileSize: 100,
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.preset.name, 'Custom Pro Portal');
  });

  test('POST /api/usage/track increments user usage', async () => {
    const res = await fetch(`${baseUrl}/api/usage/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ feature: 'bulk_photo_batch', count: 5 }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
  });

  test('GET /api/usage/summary returns aggregated user metrics', async () => {
    const res = await fetch(`${baseUrl}/api/usage/summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.totalProcessed >= 5);
  });

  test('Expired subscription automatically reverts user plan to FREE and status to EXPIRED', async () => {
    // Manually simulate expired subscription date in database
    await UserDAO.updateById(registeredUserId, {
      subscriptionEnd: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    });

    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.plan, 'FREE');
    assert.strictEqual(data.user.subscriptionStatus, 'EXPIRED');
  });
});
