import { zones, type Zone } from './world';
import type { WorldSnapshot } from './Engine';
interface Props { snapshot: WorldSnapshot; large?: boolean; onTravel?: (zone: Zone) => void }
export default function WorldMap({ snapshot, large = false, onTravel }: Props) {
  return <svg className={large ? 'verse-map-art' : 'verse-minimap-art'} viewBox="-58 -58 116 116" role="img" aria-label={`World map. Your location: ${zones.find(z => z.id === snapshot.region)?.name}`}>
    <defs>
      <radialGradient id={large ? 'sea-lg' : 'sea-sm'}><stop stopColor="#265066"/><stop offset="1" stopColor="#122c3e"/></radialGradient>
      <pattern id={large ? 'grid-lg' : 'grid-sm'} width="8" height="8" patternUnits="userSpaceOnUse"><path d="M8 0H0V8" fill="none" stroke="#9ddcea" strokeOpacity=".08" strokeWidth=".25"/></pattern>
    </defs>
    <rect x="-58" y="-58" width="116" height="116" fill={`url(#${large ? 'sea-lg' : 'sea-sm'})`}/>
    <path d="M-45 -22L-39 -38 -25 -47 -9 -49 4 -46 16 -50 35 -39 43 -26 46 -8 50 8 43 25 36 40 21 46 4 48 -16 45 -32 40 -43 25 -49 9 -44 -5Z" fill="#617b52" stroke="#9bb381" strokeWidth="1.3"/>
    <path d="M-41 -22L-32 -37 -12 -43 9 -40 26 -39 39 -23 42 -7 43 19 27 36 8 40 -14 37 -35 29 -42 4Z" fill="#385e49"/>
    <path d="M-48 9Q-15 8 0 9T48 9" fill="none" stroke="#72c7d4" strokeWidth="3.7"/>
    <path d="M-3 7V11H3V7" fill="#c1b798"/>
    {zones.filter(z => z.id !== 'hub').map(z => <path key={z.id} d={`M0 ${z.z > 10 ? 14 : 1} L${z.x} ${z.spawn[1]}`} stroke="#ccb18c" strokeWidth="1.2" fill="none" strokeDasharray="2 1" />)}
    <rect x="-58" y="-58" width="116" height="116" fill={`url(#${large ? 'grid-lg' : 'grid-sm'})`}/>
    {zones.map(z => <g key={z.id} onClick={onTravel ? () => onTravel(z) : undefined} style={{ cursor: onTravel ? 'pointer' : undefined }}>
      <rect x={z.x - 3.4} y={z.z - 2.8} width="6.8" height="5.6" rx=".7" fill="#172b33" stroke={z.color} strokeWidth=".8"/>
      <path d={`M${z.x} ${z.z - 1.7}l1.6 1.7-1.6 1.7-1.6-1.7Z`} fill={z.color}/>
      {large && <><rect x={z.x - 12} y={z.z + 4.3} width="24" height="4.2" rx=".7" fill="#112532" stroke={z.color} strokeWidth=".25"/><text x={z.x} y={z.z + 7.2} textAnchor="middle" fill="#f4ecd9" fontSize="2.45" fontFamily="system-ui" fontWeight="600">{z.name}</text></>}
    </g>)}
    <circle cx={snapshot.x} cy={snapshot.z} r="3.3" fill="#ffffff" opacity=".13"/>
    <path d={`M${snapshot.x} ${snapshot.z - 2.4}l1.6 4.1-1.6-.8-1.6.8Z`} fill="#ffffff" stroke="#142530" strokeWidth=".6"/>
    {large && <text x="49" y="-46" fill="#dbebee" fontSize="4" textAnchor="middle">N</text>}
  </svg>;
}
