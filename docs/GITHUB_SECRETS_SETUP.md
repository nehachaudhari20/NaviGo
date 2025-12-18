# GitHub Secrets Setup Guide

This guide will help you configure all required GitHub Secrets for automated Firebase deployment.

## Required GitHub Secrets

Add these in: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

### 1. FIREBASE_SERVICE_ACCOUNT (Required for deployment)

**How to get it:**
1. Go to: https://console.firebase.google.com/project/navigo-27206/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Click **"Generate Key"** in the dialog
4. A JSON file will download
5. **Copy the entire JSON content** (all of it, including `{` and `}`)

**Add as secret:**
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: Paste the entire JSON content

⚠️ **Important:** This is sensitive data. Never commit this to the repository.

---

### 2. NEXT_PUBLIC_FIREBASE_PROJECT_ID

**Value:** `navigo-27206`

**Add as secret:**
- Name: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- Value: `navigo-27206`

---

### 3. NEXT_PUBLIC_FIREBASE_API_KEY

**How to get it:**
1. Go to: https://console.firebase.google.com/project/navigo-27206/settings/general
2. Scroll to **"Your apps"** section
3. Find your **Web app** (or create one if it doesn't exist)
4. Click on the web app
5. Find **"API Key"** in the config object
6. Copy the value

**Add as secret:**
- Name: `NEXT_PUBLIC_FIREBASE_API_KEY`
- Value: The API key (starts with `AIza...`)

---

### 4. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

**Value:** `navigo-27206.firebaseapp.com`

**Or get it from:**
- Firebase Console → Project Settings → General → Your apps → Web app → authDomain

**Add as secret:**
- Name: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- Value: `navigo-27206.firebaseapp.com`

---

### 5. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET

**Value:** `navigo-27206.appspot.com`

**Or get it from:**
- Firebase Console → Project Settings → General → Your apps → Web app → storageBucket

**Add as secret:**
- Name: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- Value: `navigo-27206.appspot.com`

---

### 6. NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID

**How to get it:**
1. Go to: https://console.firebase.google.com/project/navigo-27206/settings/general
2. Scroll to **"Your apps"** section
3. Find your **Web app**
4. Find **"messagingSenderId"** in the config object
5. Copy the value (usually a number)

**Add as secret:**
- Name: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- Value: The sender ID number

---

### 7. NEXT_PUBLIC_FIREBASE_APP_ID

**How to get it:**
1. Go to: https://console.firebase.google.com/project/navigo-27206/settings/general
2. Scroll to **"Your apps"** section
3. Find your **Web app**
4. Find **"appId"** in the config object
5. Copy the value (usually starts with `1:`)

**Add as secret:**
- Name: `NEXT_PUBLIC_FIREBASE_APP_ID`
- Value: The app ID

---

### 8. NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (Optional, for Analytics)

**How to get it:**
1. Go to: https://console.firebase.google.com/project/navigo-27206/settings/general
2. Scroll to **"Your apps"** section
3. Find your **Web app**
4. Find **"measurementId"** in the config object (if Analytics is enabled)
5. Copy the value (usually starts with `G-`)

**Add as secret:**
- Name: `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- Value: The measurement ID (or leave empty if Analytics is not enabled)

---

## Quick Setup Steps

### Step 1: Get Firebase Config Values

1. Go to: https://console.firebase.google.com/project/navigo-27206/settings/general
2. Scroll to **"Your apps"** → **Web app** (or create one if it doesn't exist)
3. Copy all values from the config object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",              // → NEXT_PUBLIC_FIREBASE_API_KEY
     authDomain: "navigo-27206.firebaseapp.com",  // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     projectId: "navigo-27206",      // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
     storageBucket: "navigo-27206.appspot.com",    // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     messagingSenderId: "123456789", // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     appId: "1:123456789:web:abc",   // → NEXT_PUBLIC_FIREBASE_APP_ID
     measurementId: "G-XXXXXXXXXX"  // → NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (optional)
   }
   ```

### Step 2: Get Service Account Key

1. Go to: https://console.firebase.google.com/project/navigo-27206/settings/serviceaccounts/adminsdk
2. Click **"Generate New Private Key"**
3. Click **"Generate Key"** in the confirmation dialog
4. A JSON file will download - **copy the entire content**

### Step 3: Add Secrets to GitHub

1. Go to: https://github.com/nehachaudhari20/NaviGo/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each secret one by one:
   - Name: `FIREBASE_SERVICE_ACCOUNT` → Value: (entire JSON from step 2)
   - Name: `NEXT_PUBLIC_FIREBASE_PROJECT_ID` → Value: `navigo-27206`
   - Name: `NEXT_PUBLIC_FIREBASE_API_KEY` → Value: (from firebaseConfig)
   - Name: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` → Value: `navigo-27206.firebaseapp.com`
   - Name: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` → Value: `navigo-27206.appspot.com`
   - Name: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` → Value: (from firebaseConfig)
   - Name: `NEXT_PUBLIC_FIREBASE_APP_ID` → Value: (from firebaseConfig)
   - Name: `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` → Value: (from firebaseConfig, optional)

### Step 4: Verify Setup

After adding all secrets:
1. Push a new commit to trigger the deployment
2. Check GitHub Actions: https://github.com/nehachaudhari20/NaviGo/actions
3. The workflow should run and deploy successfully

---

## Troubleshooting

### Black Screen Issue

If you see a black screen after deployment, it's likely due to:
1. **Missing Firebase config** - The app can't initialize without these values
2. **Incorrect secret values** - Double-check all values are correct
3. **Service account permissions** - Make sure the service account has proper permissions

### Check if Secrets are Set

You can verify secrets are set by:
1. Going to: https://github.com/nehachaudhari20/NaviGo/settings/secrets/actions
2. You should see all 8 secrets listed (or 7 if MEASUREMENT_ID is not set)

### Common Mistakes

1. **FIREBASE_SERVICE_ACCOUNT**: Must be the entire JSON, not just a key
2. **Missing quotes**: Some values might need quotes, but GitHub Secrets handles this automatically
3. **Wrong project ID**: Make sure it's `navigo-27206` (not `navigo-27206.firebaseapp.com`)
4. **Extra spaces**: Make sure there are no leading/trailing spaces in values

---

## Security Notes

⚠️ **Important Security Reminders:**

- Never commit secrets to the repository
- Never share service account keys publicly
- Rotate service account keys periodically
- Use environment-specific secrets for different environments (dev/staging/prod)

---

## Next Steps

After setting up all secrets:
1. Push a commit to trigger deployment
2. Monitor the GitHub Actions workflow
3. Check the deployed site: https://navigo-27206.web.app
4. The black screen should be resolved once Firebase config is available

