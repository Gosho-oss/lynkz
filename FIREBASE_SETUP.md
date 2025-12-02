# Firebase Setup Guide

## Issue: Email/Password Authentication Not Enabled

The 400 error you're seeing is because **Email/Password authentication** is not enabled in your Firebase project.

## Fix Steps:

### 1. Enable Email/Password Authentication

1. Go to your Firebase Console: https://console.firebase.google.com/project/lynkz-e7f84/authentication/providers
2. Click on the **"Email/Password"** provider in the list
3. Toggle **"Enable"** to ON
4. Click **"Save"**

### 2. (Optional) Enable Google Authentication

If you want Google sign-in to work:

1. In the same Authentication Providers page
2. Click on **"Google"** provider
3. Toggle **"Enable"** to ON
4. Enter a **Project Support Email** (e.g., petkovwork11@gmail.com)
5. Click **"Save"**

### 3. Verify Configuration

After enabling authentication methods:

1. Refresh your app (clear browser cache if needed)
2. Try registering a new account
3. Try signing in with email/password

## About the Other Errors

The errors for `utils.js`, `extensionState.js`, and `heuristicsRedefinitions.js` are **harmless**. They are caused by browser extensions trying to inject scripts into your page. They don't affect functionality and can be safely ignored.

### To hide these warnings:

1. Disable unnecessary browser extensions
2. Use Chrome DevTools filters to hide them:
   - Open DevTools (F12)
   - Click on the filter icon
   - Add filter: `-/utils.js/ -/extensionState.js/ -/heuristicsRedefinitions.js/`

## React DevTools Warning

The "Download the React DevTools" warning is also harmless. It's just React reminding you to install the React DevTools browser extension for better development experience.

To install React DevTools:
- Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

## Current Configuration

Your Firebase project details:
- **Project ID:** lynkz-e7f84
- **API Key:** AIzaSyAzNmEj6dg16fO9V4s4hdPqpkNFzQdn-90
- **App ID:** 1:459460692536:web:83535dadb79c3bc8f234cd

## After Setup

Once authentication is enabled, you can:
1. Register new accounts
2. Sign in with email/password
3. Use Google sign-in (if enabled)
4. Access the admin dashboard with the credentials from SETUP_GUIDE.md

## Need Help?

If you still see errors after enabling authentication:
1. Check the browser console for specific error messages
2. Verify your Firebase project ID is correct
3. Make sure your .env file has the correct Firebase credentials
4. Clear browser cache and try again
