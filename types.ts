export interface Peer {
  id: string;
  name: string;
  deviceType: 'android' | 'windows' | 'mac' | 'unknown';
  ip: string;
  trusted: boolean;
  status: 'idle' | 'connecting' | 'connected' | 'transferring' | 'offline';
  lastSeen: Date;
}

export interface TransferFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number; // 0 to 100
  speed: number; // MB/s
  status: 'pending' | 'uploading' | 'downloading' | 'completed' | 'failed';
  peerId: string;
  direction: 'incoming' | 'outgoing';
  errorMessage?: string;
}

export interface ArchitectureSection {
  title: string;
  content: string;
  codeSnippet?: string;
  language?: 'python' | 'kotlin' | 'json';
}

export enum Tab {
  TRANSFER = 'TRANSFER',
  ARCHITECTURE = 'ARCHITECTURE',
  AI_AUDIT = 'AI_AUDIT',
  SERVER_GEN = 'SERVER_GEN',
  ANDROID_GEN = 'ANDROID_GEN'
}