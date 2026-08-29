// -----------------------------------------------------------------------------
// !!! IMPORTANT SECURITY WARNING !!!
// -----------------------------------------------------------------------------
//
// DO NOT DEPLOY THIS FILE TO PRODUCTION WITH A REAL API KEY VISIBLE HERE.
//
// Exposing your YouTube API key on the client-side (in the browser) is a
// major security risk. It allows anyone to find and steal your key, potentially
// using up your API quota and incurring costs on your behalf.
//
// --- FOR PRODUCTION, YOU MUST USE A BACKEND PROXY ---
//
// The recommended approach is to create a Firebase Function.
// 1. Store your API key securely in Firebase Functions environment variables.
// 2. Create an HTTP-triggered function (e.g., `searchYoutubeChannels`).
// 3. Your front-end application will call this function.
// 4. The function will then make the call to the YouTube API on the server-side
//    using the secure key and return the results to your app.
//
// This keeps your API key completely secret and secure.
//
// -----------------------------------------------------------------------------

// For local development only, you can paste your key here.
// Remember to create a `env.js` file from this template if it doesn't exist.
export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "YOUR_YOUTUBE_API_KEY_HERE";
