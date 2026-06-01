import { ExperienceItem } from '../types';

export const experience: ExperienceItem[] = [
  // Work Experience
  {
    id: 1,
    role: "Associate Software Engineer",
    company: "ThoughtIn Solutions India Pvt. Ltd.",
    location: "Gurugram, India (Remote)",
    period: "Aug 2025 - Present",
    description: [
      "Engineered frontend features using React and JavaScript alongside backend services built with Java, Python, and GCP for internal business applications.",
      "Built cloud-based workflows using Cloud Functions, Pub/Sub, and Firestore to process notifications and automate business operations.",
      "Designed an event-driven email processing workflow using Gmail API, Pub/Sub, Cloud Functions, and Firestore to extract, validate, and transform incoming data for downstream applications.",
      "Performed testing, debugging, deployments, and production monitoring while collaborating with cross-functional teams using Agile practices."
    ],
    type: "work"
  },
  {
    id: 2,
    role: "Software Engineer Intern",
    company: "ThoughtIn Solutions India Pvt. Ltd.",
    location: "Gurugram, India (Remote)",
    period: "May 2025 - Aug 2025",
    description: [
      "Built backend services and cloud-based workflows using Python and GCP to support scalable application development.",
      "Executed deployment automation using Docker, GitHub Actions, and API integration workflows across development and testing environments."
    ],
    type: "work"
  },
  {
    id: 3,
    role: "AI Intern (Computer Vision)",
    company: "Anantagni Industries Pvt. Ltd.",
    location: "Pune, India (Remote)",
    period: "Apr 2025 - Jul 2025",
    description: [
      "Implemented a YOLO-based computer vision solution for plastic waste classification, achieving ~75% detection accuracy on custom datasets.",
      "Built dataset preparation and image processing workflows to support model training, evaluation, and deployment."
    ],
    type: "work"
  },
  {
    id: 4,
    role: "Data Science Intern",
    company: "Upflairs Pvt. Ltd.",
    location: "Jaipur, India",
    period: "Jun 2024 - Aug 2024",
    description: [
      "Trained crop classification models achieving ~95% accuracy using structured agricultural datasets and feature-engineered inputs.",
      "Performed data preprocessing, feature engineering, model evaluation, and performance analysis across end-to-end ML workflows."
    ],
    type: "work"
  },

  // Education
  {
    id: 5,
    role: "Bachelor of Technology in CSE (Data Science)",
    company: "B.K. Birla Institute of Engineering and Technology",
    location: "Pilani, India",
    period: "2021 - 2025",
    description: [
      "CGPA: 8.35/10.0",
      "Specialization in Computer Science and Data Science",
      "Focused on Machine Learning, Cloud Services, and Software Development workflows."
    ],
    type: "education"
  },
  {
    id: 6,
    role: "Senior Secondary (PCMB)",
    company: "Sarasvati Vidhya Peeth Sr. Sec. School",
    location: "Sikar, India",
    period: "2019 - 2021",
    description: [
      "GPA: 91%",
      "Focused on Physics, Chemistry, Mathematics, and Biology (PCMB)."
    ],
    type: "education"
  },
  {
    id: 7,
    role: "Secondary Education",
    company: "Lords International School",
    location: "Rajgarh, Rajasthan",
    period: "2018 - 2019",
    description: [
      "Scored 73.1% in Class 10th",
      "Active participant in school competitions and academic activities."
    ],
    type: "education"
  },

  // Certifications / Courses
  {
    id: 8,
    title: "Google Associate Cloud Engineer (ACE)",
    organization: "Google Cloud",
    date: "Mar 2026",
    type: "Course",
    description: "Certified Google Associate Cloud Engineer with hands-on experience designing backend services, deploying applications, and managing cloud resources on GCP.",
    link: "https://www.credential.net/"
  },
  {
    id: 9,
    title: "Docker Foundations Professional Certificate",
    organization: "Docker",
    date: "Aug 2025",
    type: "Course",
    description: "Certified professional in containerization, image building, multi-stage Dockerfiles, and local container orchestration.",
    link: "https://www.credly.com/"
  },
  {
    id: 10,
    title: "Python Bootcamp (100 Days of Code)",
    organization: "Udemy | Dr. Angela Yu",
    date: "Feb 2025",
    type: "Course",
    description: "Completed comprehensive Python bootcamp covering advanced programming, building web scrapers, APIs, and automation scripts.",
    link: "https://www.udemy.com/certificate/UC-7ae3e699-3a95-404f-a9cd-e074b5f1553d/"
  },
  {
    id: 11,
    title: "Machine Learning A-Z",
    organization: "Udemy | SuperDataScience",
    date: "Nov 2024",
    type: "Course",
    description: "Grained deep understanding of machine learning models, regression, classification, clustering, reinforcement learning, and neural networks using Python.",
    link: "https://www.udemy.com/certificate/UC-a4c0bbee-c659-4d51-ad51-5b1211e9cc4f/"
  }
];