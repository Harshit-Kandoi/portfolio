import React, { useState } from 'react';
import { experience } from '../../data/experience';
import { ExternalLink, MapPin } from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';

export default function ExperienceApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  const [filterType, setFilterType] = useState<'all' | 'work' | 'education' | 'Course'>('all');
  const theme = useOSStore((state) => state.theme);
  const globalViewMode = useOSStore((state) => state.viewMode);
  const isSimulatingMobile = useOSStore((state) => state.isSimulatingMobile);
  const isMobile = isMobileView || globalViewMode === 'mobile' || isSimulatingMobile;

  const filteredItems = experience.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const isLight = theme === 'light';

  // Pill chip color per skill (cycles through palette)
  const CHIP_COLORS = [
    'bg-blue-500/15 text-blue-300 border-blue-500/30',
    'bg-purple-500/15 text-purple-300 border-purple-500/30',
    'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    'bg-amber-500/15 text-amber-300 border-amber-500/30',
    'bg-pink-500/15 text-pink-300 border-pink-500/30',
    'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  ];

  const NODE_COLORS: Record<string, string> = {
    work:      'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]',
    education: 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]',
    Course:    'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
  };

  const COMPANY_COLORS: Record<string, string> = {
    work:      isLight ? 'text-blue-600' : 'text-blue-400',
    education: isLight ? 'text-purple-600' : 'text-purple-400',
    Course:    isLight ? 'text-amber-600' : 'text-amber-400',
  };

  return (
    <div className={`flex flex-col flex-grow h-full overflow-hidden ${isLight ? 'bg-gray-50 text-gray-800' : 'bg-[#0c0d14] text-white'}`}>
      {/* Filter Bar */}
      <div className={`shrink-0 px-5 py-3 border-b flex items-center justify-between ${isLight ? 'bg-gray-100 border-gray-200' : 'bg-[#09090f] border-white/5'}`}>
        <div className="flex space-x-1.5 overflow-x-auto custom-scrollbar">
          {(['all', 'work', 'education', 'Course'] as const).map((type) => {
            const label = type === 'all' ? 'All History' : type === 'work' ? 'Work' : type === 'education' ? 'Education' : 'Certifications';
            const isSelected = filterType === type;
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? isLight
                      ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                      : 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : isLight
                      ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <span className={`text-[10px] font-medium hidden md:block ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>
          {filteredItems.length} records
        </span>
      </div>

      {/* Timeline */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {filteredItems.length === 0 ? (
          <p className="text-center text-xs py-12 text-gray-500">No records found.</p>
        ) : (
          <div className="relative max-w-3xl mx-auto px-4 sm:px-8 py-8">
            {filteredItems.map((item, idx) => {
              const isLast = idx === filteredItems.length - 1;

              const periodLabel = item.period || item.date || '';
              const nodeColor = NODE_COLORS[item.type] || NODE_COLORS.Course;
              const companyColor = COMPANY_COLORS[item.type] || COMPANY_COLORS.Course;

              return (
                <div
                  key={item.id}
                  className={`relative flex gap-5 sm:gap-6 mb-10 group animate-fade-in`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Left: Date column */}
                  <div className={`${isMobile ? 'w-20' : 'w-28 sm:w-32'} shrink-0 text-right flex flex-col items-end justify-start pt-1`}>
                    <span className={`text-[10px] sm:text-xs font-semibold leading-tight ${isLight ? 'text-gray-500' : 'text-gray-500'}`}>
                      {periodLabel}
                    </span>
                  </div>

                  {/* Center: node dot & connector line */}
                  <div className="relative flex justify-center w-4 shrink-0 pt-1.5">
                    {!isLast && (
                      <div
                        className={`absolute top-3 bottom-[-2.5rem] w-0.5 pointer-events-none ${
                          isLight
                            ? 'bg-purple-300/60'
                            : 'bg-purple-500/40'
                        }`}
                      />
                    )}
                    <div className={`w-3.5 h-3.5 rounded-full border-2 ${isLight ? 'border-white' : 'border-[#0c0d14]'} shrink-0 ${nodeColor} z-10 group-hover:scale-125 transition-transform`} />
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 min-w-0 pb-2">
                    {/* Role + @ Company */}
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-2">
                      <h3 className={`text-sm font-bold leading-snug ${isLight ? 'text-gray-800' : 'text-white'}`}>
                        {item.role || item.title}
                      </h3>
                      {(item.company || item.organization) && (
                        <span className={`text-sm font-medium ${companyColor}`}>
                          @ {item.company || item.organization}
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    {item.location && (
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-gray-600 shrink-0" />
                        <span className="text-[10px] text-gray-500">{item.location}</span>
                      </div>
                    )}

                    {/* Description */}
                    <div className={`text-xs leading-relaxed mb-3 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                      {Array.isArray(item.description) ? (
                        <ul className="space-y-1 list-disc list-inside">
                          {item.description.map((bullet, bIdx) => (
                            <li key={bIdx} className="leading-relaxed pl-1">{bullet}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{item.description}</p>
                      )}
                    </div>

                    {/* Skill Chips */}
                    {item.skills && item.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {item.skills.map((skill, sIdx) => (
                          <span
                            key={skill}
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${CHIP_COLORS[sIdx % CHIP_COLORS.length]}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Credential Link */}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 hover:text-purple-300 transition"
                      >
                        <span>Verify Credential</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
