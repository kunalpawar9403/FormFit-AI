import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  PRICING_PLANS,
  RAZORPAY_TEST_KEY,
  TEST_CARDS,
  TEST_UPI_IDS,
  TEST_NETBANKING_BANKS,
  simulateTestPayment,
} from '../frontend/src/services/razorpayService.js';
import {
  getProStatus,
  saveProStatus,
  clearProStatus,
} from '../frontend/src/services/storageService.js';

describe('Razorpay Pricing & Test Mode Integration', () => {
  test('all pricing plans have required fields, valid amounts and features', () => {
    assert.strictEqual(PRICING_PLANS.length >= 3, true);

    const dayPass = PRICING_PLANS.find((p) => p.id === 'day_pass');
    assert.ok(dayPass);
    assert.strictEqual(dayPass.priceInr, 99);
    assert.strictEqual(dayPass.amountPaise, 9900);
    assert.strictEqual(Array.isArray(dayPass.features), true);

    const proMonthly = PRICING_PLANS.find((p) => p.id === 'pro_monthly');
    assert.ok(proMonthly);
    assert.strictEqual(proMonthly.priceInr, 499);
    assert.strictEqual(proMonthly.amountPaise, 49900);
    assert.strictEqual(proMonthly.popular, true);

    const proAnnual = PRICING_PLANS.find((p) => p.id === 'pro_annual');
    assert.ok(proAnnual);
    assert.strictEqual(proAnnual.priceInr, 3999);
    assert.strictEqual(proAnnual.amountPaise, 399900);
  });

  test('Razorpay test key format is valid', () => {
    assert.strictEqual(typeof RAZORPAY_TEST_KEY, 'string');
    assert.strictEqual(RAZORPAY_TEST_KEY.startsWith('rzp_test_'), true);
  });

  test('test credentials contain valid cards, UPI and banks', () => {
    assert.strictEqual(TEST_CARDS.length >= 3, true);
    const successCard = TEST_CARDS.find((c) => c.status === 'success');
    const failedCard = TEST_CARDS.find((c) => c.status === 'failed');
    assert.ok(successCard);
    assert.ok(failedCard);

    assert.strictEqual(TEST_UPI_IDS.length >= 2, true);
    assert.strictEqual(TEST_NETBANKING_BANKS.length >= 4, true);
  });

  test('simulateTestPayment successfully generates simulated Razorpay payment receipt', async () => {
    const plan = PRICING_PLANS[0];
    const receipt = await simulateTestPayment({
      plan,
      method: 'card',
      details: { cardNumberMasked: '•••• •••• •••• 4444' },
      shouldFail: false,
    });

    assert.ok(receipt);
    assert.strictEqual(receipt.planId, plan.id);
    assert.strictEqual(receipt.amount, 99);
    assert.strictEqual(receipt.currency, 'INR');
    assert.strictEqual(receipt.method, 'card');
    assert.strictEqual(receipt.razorpay_payment_id.startsWith('pay_test_'), true);
    assert.strictEqual(receipt.razorpay_order_id.startsWith('order_test_'), true);
  });

  test('simulateTestPayment rejects properly on simulated decline', async () => {
    const plan = PRICING_PLANS[1];
    await assert.rejects(
      async () => {
        await simulateTestPayment({
          plan,
          method: 'card',
          details: {},
          shouldFail: true,
        });
      },
      /Transaction declined/
    );
  });

  test('saves, retrieves, and clears Pro status via storage service', () => {
    clearProStatus();
    assert.strictEqual(getProStatus(), null);

    const mockPro = {
      razorpay_payment_id: 'pay_test_ABC123',
      planId: 'pro_monthly',
      planName: 'Pro Monthly',
      amount: 499,
      date: new Date().toISOString(),
    };

    saveProStatus(mockPro);
    const retrieved = getProStatus();
    assert.ok(retrieved);
    assert.strictEqual(retrieved.razorpay_payment_id, 'pay_test_ABC123');
    assert.strictEqual(retrieved.planId, 'pro_monthly');

    clearProStatus();
    assert.strictEqual(getProStatus(), null);
  });
});
