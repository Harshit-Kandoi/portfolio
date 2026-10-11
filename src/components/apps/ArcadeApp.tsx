import { Gamepad2, Swords } from 'lucide-react';
import TabbedApp from './TabbedApp';
import GamingApp from './GamingApp';
import SnakeGame from './SnakeGame';

export default function ArcadeApp({ isMobileView }: { isMobileView?: boolean } = {}) {
  return (
    <TabbedApp
      appId="arcade"
      tabs={[
        { id: 'rpg', label: 'Dev RPG', icon: Swords, render: () => <GamingApp isMobileView={isMobileView} /> },
        { id: 'snake', label: 'Snake', icon: Gamepad2, render: () => <SnakeGame isMobileView={isMobileView} /> },
      ]}
    />
  );
}
