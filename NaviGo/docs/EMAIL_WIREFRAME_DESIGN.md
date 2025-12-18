# NaviGo Customer Email Wireframe Design

## Overview
Professional email template design for customer communications via SendGrid. This wireframe covers various email types including service reminders, anomaly alerts, appointment confirmations, and service updates.

---

## 1. Email Header Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    [NaviGo Logo]                             │
│              Predictive Vehicle Care Platform                │
└─────────────────────────────────────────────────────────────┘
```

### Header Specifications
- **Logo**: Centered, max-width: 200px, padding: 20px top
- **Tagline**: Font-size: 12px, color: #6B7280, centered
- **Background**: #FFFFFF
- **Border-bottom**: 1px solid #E5E7EB

---

## 2. Email Types & Wireframes

### 2.1 Anomaly Detection Alert Email

**Subject Line Options:**
- `⚠️ Action Required: Anomaly Detected in Your Vehicle`
- `Your Vehicle Needs Attention - NaviGo Alert`
- `🚗 Important: Component Issue Detected`

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Alert Icon - Red/Orange]                                   │
│                                                              │
│  Dear [Customer Name],                                       │
│                                                              │
│  Our AI system has detected an anomaly in your vehicle:     │
│  [Vehicle Registration Number]                               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  ANOMALY DETAILS                                    │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  Component: [Component Name]                      │    │
│  │  Issue Type: [Issue Description]                   │    │
│  │  Severity: [Critical/High/Medium]                 │    │
│  │  Confidence: [XX]%                                 │    │
│  │  Estimated Time to Failure: [X days]               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [CTA Button - Primary]                                     │
│  "Schedule Service Now"                                     │
│                                                              │
│  [CTA Button - Secondary]                                   │
│  "View Full Details"                                        │
│                                                              │
│  ────────────────────────────────────────────────────────  │
│                                                              │
│  RECOMMENDED ACTION:                                         │
│  • Schedule inspection within [X] days                     │
│  • Component: [Component Name]                             │
│  • Estimated Cost: ₹[Amount]                                │
│                                                              │
│  ────────────────────────────────────────────────────────  │
│                                                              │
│  Need Help?                                                 │
│  Contact us: support@navigo.in | +91-XXXXX-XXXXX           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.2 Service Appointment Confirmation

**Subject Line Options:**
- `✅ Appointment Confirmed: [Date] at [Time]`
- `Your Service Appointment is Booked - NaviGo`
- `📅 Service Confirmation: [Service Center Name]`

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Checkmark Icon - Green]                                   │
│                                                              │
│  Hello [Customer Name],                                     │
│                                                              │
│  Your service appointment has been confirmed!               │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  APPOINTMENT DETAILS                               │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  📅 Date: [Day], [Date] [Month] [Year]            │    │
│  │  ⏰ Time: [Time] [AM/PM]                           │    │
│  │  🚗 Vehicle: [Make] [Model] - [Registration]       │    │
│  │  📍 Service Center: [Center Name]                 │    │
│  │     [Address]                                      │    │
│  │  🔧 Service Type: [Service Description]           │    │
│  │  👨‍🔧 Technician: [Technician Name] (if assigned)  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [Map Preview - Service Center Location]                    │
│                                                              │
│  [CTA Button - Primary]                                     │
│  "Add to Calendar"                                          │
│                                                              │
│  [CTA Button - Secondary]                                   │
│  "Reschedule or Cancel"                                      │
│                                                              │
│  ────────────────────────────────────────────────────────  │
│                                                              │
│  WHAT TO EXPECT:                                            │
│  • Estimated Duration: [X] hours                            │
│  • Estimated Cost: ₹[Amount]                                │
│  • Please bring: Vehicle documents, previous service       │
│    records (if any)                                         │
│                                                              │
│  ────────────────────────────────────────────────────────  │
│                                                              │
│  Questions? Call us: +91-XXXXX-XXXXX                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.3 Service Reminder (Preventive Maintenance)

**Subject Line Options:**
- `🔔 Time for Your Vehicle's Regular Service`
- `Service Reminder: [Vehicle] Due in [X] Days`
- `Maintain Your Vehicle's Health - Service Reminder`

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Calendar Icon]                                            │
│                                                              │
│  Hi [Customer Name],                                        │
│                                                              │
│  Your vehicle [Vehicle Registration] is due for service.    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  SERVICE REMINDER                                 │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  Last Service: [Date]                              │    │
│  │  Next Service Due: [Date]                          │    │
│  │  Days Remaining: [X] days                          │    │
│  │  Odometer Reading: [X] km                           │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  RECOMMENDED SERVICES:                                      │
│  ✓ Oil Change                                               │
│  ✓ Brake Inspection                                         │
│  ✓ Tire Rotation                                            │
│  ✓ General Check-up                                         │
│                                                              │
│  [CTA Button - Primary]                                     │
│  "Book Service Now"                                          │
│                                                              │
│  [CTA Button - Secondary]                                   │
│  "View Service History"                                      │
│                                                              │
│  ────────────────────────────────────────────────────────  │
│                                                              │
│  SPECIAL OFFER:                                             │
│  Get 10% off on preventive maintenance services             │
│  Use code: PREVENT10                                        │
│  Valid until: [Date]                                        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.4 Service Completion & Feedback Request

**Subject Line Options:**
- `✅ Service Complete: How Was Your Experience?`
- `Your Vehicle is Ready - Share Your Feedback`
- `Service Completed: Rate Your Experience`

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Success Icon - Green]                                    │
│                                                              │
│  Dear [Customer Name],                                     │
│                                                              │
│  Your vehicle service has been completed successfully!      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  SERVICE SUMMARY                                   │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  🚗 Vehicle: [Make] [Model]                        │    │
│  │  📅 Service Date: [Date]                           │    │
│  │  🔧 Services Performed:                            │    │
│  │     • [Service 1]                                  │    │
│  │     • [Service 2]                                  │    │
│  │     • [Service 3]                                  │    │
│  │  💰 Total Amount: ₹[Amount]                        │    │
│  │  ⏱️ Duration: [X] hours                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [CTA Button - Primary]                                     │
│  "Download Service Report"                                  │
│                                                              │
│  ────────────────────────────────────────────────────────  │
│                                                              │
│  HOW WAS YOUR EXPERIENCE?                                   │
│                                                              │
│  [Star Rating Component - 5 Stars]                         │
│                                                              │
│  [CTA Button - Primary]                                     │
│  "Share Feedback"                                           │
│                                                              │
│  Your feedback helps us improve our services!              │
│                                                              │
│  ────────────────────────────────────────────────────────  │
│                                                              │
│  NEXT SERVICE REMINDER:                                     │
│  Your next service is due on [Date]                        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.5 Root Cause Analysis Report

**Subject Line Options:**
- `📊 Root Cause Analysis Report for Your Vehicle`
- `Technical Analysis: [Component] Issue Explained`
- `Your Vehicle's Issue - Detailed Analysis Report`

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Report Icon]                                              │
│                                                              │
│  Hello [Customer Name],                                    │
│                                                              │
│  We've completed a detailed analysis of the issue with       │
│  your vehicle [Vehicle Registration].                       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  ROOT CAUSE ANALYSIS                               │    │
│  ├────────────────────────────────────────────────────┤    │
│  │  Component: [Component Name]                       │    │
│  │  Issue: [Issue Description]                        │    │
│  │  Root Cause: [Detailed Explanation]                │    │
│  │  Confidence: [XX]%                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  TECHNICAL DETAILS:                                         │
│  • Primary Cause: [Cause Description]                      │
│  • Contributing Factors:                                   │
│    - [Factor 1]                                            │
│    - [Factor 2]                                            │
│  • Impact: [Impact Description]                            │
│                                                              │
│  RECOMMENDED ACTIONS:                                       │
│  1. [Action 1]                                             │
│  2. [Action 2]                                             │
│  3. [Action 3]                                             │
│                                                              │
│  [CTA Button - Primary]                                     │
│  "View Full Report"                                         │
│                                                              │
│  [CTA Button - Secondary]                                   │
│  "Schedule Repair"                                           │
│                                                              │
│  ────────────────────────────────────────────────────────  │
│                                                              │
│  Questions? Our technical team is here to help:            │
│  support@navigo.in | +91-XXXXX-XXXXX                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Email Footer Design

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  ────────────────────────────────────────────────────────  │
│                                                              │
│  [Social Media Icons]                                       │
│  [Facebook] [Twitter] [LinkedIn] [Instagram]                │
│                                                              │
│  ────────────────────────────────────────────────────────  │
│                                                              │
│  NaviGo - Predictive Vehicle Care Platform                  │
│                                                              │
│  📧 Email: support@navigo.in                                │
│  📞 Phone: +91-XXXXX-XXXXX                                  │
│  🌐 Website: www.navigo.in                                  │
│  📍 Address: [Company Address]                              │
│                                                              │
│  ────────────────────────────────────────────────────────  │
│                                                              │
│  [Unsubscribe Link] | [Privacy Policy] | [Terms of Service]│
│                                                              │
│  © 2024 NaviGo. All rights reserved.                        │
│                                                              │
│  You're receiving this email because you're a registered     │
│  NaviGo customer.                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Design Specifications

### 4.1 Color Palette

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Primary Brand | Blue | `#3B82F6` | Headers, Primary CTAs |
| Success/Positive | Green | `#10B981` | Confirmations, Success messages |
| Warning/Alert | Orange | `#F59E0B` | Warnings, Reminders |
| Critical/Error | Red | `#EF4444` | Critical alerts, Errors |
| Text Primary | Dark Gray | `#1F2937` | Main body text |
| Text Secondary | Gray | `#6B7280` | Secondary text, labels |
| Background | White | `#FFFFFF` | Email background |
| Border | Light Gray | `#E5E7EB` | Dividers, borders |

### 4.2 Typography

| Element | Font Family | Size | Weight | Color |
|---------|-------------|------|--------|-------|
| Heading 1 | Inter/Sans-serif | 24px | 700 | #1F2937 |
| Heading 2 | Inter/Sans-serif | 20px | 600 | #1F2937 |
| Body Text | Inter/Sans-serif | 16px | 400 | #1F2937 |
| Secondary Text | Inter/Sans-serif | 14px | 400 | #6B7280 |
| Button Text | Inter/Sans-serif | 16px | 600 | #FFFFFF |
| Link Text | Inter/Sans-serif | 16px | 400 | #3B82F6 |

### 4.3 Button Styles

#### Primary CTA Button
```
┌─────────────────────────────┐
│   Schedule Service Now      │
└─────────────────────────────┘
```
- Background: `#3B82F6`
- Text Color: `#FFFFFF`
- Padding: 14px 32px
- Border-radius: 8px
- Font-weight: 600
- Min-width: 200px

#### Secondary CTA Button
```
┌─────────────────────────────┐
│   View Full Details         │
└─────────────────────────────┘
```
- Background: `#FFFFFF`
- Text Color: `#3B82F6`
- Border: 2px solid `#3B82F6`
- Padding: 14px 32px
- Border-radius: 8px
- Font-weight: 600

### 4.4 Spacing Guidelines

- **Section Padding**: 24px top/bottom
- **Content Padding**: 20px left/right
- **Element Spacing**: 16px between elements
- **Button Spacing**: 12px between buttons
- **Card Padding**: 20px all sides
- **Footer Padding**: 40px top, 20px bottom

---

## 5. Responsive Design

### 5.1 Mobile Breakpoints

| Device | Width | Adjustments |
|--------|-------|-------------|
| Desktop | > 600px | Full width, multi-column |
| Tablet | 400-600px | Single column, adjusted padding |
| Mobile | < 400px | Stacked layout, full-width buttons |

### 5.2 Mobile Optimizations

- Single column layout
- Full-width buttons (min-height: 44px for touch)
- Increased font sizes (minimum 16px)
- Reduced padding (16px instead of 20px)
- Stacked CTAs vertically
- Simplified header (logo only)

---

## 6. Email Components Library

### 6.1 Alert Boxes

#### Success Alert
```
┌─────────────────────────────────────────┐
│ ✓ Success: Your appointment is confirmed│
└─────────────────────────────────────────┘
Background: #D1FAE5, Border: #10B981, Text: #065F46
```

#### Warning Alert
```
┌─────────────────────────────────────────┐
│ ⚠ Warning: Service due in 7 days       │
└─────────────────────────────────────────┘
Background: #FEF3C7, Border: #F59E0B, Text: #92400E
```

#### Error Alert
```
┌─────────────────────────────────────────┐
│ ✕ Error: Payment failed                │
└─────────────────────────────────────────┘
Background: #FEE2E2, Border: #EF4444, Text: #991B1B
```

### 6.2 Information Cards

```
┌─────────────────────────────────────────┐
│  [Icon]  Title                           │
│          Description text goes here      │
│          Additional details              │
└─────────────────────────────────────────┘
Background: #F9FAFB, Border: #E5E7EB, Padding: 16px
```

### 6.3 Progress Indicators

```
Service Progress: [████████░░] 80%
Background: #E5E7EB, Fill: #3B82F6
```

---

## 7. SendGrid Template Variables

### 7.1 Dynamic Content Variables

```handlebars
{{customer_name}}          - Customer's full name
{{vehicle_registration}}   - Vehicle registration number
{{vehicle_make}}           - Vehicle make (e.g., "Tata")
{{vehicle_model}}          - Vehicle model (e.g., "Nexon")
{{service_date}}           - Service/appointment date
{{service_time}}           - Service/appointment time
{{service_center_name}}    - Service center name
{{service_center_address}} - Service center address
{{component_name}}         - Component name
{{issue_description}}      - Issue description
{{severity_level}}         - Severity (Critical/High/Medium/Low)
{{confidence_score}}       - Confidence percentage
{{estimated_cost}}         - Estimated service cost
{{estimated_duration}}     - Estimated service duration
{{appointment_id}}         - Appointment/booking ID
{{service_report_url}}     - Link to service report
{{dashboard_url}}          - Link to customer dashboard
{{unsubscribe_url}}        - Unsubscribe link
```

### 7.2 Conditional Content Blocks

```handlebars
{{#if is_critical}}
  <!-- Critical alert styling -->
{{else}}
  <!-- Standard alert styling -->
{{/if}}

{{#if has_appointment}}
  <!-- Appointment details section -->
{{/if}}

{{#if has_discount}}
  <!-- Discount/promo section -->
{{/if}}
```

---

## 8. Email Testing Checklist

- [ ] **Subject Line**: Clear, concise, under 50 characters
- [ ] **Preheader Text**: Compelling preview text (first 90 characters)
- [ ] **Mobile Responsive**: Tested on iOS and Android
- [ ] **Dark Mode**: Tested in dark mode email clients
- [ ] **Image Alt Text**: All images have descriptive alt text
- [ ] **Link Testing**: All links work and are tracked
- [ ] **Unsubscribe**: Unsubscribe link is functional
- [ ] **Spam Score**: Tested with email testing tools
- [ ] **Cross-Client**: Tested in Gmail, Outlook, Apple Mail
- [ ] **Accessibility**: Proper heading hierarchy, color contrast
- [ ] **Loading Speed**: Images optimized, under 200KB total
- [ ] **Personalization**: Dynamic variables render correctly

---

## 9. Implementation Notes

### 9.1 SendGrid Setup

1. **Create Dynamic Templates** in SendGrid
2. **Set up Sender Authentication** (SPF, DKIM, DMARC)
3. **Configure Tracking** (opens, clicks, unsubscribes)
4. **Set up Webhooks** for delivery status
5. **Create Contact Lists** for segmentation

### 9.2 Template Structure

```
templates/
├── anomaly-alert.html
├── appointment-confirmation.html
├── service-reminder.html
├── service-completion.html
├── rca-report.html
└── shared/
    ├── header.html
    ├── footer.html
    └── styles.css
```

### 9.3 API Integration

```python
# Example SendGrid API call
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

message = Mail(
    from_email='noreply@navigo.in',
    to_emails=customer_email,
    subject='Anomaly Detected in Your Vehicle',
    html_content=render_template('anomaly-alert.html', **context)
)

sg = SendGridAPIClient(api_key)
response = sg.send(message)
```

---

## 10. Best Practices

1. **Personalization**: Always use customer name and vehicle details
2. **Clear CTAs**: One primary action per email
3. **Urgency**: Use appropriate urgency indicators for time-sensitive emails
4. **Value First**: Lead with customer benefit, not company promotion
5. **Consistency**: Maintain brand voice and visual identity
6. **Testing**: Always test before sending to customers
7. **Segmentation**: Send relevant emails to relevant customer segments
8. **Timing**: Send emails at optimal times (9-11 AM, 2-4 PM IST)
9. **Frequency**: Don't overwhelm customers (max 2-3 emails per week)
10. **Feedback Loop**: Include feedback mechanisms in service completion emails

---

## 11. Email Performance Metrics

Track these metrics for each email type:

- **Open Rate**: Target > 25%
- **Click-Through Rate**: Target > 5%
- **Conversion Rate**: Target > 2%
- **Unsubscribe Rate**: Keep < 0.5%
- **Bounce Rate**: Keep < 2%
- **Spam Complaints**: Keep < 0.1%

---

## 12. A/B Testing Ideas

1. **Subject Lines**: Test urgency vs. benefit-focused
2. **CTA Colors**: Test primary brand color vs. contrasting color
3. **Email Length**: Test short vs. detailed versions
4. **Image Usage**: Test with images vs. text-only
5. **Personalization**: Test with/without personalization
6. **Send Times**: Test morning vs. afternoon sends

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintained By**: NaviGo Development Team

