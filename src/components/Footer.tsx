import React from 'react';
import { Link } from 'react-scroll';
import { navLinks, socialLinks } from '../data/navigation';
import { Github, Linkedin, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const renderSocialIcon = (icon: string) => {
    switch (icon) {
      case 'github':
        return <Github size={20} />;
      case 'linkedin':
        return <Linkedin size={20} />;
      case 'mail':
        return <Mail size={20} />;
      case 'phone':
        return <Phone size={20} />;
      default:
        return null;
    }
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4">
              Harshit Kandoi
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Backend Engineer focused on building cloud-native systems that turn data into reliable, actionable outcomes.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  aria-label={link.platform}
                >
                  {renderSocialIcon(link.icon)}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <Mail size={16} className="mr-2 text-primary-500" />
                <a href="mailto:hello@harshitkandoi.com" className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  kandoiharshitsdlp@gmail.com
                </a>
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <Phone size={16} className="mr-2 text-primary-500" />
                <a href="tel:+15551234567" className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  +91 7850098453
                </a>
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <Github size={16} className="mr-2 text-primary-500" />
                <a href="https://github.com/harshitkandoi" target="_blank" rel="noopener noreferrer" className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  github.com/Harshit-Kandoi
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © {currentYear} Harshit Kandoi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;