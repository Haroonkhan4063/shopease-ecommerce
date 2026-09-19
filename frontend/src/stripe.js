import { loadStripe } from "@stripe/stripe-js";

// VITE_STRIPE_PUBLIC_KEY must be set in .env — see .env.example
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default stripePromise;
