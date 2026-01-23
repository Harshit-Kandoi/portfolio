export const projects: Project[] = [
  {
    id: 1,
    title: "Local GCP Emulator (Firestore + Pub/Sub Simulation)",
    description: "Built a local emulator for GCP services using Firestore and Pub/Sub to enable offline development and cost-free testing. Designed a Flask-based dashboard, background message listeners, and a cloud-like architecture to prototype and validate backend workflows before production deployment.",
    image: "https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg",
    category: ["Cloud Computing", "Backend Development"],
    technologies: ["Python", "Flask", "Firestore Emulator", "Pub/Sub Emulator", "GCP"],
    github: "https://github.com/Harshit-Kandoi/Local-GCP-Emulator",
    featured: true
  },
  {
    id: 2,
    title: "ASL Hand-Sign Detection",
    description: "Developed a real-time hand sign detection system using YOLOv5 and a custom dataset to convert ASL gestures into text. Focused on efficient inference, dataset preparation, and real-time computer vision pipelines.",
    image: "https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg",
    category: ["Computer Vision", "Deep Learning"],
    technologies: ["Python", "YOLOv5", "PyTorch", "OpenCV"],
    github: "https://github.com/Harshit-Kandoi/ASL-letter-detection",
    featured: true
  },
  {
    id: 3,
    title: "Plastic Type Classification Dataset (Web Scraping)",
    description: "Engineered an automated web scraping pipeline to curate a dataset of 3,000+ plastic images categorized by material type. Designed the dataset for YOLO-based training to support computer vision models in sustainability-focused use cases.",
    image: "https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg",
    category: ["Data Engineering", "Web Scraping"],
    technologies: ["Python", "BeautifulSoup4", "Selenium", "Pandas"],
    github: "https://github.com/Harshit-Kandoi/web-image-scrapper",
    featured: true
  },
  {
    id: 4,
    title: "Doom Reinforcement Learning Game",
    description: "Built a Deep Q-Learning agent to play Doom using raw pixel input. Implemented CNN-based models, tuned reward functions, and managed GPU-intensive training in a simulated 3D environment to study reinforcement learning behavior.",
    image: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
    category: ["Reinforcement Learning", "Game AI"],
    technologies: ["Python", "PyTorch", "NumPy", "OpenCV", "ViZDoom"],
    github: "https://github.com/Harshit-Kandoi/doom_reinforcement_learning",
    featured: true
  },
  {
    id: 5,
    title: "Ghibli Art Generator",
    description: "Developed a lightweight generative AI tool that converts text prompts into Ghibli-style images using Google’s Gemini API. Focused on rapid prototyping, API integration, and running inference without GPU dependency.",
    image: "https://images.pexels.com/photos/2781760/pexels-photo-2781760.jpeg",
    category: ["Generative AI", "Creative AI"],
    technologies: ["Python", "Google Gemini", "Pillow", "GenerativeAI"],
    github: "https://github.com/Harshit-Kandoi/Ghibli",
    featured: true
  },
  {
    id: 6,
    title: "Movie Recommendation System",
    description: "Implemented collaborative and content-based recommendation algorithms to suggest movies based on user preferences. Deployed the system using Streamlit to provide an interactive and user-friendly interface.",
    image: "https://images.pexels.com/photos/7991375/pexels-photo-7991375.jpeg",
    category: ["Machine Learning", "Web App"],
    technologies: ["Python", "Machine Learning", "Streamlit", "Pandas"],
    github: "https://github.com/Harshit-Kandoi/movie-recommender",
    featured: true
  },
  {
    id: 7,
    title: "Whisper Transcription Web-App",
    description: "Built a speech-to-text web application using OpenAI Whisper, supporting both file-based and real-time audio transcription. Integrated backend APIs with a simple frontend for seamless user interaction.",
    image: "https://images.pexels.com/photos/267614/pexels-photo-267614.jpeg",
    category: ["NLP", "Web App"],
    technologies: ["Python", "Flask", "Whisper AI", "JavaScript", "HTML", "CSS"],
    github: "https://github.com/Harshit-Kandoi/Transcription",
    featured: true
  },
  {
    id: 8,
    title: "Crop Classification",
    description: "Developed a machine learning model to classify crop types based on environmental parameters such as temperature, humidity, and rainfall. Deployed the model as a Flask web application for easy access and testing.",
    image: "https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg",
    category: ["Agriculture", "Machine Learning"],
    technologies: ["Python", "Scikit-learn", "Flask", "Pandas"],
    github: "https://github.com/Harshit-Kandoi/crops",
    featured: true
  },
  {
    id: 9,
    title: "Credit Card Financial Dashboard",
    description: "Designed an interactive Power BI dashboard to analyze credit card transactions, spending patterns, and customer behavior, supported by SQL-based data querying and preprocessing.",
    image: "https://images.pexels.com/photos/259200/pexels-photo-259200.jpeg",
    category: ["Data Visualization", "Finance"],
    technologies: ["Power BI", "SQL", "Python", "Excel"],
    github: "https://github.com/Harshit-Kandoi/Credit-Card-Financial-Dashboard",
    featured: true
  }
];
