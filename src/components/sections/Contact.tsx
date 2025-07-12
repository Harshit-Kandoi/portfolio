import React, { useState } from 'react';
import { Github, Linkedin, Mail, Phone, Send } from 'lucide-react';
import SectionTitle from '../ui/SectionTitle';
import Button from '../ui/Button';
import { socialLinks } from '../../data/navigation';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // Simulate form submission
    setTimeout(() => {
      setFormStatus('success');
      // Reset form after success
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setFormStatus('idle');
      }, 3000);
    }, 1500);
  };
  
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
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="section-container">
        <SectionTitle 
          title="Contact Me" 
          subtitle="Have a question or want to work together? I'd love to hear from you."
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Send a Message
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Project Inquiry"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  placeholder="Your message here..."
                />
              </div>
              
              <Button
                type="submit"
                variant="primary"
                disabled={formStatus === 'submitting'}
                className="w-full"
                icon={formStatus === 'submitting' ? undefined : <Send size={16} />}
              >
                {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
              </Button>
              
              {formStatus === 'success' && (
                <div className="mt-4 p-3 bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-300 rounded-md text-sm">
                  Thank you for your message! I'll get back to you soon.
                </div>
              )}
              
              {formStatus === 'error' && (
                <div className="mt-4 p-3 bg-error-100 dark:bg-error-900/20 text-error-700 dark:text-error-300 rounded-md text-sm">
                  There was an error sending your message. Please try again.
                </div>
              )}
            </form>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Contact Information
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Feel free to reach out if you have any questions about my work or if you're interested in 
              collaborating on a project. I'm always open to discussing new opportunities and challenges 
              in the data science field.
            </p>
            
            <div className="space-y-6">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400 mr-4">
                    {renderSocialIcon(link.icon)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {link.platform}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {link.url.replace('mailto:', '').replace('tel:', '')}
                    </p>
                  </div>
                </a>
              ))}
            </div>
            
            <div className="mt-10">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Location
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Based in Rajasthan, India<br />
                Available for remote work worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;