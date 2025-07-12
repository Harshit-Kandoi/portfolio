import { Project } from '../types';

export const projects: Project[] = [
  {
    id: 1,
    title: "ASL Hand-Sign Detection",
    description: "Real-time ASL hand sign detection using YOLOv5 and a custom dataset to translate gestures into text, enabling better communication for the hearing-impaired.",
    image: "https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg",
    category: ["Computer Vision", "Deep Learning"],
    technologies: ["Python", "YOLOv5", "PyTorch", "Github"],
    github: "https://github.com/Harshit-Kandoi/ASL-letter-detection",
    featured: true
  },
  {
    id: 2,
    title: "Reinforcement Learning Snake Game",
    description: "Implemented a self-learning Snake game using Deep Q-Learning, improving gameplay strategy through reinforcement learning techniques.",
    image: "https://images.pexels.com/photos/1616216/pexels-photo-1616216.jpeg",
    category: ["Reinforcement Learning", "Game AI"],
    technologies: ["Python", "PyTorch", "Numpy", "Matplotlib"],
    github: "https://github.com/Harshit-Kandoi/Reinforcement-Learning-Snake-Game-",
    featured: true
  },
  {
    id: 3,
    title: "Whisper Transcription Web-App",
    description: "Developed a speech-to-text application using Whisper AI, enabling accurate transcription for web-based and local file inputs.",
    image: "https://images.pexels.com/photos/267614/pexels-photo-267614.jpeg",
    category: ["NLP", "Web App"],
    technologies: ["Python", "Flask", "Whisper AI", "HTML", "CSS", "JavaScript"],
    github: "https://github.com/Harshit-Kandoi/Transcription",
    featured: true
  },
  {
    id: 4,
    title: "Movie Recommendation System",
    description: "Built a personalized movie recommendation system using collaborative & content-based filtering, deployed with Streamlit for ease of use.",
    image: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg",
    category: ["Machine Learning", "Web App"],
    technologies: ["Python", "Machine Learning", "Streamlit", "Kaggle"],
    github: "https://github.com/Harshit-Kandoi/movie-recommender",
    featured: true
  },
  {
    id: 5,
    title: "Email Spam or Ham Classification",
    description: "Applied NLP and machine learning techniques to classify emails as spam or ham using text preprocessing and vectorization methods.",
    image: "https://images.pexels.com/photos/267614/pexels-photo-267614.jpeg",
    category: ["NLP", "Classification"],
    technologies: ["Python", "NLTK", "Scikit-learn", "Flask", "CountVectorizer"],
    github: "https://github.com/Harshit-Kandoi/email-project",
    featured: true
  },
  {
    id: 6,
    title: "House Price Prediction",
    description: "Developed a regression model to predict house prices based on various numerical and categorical features using feature engineering and model evaluation.",
    image: "https://images.pexels.com/photos/439391/pexels-photo-439391.jpeg",
    category: ["Regression", "Machine Learning"],
    technologies: ["Python", "Pandas", "Scikit-learn", "Matplotlib"],
    github: "https://github.com/Harshit-Kandoi/house-sale-prediction",
    featured: true
  },
  {
    id: 7,
    title: "Crop Classification",
    description: "Implemented a classification model to predict crop types based on environmental conditions like rainfall, temperature, and humidity.",
    image: "https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg",
    category: ["Agriculture", "Machine Learning"],
    technologies: ["Python", "Pandas", "Scikit-learn", "Matplotlib", "Flask"],
    github: "https://github.com/Harshit-Kandoi/crops",
    featured: true
  },
  {
    id: 8,
    title: "Pizza Sales Analytics Dashboard",
    description: "Designed an interactive dashboard to analyze sales data, track revenue trends, and identify top-performing pizza categories and time slots.",
    image: "https://images.pexels.com/photos/2619970/pexels-photo-2619970.jpeg",
    category: ["Data Visualization", "Business Analytics"],
    technologies: ["Power BI", "Excel", "SQL", "Python (Pandas)"],
    github: "https://github.com/Harshit-Kandoi/pizza-sales",
    featured: true
  },
  {
    id: 9,
    title: "Credit Card Financial Dashboard",
    description: "Created a financial analytics dashboard to track customer transactions, credit limits, and identify customer segments.",
    image: "https://images.pexels.com/photos/210574/pexels-photo-210574.jpeg",
    category: ["Data Visualization", "Finance"],
    technologies: ["Power BI", "SQL", "Python", "Excel"],
    github: "https://github.com/Harshit-Kandoi/Credit-Card-Financial-Dashboard",
    featured: true
  }
];
