import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/sections/Home';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import Skills from './components/sections/Skills';
import Experience from './components/sections/Experience';
import Blog from './components/sections/Blog';
import Contact from './components/sections/Contact';
import ResumeButton from './components/ResumeButton';
import ScrollToTop from './components/ui/ScrollToTop';

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      
      <main>
        <Home />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Blog />
        <Contact />
        <ResumeButton />
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default App;