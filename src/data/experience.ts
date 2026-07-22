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
      "Developed internal business applications using React, JavaScript, Java, Python, and GCP to support production workflows and operational processes.",
      "Engineered event-driven workflows using Cloud Functions, Pub/Sub, Firestore, and Gmail APIs to automate email processing and business operations.",
      "Integrated APIs, deployment workflows, and cloud services while supporting testing, debugging, monitoring, and production releases.",
      "Collaborated with cross-functional teams using Agile practices and Jira to deliver reliable software solutions across frontend, backend, and cloud environments."
    ],
    skills: ["React", "Python", "Java", "GCP", "Cloud Functions", "Firestore", "Pub/Sub"],
    type: "work"
  },

  {
    id: 2,
    role: "Software Engineer Intern",
    company: "ThoughtIn Solutions India Pvt. Ltd.",
    location: "Gurugram, India (Remote)",
    period: "May 2025 - Aug 2025",
    description: [
      "Developed backend services and cloud-native workflows using Python, Cloud Functions, Pub/Sub, Firestore, and App Engine.",
      "Executed deployment automation using Docker, GitHub Actions, and API integration workflows across development and testing environments."
    ],
    skills: ["Python", "Docker", "GitHub Actions", "App Engine", "Firestore"],
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
      "Managed dataset preparation, image preprocessing, model evaluation, and deployment workflows for sustainability-focused applications."
    ],
    skills: ["Python", "YOLOv5", "OpenCV", "PyTorch", "Computer Vision"],
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
    skills: ["Python", "Scikit-learn", "Pandas", "XGBoost", "Data Science"],
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
      "Built a solid foundation in software engineering, cloud computing, databases, and machine learning."
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
      "Academic Score: 91%",
      "Focused on Physics, Chemistry, Mathematics, and Biology."
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
      "Academic Score: 73.1%",
      "Active participant in school competitions and academic activities."
    ],
    type: "education"
  },

  // Certifications / Courses
  {
    id: 8,
    title: "Software QA & Test Automation Engineering",
    organization: "Coursera",
    date: "Jun 2026",
    type: "Course",
    description: "QA automation through hands-on experience with industry-leading testing tools and methodologies: Selenium, Cypress, JMeter, xUnit, and Postman API validation.",
    link: "https://coursera.org/share/0810f3ef5e95663b8a1d979afd5cf464",
    skills: ["Selenium", "Cypress", "Agile QA", "JMeter", "Postman"]
  },
  {
    id: 9,
    title: "Google Associate Cloud Engineer (ACE)",
    organization: "Google Cloud",
    date: "Mar 2026",
    type: "Course",
    description: "Certified Google Associate Cloud Engineer with hands-on experience designing backend services, deploying applications, and managing cloud resources on GCP.",
    link: "https://www.credly.com/badges/dce123b5-e38c-4619-86d6-8ff49362c926/linked_in_profile",
    skills: ["GCP", "Cloud Infrastructure", "Kubernetes", "IAM"]
  },
  {
    id: 10,
    title: "Docker Foundations Professional Certificate",
    organization: "Docker",
    date: "Aug 2025",
    type: "Course",
    description: "Certified professional in containerization, image building, multi-stage Dockerfiles, and local container orchestration.",
    link: "https://www.linkedin.com/learning/certificates/9642001c23ee467631715f91472bc09ffd79bd1ceca1419cac4f1024651bcf29",
    skills: ["Docker", "Containerization", "Docker Compose"]
  },
  {
    id: 11,
    title: "Microsoft Azure AI Essentials: Workloads & ML",
    organization: "LinkedIn Learning",
    date: "Aug 2025",
    type: "Course",
    description: "Understanding AI workloads, computer vision, NLP, and deploying machine learning solutions with Azure AI Foundry.",
    link: "https://www.linkedin.com/learning/certificates/66444b1c98dada9eadb5dd9fd08cbb84c3a107633c55520fedca2b2ea5d14f2d",
    skills: ["Microsoft Azure", "Azure AI Foundry", "Machine Learning"]
  },
  {
    id: 12,
    title: "Python Bootcamp (100 Days of Code)",
    organization: "Udemy | Dr. Angela Yu",
    date: "Feb 2025",
    type: "Course",
    description: "Completed comprehensive Python bootcamp covering advanced programming, building web scrapers, APIs, and automation scripts.",
    link: "https://www.udemy.com/certificate/UC-7ae3e699-3a95-404f-a9cd-e074b5f1553d/",
    skills: ["Python", "Flask", "Databases", "Automation"]
  },
  {
    id: 13,
    title: "Machine Learning A-Z",
    organization: "Udemy | SuperDataScience",
    date: "Nov 2024",
    type: "Course",
    description: "Gained deep understanding of machine learning models, regression, classification, clustering, reinforcement learning, and neural networks using Python & R.",
    link: "https://www.udemy.com/certificate/UC-a4c0bbee-c659-4d51-ad51-5b1211e9cc4f/",
    skills: ["Machine Learning", "Deep Learning", "Python", "R"]
  }
];