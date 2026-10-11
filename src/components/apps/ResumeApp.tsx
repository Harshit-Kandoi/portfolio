import { useRef } from 'react';
import { Download, Printer, ExternalLink, FileText } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { resumeLink } from '../../data/navigation';
import { trackEvent } from '../../utils/analytics';

export default function ResumeApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const theme = useOSStore((state) => state.theme);
  const viewMode = useOSStore((state) => state.viewMode);
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handlePrint = () => {
    trackEvent('resume_print');
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.focus();
        iframeRef.current.contentWindow?.print();
      } catch {
        // Fallback print in case of cross-origin security block (though local should be fine)
        window.print();
      }
    } else {
      window.print();
    }
  };

  const isLight = theme === 'light';
  const controlBg = isLight ? 'bg-gray-100 border-b border-gray-200' : 'bg-slate-900 border-b border-white/5';
  const isMobile = isMobileView || viewMode === 'mobile' || isSimulatingMobile;

  if (isMobile) {
    return (
      <div className={`flex flex-col flex-grow h-full overflow-y-auto p-6 items-center justify-center space-y-6 ${isLight ? 'bg-white text-gray-800' : 'bg-slate-950 text-purple-100'}`}>
        <div className={`w-full max-w-sm border p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-xl ${
          isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'
        }`}>
          <div className="w-16 h-16 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/25 flex items-center justify-center shadow-lg shadow-purple-500/5">
            <FileText className="w-8 h-8" />
          </div>
          
          <div className="space-y-1">
            <h2 className={`text-sm font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>Resume.pdf</h2>
            <p className="text-[10px] text-purple-500 font-semibold uppercase tracking-wider">Harshit Kandoi</p>
          </div>

          <p className={`text-[11px] leading-relaxed px-2 ${isLight ? 'text-slate-700 font-medium' : 'text-gray-400'}`}>
            View Harshit's resume detailing professional experience at ThoughtIn Solutions, GCP Cloud certifications, and core stack technologies.
          </p>

          <div className={`w-full pt-4 border-t ${isLight ? 'border-slate-200' : 'border-white/10'} flex flex-col space-y-2`}>
            <a
              href={resumeLink}
              download="Harshit_Kandoi_Resume.pdf"
              onClick={() => trackEvent('resume_download')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition shadow-lg shadow-purple-500/10"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </a>
            
            <a
              href={resumeLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full font-semibold text-xs py-2.5 px-4 rounded-xl border flex items-center justify-center space-x-2 transition ${
                isLight ? 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-900' : 'bg-slate-900 hover:bg-slate-800 text-white border-gray-800'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open PDF</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col flex-grow h-full overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-slate-950'}`}>
      
      {/* PDF Viewer Top Controls Bar */}
      <div className={`p-3 flex items-center justify-between space-x-2 shrink-0 ${controlBg}`}>
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-purple-500" />
          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>Resume Viewer</span>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={resumeLink}
            download="Harshit_Kandoi_Resume.pdf"
            onClick={() => trackEvent('resume_download')}
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white flex items-center space-x-1.5 text-xs font-semibold transition"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </a>
          
          <button 
            onClick={handlePrint} 
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white flex items-center space-x-1.5 text-xs font-semibold transition" 
            title="Print Resume"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* PDF iframe Viewer Container */}
      <div className="flex-grow p-4 flex justify-center items-stretch bg-gray-900">
        <iframe
          ref={iframeRef}
          src={resumeLink}
          className="w-full max-w-[850px] border border-gray-800 rounded-lg shadow-2xl bg-white"
          title="Resume PDF Viewer"
        />
      </div>

    </div>
  );
}
