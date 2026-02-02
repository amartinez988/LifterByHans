import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Uplio",
  description: "Privacy Policy for Uplio elevator service management platform",
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 mb-8">Last updated: February 2, 2026</p>
          
          <div className="prose prose-slate max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Uplio ("Company", "we", "us", or "our") respects your privacy and is committed to 
              protecting your personal data. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our elevator service management 
              platform ("Service").
            </p>
            <p>
              By using the Service, you consent to the practices described in this Privacy Policy.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, company name, job title</li>
              <li><strong>Business Data:</strong> Building information, elevator/escalator details, inspection records, work orders, service history</li>
              <li><strong>Payment Information:</strong> Billing address, payment card details (processed securely by our payment provider)</li>
              <li><strong>Communications:</strong> Messages, feedback, and support requests</li>
            </ul>

            <h3>2.2 Information Collected Automatically</h3>
            <ul>
              <li><strong>Usage Data:</strong> Pages visited, features used, actions taken, time spent</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Location Data:</strong> General location based on IP address; precise location only with consent for technician features</li>
              <li><strong>Cookies:</strong> Session cookies, authentication tokens, preference cookies</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide, maintain, and improve the Service</li>
              <li>Process transactions and send related information</li>
              <li>Send administrative notifications (service updates, security alerts)</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Monitor and analyze usage patterns to improve user experience</li>
              <li>Detect, prevent, and address technical issues and fraud</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Data Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            
            <h3>4.1 Service Providers</h3>
            <p>
              Third-party vendors who perform services on our behalf, such as:
            </p>
            <ul>
              <li>Cloud hosting (Vercel, database providers)</li>
              <li>Payment processing (Stripe)</li>
              <li>Email delivery (Resend)</li>
              <li>Analytics services</li>
            </ul>

            <h3>4.2 Your Organization</h3>
            <p>
              If you use the Service through a company account, your organization's administrators 
              may access your activity and data within the Service.
            </p>

            <h3>4.3 Legal Requirements</h3>
            <p>
              We may disclose information if required by law, legal process, or government request, 
              or to protect our rights, privacy, safety, or property.
            </p>

            <h3>4.4 Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, or sale of assets, your information may be 
              transferred as part of that transaction.
            </p>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your data, including:
            </p>
            <ul>
              <li>Encryption in transit (TLS/SSL) and at rest</li>
              <li>Access controls and authentication requirements</li>
              <li>Regular security assessments</li>
              <li>Employee training on data protection</li>
            </ul>
            <p>
              However, no method of transmission over the Internet is 100% secure. We cannot 
              guarantee absolute security of your data.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to 
              provide the Service. We may retain certain information as required by law or for 
              legitimate business purposes, such as:
            </p>
            <ul>
              <li>Maintaining records for tax and accounting purposes</li>
              <li>Resolving disputes</li>
              <li>Enforcing our agreements</li>
            </ul>
            <p>
              Upon account deletion, we will delete or anonymize your personal data within 90 days, 
              except as required by law.
            </p>

            <h2>7. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request transfer of your data in a portable format</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
            </ul>
            <p>
              To exercise these rights, contact us at hello@uplio.app. We will respond within 30 days.
            </p>

            <h2>8. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Keep you signed in</li>
              <li>Remember your preferences</li>
              <li>Understand how you use the Service</li>
              <li>Improve performance and user experience</li>
            </ul>
            <p>
              You can control cookies through your browser settings. Disabling cookies may affect 
              the functionality of the Service.
            </p>

            <h2>9. Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites. We are not responsible for 
              the privacy practices of these external sites. We encourage you to review their 
              privacy policies.
            </p>

            <h2>10. Children's Privacy</h2>
            <p>
              The Service is not intended for children under 16 years of age. We do not knowingly 
              collect personal data from children. If you believe we have collected data from a 
              child, please contact us immediately.
            </p>

            <h2>11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your 
              country of residence, including the United States. These countries may have different 
              data protection laws. We take appropriate safeguards to protect your data in accordance 
              with this Privacy Policy.
            </p>

            <h2>12. California Privacy Rights (CCPA)</h2>
            <p>
              California residents have additional rights under the California Consumer Privacy Act:
            </p>
            <ul>
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale of personal information (we do not sell personal data)</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>

            <h2>13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant 
              changes by email or through the Service. The "Last updated" date at the top indicates 
              when the policy was last revised.
            </p>

            <h2>14. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              <strong>Email:</strong> hello@uplio.app<br />
              <strong>Website:</strong> https://uplio.app
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          <Link href="/terms" className="hover:text-brand-600">Terms of Service</Link>
          <span className="mx-2">•</span>
          <Link href="/" className="hover:text-brand-600">Home</Link>
        </div>
      </div>
    </div>
  );
}
