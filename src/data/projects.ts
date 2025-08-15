import { Project } from '../types';

export const projects: Project[] = [
  {
    id: 1,
    title: "Local GCP Emulator (Firestore + Pub/Sub Simulation)",
    description: "Engineered a local simulation of GCP services using Firestore and Pub/Sub emulators, enabling offline development and testing. Built a Flask dashboard for uploads, background threading for message listening, and a GCP-like architecture to prototype cloud apps locally without cost.",
    image: "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg", // server/cloud setup
    category: ["Cloud Computing", "Backend Development"],
    technologies: ["Python", "Flask", "Firestore Emulator", "Pub/Sub Emulator", "GCP"],
    github: "",
    featured: true
  },
  {
    id: 2,
    title: "ASL Hand-Sign Detection",
    description: "Real-time ASL hand sign detection using YOLOv5 and a custom dataset to translate gestures into text, enabling better communication for the hearing-impaired.",
    image: "https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg", // sign language
    category: ["Computer Vision", "Deep Learning"],
    technologies: ["Python", "YOLOv5", "PyTorch", "OpenCV"],
    github: "https://github.com/Harshit-Kandoi/ASL-letter-detection",
    featured: true
  },
  {
    id: 3,
    title: "Plastic Type Classification Dataset (Web Scraping)",
    description: "Curated a dataset of over 3,000 plastic images for classification into categories like PET, PE, PC, PP, PS, and Others. Used BeautifulSoup and Selenium for automated scraping and Pandas for organization, designed for YOLO training and sustainability research.",
    image: "https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg", // plastic waste
    category: ["Data Engineering", "Web Scraping"],
    technologies: ["Python", "BeautifulSoup4", "Selenium", "Pandas"],
    github: "",
    featured: true
  },
  {
    id: 4,
    title: "Doom Reinforcement Learning Game",
    description: "Developed a reinforcement learning agent with Deep Q-Learning to play Doom using only pixel data. Implemented CNN-based models, tuned reward functions, and managed GPU-intensive training in a 3D ViZDoom environment.",
    image: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg", // gaming AI
    category: ["Reinforcement Learning", "Game AI"],
    technologies: ["Python", "PyTorch", "NumPy", "OpenCV", "ViZDoom"],
    github: "",
    featured: true
  },
  {
    id: 5,
    title: "Ghibli Art Generator",
    description: "Built a Python tool that transforms text prompts into Studio Ghibli-style images using Google's Gemini API. Runs without GPU dependency, showcasing rapid prototyping in Generative AI.",
    image: "https://images.pexels.com/photos/2781760/pexels-photo-2781760.jpeg", // artistic illustration
    category: ["Generative AI", "Creative AI"],
    technologies: ["Python", "Google Gemini", "Pillow", "GenerativeAI"],
    github: "",
    featured: true
  },
  {
    id: 6,
    title: "Movie Recommendation System",
    description: "Implemented collaborative and content-based filtering to recommend movies based on user preferences. Deployed with Streamlit for interactive use.",
    image: "https://images.pexels.com/photos/7991375/pexels-photo-7991375.jpeg", // movie theater
    category: ["Machine Learning", "Web App"],
    technologies: ["Python", "Machine Learning", "Streamlit", "Pandas"],
    github: "https://github.com/Harshit-Kandoi/movie-recommender",
    featured: true
  },
  {
    id: 7,
    title: "Whisper Transcription Web-App",
    description: "Built a speech-to-text web app using Whisper AI, capable of transcribing audio from local files and real-time microphone input.",
    image: "https://images.pexels.com/photos/267614/pexels-photo-267614.jpeg", // microphone
    category: ["NLP", "Web App"],
    technologies: ["Python", "Flask", "Whisper AI", "JavaScript", "HTML", "CSS"],
    github: "https://github.com/Harshit-Kandoi/Transcription",
    featured: true
  },
  {
    id: 8,
    title: "Crop Classification",
    description: "Created a classification model to predict crop types based on environmental factors like temperature, humidity, and rainfall. Deployed as a Flask web app for easy accessibility.",
    image: "https://images.pexels.com/photos/3185757/pexels-photo-3185757.jpeg", // crops field
    category: ["Agriculture", "Machine Learning"],
    technologies: ["Python", "Scikit-learn", "Flask", "Pandas"],
    github: "https://github.com/Harshit-Kandoi/crops",
    featured: true
  },
  {
    id: 9,
    title: "Credit Card Financial Dashboard",
    description: "Designed an analytics dashboard in Power BI to monitor customer transactions, credit limits, and spending trends, integrating SQL for backend queries.",
    image: "https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg", // finance dashboard
    category: ["Data Visualization", "Finance"],
    technologies: ["Power BI", "SQL", "Python", "Excel"],
    github: "https://github.com/Harshit-Kandoi/Credit-Card-Financial-Dashboard",
    featured: true
  }
];
