'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Terms of Service</h1>
              <p className="text-gray-600 mt-2">Last Updated: June 6, 2025</p>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white">
          <div className="prose prose-lg max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Clubly ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not use the Platform.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Clubly is an educational platform designed to facilitate student club management and teacher-student advisor relationships. The Platform provides tools for:
            </p>
            <ul>
              <li>Club organization and management</li>
              <li>Teacher advisor matching and communication</li>
              <li>Meeting scheduling and management</li>
              <li>AI-powered content generation (presentations, emails, roadmaps)</li>
              <li>Educational resource sharing and collaboration</li>
            </ul>

            <h2>3. User Accounts and Registration</h2>
            
            <h3>3.1 Account Creation</h3>
            <ul>
              <li><strong>Accurate Information:</strong> You must provide accurate, current, and complete information</li>
              <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account</li>
              <li><strong>Age Requirements:</strong> You must be at least 13 years old to create an account</li>
              <li><strong>Educational Use:</strong> Accounts are intended for educational purposes only</li>
            </ul>

            <h3>3.2 Account Types</h3>
            <ul>
              <li><strong>Student Accounts:</strong> For students participating in clubs and organizations</li>
              <li><strong>Teacher Accounts:</strong> For educators serving as club advisors</li>
              <li><strong>Administrator Accounts:</strong> For school administrators managing the platform</li>
            </ul>

            <h2>4. Acceptable Use Policy</h2>
            
            <h3>4.1 Permitted Uses</h3>
            <ul>
              <li><strong>Educational Activities:</strong> Use for legitimate educational and club-related purposes</li>
              <li><strong>Professional Communication:</strong> Appropriate communication between students and teachers</li>
              <li><strong>Content Creation:</strong> Generate educational content using our AI tools</li>
              <li><strong>Collaboration:</strong> Work together on club projects and activities</li>
            </ul>

            <h3>4.2 Prohibited Uses</h3>
            <ul>
              <li><strong>Illegal Activities:</strong> Any use that violates applicable laws or regulations</li>
              <li><strong>Harassment:</strong> Bullying, intimidation, or harassment of other users</li>
              <li><strong>Inappropriate Content:</strong> Sharing content that is offensive, discriminatory, or inappropriate</li>
              <li><strong>Commercial Use:</strong> Using the platform for commercial purposes without permission</li>
              <li><strong>Security Violations:</strong> Attempting to hack, disrupt, or compromise the platform</li>
              <li><strong>Impersonation:</strong> Creating fake accounts or impersonating others</li>
            </ul>

            <h2>5. Content and Intellectual Property</h2>
            
            <h3>5.1 User-Generated Content</h3>
            <ul>
              <li><strong>Ownership:</strong> You retain ownership of content you create and upload</li>
              <li><strong>License to Us:</strong> You grant us a limited license to use your content to provide the service</li>
              <li><strong>Responsibility:</strong> You are responsible for ensuring your content complies with these Terms</li>
              <li><strong>Removal Rights:</strong> We may remove content that violates these Terms</li>
            </ul>

            <h3>5.2 AI-Generated Content</h3>
            <ul>
              <li><strong>Ownership:</strong> You own AI-generated content created using our tools</li>
              <li><strong>Usage Rights:</strong> You may use AI-generated content for educational purposes</li>
              <li><strong>Attribution:</strong> No attribution to Clubly is required for AI-generated content</li>
              <li><strong>Limitations:</strong> AI-generated content should be reviewed for accuracy and appropriateness</li>
            </ul>

            <h3>5.3 Platform Content</h3>
            <ul>
              <li><strong>Our Ownership:</strong> We own the Platform, including software, design, and functionality</li>
              <li><strong>Limited License:</strong> We grant you a limited, non-exclusive license to use the Platform</li>
              <li><strong>No Reverse Engineering:</strong> You may not reverse engineer or attempt to extract source code</li>
            </ul>

            <h2>6. Privacy and Data Protection</h2>
            
            <h3>6.1 Data Collection</h3>
            <ul>
              <li><strong>Personal Information:</strong> We collect information necessary to provide our services</li>
              <li><strong>Usage Data:</strong> We collect data about how you use the Platform</li>
              <li><strong>Educational Records:</strong> We handle educational data in compliance with applicable laws</li>
              <li><strong>Privacy Policy:</strong> Our Privacy Policy governs data collection and use</li>
            </ul>

            <h3>6.2 Data Security</h3>
            <ul>
              <li><strong>Security Measures:</strong> We implement appropriate security measures to protect your data</li>
              <li><strong>No Guarantees:</strong> While we strive to protect your data, no system is 100% secure</li>
              <li><strong>Breach Notification:</strong> We will notify you of any data breaches as required by law</li>
            </ul>

            <h2>7. Teacher-Student Relationships</h2>
            
            <h3>7.1 Professional Boundaries</h3>
            <ul>
              <li><strong>Appropriate Communication:</strong> All communication must be professional and appropriate</li>
              <li><strong>Educational Focus:</strong> Interactions should focus on educational and club-related matters</li>
              <li><strong>Reporting Requirements:</strong> Teachers must report any concerning behavior or content</li>
              <li><strong>School Policies:</strong> Users must comply with their school's policies and procedures</li>
            </ul>

            <h3>7.2 Advisor Responsibilities</h3>
            <ul>
              <li><strong>Mentorship:</strong> Teachers serving as advisors should provide appropriate guidance</li>
              <li><strong>Safety:</strong> Ensure a safe and supportive environment for all students</li>
              <li><strong>Confidentiality:</strong> Maintain appropriate confidentiality of student information</li>
              <li><strong>Professional Development:</strong> Stay informed about best practices in student advising</li>
            </ul>

            <h2>8. AI Tools and Features</h2>
            
            <h3>8.1 AI Content Generation</h3>
            <ul>
              <li><strong>Educational Use:</strong> AI tools are designed for educational purposes</li>
              <li><strong>Accuracy:</strong> AI-generated content should be reviewed for accuracy and appropriateness</li>
              <li><strong>Originality:</strong> Users are responsible for ensuring content originality and avoiding plagiarism</li>
              <li><strong>Limitations:</strong> AI tools have limitations and may not always produce perfect results</li>
            </ul>

            <h3>8.2 Content Review</h3>
            <ul>
              <li><strong>User Responsibility:</strong> Users must review all AI-generated content before use</li>
              <li><strong>Appropriateness:</strong> Ensure content is appropriate for the educational context</li>
              <li><strong>Compliance:</strong> Content must comply with school policies and applicable laws</li>
              <li><strong>Quality Control:</strong> We reserve the right to review and moderate AI-generated content</li>
            </ul>

            <h2>9. Payment and Billing</h2>
            
            <h3>9.1 Free Tier</h3>
            <ul>
              <li><strong>Basic Features:</strong> Free access to core platform features</li>
              <li><strong>Limitations:</strong> Some advanced features may require a paid subscription</li>
              <li><strong>No Payment Required:</strong> No credit card required for basic account creation</li>
            </ul>

            <h3>9.2 Paid Features</h3>
            <ul>
              <li><strong>Subscription Plans:</strong> Premium features available through paid subscriptions</li>
              <li><strong>Billing:</strong> Billing handled through secure third-party payment processors</li>
              <li><strong>Cancellation:</strong> You may cancel your subscription at any time</li>
              <li><strong>Refunds:</strong> Refund policy as specified in your subscription agreement</li>
            </ul>

            <h2>10. Termination</h2>
            
            <h3>10.1 Account Termination</h3>
            <ul>
              <li><strong>Your Right:</strong> You may terminate your account at any time</li>
              <li><strong>Our Right:</strong> We may terminate accounts that violate these Terms</li>
              <li><strong>Effect of Termination:</strong> Access to the Platform will cease upon termination</li>
              <li><strong>Data Retention:</strong> Data retention policies apply as specified in our Privacy Policy</li>
            </ul>

            <h3>10.2 Suspension</h3>
            <ul>
              <li><strong>Temporary Suspension:</strong> We may suspend accounts pending investigation</li>
              <li><strong>Permanent Ban:</strong> Repeated violations may result in permanent account termination</li>
              <li><strong>Appeal Process:</strong> Users may appeal termination decisions through our support system</li>
            </ul>

            <h2>11. Disclaimers and Limitations</h2>
            
            <h3>11.1 Service Availability</h3>
            <ul>
              <li><strong>No Guarantees:</strong> We do not guarantee uninterrupted service availability</li>
              <li><strong>Maintenance:</strong> We may perform maintenance that temporarily affects service</li>
              <li><strong>Third-Party Dependencies:</strong> Service may be affected by third-party service outages</li>
            </ul>

            <h3>11.2 Limitation of Liability</h3>
            <ul>
              <li><strong>No Warranty:</strong> The Platform is provided "as is" without warranties</li>
              <li><strong>Limitation:</strong> Our liability is limited to the maximum extent permitted by law</li>
              <li><strong>Exclusions:</strong> We are not liable for indirect, incidental, or consequential damages</li>
            </ul>

            <h2>12. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Clubly, its officers, directors, employees, and agents from any claims, damages, or expenses arising from:
            </p>
            <ul>
              <li>Your use of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Content you create or share on the Platform</li>
            </ul>

            <h2>13. Governing Law and Dispute Resolution</h2>
            
            <h3>13.1 Governing Law</h3>
            <ul>
              <li><strong>Jurisdiction:</strong> These Terms are governed by the laws of the United States</li>
              <li><strong>Venue:</strong> Any legal proceedings must be brought in the appropriate courts</li>
              <li><strong>Severability:</strong> If any provision is found invalid, the remaining provisions remain in effect</li>
            </ul>

            <h3>13.2 Dispute Resolution</h3>
            <ul>
              <li><strong>Good Faith:</strong> We encourage resolving disputes through good faith communication</li>
              <li><strong>Mediation:</strong> Disputes may be resolved through mediation before legal action</li>
              <li><strong>Arbitration:</strong> Some disputes may be subject to binding arbitration</li>
            </ul>

            <h2>14. Changes to Terms</h2>
            
            <h3>14.1 Modification Rights</h3>
            <ul>
              <li><strong>Our Right:</strong> We may modify these Terms at any time</li>
              <li><strong>Notification:</strong> We will notify users of material changes</li>
              <li><strong>Acceptance:</strong> Continued use constitutes acceptance of modified Terms</li>
              <li><strong>Effective Date:</strong> Changes become effective as specified in the notification</li>
            </ul>

            <h2>15. Contact Information</h2>
            
            <h3>15.1 General Inquiries</h3>
            <ul>
              <li><strong>Email:</strong> clublyteam@gmail.com</li>
              <li><strong>Response Time:</strong> We respond to inquiries within 24-48 hours</li>
              <li><strong>Business Hours:</strong> Monday-Friday, 9 AM - 5 PM EST</li>
            </ul>

            <h3>15.2 Legal Matters</h3>
            <ul>
              <li><strong>Email:</strong> clublyteam@gmail.com</li>
              <li><strong>Purpose:</strong> For legal notices, copyright issues, and Terms-related matters</li>
            </ul>

            <h2>16. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions will remain in full force and effect.
            </p>

            <h2>17. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Clubly regarding the use of the Platform.
            </p>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                By using Clubly, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:clublyteam@gmail.com" className="text-blue-600 hover:underline">
                  clublyteam@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}