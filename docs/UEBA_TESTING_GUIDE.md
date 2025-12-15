# UEBA Verification & Testing Guide

## Quick Verification Checklist

### 1. **Using the Built-in Test Suite** ✅ RECOMMENDED

Navigate to: **Analytics → Test Suite Tab**

The automated test suite will verify:
- ✓ UEBA Service initialization
- ✓ LocalStorage access and event storage
- ✓ Chat interaction tracking
- ✓ Analytics summary generation
- ✓ Risk scoring system
- ✓ User authentication tracking
- ✓ Event persistence
- ✓ Firebase Analytics connection

**How to use:**
1. Go to `/analytics` page
2. Click the "Test Suite" tab
3. Click "Run Tests" button
4. Review pass/fail results

---

### 2. **Manual Browser Console Verification**

#### Open DevTools Console (F12)
You should see UEBA logs when:

**On Chat Interaction:**
```javascript
[UEBA] chat_interaction { user: 'user@example.com', risk: 15, metadata: {...} }
```

**On Login:**
```javascript
[UEBA] user_login { user: 'user@example.com', risk: 0, metadata: {...} }
```

**On Logout:**
```javascript
[UEBA] user_logout { user: 'user@example.com', risk: undefined, metadata: {...} }
```

**On High-Risk Detection:**
```javascript
[UEBA ANOMALY] High risk login detected { userId: 'user@example.com', riskScore: 75 }
```

---

### 3. **LocalStorage Verification**

#### Check Browser Storage
1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **Local Storage**
4. Look for key: `ueba_events`
5. You should see an array of event objects

**What to look for:**
```json
[
  {
    "userId": "user@example.com",
    "sessionId": "1702656789-abc123",
    "timestamp": "2025-12-15T10:30:00.000Z",
    "eventType": "chat_interaction",
    "entityType": "chatbot",
    "metadata": {
      "messageLength": 25,
      "responseTime": 1250,
      "intent": "health_check"
    },
    "riskScore": 10
  }
]
```

---

### 4. **Dashboard Verification**

Navigate to: **Analytics → Dashboard Tab**

**Check that metrics are updating:**
- Chat Interactions counter increases when you use chatbot
- User Logins counter increases on login
- Anomalies counter increases for high-risk events
- Recent Activity Feed shows latest events

**Test Steps:**
1. Open the chatbot (bottom-right)
2. Send a message: "Check my vehicle health"
3. Go to Analytics dashboard
4. Verify "Chat Interactions" increased
5. Check "Recent Activity" shows your message

---

### 5. **Risk Scoring Verification**

#### Test Low Risk (Score < 40)
Send chatbot message:
```
"Hello, how are you?"
```
Expected: Green risk level

#### Test Medium Risk (Score 40-69)
Send chatbot message with long text:
```
"[Type 500+ characters of text]"
```
Expected: Orange risk level

#### Test High Risk (Score 70+)
Send chatbot message:
```
"EMERGENCY URGENT HELP NEEDED ACCIDENT!!!!!!!!!"
```
Expected: Red risk level

Check console for risk scores.

---

### 6. **Intent Detection Verification**

Test different message types and verify intent classification:

| Message | Expected Intent |
|---------|----------------|
| "Schedule a service" | `scheduling` |
| "Check vehicle health" | `health_check` |
| "Emergency help needed" | `emergency` |
| "How much does service cost?" | `cost_inquiry` |
| "Show maintenance history" | `service_inquiry` |
| "Hello" | `general` |

**How to verify:**
1. Send message to chatbot
2. Open DevTools console
3. Look for `[UEBA]` log with intent field
4. Or check LocalStorage `ueba_events` → metadata.intent

---

### 7. **Authentication Tracking Verification**

#### Test Login Tracking
1. Logout if logged in
2. Open DevTools Console
3. Login with any email
4. Check console for: `[UEBA] user_login`
5. Go to Analytics → Recent Activity
6. Verify login event appears

#### Test Logout Tracking
1. Click Logout
2. Check console for: `[UEBA] user_logout`
3. Verify event in Recent Activity

---

### 8. **Firebase Analytics Verification** (Production Only)

#### Development Environment
Firebase Analytics may not be fully initialized locally. This is normal.

#### Production Environment
After deployment:
1. Visit your deployed app
2. Interact with chatbot and features
3. Go to Firebase Console
4. Navigate to Analytics → Events
5. Look for custom events:
   - `chat_interaction`
   - `user_login`
   - `user_logout`
   - `anomaly_detected`

**Firebase Console:** https://console.firebase.google.com/project/navigo-27206/analytics

---

## Common Issues & Solutions

### ❌ No events showing in LocalStorage
**Solution:** 
- Make sure you're logged in or interacting with the chatbot
- Check browser console for errors
- Clear cache and reload

### ❌ Console shows no UEBA logs
**Solution:**
- Check that you're in development mode: `NODE_ENV=development`
- Logs only appear in dev mode
- Production logs go to Firebase Analytics only

### ❌ Test Suite shows failures
**Solution:**
- Check specific test failure message
- Verify user is logged in for auth tests
- Ensure localStorage is enabled in browser
- Check browser console for JavaScript errors

### ❌ Risk scores always 0
**Solution:**
- Send messages with emergency keywords
- Make very long or very short messages
- Check `calculateRiskScore` function is being called
- Verify metadata is being saved

### ❌ Firebase Analytics not working
**Solution:**
- Check environment variables are set correctly
- Verify `.env.local` has all NEXT_PUBLIC_FIREBASE_* variables
- Firebase only works in browser (not SSR)
- May need to deploy to production to fully test

---

## Advanced Verification

### Using Browser Console Commands

```javascript
// Get all UEBA events
JSON.parse(localStorage.getItem('ueba_events'))

// Get analytics summary
uebaService.getAnalyticsSummary()

// Manually track a test event
uebaService.trackChatbotInteraction({
  message: "Test message",
  responseTime: 1000,
  userId: "test@example.com",
  intent: "test"
})

// Check recent events
uebaService.getRecentEvents()

// Clear all events
localStorage.removeItem('ueba_events')
```

### Performance Testing

Monitor performance impact:
1. Open Performance tab in DevTools
2. Start recording
3. Interact with chatbot multiple times
4. Stop recording
5. Check if UEBA adds significant overhead (should be minimal)

---

## Success Criteria

Your UEBA implementation is working correctly if:

✅ Test Suite shows all tests passing (or only Firebase pending in dev)
✅ Events appear in LocalStorage after interactions
✅ Console logs show UEBA events in development
✅ Analytics dashboard updates in real-time
✅ Risk scores are calculated correctly
✅ Intent detection classifies messages properly
✅ Login/Logout events are tracked
✅ Recent Activity Feed shows events with timestamps

---

## Next Steps After Verification

1. **Monitor Production**: Deploy and monitor real user behavior
2. **Set Up Alerts**: Configure alerts for high-risk events
3. **Analyze Patterns**: Review analytics regularly for insights
4. **Tune Risk Scores**: Adjust risk calculation based on real data
5. **Export Data**: Consider backing up events to a database

---

## Support

If you encounter issues:
1. Run the automated Test Suite first
2. Check browser console for errors
3. Verify all environment variables are set
4. Review the [UEBA_IMPLEMENTATION.md](./UEBA_IMPLEMENTATION.md) documentation
5. Check Firebase Console for analytics data
