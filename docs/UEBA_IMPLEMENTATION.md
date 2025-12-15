# UEBA (User and Entity Behavior Analytics) Implementation Guide

## Overview

This project now includes a comprehensive UEBA system for monitoring and analyzing AI agent behavior, user interactions, and detecting anomalies in real-time.

## Features Implemented

### 1. **Analytics Service** (`lib/analytics.ts`)
- **Event Tracking**: Tracks chat interactions, logins, logouts, and page views
- **Risk Scoring**: Automatically calculates risk scores based on:
  - Emergency keywords detection
  - Response time analysis
  - Message pattern analysis
  - Spam detection
  - Login anomaly detection
- **Anomaly Detection**: Identifies suspicious behavior patterns
- **Event Buffering**: Efficient event storage and batching
- **Local Storage**: Maintains last 100 events for dashboard display

### 2. **Firebase Analytics Integration** (`lib/firebase-analytics.ts`)
- Google Analytics 4 integration
- User identification tracking
- Custom event logging
- Page view tracking
- Graceful fallback if analytics fails

### 3. **Chatbot UEBA Integration** (`components/chatbot.tsx`)
- **Intent Detection**: Automatically classifies user queries:
  - `service_inquiry`: Service and maintenance questions
  - `emergency`: Urgent assistance requests
  - `health_check`: Vehicle status inquiries
  - `scheduling`: Appointment booking
  - `cost_inquiry`: Pricing questions
  - `general`: Other interactions
- **Response Time Tracking**: Monitors agent performance
- **User Identification**: Links events to authenticated users

### 4. **Authentication Tracking** (`contexts/auth-context.tsx`)
- Login event tracking with metadata:
  - User persona
  - Remember me preference
  - User agent
  - Screen resolution
  - Timestamp
- Logout event tracking
- Session restoration tracking
- Firebase Analytics user ID synchronization

### 5. **UEBA Dashboard** (`components/ueba-dashboard.tsx`)
Real-time analytics visualization with:
- **Summary Metrics**:
  - Total chat interactions
  - User login count
  - Anomalies detected
  - Average risk score
  - High-risk events
  - System status
- **Recent Activity Feed**: Last 10 events with details
- **Risk Analysis Charts**: Visual representation of behavioral patterns
- **Color-Coded Risk Levels**:
  - 🟢 Low (0-39): Green
  - 🟠 Medium (40-69): Orange
  - 🔴 High (70-100): Red

### 6. **Analytics Page** (`app/analytics/page.tsx`)
Dedicated dashboard page accessible at `/analytics` with full UEBA visualization

## Usage

### Accessing the Dashboard

1. Navigate to the **Analytics** section in the sidebar
2. View real-time metrics and recent agent activity
3. Monitor risk levels and behavioral patterns

### Tracked Events

#### Chat Interactions
```typescript
uebaService.trackChatbotInteraction({
  message: "Check vehicle health",
  responseTime: 1250,
  userId: "user@example.com",
  intent: "health_check"
})
```

#### User Login
```typescript
uebaService.trackLogin("user@example.com", {
  persona: "Family Driver",
  rememberMe: true,
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent
})
```

#### User Logout
```typescript
uebaService.trackLogout("user@example.com")
```

#### Custom Events
```typescript
uebaService.trackUserBehavior({
  action: 'page_view',
  userId: "user@example.com",
  metadata: {
    page: '/servicing',
    duration: 45000
  }
})
```

## Risk Scoring System

### Chat Interaction Risk Factors
- **Emergency Keywords** (+30 points): emergency, urgent, accident, crash, broke down, help
- **Slow Response Time** (+20 points): Response time > 5 seconds
- **Unusual Message Length** (+10 points): Very long (>500 chars) or very short (<2 chars)
- **Spam Patterns** (+40 points):
  - Repeated characters (10+ in a row)
  - Excessive capitalization (>70%)

### Login Risk Factors
- **Unusual Hours** (+20 points): Login between 2 AM - 5 AM
- Future enhancements could include:
  - Multiple failed login attempts
  - New location detection
  - Unusual user agent patterns

## Configuration

### Environment Variables (Required for Firebase Analytics)
Add these to your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=navigo-27206
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### GitHub Actions
The deployment workflow has been updated to include all Firebase Analytics environment variables.

## Data Storage

### Local Storage
- Events are stored in browser localStorage under `ueba_events` key
- Last 100 events are retained
- Used for dashboard visualization

### Firebase Analytics
- All events are sent to Google Analytics 4
- Server-side analytics processing
- Long-term data retention and analysis

## Development Mode

In development, UEBA events are logged to the console:
```javascript
[UEBA] chat_interaction { user: 'user@example.com', risk: 15, metadata: {...} }
```

Anomalies are logged as warnings:
```javascript
[UEBA ANOMALY] High risk login detected { userId: 'user@example.com', riskScore: 75 }
```

## Privacy & Security

- User emails are used as identifiers (can be anonymized)
- All data is stored locally and in Firebase Analytics (respecting user consent)
- No sensitive data (passwords, payment info) is tracked
- GDPR compliant with proper user consent mechanisms

## Future Enhancements

1. **Machine Learning Integration**
   - Train models on historical data
   - Predictive anomaly detection
   - Personalized risk thresholds

2. **Advanced Analytics**
   - Session duration tracking
   - User journey mapping
   - Conversion funnel analysis
   - Cohort analysis

3. **Real-time Alerts**
   - Email/SMS notifications for high-risk events
   - Slack/Teams integration
   - Automated incident response

4. **Enhanced Visualization**
   - Time-series charts
   - Heatmaps
   - Geographical maps (if location tracking added)
   - Export to PDF/CSV

5. **Integration with Backend**
   - Custom analytics endpoint
   - Database storage for long-term analysis
   - API for querying historical data
   - Real-time WebSocket updates

## API Reference

### UEBAService Methods

```typescript
// Track chatbot interaction
uebaService.trackChatbotInteraction(data: {
  message: string
  responseTime: number
  sentiment?: string
  intent?: string
  userId: string
})

// Track user behavior
uebaService.trackUserBehavior(data: {
  action: string
  userId: string
  metadata?: Record<string, any>
})

// Track login
uebaService.trackLogin(userId: string, metadata: Record<string, any>)

// Track logout
uebaService.trackLogout(userId: string)

// Get recent events
uebaService.getRecentEvents(): UEBAEvent[]

// Get analytics summary
uebaService.getAnalyticsSummary(): AnalyticsSummary
```

## Testing

To test the UEBA implementation:

1. **Chat with the AI Assistant**
   - Send various messages
   - Try emergency keywords: "emergency help needed"
   - Check dashboard for tracking

2. **Login/Logout**
   - Login with different personas
   - Check analytics page for login events

3. **Navigate Pages**
   - Visit different sections
   - Verify page view tracking

4. **Risk Triggers**
   - Send messages with spam patterns
   - Login at unusual hours
   - Monitor risk scores in dashboard

## Support

For issues or questions about UEBA implementation:
- Check the browser console for debug logs
- Review Firebase Analytics dashboard
- Verify environment variables are set correctly

## License

This UEBA implementation is part of the NaviGo vehicle care project.
