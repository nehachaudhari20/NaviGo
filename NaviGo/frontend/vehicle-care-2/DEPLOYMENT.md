# NaviGo Frontend Deployment Guide

## Quick Deploy

```bash
cd frontend/vehicle-care-2
./deploy.sh
```

## Manual Deployment Steps

### 1. Build the Application

```bash
cd frontend/vehicle-care-2
pnpm build
```

This creates the `out/` directory with static files.

### 2. Verify Build Output

```bash
# Check if index.html exists
ls -la out/index.html

# Check build size
du -sh out
```

### 3. Test Locally (Optional)

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Test locally
firebase serve --only hosting
```

Visit `http://localhost:5000` to test.

### 4. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

## Deployment Files

- **firebase.json**: Firebase Hosting configuration
- **.firebaserc**: Project configuration (navigo-27206)
- **firestore.rules**: Firestore security rules
- **deploy.sh**: Automated deployment script

## Troubleshooting

### Page Not Loading

1. **Rebuild the application:**
   ```bash
   cd frontend/vehicle-care-2
   pnpm build
   ```

2. **Check build output:**
   ```bash
   ls -la out/
   ```

3. **Verify firebase.json:**
   - Should point to `"public": "out"`
   - Should be in `frontend/vehicle-care-2/` directory

4. **Check Firebase project:**
   ```bash
   firebase projects:list
   firebase use navigo-27206
   ```

5. **Test locally first:**
   ```bash
   firebase serve --only hosting
   ```

### Build Errors

- Check for TypeScript errors (they're ignored in build but might cause runtime issues)
- Verify all dependencies are installed: `pnpm install`
- Check Next.js version compatibility

### Deployment Errors

- Ensure Firebase CLI is installed: `npm install -g firebase-tools`
- Login to Firebase: `firebase login`
- Verify project: `firebase use navigo-27206`

## URLs After Deployment

- Production: `https://navigo-27206.web.app`
- Alternative: `https://navigo-27206.firebaseapp.com`

## Environment Variables

For production, ensure these are set in Firebase Hosting:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

These can be set via Firebase Console → Hosting → Environment Variables

