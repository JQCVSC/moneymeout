export interface CreatorProfile {
  id: string;
  name: string;
  handle: string;
  subscribers: number;
  description: string;
  avatarUrl: string;
  bannerUrl:string;
  balance?: number; // Total funds raised
  stripeConnectAccountId?: string;
  stripeOnboardingComplete?: boolean;
}

export interface CreatorPost {
    id: string;
    title: string;
    thumbnailUrl: string;
    publishedAt: string;
    url: string;
}

// User structure now includes uid from Firebase Auth
export interface User {
    uid: string;
    name: string | null;
    email: string | null;
    claimedCreator?: CreatorProfile;
}

// Represents a single donation transaction
export interface Donation {
    id: string;
    amount: number;
    fanName: string;
    fanUid?: string;
    creatorId?: string;
    creatorName?: string;
    message?: string;
    timestamp: Date;
    status?: 'pending' | 'completed' | 'failed';
    type?: 'donation' | 'withdrawal';
}

export interface Notification {
    id: string;
    type: 'donation';
    title: string;
    content: string;
    message?: string;
    amount?: number;
    fanName?: string;
    isRead: boolean;
    timestamp: Date;
}


// Keep these for search page error handling
export type ApiErrorType = 'INVALID_KEY' | 'PERMISSION_DENIED' | 'NOT_CONFIGURED' | 'QUOTA_EXCEEDED' | 'GENERIC_ERROR' | 'API_ERROR' | 'BAD_REQUEST';

export interface CreatorsResult {
    creators: CreatorProfile[];
    isError: boolean;
    errorMessage?: string | { title: string; points: string[] };
    errorType?: ApiErrorType;
}