import React from 'react';
import { Link } from 'react-scroll';
import { ArrowDown, ExternalLink } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import Button from '../ui/Button';

const Home: React.FC = () => {
  return (
    <section id="home" className="min-h-screen flex items-center relative">
      <div className="absolute inset-0 z-0">
        <div className="bg-gradient-to-br from-primary-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 w-full h-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
              Hi, I'm Harshit Kandoi
            </h1>
            <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-primary-600 dark:text-primary-400 mb-6 h-14">
              <TypeAnimation
                sequence={[
                  'Backend Software Engineer',
                  2000,
                  'Python & Cloud Specialist',
                  2000,
                  'AI-Driven Data Systems Builder',
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-lg">
            Backend-focused Software Engineer with hands-on experience in Python, cloud-native systems, and applied AI, building scalable services that reduce manual effort and improve data-driven workflows.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="projects"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
              >
                <Button>View My Work</Button>
              </Link>
              <Link
                to="contact"
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
              >
                <Button variant="outline">Contact Me</Button>
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center items-center animate-slide-right">
            <div className="relative inline-block">
              <div className="rounded-full h-80 w-80 overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                <img
                  src="/profile.jpg"
                  alt="Harshit Kandoi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium italic">
                  "Building backend systems that turn data into reliable decisions"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
        <Link
          to="about"
          spy={true}
          smooth={true}
          offset={-70}
          duration={500}
          className="text-primary-500 dark:text-primary-400 cursor-pointer"
        >
          <ArrowDown size={32} />
        </Link>
      </div>
    </section>
  );
};

export default Home;