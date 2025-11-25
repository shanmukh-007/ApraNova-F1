# Stripe Integration Setup Checklist

## 📋 Pre-Deployment Checklist

### Development Setup

- [ ] **Install Stripe Dependencies**
  ```bash
  cd frontend
  npm install @stripe/stripe-js @stripe/react-stripe-js
  ```

- [ ] **Get Stripe Test Keys**
  - [ ] Visit https://dashboard.stripe.com/test/apikeys
  - [ ] Copy Publishable key (pk_test_...)
  - [ ] Copy Secret key (sk_test_...)

- [ ] **Configure Environment Variables**
  - [ ] Add `STRIPE_SECRET_KEY` to `.env`
  - [ ] Add `STRIPE_PUBLISHABLE_KEY` to `.env`
  - [ ] Verify no extra spaces or quotes

- [ ] **Start Services**
  - [ ] Backend running: `docker-compose up`
  - [ ] Frontend running: `cd frontend && npm run dev`
  - [ ] Both accessible (backend:8000, frontend:3000)

### Testing

- [ ] **Test Successful Payment**
  - [ ] Navigate to http://localhost:3000
  - [ ] Click "Get Started"
  - [ ] Select a track (DP or FSD)
  - [ ] Enter test card: `4242 4242 4242 4242`
  - [ ] Expiry: `12/34`, CVC: `123`, ZIP: `12345`
  - [ ] Click "Pay $999"
  - [ ] Verify success page appears
  - [ ] Check payment in Stripe Dashboard

- [ ] **Test Declined Payment**
  - [ ] Use card: `4000 0000 0000 9995`
  - [ ] Verify error message appears
  - [ ] Verify can retry payment

- [ ] **Test Payment Cancellation**
  - [ ] Start payment process
  - [ ] Close browser tab
  - [ ] Verify payment status in database

- [ ] **Verify User Enrollment**
  - [ ] After successful payment
  - [ ] Check user's track is updated
  - [ ] Verify user can access dashboard
  - [ ] Verify user can launch workspace

- [ ] **Check Database Records**
  - [ ] Payment record created
  - [ ] Status is "succeeded"
  - [ ] Amount is correct
  - [ ] User is linked correctly

### Production Setup

- [ ] **Get Live Stripe Keys**
  - [ ] Switch to Live mode in Stripe Dashboard
  - [ ] Copy Live Publishable key (pk_live_...)
  - [ ] Copy Live Secret key (sk_live_...)

- [ ] **Update Production Environment**
  - [ ] Add live keys to production `.env`
  - [ ] Never commit keys to version control
  - [ ] Use environment variables or secrets manager

- [ ] **Set Up Webhooks**
  - [ ] Go to Stripe Dashboard → Developers → Webhooks
  - [ ] Add endpoint: `https://yourdomain.com/api/payments/webhook/`
  - [ ] Select events:
    - [ ] `payment_intent.succeeded`
    - [ ] `payment_intent.payment_failed`
    - [ ] `payment_intent.canceled`
  - [ ] Copy Webhook Signing Secret
  - [ ] Add to production `.env`: `STRIPE_WEBHOOK_SECRET`

- [ ] **Test Webhooks**
  - [ ] Make a test payment in production
  - [ ] Verify webhook is received
  - [ ] Check webhook logs in Stripe Dashboard
  - [ ] Verify payment status updates correctly

- [ ] **Security Review**
  - [ ] HTTPS enabled on production
  - [ ] API keys stored securely
  - [ ] Webhook signature verification enabled
  - [ ] CORS configured correctly
  - [ ] Rate limiting enabled (optional)

### Optional Enhancements

- [ ] **Email Notifications**
  - [ ] Payment success email
  - [ ] Payment failure email
  - [ ] Receipt email with PDF

- [ ] **Payment History Page**
  - [ ] Show user's past payments
  - [ ] Download receipts
  - [ ] View payment status

- [ ] **Refund Functionality**
  - [ ] Admin can issue refunds
  - [ ] Automatic enrollment revocation
  - [ ] Refund notification emails

- [ ] **Analytics Dashboard**
  - [ ] Track conversion rates
  - [ ] Monitor payment success rate
  - [ ] Revenue by track
  - [ ] Failed payment reasons

- [ ] **Discount Codes**
  - [ ] Create discount model
  - [ ] Add discount field to payment form
  - [ ] Validate discount codes
  - [ ] Apply discounts to payment amount

- [ ] **Multiple Payment Methods**
  - [ ] Enable Apple Pay
  - [ ] Enable Google Pay
  - [ ] Enable local payment methods (UPI, etc.)

### Documentation

- [ ] **Update User Documentation**
  - [ ] Payment process guide
  - [ ] Refund policy
  - [ ] FAQ about payments

- [ ] **Update Developer Documentation**
  - [ ] API documentation
  - [ ] Webhook handling
  - [ ] Testing guide

- [ ] **Create Support Materials**
  - [ ] Troubleshooting guide
  - [ ] Common error messages
  - [ ] Contact support info

### Monitoring & Maintenance

- [ ] **Set Up Monitoring**
  - [ ] Payment success rate alerts
  - [ ] Failed payment alerts
  - [ ] Webhook delivery alerts
  - [ ] Revenue tracking

- [ ] **Regular Reviews**
  - [ ] Weekly payment reports
  - [ ] Monthly revenue analysis
  - [ ] Quarterly security audit
  - [ ] Annual Stripe account review

- [ ] **Backup & Recovery**
  - [ ] Database backups include payments
  - [ ] Payment data retention policy
  - [ ] Disaster recovery plan

## 🎯 Quick Status Check

### Is Everything Working?

Run through this quick test:

1. ✅ Can access payment page
2. ✅ Payment form loads correctly
3. ✅ Test payment succeeds
4. ✅ Success page appears
5. ✅ User can access dashboard
6. ✅ Payment appears in Stripe Dashboard
7. ✅ Payment record in database

If all ✅, you're good to go!

## 📞 Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe Support**: https://support.stripe.com
- **Stripe Status**: https://status.stripe.com

## 🚨 Emergency Contacts

- **Stripe Support**: support@stripe.com
- **Technical Issues**: Check Stripe Dashboard → Help
- **Payment Disputes**: Stripe Dashboard → Disputes

---

**Last Updated**: November 20, 2025  
**Version**: 1.0  
**Status**: Ready for Implementation

