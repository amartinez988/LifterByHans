import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Uplio",
  description: "Terms of Service for Uplio elevator service management platform",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link 
            href="/"
            className="text-brand-600 hover:text-brand-700 text-sm font-medium"
          >
            ← Back to Home
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-500 mb-8">Last updated: February 2, 2026</p>
          
          <div className="prose prose-slate max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Uplio ("Service"), operated by Uplio ("Company", "we", "us", or "our"), 
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
              do not use the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Uplio is a cloud-based software platform designed for elevator and escalator service companies 
              to manage their operations, including but not limited to:
            </p>
            <ul>
              <li>Building and unit management</li>
              <li>Inspection scheduling and tracking</li>
              <li>Work order management</li>
              <li>Technician dispatch and coordination</li>
              <li>Customer portal access</li>
              <li>Reporting and analytics</li>
            </ul>

            <h2>3. Account Registration</h2>
            <p>
              To use certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h2>4. Subscription and Payments</h2>
            <p>
              Certain features of the Service require a paid subscription. By subscribing, you agree to:
            </p>
            <ul>
              <li>Pay all applicable fees as described at the time of purchase</li>
              <li>Provide valid payment information</li>
              <li>Authorize us to charge your payment method on a recurring basis</li>
            </ul>
            <p>
              Subscriptions automatically renew unless cancelled before the renewal date. 
              Refunds are provided in accordance with our refund policy.
            </p>

            <h2>5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malicious code or interfere with the Service</li>
              <li>Attempt to gain unauthorized access to any systems</li>
              <li>Use the Service to harm, threaten, or harass others</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>

            <h2>6. Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-brand-600 hover:text-brand-700">
                Privacy Policy
              </Link>
              , which describes how we collect, use, and protect your information.
            </p>
            <p>
              You retain ownership of the data you submit to the Service. You grant us a limited license 
              to use this data solely to provide and improve the Service.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by Uplio and 
              are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2>8. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF 
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p>
              We do not warrant that the Service will be uninterrupted, secure, or error-free. 
              The Service is not intended to replace professional inspections, certifications, 
              or compliance with elevator safety regulations.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, UPLIO SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO 
              LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p>
              Our total liability shall not exceed the amount you paid us in the twelve (12) months 
              preceding the claim.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Uplio and its officers, directors, employees, 
              and agents from any claims, damages, losses, or expenses arising from your use of the 
              Service or violation of these Terms.
            </p>

            <h2>11. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Service immediately, 
              without prior notice, for conduct that we believe violates these Terms or is 
              harmful to other users, us, or third parties.
            </p>
            <p>
              Upon termination, your right to use the Service will cease immediately. 
              You may request export of your data within 30 days of termination.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of 
              significant changes via email or through the Service. Continued use after changes 
              constitutes acceptance of the modified Terms.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the 
              State of Florida, United States, without regard to its conflict of law provisions.
            </p>

            <h2>14. Contact Information</h2>
            <p>
              For questions about these Terms, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> hello@uplio.app<br />
              <strong>Website:</strong> https://uplio.app
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          <Link href="/privacy" className="hover:text-brand-600">Privacy Policy</Link>
          <span className="mx-2">•</span>
          <Link href="/" className="hover:text-brand-600">Home</Link>
        </div>
      </div>
    </div>
  );
}
