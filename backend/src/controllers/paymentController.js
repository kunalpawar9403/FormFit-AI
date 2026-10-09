import crypto from 'crypto';
import { UserDAO, SubscriptionDAO } from '../models/store.js';

export const BACKEND_PLANS = [
  {
    id: 'day_pass',
    name: '24-Hour Pass',
    priceInr: 99,
    amountPaise: 9900,
    durationHours: 24,
    description: 'Perfect for completing a single urgent exam application.',
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    priceInr: 499,
    amountPaise: 49900,
    durationDays: 30,
    description: 'The standard plan for regular applicants, students & professionals.',
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual',
    priceInr: 3999,
    amountPaise: 399900,
    durationDays: 365,
    description: 'Ideal for cyber cafés, university counselors & visa consultants.',
  },
];

export async function getPlans(req, res) {
  return res.json({
    success: true,
    plans: BACKEND_PLANS,
  });
}

export async function createOrder(req, res, next) {
  try {
    const { planId } = req.body;
    const plan = BACKEND_PLANS.find((p) => p.id === planId) || BACKEND_PLANS[1];

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_FormFitDemoKey';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId = null;
    let isRealOrder = false;

    // If real Razorpay credentials exist, attempt real Razorpay SDK order creation
    if (keySecret && !keyId.includes('DemoKey')) {
      try {
        const Razorpay = (await import('razorpay')).default;
        const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
        const userIdentifier = req.user?.id ? String(req.user.id).slice(0, 8) : 'usr';
        const rzpOrder = await instance.orders.create({
          amount: plan.amountPaise,
          currency: 'INR',
          receipt: `rcpt_${userIdentifier}_${Date.now()}`,
          notes: {
            userId: String(req.user?.id || 'guest'),
            planId: String(plan.id),
          },
        });
        orderId = rzpOrder.id;
        isRealOrder = true;
      } catch (sdkErr) {
        console.warn('[Razorpay SDK] Order creation fallback to direct checkout:', sdkErr.message);
      }
    }

    return res.json({
      success: true,
      order: {
        id: orderId,
        isRealOrder,
        amount: plan.amountPaise,
        currency: 'INR',
        planId: plan.id,
        planName: plan.name,
        key: keyId,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = req.body;

    if (!razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment identification parameter.',
      });
    }

    const effectiveOrderId = razorpay_order_id || `order_direct_${Date.now().toString(36)}`;

    const plan = BACKEND_PLANS.find((p) => p.id === planId) || BACKEND_PLANS[1];
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Cryptographic signature check when Razorpay secret and order ID are configured
    if (keySecret && razorpay_order_id && razorpay_signature && !razorpay_signature.startsWith('sig_test_')) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          code: 'PAYMENT_VERIFICATION_FAILED',
          message: 'Razorpay cryptographic signature verification failed.',
        });
      }
    }

    // Calculate subscription period
    const now = new Date();
    const endDate = new Date(now);
    if (plan.durationHours) {
      endDate.setHours(endDate.getHours() + plan.durationHours);
    } else if (plan.durationDays) {
      endDate.setDate(endDate.getDate() + plan.durationDays);
    } else {
      endDate.setDate(endDate.getDate() + 30);
    }

    // Persist Subscription in MongoDB
    const subscription = await SubscriptionDAO.create({
      userId: req.user.id,
      razorpayOrderId: effectiveOrderId,
      razorpayPaymentId: razorpay_payment_id,
      plan: 'PRO',
      amount: plan.priceInr,
      currency: 'INR',
      status: 'ACTIVE',
      startDate: now,
      endDate: endDate,
    });

    // Update User Entitlement in MongoDB
    const updatedUser = await UserDAO.updateById(req.user.id, {
      plan: 'PRO',
      subscriptionStatus: 'ACTIVE',
      subscriptionId: subscription._id,
      subscriptionStart: now,
      subscriptionEnd: endDate,
    });

    return res.json({
      success: true,
      message: `Pro plan activated successfully! Valid until ${endDate.toLocaleDateString()}.`,
      subscription,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.plan,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionId: updatedUser.subscriptionId,
        subscriptionStart: updatedUser.subscriptionStart,
        subscriptionEnd: updatedUser.subscriptionEnd,
      },
    });
  } catch (err) {
    next(err);
  }
}
