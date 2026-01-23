export const projects: Project[] = [
  {
    id: 1,
    title: "Local GCP Emulator for Backend Prototyping",
    description: "Built a local emulator for Firestore and Pub/Sub to enable offline backend development and cost-free testing. Designed a Flask dashboard and background listeners to simulate cloud workflows before production deployment.",
    image: "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg",
    category: ["Cloud Computing", "Backend Development"],
    technologies: ["Python", "Flask", "Firestore Emulator", "Pub/Sub Emulator", "GCP"],
    github: "https://github.com/Harshit-Kandoi/Local-GCP-Emulator",
    featured: true
  },
  {
    id: 2,
    title: "Real-Time ASL Hand Sign Detection",
    description: "Developed a real-time computer vision pipeline using YOLOv5 to convert ASL hand signs into text. Focused on custom dataset preparation, efficient inference, and real-time gesture recognition.",
    image: "https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg",
    category: ["Computer Vision", "Deep Learning"],
    technologies: ["Python", "YOLOv5", "PyTorch", "OpenCV"],
    github: "https://github.com/Harshit-Kandoi/ASL-letter-detection",
    featured: true
  },
  {
    id: 3,
    title: "Plastic Image Dataset Pipeline for CV Models",
    description: "Engineered an automated web scraping pipeline to collect and organize 3,000+ plastic images by material type. Designed the dataset specifically for YOLO-based training in sustainability-focused applications.",
    image: "https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg",
    category: ["Data Engineering", "Web Scraping"],
    technologies: ["Python", "BeautifulSoup4", "Selenium", "Pandas"],
    github: "https://github.com/Harshit-Kandoi/web-image-scrapper",
    featured: true
  },
  {
    id: 4,
    title: "Deep Q-Learning Agent for Doom",
    description: "Built a reinforcement learning agent using Deep Q-Learning to play Doom from raw pixel input. Implemented CNN-based models and tuned reward strategies in a simulated 3D environment.",
    image: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
    category: ["Reinforcement Learning", "Game AI"],
    technologies: ["Python", "PyTorch", "NumPy", "OpenCV", "ViZDoom"],
    github: "https://github.com/Harshit-Kandoi/doom_reinforcement_learning",
    featured: true
  },
  {
    id: 5,
    title: "Ghibli-Style Image Generator",
    description: "Developed a lightweight generative AI tool that transforms text prompts into Ghibli-style images. Integrated Google Gemini API to enable fast inference without GPU dependency.",
    image: "https://images.pexels.com/photos/2781760/pexels-photo-2781760.jpeg",
    category: ["Generative AI", "Creative AI"],
    technologies: ["Python", "Google Gemini", "Pillow", "GenerativeAI"],
    github: "https://github.com/Harshit-Kandoi/Ghibli",
    featured: true
  },
  {
    id: 6,
    title: "Movie Recommendation Engine",
    description: "Implemented collaborative and content-based filtering to recommend movies based on user preferences. Deployed the system with Streamlit to provide an interactive recommendation experience.",
    image: "https://images.pexels.com/photos/7991375/pexels-photo-7991375.jpeg",
    category: ["Machine Learning", "Web App"],
    technologies: ["Python", "Machine Learning", "Streamlit", "Pandas"],
    github: "https://github.com/Harshit-Kandoi/movie-recommender",
    featured: true
  },
  {
    id: 7,
    title: "Speech-to-Text Transcription Web App",
    description: "Built a web application for audio transcription using OpenAI Whisper. Supported both file-based and real-time audio input through backend APIs and a simple frontend.",
    image: "https://images.pexels.com/photos/267614/pexels-photo-267614.jpeg",
    category: ["NLP", "Web App"],
    technologies: ["Python", "Flask", "Whisper AI", "JavaScript", "HTML", "CSS"],
    github: "https://github.com/Harshit-Kandoi/Transcription",
    featured: true
  },
  {
    id: 8,
    title: "Crop Classification ML Service",
    description: "Developed a machine learning model to classify crops using environmental parameters such as rainfall and temperature. Deployed the model as a Flask-based web application for testing and usage.",
    image: "https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg",
    category: ["Agriculture", "Machine Learning"],
    technologies: ["Python", "Scikit-learn", "Flask", "Pandas"],
    github: "https://github.com/Harshit-Kandoi/crops",
    featured: true
  },
  {
    id: 9,
    title: "Credit Card Transaction Analytics Dashboard",
    description: "Designed an interactive Power BI dashboard to analyze credit card spending patterns and customer behavior. Used SQL and Python for data preparation and backend querying.",
    image: "https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg",
    category: ["Data Visualization", "Finance"],
    technologies: ["Power BI", "SQL", "Python", "Excel"],
    github: "https://github.com/Harshit-Kandoi/Credit-Card-Financial-Dashboard",
    featured: true
  }
];