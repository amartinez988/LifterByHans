import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
  title: "Pricing | Uplio",
  description: "Simple, transparent pricing for elevator service companies of all sizes",
};

const plans = [
  {
    name: "Starter",
    price: "$49",
    description: "For small elevator companies",
    icon: "⚡",
    features: [
      "Up to 3 users",
      "Up to 100 units",
      "Basic reporting",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$149",
    description: "For growing companies",
    icon: "📋",
    features: [
      "Up to 10 users",
      "Unlimited units",
      "Analytics dashboard",
      "Customer portal",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$299",
    description: "For established companies",
    icon: "👑",
    features: [
      "Unlimited users",
      "Unlimited units",
      "Advanced analytics",
      "API access",
      "White-label options",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              UPLIO
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            No hidden fees. No surprises. Cancel anytime.
          </p>
          <p className="text-sm text-slate-500">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-brand-600 text-white shadow-xl scale-105"
                    : "bg-white border border-slate-200 shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-2xl mb-2">{plan.icon}</div>
                <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? "text-brand-100" : "text-slate-500"}`}>
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? "text-brand-100" : "text-slate-500"}`}>
                    /month
                  </span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? "text-brand-200" : "text-green-500"}`} />
                      <span className={`text-sm ${plan.highlighted ? "text-white" : "text-slate-600"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-white text-brand-600 hover:bg-brand-50"
                      : "bg-brand-600 text-white hover:bg-brand-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">How does the free trial work?</h3>
              <p className="text-slate-600">
                Every plan includes a 14-day free trial with full access to all features. 
                No credit card required to start. You can upgrade, downgrade, or cancel anytime.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I change plans later?</h3>
              <p className="text-slate-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect 
                on your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">What counts as a unit?</h3>
              <p className="text-slate-600">
                A unit is any elevator, escalator, or lift that you manage. Each piece of 
                equipment counts as one unit regardless of the building.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Do you offer annual billing?</h3>
              <p className="text-slate-600">
                Yes! Annual plans get 2 months free. Contact us for annual pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Ready to streamline your operation?
          </h2>
          <p className="text-slate-600 mb-8">
            Join elevator service companies who trust Uplio to manage their business.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-brand-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                UPLIO
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/terms" className="text-slate-500 hover:text-brand-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-slate-500 hover:text-brand-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-slate-500 hover:text-brand-600 transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} UPLIO. Built for the vertical transport industry.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
