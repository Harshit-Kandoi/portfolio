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
          subtitle="Learn more about my background, experience, and what drives me in the field of data science."
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
                Actively exploring data science by building real-world ML models and analytical pipelines.
              </p>
            </div>
          </div>
          
          {/* Bio column */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Aspiring Data Scientist & ML Enthusiast
            </h3>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                I'm Harshit Kandoi, a B.Tech graduate in Data Science with experience in AI, Machine Learning, and backend development. I build intelligent, scalable solutions that bridge data and impactful applications.
              </p>
            
              <p>
                Currently an Associate Software Engineer at ThoughtIn Solutions, I work on backend systems, API integrations, and scalable software infrastructure. Previously, at Anantagni Industries, I developed a YOLO-based plastic detection model for sustainability initiatives.
              </p>
            
              <p>
                I’ve built and deployed AI/ML models like ASL Hand Sign Detection, Crop Recommendation, Insurance Prediction, and Movie Recommendation Systems, with expertise in computer vision, data pipelines, and real-time automation.
              </p>
            
              <p>
                Passionate about data storytelling, cloud platforms, and open-source contributions, I strive for continuous learning and innovation in every project.
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
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Specialization</h4>
                <p className="text-gray-700 dark:text-gray-300">Machine Learning, NLP, Data Analysis, Computer Vision</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Languages</h4>
                <p className="text-gray-700 dark:text-gray-300">English, Hindi, Python, SQL 😉</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;