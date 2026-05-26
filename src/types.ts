export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  balance: number;
  miningRate: number; // CM per hour
  miningSessionEndTime: number | null; // Timestamp when session ends
  miningSessionStartTime: number | null; // Timestamp when session ends
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  joinDate: number;
  dailyStreak: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
  role: 'user' | 'admin';
  isActive: boolean;
  totalMined: number;
  lastCheckIn: number | null;
  lastSquadClaim?: number | null;
  deviceId?: string;
  transactionsBlocked?: boolean;
  squadId?: string;
}

export interface Squad {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: number;
  memberUids: string[];
  totalBalance: number;
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: 'mining_reward' | 'task_reward' | 'referral_bonus' | 'transfer_sent' | 'transfer_received' | 'withdrawal';
  amount: number;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
  senderUid?: string;
  receiverUid?: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  type: 'twitter' | 'tiktok' | 'instagram' | 'youtube' | 'ad' | 'daily';
  url?: string;
  isActive: boolean;
}

export interface UserTask {
  taskId: string;
  completedAt: number;
  status: 'completed' | 'pending';
}

export interface TaskClaim {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  taskId: string;
  taskTitle: string;
  reward: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface AdSettings {
  showAds: boolean;
  adsterraSnippet?: string;
  admobBannerId?: string;
}
