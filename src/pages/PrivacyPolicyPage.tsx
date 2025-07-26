import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 pt-4 pb-20">
      <div className="px-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4 text-white hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
        </div>

        {/* Privacy Policy Content */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, 
              update your profile, or contact us. This includes your name, email address, phone number, 
              and listening preferences.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed">
              We use the information we collect to provide, maintain, and improve our audiobook service, 
              personalize your experience, communicate with you, and ensure the security of our platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">3. Information Sharing</h2>
            <p className="text-gray-300 leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy or as required by law.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies and Tracking</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, 
              analyze usage patterns, and personalize content recommendations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              You have the right to access, update, or delete your personal information. 
              You may also opt out of certain communications and data processing activities.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">7. Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our service is not intended for children under 13 years of age. 
              We do not knowingly collect personal information from children under 13.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">8. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any changes 
              by posting the new privacy policy on this page and updating the "Last Updated" date.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about this privacy policy or our data practices, 
              please contact us at privacy@audiobook-app.com.
            </p>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-400">
              Last Updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;