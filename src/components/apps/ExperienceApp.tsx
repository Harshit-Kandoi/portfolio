import React, { useState } from 'react';
import { experience } from '../../data/experience';
import { Briefcase, GraduationCap, Award, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';

export default function ExperienceApp() {
  const [filterType, setFilterType] = useState<'all' | 'work' | 'education' | 'Course'>('all');
  const theme = useOSStore((state) => state.theme);

  const filteredItems = experience.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const isLight = theme === 'light';
  const containerBg = isLight ? 'bg-gray-50 text-gray-800' : 'bg-slate-950 text-purple-100';
  const headerBg = isLight ? 'bg-gray-100 border-b border-gray-200' : 'bg-slate-900/50 border-b border-white/5';
  const cardBg = isLight ? 'bg-white border-gray-200 shadow-sm' : 'bg-slate-900/40 border-white/5 shadow-lg';
  const textMuted = isLight ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`flex flex-col flex-grow h-full overflow-hidden ${containerBg} custom-scrollbar`}>
      {/* Navigation Headers */}
      <div className={`p-4 flex items-center justify-between space-x-2 shrink-0 ${headerBg}`}>
        <div className="flex space-x-1.5 overflow-x-auto custom-scrollbar flex-grow mr-2">
          {(['all', 'work', 'education', 'Course'] as const).map((type) => {
            const label = type === 'all' ? 'All History' : type === 'work' ? 'Work Experience' : type === 'education' ? 'Education' : 'Certifications';
            const isSelected = filterType === type;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? isLight 
                      ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                      : 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                    : isLight
                      ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                      : 'bg-slate-900/40 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className={`text-xs font-semibold hidden md:block ${textMuted}`}>
          Total: {filteredItems.length} records
        </div>
      </div>

      {/* Timeline Scroll Area */}
      <div className="flex-grow overflow-y-auto p-6 md:p-8 relative custom-scrollbar">
        {filteredItems.length === 0 ? (
          <p className={`text-center text-xs py-12 ${textMuted}`}>No records found.</p>
        ) : (
          <div className="max-w-3xl mx-auto">
          <div className="relative border-l-2 border-purple-900/30 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8">
            {/* Pulsing Vertical Timeline line */}
            <div className="absolute top-0 bottom-0 left-[-2px] w-[2px] bg-gradient-to-b from-purple-500 via-pink-500 to-indigo-500" />

            {filteredItems.map((item) => {
              const isWork = item.type === 'work';
              const isEdu = item.type === 'education';
              
              let Icon = Award;
              let iconColor = 'bg-amber-600/20 text-amber-400 border-amber-500/30';
              if (isWork) {
                Icon = Briefcase;
                iconColor = 'bg-blue-600/20 text-blue-400 border-blue-500/30';
              } else if (isEdu) {
                Icon = GraduationCap;
                iconColor = 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30';
              }

              return (
                <div key={item.id} className="relative group animate-fade-in">
                  
                  {/* Timeline Node Point Icon */}
                  <span className={`absolute left-[-42px] md:left-[-50px] top-1.5 flex items-center justify-center w-7 h-7 rounded-full border-2 bg-slate-950 shadow-md ${iconColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>

                  {/* Card Container */}
                  <div className={`p-5 rounded-2xl border transition-all ${cardBg} hover:border-purple-500/40 hover:shadow-purple-500/5`}>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors leading-tight">
                          {item.role || item.title}
                        </h3>
                        <span className="text-xs font-semibold text-purple-400 block mt-0.5">
                          {item.company || item.organization}
                        </span>
                      </div>
                      
                      <div className="flex flex-col md:items-end text-[10px] sm:text-xs">
                        <span className="flex items-center space-x-1.5 text-gray-300 font-semibold">
                          <Calendar className="w-3 h-3 text-purple-400" />
                          <span>{item.period || item.date}</span>
                        </span>
                        {item.location && (
                          <span className={`flex items-center space-x-1 mt-0.5 ${textMuted}`}>
                            <MapPin className="w-3 h-3" />
                            <span>{item.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description Paragraphs */}
                    <div className="mt-4 text-xs leading-relaxed space-y-2 text-justify">
                      {Array.isArray(item.description) ? (
                        <ul className={`list-disc list-inside space-y-1.5 ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
                          {item.description.map((bullet, bIdx) => (
                            <li key={bIdx} className="leading-relaxed pl-1">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className={isLight ? 'text-gray-750' : 'text-gray-300'}>{item.description}</p>
                      )}
                    </div>

                    {/* External Link Credentials */}
                    {item.link && (
                      <div className="mt-4 pt-3 border-t border-white/5 flex">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition"
                        >
                          <span>Verify Credential</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
