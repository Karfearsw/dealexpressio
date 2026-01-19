import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-06-20'
});

interface TierSetup {
    name: string;
    price: number;
    description: string;
}

const tiers: TierSetup[] = [
    {
        name: 'Basic',
        price: 15000,
        description: '400 leads per month (FSBO & County Records)'
    },
    {
        name: 'Pro',
        price: 25000,
        description: '700 leads per month (FSBO & County Records)'
    },
    {
        name: 'Enterprise',
        price: 50000,
        description: '1,200 leads including 20 prequalified inbound leads with recordings'
    }
];

async function setupStripeProducts() {
    console.log('Setting up Stripe products and prices...\n');

    const results: Record<string, string> = {};

    for (const tier of tiers) {
        try {
            const existingProducts = await stripe.products.list({
                limit: 100
            });
            
            let product = existingProducts.data.find(p => p.name === `DealExpress ${tier.name}`);
            
            if (!product) {
                product = await stripe.products.create({
                    name: `DealExpress ${tier.name}`,
                    description: tier.description,
                    metadata: {
                        tier: tier.name.toLowerCase()
                    }
                });
                console.log(`Created product: ${product.name} (${product.id})`);
            } else {
                console.log(`Product already exists: ${product.name} (${product.id})`);
            }

            const existingPrices = await stripe.prices.list({
                product: product.id,
                active: true
            });

            let price = existingPrices.data.find(p => 
                p.unit_amount === tier.price && 
                p.recurring?.interval === 'month'
            );

            if (!price) {
                price = await stripe.prices.create({
                    product: product.id,
                    unit_amount: tier.price,
                    currency: 'usd',
                    recurring: {
                        interval: 'month'
                    },
                    metadata: {
                        tier: tier.name.toLowerCase()
                    }
                });
                console.log(`Created price: $${tier.price / 100}/month (${price.id})`);
            } else {
                console.log(`Price already exists: $${tier.price / 100}/month (${price.id})`);
            }

            results[tier.name.toLowerCase()] = price.id;
        } catch (error) {
            console.error(`Error setting up ${tier.name}:`, error);
        }
    }

    console.log('\n=== Environment Variables to Set ===\n');
    console.log(`STRIPE_PRICE_BASIC=${results.basic}`);
    console.log(`STRIPE_PRICE_PRO=${results.pro}`);
    console.log(`STRIPE_PRICE_ENTERPRISE=${results.enterprise}`);
    console.log('\nAdd these to your environment variables.');

    return results;
}

setupStripeProducts()
    .then(() => {
        console.log('\nSetup complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Setup failed:', error);
        process.exit(1);
    });
