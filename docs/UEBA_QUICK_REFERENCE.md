# UEBA Quick Reference Card

## 🚀 Quick Start

### Access UEBA Dashboard
```
Navigate to: /analytics
```

### Run Automated Tests
```
Analytics → Test Suite Tab → Run Tests
```

---

## 🔧 Browser Console Commands

Open console with **F12**, then type:

```javascript
// Show all events
uebaHelpers.showEvents()

// Show summary
uebaHelpers.showSummary()

// Show last 10 events
uebaHelpers.getLast(10)

// Show high-risk events
uebaHelpers.showHighRisk()

// Filter by event type
uebaHelpers.showByType('chat_interaction')
uebaHelpers.showByType('user_login')

// Clear all events
uebaHelpers.clearEvents()

// Export to JSON file
uebaHelpers.exportEvents()

// Show help
uebaHelpers.help()
```

---

## 📊 Event Types

| Type | Description | Triggered By |
|------|-------------|--------------|
| `chat_interaction` | Chatbot messages | User sends/receives message |
| `user_login` | Authentication | User logs in |
| `user_logout` | Sign out | User logs out |
| `anomaly_detected` | Suspicious behavior | High-risk activity |
| `page_view` | Navigation | User visits page |

---

## 🎯 Intent Classification

| Intent | Trigger Keywords |
|--------|-----------------|
| `service_inquiry` | service, maintenance |
| `emergency` | emergency, urgent |
| `health_check` | health, status |
| `scheduling` | schedule, appointment |
| `cost_inquiry` | cost, price |
| `general` | other messages |

---

## 🚨 Risk Levels

| Level | Score | Color | Example |
|-------|-------|-------|---------|
| 🟢 Low | 0-39 | Green | "Hello, how are you?" |
| 🟠 Medium | 40-69 | Orange | Very long messages |
| 🔴 High | 70-100 | Red | "EMERGENCY URGENT!!!" |

### Risk Factors
- **+30** Emergency keywords
- **+20** Slow response (>5s)
- **+10** Unusual message length
- **+40** Spam patterns
- **+20** Late night login (2-5 AM)

---

## ✅ Manual Testing Checklist

### Basic Functionality
- [ ] Open chatbot and send message
- [ ] Check console for `[UEBA]` logs
- [ ] View Analytics dashboard
- [ ] Verify metrics update
- [ ] Check Recent Activity feed

### Event Tracking
- [ ] Send chat message → Check chat_interaction
- [ ] Login → Check user_login event
- [ ] Logout → Check user_logout event
- [ ] Navigate pages → Check page_view

### Risk Scoring
- [ ] Send normal message → Low risk
- [ ] Send long message (500+ chars) → Medium risk
- [ ] Send "EMERGENCY URGENT!!!" → High risk
- [ ] Verify risk scores in dashboard

### Intent Detection
- [ ] "Schedule service" → scheduling
- [ ] "Check health" → health_check
- [ ] "Emergency help" → emergency
- [ ] "How much?" → cost_inquiry

### Persistence
- [ ] Interact with chatbot
- [ ] Refresh page
- [ ] Check events still exist in localStorage
- [ ] Verify dashboard shows history

---

## 🔍 Where to Look

### Browser Console (F12)
```
Look for: [UEBA] logs
Colors: Different colors for different event types
Warnings: [UEBA ANOMALY] for high-risk events
```

### DevTools → Application → Local Storage
```
Key: ueba_events
Value: Array of event objects with metadata
```

### Analytics Dashboard
```
Path: /analytics
Tabs: Dashboard | Test Suite
Metrics: Interactions, Logins, Anomalies, Risk Score
```

### Firebase Console (Production)
```
URL: console.firebase.google.com/project/navigo-27206/analytics
Events: Look for custom events
Real-time: Check DebugView for live events
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No console logs | Check NODE_ENV=development |
| No events in localStorage | Interact with chatbot or login |
| Test suite fails | Check specific error messages |
| Risk scores always 0 | Send emergency keywords |
| Firebase not working | Check environment variables |

---

## 📱 Test Scenarios

### Scenario 1: Normal User
1. Login as "user@example.com"
2. Chat: "How is my vehicle?"
3. Expected: Low risk, health_check intent

### Scenario 2: Emergency
1. Login as "emergency@example.com"
2. Chat: "EMERGENCY URGENT ACCIDENT HELP!!!"
3. Expected: High risk (70+), emergency intent

### Scenario 3: Suspicious Activity
1. Login at 3 AM
2. Send spam-like message: "AAAAAAAAAAAAAA"
3. Expected: High risk, potential anomaly

---

## 📈 Success Metrics

Your UEBA is working if you see:

✅ Events in localStorage after actions  
✅ Console logs with `[UEBA]` prefix  
✅ Dashboard metrics updating  
✅ Risk scores calculated correctly  
✅ Test Suite shows passing tests  
✅ Recent Activity shows events  

---

## 🔗 Documentation Links

- **Full Implementation**: [UEBA_IMPLEMENTATION.md](./UEBA_IMPLEMENTATION.md)
- **Testing Guide**: [UEBA_TESTING_GUIDE.md](./UEBA_TESTING_GUIDE.md)
- **Analytics Service**: `lib/analytics.ts`
- **Test Suite**: `/analytics` → Test Suite tab

---

## 💡 Pro Tips

1. **Keep console open** while testing to see real-time logs
2. **Use Test Suite** for comprehensive automated checks
3. **Export events** regularly for analysis
4. **Monitor production** via Firebase Console
5. **Clear events** between test sessions for clean results
6. **Check LocalStorage** size if you have performance issues

---

**Last Updated**: December 15, 2025  
**Version**: 1.0
