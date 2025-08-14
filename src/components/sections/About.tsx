import React from 'react';
import SectionTitle from '../ui/SectionTitle';
import { Calendar, GraduationCap, Briefcase, Award } from 'lucide-react';

const About: React.FC = () => {
  const milestones = [
    {
      year: 'Aug 2025',
      title: 'Associate Software Engineer',
      description: 'Joined ThoughtIn Solutions, contributing to backend development, scalable software infrastructure, API integrations, and secure cloud-based applications in an agile environment.',
      icon: <Briefcase className="text-primary-500" size={24} />
    },
    {
      year: 'May 2025',
      title: 'Software Development Intern',
      description: 'Interned at ThoughtIn Solutions, focusing on backend systems, API development, and streamlining data pipelines to enhance system efficiency.',
      icon: <Briefcase className="text-primary-500" size={24} />
    },
    {
      year: 'Apr 2025',
      title: 'AI Intern',
      description: 'Worked with Anantagni Industries on computer vision solutions, training YOLO models for plastic detection and deploying AI models for waste-to-energy innovations.',
      icon: <Briefcase className="text-primary-500" size={24} />
    },
    {
      year: 'Jul 2025',
      title: 'B.Tech in Data Science [CSE]',
      description: 'Graduated from B.K. Birla Institute of Engineering and Technology with a CGPA of 8.35, specializing in AI, ML, and data-driven solutions.',
      icon: <GraduationCap className="text-primary-500" size={24} />
    },
    {
      year: 'June 2024',
      title: 'Data Science Intern',
      description: 'Interned at Upflairs, building machine learning models and analytics dashboards for real-world applications.',
      icon: <Briefcase className="text-primary-500" size={24} />
    },
    {
      year: '2021',
      title: 'B.Tech Journey Begins',
      description: 'Started undergraduate studies in Computer Science with a specialization in Data Science at BKBIET.',
      icon: <GraduationCap className="text-primary-500" size={24} />
    }
  ];
};


  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
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
              I'm Harshit Kandoi, a B.Tech graduate in Data Science with hands-on experience in AI, Machine Learning, and backend development. I specialize in building intelligent, scalable, and secure solutions that bridge the gap between data and impactful applications.
            </p>
          
            <p>
              My professional journey includes working as an Associate Software Engineer and Software Development Intern at ThoughtIn Solutions, where I contributed to backend systems, API integrations, and scalable software infrastructure. As an AI Intern at Anantagni Industries, I trained YOLO models for plastic detection and deployed AI-driven solutions for waste-to-energy innovation.
            </p>
          
            <p>
              Over time, I have built and deployed diverse AI/ML models, including Spam Detection, Crop Recommendation, Insurance Prediction, and a Movie Recommendation System. My expertise also extends to computer vision, data pipelines, and real-time processing for domain-specific automation.
            </p>
          
            <p>
              Beyond development, I value the art of data storytelling—translating complex technical results into clear, actionable insights for decision-makers. I actively explore cloud platforms, cost-efficient deployments, and contribute to open-source, driven by a mindset of continuous learning and innovation.
            </p>
          </div>

            
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Education</h4>
                <p className="text-gray-700 dark:text-gray-300">B.tech in Data Science [CS]</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold text-primary-600 dark:text-primary-400 mb-1">Location</h4>
                <p className="text-gray-700 dark:text-gray-300">Churu, Rajasthan, India</p>
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
        
        {/* Career Timeline */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">
            My Journey
          </h3>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary-200 dark:bg-primary-900"></div>
            
            {/* Timeline items */}
            <div className="space-y-16">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-gray-800 border-4 border-primary-500 dark:border-primary-400 z-10 flex items-center justify-center">
                    {milestone.icon}
                  </div>
                  
                  {/* Content */}
                  <div className={`flex items-center justify-between gap-8 ${
                    index % 2 === 0 ? 'flex-row-reverse' : ''
                  }`}>
                    {/* Year */}
                    <div className={`w-24 font-semibold text-lg text-primary-600 dark:text-primary-400 ${
                      index % 2 === 0 ? 'text-left' : 'text-right'
                    }`}>
                      {milestone.year}
                    </div>
                    
                    {/* Content box */}
                    <div className={`w-[calc(50%-4rem)] bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md ${
                      index % 2 === 0 ? 'text-right' : 'text-left'
                    }`}>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {milestone.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;