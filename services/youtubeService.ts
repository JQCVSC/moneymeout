import { CreatorProfile, CreatorsResult, ApiErrorType, CreatorPost } from '../types';
import { YOUTUBE_API_KEY } from '../env.js';

// --- YOUTUBE API CONFIGURATION ---
const API_KEY: string = YOUTUBE_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const VITE_API_URL = import.meta.env?.VITE_API_URL || 'https://us-central1-cash-me-out-2.cloudfunctions.net/youtubeApiProxy';

// --- API CONFIGURATION CHECK ---
const checkApiConfig = (): { isConfigured: boolean; errorResult: CreatorsResult | null } => {
    if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        return {
            isConfigured: false,
            errorResult: {
                creators: [],
                isError: true,
                errorMessage: {
                    title: "Action Required: YouTube API Key Not Configured",
                    points: [
                        "The `YOUTUBE_API_KEY` is not set in your env.js file.",
                        "Please open the `env.js` file in the editor.",
                        "Replace the placeholder string with your actual YouTube API key for local development.",
                        "For production, this key must be moved to a secure Firebase Function."
                    ],
                },
                errorType: 'NOT_CONFIGURED',
            }
        };
    }
    return { isConfigured: true, errorResult: null };
};

// --- ERROR HANDLING ---
const handleApiError = async (response: Response): Promise<CreatorsResult> => {
    let errorMessage: string | { title: string; points: string[] } = "An unknown API error occurred.";
    let errorType: ApiErrorType = 'API_ERROR';
    
    try {
        const errorData = await response.json();
        const errorReason = errorData?.error?.errors?.[0]?.reason;

        if (errorReason === 'keyInvalid') {
            errorMessage = "The provided YouTube API Key is invalid. Please double-check it in your `env.js` file.";
            errorType = 'INVALID_KEY';
        } else if (errorReason === 'quotaExceeded' || errorReason === 'dailyLimitExceeded') {
             errorMessage = {
                title: "YouTube API Quota Exceeded",
                points: [
                    "You have used up the daily allowance of requests for the YouTube API.",
                    "This is a limit set by Google on your project.",
                    "You can view your usage and request a higher limit in the Google Cloud Console.",
                ],
            };
            errorType = 'QUOTA_EXCEEDED';
        }
        else if (response.status === 403) {
             errorMessage = "The YouTube API request was forbidden. This is likely due to incorrect HTTP referrer settings in your Google Cloud Console API key configuration.";
             errorType = 'PERMISSION_DENIED';
        } 
        else {
            errorMessage = errorData?.error?.message || `API request failed with status ${response.status}`;
        }
    } catch (e) {
        errorMessage = `API request failed with status ${response.status}. Could not parse error response.`;
    }

    console.error("YouTube API Error:", errorMessage);
    return { creators: [], isError: true, errorMessage, errorType };
};

// --- DATA MAPPING ---
const mapToCreatorProfiles = (channelItems: any[]): CreatorProfile[] => {
    return channelItems.map((item) => {
        const rawHandle = item.snippet?.customUrl || item.id;
        const finalHandle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;

        return {
            id: item.id.channelId || item.id,
            name: item.snippet?.title || 'N/A',
            handle: finalHandle,
            subscribers: parseInt(item.statistics?.subscriberCount || '0', 10),
            description: item.snippet?.description || '',
            avatarUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
            bannerUrl: item.brandingSettings?.image?.bannerExternalUrl ? `${item.brandingSettings.image.bannerExternalUrl}=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj` : '',
        };
    });
};

const mapToCreatorPosts = (videoItems: any[]): CreatorPost[] => {
    return videoItems.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
};


// --- CORE API FETCHER ---

const FEATURED_CREATOR_IDS = [
    'UCBJycsmduvYEL83R_U4JriQ', // MKBHD
    'UCpE5_z6aM2_6E1rDb5iA5-w', // Zoe Sugg
    'UCX6OQ3DkcsbYNE6H8uQQuVA', // MrBeast
    'UCHkCmKyC-3vEYESdEDHwPxA', // Chloe Ting
    'UCJHA_jMfCvEnv-3kRjTCQXw', // Binging with Babish
    'UCRijo3ddMTht_IHyNSNXpNQ', // Coffeezilla
];

export const getFeaturedCreators = async (): Promise<CreatorsResult> => {
    return fetchChannelDetailsByIds(FEATURED_CREATOR_IDS);
};

export const fetchChannelDetailsByIds = async (ids: string[]): Promise<CreatorsResult> => {
    if (ids.length === 0) {
        return { creators: [], isError: false };
    }

    const idsString = ids.join(',');

    // 1. Try VITE_API_URL Cloud Function if available
    if (VITE_API_URL) {
        try {
            const url = `${VITE_API_URL}?endpoint=channels&part=snippet,statistics,brandingSettings&id=${encodeURIComponent(idsString)}`;
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const creators = mapToCreatorProfiles(data.items || []);
                return { creators, isError: false };
            }
        } catch (e) {
            console.warn("Cloud function fetch failed, trying local proxy:", e);
        }
    }

    // 2. Try server proxy route
    try {
        const proxyResponse = await fetch(`/api/youtube/channels?ids=${encodeURIComponent(idsString)}`);
        const contentType = proxyResponse.headers.get('content-type') || '';
        if (proxyResponse.ok && contentType.includes('application/json')) {
            const data = await proxyResponse.json();
            const creators = mapToCreatorProfiles(data.items || []);
            return { creators, isError: false };
        }
    } catch (e) {
        // Fall through to direct fetch if proxy unavailable
    }

    // 3. Direct client fetch fallback
    const configCheck = checkApiConfig();
    if (!configCheck.isConfigured) return configCheck.errorResult!;

    const url = `${YOUTUBE_API_BASE_URL}/channels?part=snippet,statistics,brandingSettings&id=${idsString}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return handleApiError(response);

        const data = await response.json();
        const creators = mapToCreatorProfiles(data.items || []);
        return { creators, isError: false };
    } catch (error) {
        console.error("Network or fetch error:", error);
        return { creators: [], isError: true, errorMessage: "A network error occurred. Please check your connection." };
    }
};

export const searchCreators = async (query: string): Promise<CreatorsResult> => {
    // 1. Try VITE_API_URL Cloud Function if available
    if (VITE_API_URL) {
        try {
            const url = `${VITE_API_URL}?endpoint=search&part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=12`;
            const proxyResponse = await fetch(url);
            if (proxyResponse.ok) {
                const searchData = await proxyResponse.json();
                const channelIds = (searchData.items || []).map((item: any) => item.id?.channelId || item.id).filter(Boolean);

                if (channelIds.length === 0) {
                    return { creators: [], isError: false };
                }

                return fetchChannelDetailsByIds(channelIds);
            }
        } catch (e) {
            console.warn("Cloud function search failed, trying local proxy:", e);
        }
    }

    // 2. Try server proxy route
    try {
        const proxyResponse = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
        const contentType = proxyResponse.headers.get('content-type') || '';
        if (proxyResponse.ok && contentType.includes('application/json')) {
            const searchData = await proxyResponse.json();
            const channelIds = (searchData.items || []).map((item: any) => item.id?.channelId || item.id).filter(Boolean);

            if (channelIds.length === 0) {
                return { creators: [], isError: false };
            }

            return fetchChannelDetailsByIds(channelIds);
        }
    } catch (e) {
        // Fall through to direct fetch
    }

    // 3. Direct client fetch fallback
    const configCheck = checkApiConfig();
    if (!configCheck.isConfigured) return configCheck.errorResult!;

    const searchUrl = `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=12&key=${API_KEY}`;
    
    try {
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) return handleApiError(searchResponse);

        const searchData = await searchResponse.json();
        const channelIds = (searchData.items || []).map((item: any) => item.id.channelId).filter(Boolean);

        if (channelIds.length === 0) {
            return { creators: [], isError: false };
        }

        return fetchChannelDetailsByIds(channelIds);

    } catch (error) {
        console.error("Network or fetch error during search:", error);
        return { creators: [], isError: true, errorMessage: "A network error occurred during the search." };
    }
};

export const getCreatorFeed = async (channelId: string): Promise<{posts: CreatorPost[], isError: boolean}> => {
    // 1. Try VITE_API_URL Cloud Function if available
    if (VITE_API_URL) {
        try {
            const url = `${VITE_API_URL}?endpoint=search&part=snippet&channelId=${encodeURIComponent(channelId)}&order=date&type=video&maxResults=12`;
            const proxyResponse = await fetch(url);
            if (proxyResponse.ok) {
                const data = await proxyResponse.json();
                return { posts: mapToCreatorPosts(data.items || []), isError: false };
            }
        } catch (e) {
            console.warn("Cloud function feed fetch failed, trying local proxy:", e);
        }
    }

    // 2. Try server proxy route
    try {
        const proxyResponse = await fetch(`/api/youtube/feed?channelId=${encodeURIComponent(channelId)}`);
        const contentType = proxyResponse.headers.get('content-type') || '';
        if (proxyResponse.ok && contentType.includes('application/json')) {
            const data = await proxyResponse.json();
            return { posts: mapToCreatorPosts(data.items || []), isError: false };
        }
    } catch (e) {
        // Fall through to direct fetch
    }

    // 3. Direct client fetch fallback
    const configCheck = checkApiConfig();
    if (!configCheck.isConfigured) return { posts: [], isError: true };
    
    const url = `${YOUTUBE_API_BASE_URL}/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=12&key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Failed to fetch creator feed");
            return { posts: [], isError: true };
        }
        const data = await response.json();
        return { posts: mapToCreatorPosts(data.items || []), isError: false };

    } catch(error) {
        console.error("Network or fetch error during feed fetch:", error);
        return { posts: [], isError: true };
    }
};