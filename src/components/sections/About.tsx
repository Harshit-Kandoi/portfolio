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
          subtitle="I’m a full-stack software engineer who enjoys building systems that make work easier."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image column */}
          <div className="relative">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="/tempo.jpg"
                alt="Harshit Kandoi"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-white dark:bg-gray-800 p-4 rounded shadow-lg max-w-xs">
              <p className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                Bridging frontend, backend, and cloud technologies to build reliable software solutions.
              </p>
            </div>
          </div>

          {/* Bio column */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Full Stack Software Engineer
            </h3>

            <div className="space-y-4 text-gray-700 dark:text-gray-300 text-justify leading-relaxed">
              <p className="first-letter:text-2xl first-letter:font-bold first-letter:text-primary-600 dark:first-letter:text-primary-400">
                I'm Harshit Kandoi, a Full Stack Software Engineer and Google Associate Cloud Engineer (ACE) with experience building web applications, backend services, and cloud-native solutions.
              </p>

              <p>
                Currently at ThoughtIn Solutions, I work across the full software lifecycle—developing frontend interfaces with React, building backend services using Java and Python, integrating APIs, and designing event-driven workflows on Google Cloud Platform using Cloud Functions, Pub/Sub, and Firestore.
              </p>

              <p>
                My journey started with data science and computer vision projects, giving me a strong foundation in problem-solving, data processing, and automation. Over time, my focus evolved toward software engineering, where I enjoy building scalable applications that improve business operations and developer productivity.
              </p>

              <p>
                I’m particularly interested in full-stack development, cloud engineering, system design, and workflow automation, with a focus on creating reliable solutions that deliver measurable value.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Education</h4>
                <p className="text-gray-700 dark:text-gray-300">B.Tech in CSE (Data Science)</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Location</h4>
                <p className="text-gray-700 dark:text-gray-300">Jaipur, Rajasthan, India</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Core Focus</h4>
                <p className="text-gray-700 dark:text-gray-300">Full Stack Development, Cloud Engineering, Automation</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Tech Stack</h4>
                <p className="text-gray-700 dark:text-gray-300">React, Java, Python, SQL, Google Cloud Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;