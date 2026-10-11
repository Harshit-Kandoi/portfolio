export const initialCombatLogs = [
  "System initialized. Standing by in training simulator.",
  "Warning: High volume of uncompiled modules detected in branch master.",
  "Harshit Kandoi level sync completed.",
  "Available targets: Production Outage (Lv.5), Memory Leak (Lv.3), SQL Injection (Lv.2)."
];

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  rarity: 'Legendary' | 'Epic' | 'Rare' | 'Common';
  statBoost: string;
  badgeUrl?: string;
}

export const inventoryItems: InventoryItem[] = [
  {
    id: 'gcp_ace',
    name: 'Google Associate Cloud Engineer (ACE)',
    category: 'Credentials',
    description: 'Verifies professional knowledge of deploying applications, monitoring operations, and managing enterprise cloud configurations on GCP.',
    rarity: 'Legendary',
    statBoost: '+25 Cloud Defense',
    badgeUrl: 'https://images.credly.com/images/2d847180-2a21-424a-89b3-46c59b207ee8/google_associate_cloud_engineer.png'
  },
  {
    id: 'docker_foundations',
    name: 'Docker Foundations Professional Certificate',
    category: 'Containers',
    description: 'Containerization, image building, multi-stage Dockerfiles and local container orchestration with Docker Compose.',
    rarity: 'Epic',
    statBoost: '+15 Container Shielding',
  },
  {
    id: 'yolo_models',
    name: 'YOLOv5 Visor Module',
    category: 'Computer Vision',
    description: 'Custom-trained YOLOv5 object detection weights for recognising ASL hand signs from a webcam feed.',
    rarity: 'Epic',
    statBoost: '+20 AI Target Lock',
  },
  {
    id: 'python_scroll',
    name: 'Python Master Scroll',
    category: 'Languages',
    description: 'Comprehensive codebase mastery across Python automation libraries, Flask backends, and Pandas dataframe analytics pipelines.',
    rarity: 'Rare',
    statBoost: '+15 Code Speed',
  },
  {
    id: 'git_token',
    name: 'Git Master Access Token',
    category: 'Repository',
    description: 'Full write access token for automated GitHub actions pipelines, workflow configurations, and version release hooks.',
    rarity: 'Rare',
    statBoost: '+10 Deployment Haste',
  },
  {
    id: 'gcp_emulator',
    name: 'Local Firestore Emulator Key',
    category: 'Development Tools',
    description: 'Custom written local simulation queue for Firestore, Pub/Sub, and Cloud Functions to debug code offline without incurring cloud bills.',
    rarity: 'Legendary',
    statBoost: '+20 Sandbox Autonomy',
  }
];
