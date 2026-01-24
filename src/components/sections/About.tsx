import React from 'react';
import SectionTitle from '../ui/SectionTitle';
import { Calendar, GraduationCap, Briefcase, Award } from 'lucide-react';
const About: React.FC = () => {
  const milestones = [
  ]
  return (
    <section id="about" className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="section-container">
        <SectionTitle
          title="About Me"
          subtitle="A brief overview of my background, experience, and how I build backend systems using cloud and AI."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image column */}
          <div className="relative">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="/tempo.jpg"
                alt="Harshit Kandoi"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-xs">
              <p className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                Backend-focused engineer building cloud-native systems with Python, GCP, and applied AI.
              </p>
            </div>
          </div>

          {/* Bio column */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Associate Software Engineer (Backend)
            </h3>

            <div className="space-y-4 text-gray-700 dark:text-gray-300 text-justify leading-relaxed">
              <p className="first-letter:text-2xl first-letter:font-bold first-letter:text-primary-600 dark:first-letter:text-primary-400">
                I'm Harshit Kandoi, an Associate Software Engineer specializing in backend development, with hands-on experience in building cloud-native and AI-enabled systems using Python and Google Cloud Platform (GCP).
              </p>

              <p>
                At ThoughtIn Solutions, I work on backend services, APIs, and Cloud Functions that reduce data latency, automate data processing, and improve system reliability. I apply AI-driven approaches to minimize manual effort while increasing accuracy in production workflows.
              </p>

              <p>
                Previously, I worked on applied AI and computer vision projects, including YOLO-based classification models and machine learning systems. These experiences helped me build a strong foundation in applied AI while transitioning into backend and cloud-focused engineering roles.
              </p>

              <p>
                I enjoy working in product-driven environments where backend systems, cloud infrastructure, and AI come together to solve real business problems in a scalable and maintainable way.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Education</h4>
                <p className="text-gray-700 dark:text-gray-300">B.tech in Data Science [CSE]</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Location</h4>
                <p className="text-gray-700 dark:text-gray-300">Jaipur, Rajasthan, India</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Core Focus</h4>
                <p className="text-gray-700 dark:text-gray-300">Backend Engineering, Cloud Systems, Applied AI</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Languages</h4>
                <p className="text-gray-700 dark:text-gray-300">Python, React, JavaScript, SQL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;