import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Download, Printer, RotateCcw, Mail, Phone, Globe } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';

export default function ResumeApp() {
  const [zoom, setZoom] = useState(100);
  const theme = useOSStore((state) => state.theme);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 70));
  const handleZoomReset = () => setZoom(100);

  const handlePrint = () => {
    window.print();
  };

  const isLight = theme === 'light';
  const controlBg = isLight ? 'bg-gray-150 border-b border-gray-200' : 'bg-slate-900 border-b border-white/5';
  const paperBg = 'bg-white text-gray-900 shadow-2xl';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-slate-950'}`}>
      
      {/* PDF Viewer Top Controls Bar */}
      <div className={`p-3 flex items-center justify-between space-x-2 shrink-0 ${controlBg}`}>
        <div className="flex items-center space-x-1">
          <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-400 font-mono w-10 text-center">{zoom}%</span>
          <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomReset} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white" title="Reset Zoom">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Download button redirects to mock pdf download or open */}
          <a
            href="https://raw.githubusercontent.com/Harshit-Kandoi/Local-GCP-Emulator/main/README.md" // placeholder repo file download link or general github profile
            target="_blank"
            download
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white flex items-center space-x-1.5 text-xs font-semibold"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </a>
          <button onClick={handlePrint} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white flex items-center space-x-1.5 text-xs font-semibold" title="Print Resume">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* PDF Page Container */}
      <div className="flex-grow overflow-auto p-6 flex justify-center items-start">
        <div
          className={`w-full max-w-[800px] p-8 sm:p-12 rounded-lg origin-top transition-transform ${paperBg}`}
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Document Header */}
          <div className="text-center pb-6 border-b border-gray-300">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Harshit Kandoi</h1>
            <p className="text-sm font-semibold text-purple-700 tracking-wide mt-1">Associate Software Engineer | AI & Cloud Developer</p>
            
            {/* Contact Details */}
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mt-4">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5" />
                <span>harshit.kandoi@outlook.com</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5" />
                <span>+91 93582 32130</span>
              </span>
              <span className="flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5" />
                <a href="https://linkedin.com/in/harshit-kandoi" className="hover:underline">linkedin.com/in/harshit-kandoi</a>
              </span>
            </div>
          </div>

          {/* Education & Experience Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            
            {/* Left Hand Column: Skills and Education */}
            <div className="md:col-span-1 space-y-6">
              
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 border-b border-gray-200 pb-1 mb-2.5">
                  Education
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900">B.Tech in CSE (Data Science)</h4>
                    <p className="text-[11px] text-gray-600">B.K. Birla Institute of Engineering & Technology</p>
                    <p className="text-[10px] text-gray-500">2021 - 2025 | CGPA: 8.35</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Senior Secondary (PCMB)</h4>
                    <p className="text-[11px] text-gray-600">Sarasvati Vidhya Peeth School</p>
                    <p className="text-[10px] text-gray-500">2019 - 2021 | Score: 91%</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 border-b border-gray-200 pb-1 mb-2.5">
                  Core Skills
                </h3>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {['Python', 'Java', 'SQL', 'JavaScript', 'React', 'Flask', 'GCP', 'Docker', 'YOLO', 'CI/CD', 'Firestore', 'Pub/Sub', 'API integration', 'Machine Learning'].map((s) => (
                    <span key={s} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium border border-gray-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 border-b border-gray-200 pb-1 mb-2.5">
                  Certifications
                </h3>
                <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-1.5">
                  <li>Google Associate Cloud Engineer (ACE)</li>
                  <li>Docker Foundations Professional Cert</li>
                  <li>100 Days of Code (Python Bootcamp)</li>
                  <li>Machine Learning A-Z (Udemy)</li>
                </ul>
              </div>

            </div>

            {/* Right Hand Column: Experience and Projects */}
            <div className="md:col-span-2 space-y-6">
              
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 border-b border-gray-200 pb-1 mb-3">
                  Professional Experience
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900">Associate Software Engineer</h4>
                      <span className="text-[10px] text-gray-500">Aug 2025 - Present</span>
                    </div>
                    <p className="text-[11px] text-purple-700 font-semibold">ThoughtIn Solutions India Pvt. Ltd.</p>
                    <ul className="list-disc list-inside text-gray-600 mt-1.5 space-y-1 text-[11px] pl-1">
                      <li>Developed internal applications with React, Java, Python, and GCP.</li>
                      <li>Engineered event-driven automations using Pub/Sub and Firestore.</li>
                      <li>Integrated REST APIs and supported Agile release cycles.</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900">Software Engineer Intern</h4>
                      <span className="text-[10px] text-gray-500">May 2025 - Aug 2025</span>
                    </div>
                    <p className="text-[11px] text-purple-700 font-semibold">ThoughtIn Solutions India Pvt. Ltd.</p>
                    <ul className="list-disc list-inside text-gray-600 mt-1.5 space-y-1 text-[11px] pl-1">
                      <li>Designed Cloud Functions pipelines and microservices.</li>
                      <li>Automated builds via Docker and GitHub Actions.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700 border-b border-gray-200 pb-1 mb-3">
                  Key Projects
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900">Local GCP Emulator</h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Offline simulation environment for Google Cloud Firestore and Pub/Sub APIs built in Python/Flask, enabling sandboxed serverless logic execution.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">ASL Gesture Recognition System</h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Real-time American Sign Language classifier utilizing PyTorch and YOLOv5 to perform video feed sign-to-text inference with 90%+ accuracy.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Deep Q-Learning Agent (ViZDoom)</h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Autonomous agent playing Doom using reinforcement learning, custom CNN reward shapers, and raw image input frames.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
