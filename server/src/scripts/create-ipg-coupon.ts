import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20'
});

async function createIPGCoupon() {
    try {
        console.log('Creating IPG coupon ($100 off Basic tier)...');

        const coupon = await stripe.coupons.create({
            id: 'ipg-100-off',
            amount_off: 10000,
            currency: 'usd',
            duration: 'forever',
            name: 'IPG $100 Off'
        });

        console.log('Coupon created:', coupon.id);

        const promotionCode = await stripe.promotionCodes.create({
            coupon: coupon.id,
            code: 'IPG',
            active: true
        });

        console.log('Promotion code created:', promotionCode.code);
        console.log('\nSuccess! Users can now enter "IPG" during checkout to get $100 off.');
        console.log('This makes the Basic tier $50/month instead of $150/month.');

    } catch (error: any) {
        if (error.code === 'resource_already_exists') {
            console.log('Coupon or promotion code already exists. Checking status...');
            
            try {
                const existingCoupon = await stripe.coupons.retrieve('ipg-100-off');
                console.log('Existing coupon found:', existingCoupon.id, existingCoupon.name);
                
                const promoCodes = await stripe.promotionCodes.list({
                    code: 'IPG',
                    limit: 1
                });
                
                if (promoCodes.data.length > 0) {
                    console.log('Existing promotion code found:', promoCodes.data[0].code);
                    console.log('Status: Active =', promoCodes.data[0].active);
                }
            } catch (e) {
                console.log('Could not retrieve existing resources');
            }
        } else {
            console.error('Error creating coupon:', error.message);
        }
    }
}

createIPGCoupon();
