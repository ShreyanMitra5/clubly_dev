'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Privacy Policy</h1>
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
            <h2>1. Introduction</h2>
            <p>
              Clubly ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our educational platform designed for student clubs and teacher advisors.
            </p>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Account Information</h3>
            <ul>
              <li><strong>Personal Details:</strong> Name, email address, and profile information provided during registration</li>
              <li><strong>Authentication Data:</strong> Managed securely through Clerk (SOC 2 Type II compliant)</li>
              <li><strong>Educational Information:</strong> School affiliation, teacher credentials, room numbers, and availability preferences</li>
              <li><strong>Contact Information:</strong> Email addresses for communication and notifications</li>
            </ul>
            
            <h3>2.2 Club and Activity Data</h3>
            <ul>
              <li><strong>Club Information:</strong> Names, descriptions, mission statements, and organizational details</li>
              <li><strong>Membership Data:</strong> Member lists, roles, and participation records</li>
              <li><strong>Meeting Records:</strong> Schedules, attendance, notes, and summaries</li>
              <li><strong>Content Creation:</strong> AI-generated presentations, emails, roadmaps, and other educational materials</li>
              <li><strong>Communication Logs:</strong> Messages between students and teachers, advisor requests, and meeting bookings</li>
            </ul>

            <h3>2.3 Usage Information</h3>
            <ul>
              <li><strong>Platform Activity:</strong> Features used, time spent, and interaction patterns</li>
              <li><strong>AI Content:</strong> Presentations, emails, and roadmaps generated through our AI tools</li>
              <li><strong>Scheduling Data:</strong> Meeting bookings, availability preferences, and calendar integration</li>
              <li><strong>Performance Metrics:</strong> Platform usage statistics and feature adoption rates</li>
            </ul>

            <h3>2.4 Technical Information</h3>
            <ul>
              <li><strong>Device Data:</strong> IP address, browser type, operating system, and device identifiers</li>
              <li><strong>Log Data:</strong> Server logs, error reports, and performance monitoring data</li>
              <li><strong>Cookies and Tracking:</strong> Essential cookies for platform functionality (no third-party advertising cookies)</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            
            <h3>3.1 Core Platform Services</h3>
            <ul>
              <li>Provide and maintain the Clubly educational platform</li>
              <li>Enable club management and organization features</li>
              <li>Facilitate teacher-student advisor relationships and communication</li>
              <li>Generate AI-powered educational content (presentations, emails, roadmaps)</li>
              <li>Schedule and manage meetings, events, and club activities</li>
            </ul>

            <h3>3.2 Communication and Support</h3>
            <ul>
              <li>Send important updates about your clubs and activities</li>
              <li>Notify you of meeting requests, advisor approvals, and platform updates</li>
              <li>Provide technical support and customer service</li>
              <li>Send educational content, tips, and platform improvements</li>
            </ul>

            <h3>3.3 Platform Improvement</h3>
            <ul>
              <li>Analyze usage patterns to enhance our services</li>
              <li>Develop new features based on user needs and feedback</li>
              <li>Ensure platform security and prevent abuse or misuse</li>
              <li>Conduct research to improve educational outcomes and user experience</li>
            </ul>

            <h2>4. Data Security and Protection</h2>
            
            <h3>4.1 Security Measures</h3>
            <ul>
              <li><strong>Encryption:</strong> End-to-end encryption for all data transmission using industry-standard protocols</li>
              <li><strong>Authentication:</strong> Secure authentication via Clerk with multi-factor authentication support</li>
              <li><strong>Database Security:</strong> Enterprise-grade encryption at rest using Supabase</li>
              <li><strong>Access Controls:</strong> Role-based permissions and strict access controls</li>
              <li><strong>Regular Audits:</strong> Ongoing security assessments and penetration testing</li>
            </ul>

            <h3>4.2 Data Retention</h3>
            <ul>
              <li><strong>Account Data:</strong> Retained while your account is active and for 30 days after closure</li>
              <li><strong>Club Data:</strong> Retained for 7 years after club closure for educational record purposes</li>
              <li><strong>Meeting Records:</strong> Retained for 3 years for administrative and educational purposes</li>
              <li><strong>AI-Generated Content:</strong> Retained for 2 years or until manually deleted by users</li>
              <li><strong>Logs and Analytics:</strong> Retained for 1 year for security and performance monitoring</li>
            </ul>

            <h3>4.3 Data Sharing and Disclosure</h3>
            <ul>
              <li><strong>No Sale of Data:</strong> We never sell your personal information to third parties</li>
              <li><strong>Consent-Based Sharing:</strong> Data is only shared with your explicit consent</li>
              <li><strong>Anonymous Analytics:</strong> Aggregated, anonymized data may be used for research and platform improvement</li>
              <li><strong>Legal Compliance:</strong> Data may be disclosed when required by law or to protect our rights</li>
              <li><strong>Service Providers:</strong> Limited sharing with trusted partners (Clerk, Supabase, Groq) under strict data protection agreements</li>
            </ul>

            <h2>5. Your Rights and Choices</h2>
            
            <h3>5.1 Access and Control</h3>
            <ul>
              <li><strong>Data Access:</strong> View and download all your data at any time through your account settings</li>
              <li><strong>Data Correction:</strong> Update or correct your personal information</li>
              <li><strong>Account Deletion:</strong> Delete your account and associated data (with 30-day recovery period)</li>
              <li><strong>Communication Preferences:</strong> Opt out of non-essential communications</li>
              <li><strong>Privacy Settings:</strong> Control visibility of your club activities and information</li>
            </ul>

            <h3>5.2 Data Portability</h3>
            <ul>
              <li><strong>Export Capabilities:</strong> Download your club data in standard formats (JSON, CSV)</li>
              <li><strong>Content Transfer:</strong> Export AI-generated content you've created</li>
              <li><strong>Meeting Records:</strong> Access and download meeting attendance and notes</li>
              <li><strong>Communication History:</strong> Retrieve message logs and advisor communications</li>
            </ul>

            <h3>5.3 Privacy Controls</h3>
            <ul>
              <li><strong>Club Visibility:</strong> Control who can see your club information and activities</li>
              <li><strong>Advisor Requests:</strong> Manage who can request you as an advisor</li>
              <li><strong>Meeting Availability:</strong> Set and control your meeting availability preferences</li>
              <li><strong>AI Content Settings:</strong> Control AI content generation and storage preferences</li>
            </ul>

            <h2>6. Third-Party Services</h2>
            
            <h3>6.1 Authentication (Clerk)</h3>
            <ul>
              <li><strong>Purpose:</strong> Handles user authentication and account management</li>
              <li><strong>Compliance:</strong> SOC 2 Type II compliant with strict security standards</li>
              <li><strong>Data Access:</strong> Does not have access to your club content or activities</li>
              <li><strong>Privacy Policy:</strong> Available at clerk.com/privacy</li>
            </ul>

            <h3>6.2 Database Services (Supabase)</h3>
            <ul>
              <li><strong>Purpose:</strong> Stores your data securely with enterprise-grade encryption</li>
              <li><strong>Compliance:</strong> GDPR compliant with data residency options</li>
              <li><strong>Security:</strong> Regular security audits and 24/7 monitoring</li>
              <li><strong>Privacy Policy:</strong> Available at supabase.com/privacy</li>
            </ul>

            <h3>6.3 AI Services (Groq)</h3>
            <ul>
              <li><strong>Purpose:</strong> Processes content to generate presentations, emails, and roadmaps</li>
              <li><strong>Data Handling:</strong> Does not store your content after processing</li>
              <li><strong>Usage:</strong> Uses your data only for the specific AI generation you request</li>
              <li><strong>Privacy Policy:</strong> Available at groq.com/privacy</li>
            </ul>

            <h2>7. Children's Privacy (COPPA Compliance)</h2>
            
            <h3>7.1 Age Restrictions</h3>
            <ul>
              <li><strong>Under 13:</strong> We do not knowingly collect personal information from children under 13</li>
              <li><strong>Immediate Deletion:</strong> If we discover data from a child under 13, we will delete it immediately</li>
              <li><strong>Parental Rights:</strong> Parents can contact us to review, update, or delete their child's information</li>
              <li><strong>Consent Requirements:</strong> We require parental consent for users under 18 in certain jurisdictions</li>
            </ul>

            <h3>7.2 Educational Use</h3>
            <ul>
              <li><strong>Institutional Oversight:</strong> Platform is designed for educational institutions and student organizations</li>
              <li><strong>Teacher Monitoring:</strong> Teachers and administrators can monitor appropriate student activity</li>
              <li><strong>School Partnerships:</strong> We work with schools to ensure appropriate data handling</li>
              <li><strong>FERPA Compliance:</strong> Educational records are protected under FERPA guidelines where applicable</li>
            </ul>

            <h2>8. International Data Transfers</h2>
            <ul>
              <li><strong>Primary Storage:</strong> Data is primarily stored in the United States</li>
              <li><strong>International Users:</strong> Additional safeguards are in place for international data transfers</li>
              <li><strong>Adequacy Decisions:</strong> We rely on adequacy decisions and standard contractual clauses</li>
              <li><strong>User Rights:</strong> International users maintain the same privacy rights and protections</li>
            </ul>

            <h2>9. Cookies and Tracking Technologies</h2>
            
            <h3>9.1 Essential Cookies</h3>
            <ul>
              <li><strong>Authentication:</strong> Required for user login and session management</li>
              <li><strong>Functionality:</strong> Necessary for platform features and user preferences</li>
              <li><strong>Security:</strong> Used for fraud prevention and security monitoring</li>
            </ul>

            <h3>9.2 No Advertising Cookies</h3>
            <ul>
              <li><strong>No Third-Party Tracking:</strong> We do not use advertising or marketing cookies</li>
              <li><strong>No Behavioral Tracking:</strong> We do not track users across other websites</li>
              <li><strong>Privacy-First:</strong> Our cookie usage is minimal and focused on platform functionality</li>
            </ul>

            <h2>10. Contact Information</h2>
            
            <h3>10.1 Privacy Inquiries</h3>
            <ul>
              <li><strong>Email:</strong> clublyteam@gmail.com</li>
              <li><strong>Response Time:</strong> We respond to all privacy inquiries within 48 hours</li>
              <li><strong>Data Requests:</strong> Use the same email for data access, correction, or deletion requests</li>
            </ul>

            <h3>10.2 Data Protection Officer</h3>
            <ul>
              <li><strong>Contact:</strong> clublyteam@gmail.com</li>
              <li><strong>Purpose:</strong> For complex privacy questions or concerns</li>
              <li><strong>Availability:</strong> Business hours, Monday-Friday</li>
            </ul>

            <h2>11. Policy Updates</h2>
            
            <h3>11.1 Notification Methods</h3>
            <ul>
              <li><strong>Website Posting:</strong> Updated policy posted on our website</li>
              <li><strong>Email Notification:</strong> Direct email to all users for material changes</li>
              <li><strong>Platform Notice:</strong> In-app notification for significant updates</li>
              <li><strong>Effective Date:</strong> Changes become effective 30 days after notification</li>
            </ul>

            <h3>11.2 Your Continued Use</h3>
            <ul>
              <li><strong>Acceptance:</strong> Continued use of the platform after changes constitutes acceptance</li>
              <li><strong>Objection Rights:</strong> You may object to changes by contacting us or deleting your account</li>
              <li><strong>Version History:</strong> Previous versions of this policy are available upon request</li>
            </ul>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                This Privacy Policy is effective as of June 2025 and will remain in effect except with respect to any changes in its provisions in the future.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                If you have any questions about this Privacy Policy, please contact us at{' '}
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