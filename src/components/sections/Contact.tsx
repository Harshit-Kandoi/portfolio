import React from 'react';
import { Github, Linkedin, Mail, Phone } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';
import { socialLinks } from '../../data/navigation';

const Contact: React.FC = () => {
  const renderSocialIcon = (icon: string) => {
    switch (icon) {
      case 'github':
        return <Github size={24} />;
      case 'linkedin':
        return <Linkedin size={24} />;
      case 'mail':
        return <Mail size={24} />;
      case 'phone':
        return <Phone size={24} />;
      default:
        return null;
    }
  };

  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-900">
      <div className="section-container">
        <SectionTitle 
          title="Contact Me" 
          subtitle="Feel free to reach out if you have any questions about my work or if you're interested in collaborating on a project."
        />
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              I’m open to opportunities and challenges in backend, cloud, and applied AI engineering. Whether it’s a role, project, or technical discussion, I’m always happy to connect.
            </p>
          </div>
          
          {/* Contact Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400 mr-6">
                  {renderSocialIcon(link.icon)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {link.platform}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {link.url.replace('mailto:', '').replace('tel:', '').replace('+91', '+91 ')}
                  </p>
                </div>
              </a>
            ))}
          </div>
          
          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Location & Availability
              </h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-400">
                <p>📍 Based in Rajasthan, India</p>
                <p>🌍 Available for remote work worldwide</p>
                <p>⏰ Open to full-time and freelance opportunities</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Let's Connect
              </h3>
              <div className="space-y-3 text-gray-600 dark:text-gray-400">
                <p>💼 Professional inquiries welcome</p>
                <p>🤝 Open to collaboration opportunities</p>
                <p>📚 Happy to discuss data science topics</p>
              </div>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Prefer a different way to connect?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://linkedin.com/in/harshit-kandoi"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Connect on LinkedIn
              </a>
              <a
                href="mailto:kandoiharshitsdlp@gmail.com"
                className="btn btn-outline"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;