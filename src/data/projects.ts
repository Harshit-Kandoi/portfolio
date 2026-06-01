import { Project } from '../types';

export const projects: Project[] = [
  {
    id: 1,
    title: "Local GCP Emulator (Firestore + Pub/Sub)",
    description: "Engineered a local cloud development environment to simulate Firestore and Pub/Sub services offline. Validated serverless workflows locally before deployment, reducing external cloud service dependency during early development.",
    image: "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg",
    category: ["Cloud & Backend"],
    technologies: ["Python", "Flask", "Firestore", "Pub/Sub", "GCP"],
    github: "https://github.com/Harshit-Kandoi/Local-GCP-Emulator",
    featured: true
  },
  {
    id: 2,
    title: "Real-Time ASL Hand Sign Detection",
    description: "Developed a computer vision system utilizing YOLOv5 to translate American Sign Language (ASL) hand gestures into text. Preprocessed custom datasets and deployed real-time video-based inference with 90%+ classification accuracy.",
    image: "https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg",
    category: ["AI & Machine Learning"],
    technologies: ["Python", "YOLOv5", "PyTorch", "OpenCV"],
    github: "https://github.com/Harshit-Kandoi/ASL-letter-detection",
    featured: true
  },
  {
    id: 3,
    title: "Whisper Transcription Web Application",
    description: "Built a speech-to-text transcription web app leveraging OpenAI Whisper. Implemented file-based uploads and backend processing pipelines in Python/Flask to convert audio and video recordings into structured text transcripts.",
    image: "https://images.pexels.com/photos/267614/pexels-photo-267614.jpeg",
    category: ["AI & Machine Learning", "Cloud & Backend"],
    technologies: ["Python", "Flask", "Whisper AI", "JavaScript", "HTML", "CSS"],
    github: "https://github.com/Harshit-Kandoi/Transcription",
    featured: false
  },
  {
    id: 4,
    title: "Movie Recommendation System",
    description: "Designed a recommendation engine implementing collaborative and content-based filtering algorithms. Integrated a web UI with Streamlit and SQL databases to produce personalized suggestions based on user ratings.",
    image: "https://images.pexels.com/photos/7991375/pexels-photo-7991375.jpeg",
    category: ["AI & Machine Learning"],
    technologies: ["Python", "Machine Learning", "Streamlit", "SQLAlchemy", "Pandas"],
    github: "https://github.com/Harshit-Kandoi/movie-recommender",
    featured: true
  },
  {
    id: 5,
    title: "Plastic Image Dataset Pipeline",
    description: "Engineered an automated data pipeline to collect, clean, and organize 3,000+ plastic material images using BeautifulSoup and Selenium. Prepared clean training data for YOLO-based sustainability models.",
    image: "https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg",
    category: ["Data & Automation"],
    technologies: ["Python", "BeautifulSoup4", "Selenium", "Pandas"],
    github: "https://github.com/Harshit-Kandoi/web-image-scrapper",
    featured: false
  },
  {
    id: 6,
    title: "Deep Q-Learning Agent for Doom",
    description: "Created a reinforcement learning agent using PyTorch to play Doom using raw visual feeds as inputs. Designed Convolutional Neural Network (CNN) policies and customized reward shaping to train autonomous game-playing agents.",
    image: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
    category: ["AI & Machine Learning"],
    technologies: ["Python", "PyTorch", "NumPy", "OpenCV", "ViZDoom"],
    github: "https://github.com/Harshit-Kandoi/doom_reinforcement_learning",
    featured: false
  },
  {
    id: 7,
    title: "Ghibli-Style Image Generator",
    description: "Designed a lightweight generative AI web tool that transforms user text prompts into Studio Ghibli-style artwork using Gemini API, removing local GPU compute requirements.",
    image: "https://images.pexels.com/photos/2781760/pexels-photo-2781760.jpeg",
    category: ["AI & Machine Learning"],
    technologies: ["Python", "Google Gemini", "Pillow", "GenerativeAI"],
    github: "https://github.com/Harshit-Kandoi/Ghibli",
    featured: false
  },
  {
    id: 8,
    title: "Crop Classification ML Service",
    description: "Trained and evaluated multi-class classification models using environmental inputs (temperature, humidity, rainfall) to suggest optimal crops. Deployed the service as an API for agricultural decision support.",
    image: "https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg",
    category: ["AI & Machine Learning"],
    technologies: ["Python", "Scikit-learn", "Flask", "Pandas"],
    github: "https://github.com/Harshit-Kandoi/crops",
    featured: false
  },
  {
    id: 9,
    title: "Credit Card Financial Dashboard",
    description: "Built an interactive analytics dashboard in Power BI backed by SQL queries to analyze financial spending behaviors. Designed key performance indicators (KPIs) to reveal patterns in credit card usage.",
    image: "https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg",
    category: ["Data & Automation"],
    technologies: ["Power BI", "SQL", "Python", "Excel"],
    github: "https://github.com/Harshit-Kandoi/Credit-Card-Financial-Dashboard",
    featured: false
  }
];