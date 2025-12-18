# NaviGo System - Complete Flowchart Documentation

## Table of Contents
1. [System Overview Flowchart](#1-system-overview-flowchart)
2. [User Authentication Flow](#2-user-authentication-flow)
3. [Dashboard Loading Flow](#3-dashboard-loading-flow)
4. [AI Pipeline Flow](#4-ai-pipeline-flow)
5. [Real-time Notification Flow](#5-real-time-notification-flow)
6. [Component Interaction Flow](#6-component-interaction-flow)
7. [Data Fetching Flow](#7-data-fetching-flow)
8. [Manufacturer Dashboard Flow](#8-manufacturer-dashboard-flow)

---

## 1. System Overview Flowchart

```mermaid
graph TB
    Start([User Opens Browser]) --> CheckAuth{Authenticated?}
    CheckAuth -->|No| LoginPage[Login Page]
    CheckAuth -->|Yes| CheckPersona{Persona?}
    
    LoginPage --> SelectPersona[Select Persona]
    SelectPersona --> EnterCreds[Enter Credentials]
    EnterCreds --> AuthAPI[POST /api/auth/login]
    AuthAPI --> AuthBackend[Backend Auth Service]
    AuthBackend --> ValidateCreds{Valid?}
    ValidateCreds -->|No| LoginError[Show Error]
    LoginError --> EnterCreds
    ValidateCreds -->|Yes| GenerateToken[Generate JWT Token]
    GenerateToken --> StoreAuth[Store in localStorage]
    StoreAuth --> UpdateContext[Update AuthContext]
    UpdateContext --> CheckPersona
    
    CheckPersona -->|Customer| CustomerDash[Customer Dashboard]
    CheckPersona -->|Service| ServiceDash[Service Center Dashboard]
    CheckPersona -->|Manufacturer| ManufacturerDash[Manufacturer Dashboard]
    
    CustomerDash --> LoadData1[Load Customer Data]
    ServiceDash --> LoadData2[Load Service Center Data]
    ManufacturerDash --> LoadData3[Load Manufacturer Data]
    
    LoadData1 --> RenderUI1[Render UI Components]
    LoadData2 --> RenderUI2[Render UI Components]
    LoadData3 --> RenderUI3[Render UI Components]
    
    RenderUI1 --> UserInteracts[User Interacts]
    RenderUI2 --> UserInteracts
    RenderUI3 --> UserInteracts
    
    UserInteracts --> APICall[API Call]
    APICall --> Backend[Backend Service]
    Backend --> Database[(Database)]
    Backend --> AIService[AI Service]
    AIService --> MLModels[ML Models]
    
    Database --> Response[Response Data]
    MLModels --> AIResponse[AI Predictions]
    
    Response --> UpdateUI[Update UI]
    AIResponse --> UpdateUI
    UpdateUI --> UserInteracts
    
    style Start fill:#e1f5ff
    style LoginPage fill:#fff4e1
    style CustomerDash fill:#e8f5e9
    style ServiceDash fill:#e3f2fd
    style ManufacturerDash fill:#f3e5f5
    style AIService fill:#fff9c4
    style Database fill:#fce4ec
```

---

## 2. User Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant LoginPage
    participant AuthContext
    participant API
    participant Backend
    participant Database
    participant Dashboard

    User->>Browser: Navigate to /manufacturer
    Browser->>LoginPage: Load Page
    LoginPage->>AuthContext: Check isAuthenticated
    AuthContext->>AuthContext: Check localStorage
    
    alt Not Authenticated
        AuthContext-->>LoginPage: isAuthenticated = false
        LoginPage->>Browser: Redirect to /login
        Browser->>User: Show Login Form
        
        User->>LoginPage: Select Persona (Manufacturer)
        User->>LoginPage: Enter Email & Password
        User->>LoginPage: Click "Sign In"
        
        LoginPage->>API: POST /api/auth/login
        Note over LoginPage,API: {email, password, persona}
        
        API->>Backend: Validate Credentials
        Backend->>Database: Query User Table
        Database-->>Backend: User Data
        
        alt Invalid Credentials
            Backend-->>API: 401 Unauthorized
            API-->>LoginPage: Error Response
            LoginPage->>User: Show Error Message
        else Valid Credentials
            Backend->>Backend: Generate JWT Token
            Backend-->>API: {token, user}
            API-->>LoginPage: Success Response
            
            LoginPage->>AuthContext: login(email, persona)
            AuthContext->>AuthContext: Store in localStorage
            AuthContext->>AuthContext: Update state
            AuthContext-->>LoginPage: isAuthenticated = true
            
            LoginPage->>Browser: Redirect to /manufacturer
        end
    else Already Authenticated
        AuthContext-->>LoginPage: isAuthenticated = true
        LoginPage->>Browser: Redirect to /manufacturer
    end
    
    Browser->>Dashboard: Load Manufacturer Dashboard
    Dashboard->>AuthContext: Verify persona = "manufacturer"
    AuthContext-->>Dashboard: User verified
    Dashboard->>Dashboard: Render Components
```

---

## 3. Dashboard Loading Flow

```mermaid
graph TD
    Start([User Accesses Dashboard]) --> CheckAuth{Authenticated?}
    CheckAuth -->|No| RedirectLogin[Redirect to /login]
    CheckAuth -->|Yes| CheckPersona{Correct Persona?}
    
    CheckPersona -->|No| RedirectDash[Redirect to Correct Dashboard]
    CheckPersona -->|Yes| LoadLayout[Load Dashboard Layout]
    
    LoadLayout --> LoadSidebar[Load Sidebar Component]
    LoadLayout --> LoadHeader[Load Header Component]
    LoadLayout --> LoadMain[Load Main Content]
    
    LoadSidebar --> RenderSidebar[Render Navigation Icons]
    LoadHeader --> RenderHeader[Render Search, Notifications, User]
    LoadMain --> LoadComponents[Load Dashboard Components]
    
    LoadComponents --> ParallelLoad[Parallel Component Loading]
    
    ParallelLoad --> LoadKPIs[Load KPI Cards]
    ParallelLoad --> LoadAIInsights[Load AI Insights]
    ParallelLoad --> LoadQuality[Load Quality Predictions]
    ParallelLoad --> LoadNotifications[Load Notifications]
    ParallelLoad --> LoadStock[Load Current Stock]
    ParallelLoad --> LoadDefects[Load Defect Rates]
    ParallelLoad --> LoadProduction[Load Production Status]
    ParallelLoad --> LoadWaste[Load Waste of Cost]
    ParallelLoad --> LoadOrders[Load Pending Orders]
    ParallelLoad --> LoadTopProduct[Load Top Product]
    
    LoadKPIs --> FetchKPI[Fetch KPI Data from API]
    LoadAIInsights --> FetchAI[Fetch AI Insights from API]
    LoadQuality --> FetchQuality[Fetch Quality Predictions]
    LoadNotifications --> FetchNotif[Fetch Notifications]
    LoadStock --> FetchStock[Fetch Stock Data]
    LoadDefects --> FetchDefects[Fetch Defect Data]
    LoadProduction --> FetchProduction[Fetch Production Data]
    LoadWaste --> FetchWaste[Fetch Waste Data]
    LoadOrders --> FetchOrders[Fetch Orders Data]
    LoadTopProduct --> FetchProduct[Fetch Product Data]
    
    FetchKPI --> RenderKPIs[Render KPI Cards]
    FetchAI --> RenderAI[Render AI Insights]
    FetchQuality --> RenderQuality[Render Quality Chart]
    FetchNotif --> RenderNotif[Render Notifications]
    FetchStock --> RenderStock[Render Stock Chart]
    FetchDefects --> RenderDefects[Render Defect Chart]
    FetchProduction --> RenderProduction[Render Production Cards]
    FetchWaste --> RenderWaste[Render Waste Chart]
    FetchOrders --> RenderOrders[Render Orders Table]
    FetchProduct --> RenderProduct[Render Product Card]
    
    RenderKPIs --> Complete[All Components Rendered]
    RenderAI --> Complete
    RenderQuality --> Complete
    RenderNotif --> Complete
    RenderStock --> Complete
    RenderDefects --> Complete
    RenderProduction --> Complete
    RenderWaste --> Complete
    RenderOrders --> Complete
    RenderProduct --> Complete
    
    Complete --> UserInteracts[User Can Interact]
    
    style Start fill:#e1f5ff
    style ParallelLoad fill:#fff9c4
    style Complete fill:#e8f5e9
```

---

## 4. AI Pipeline Flow

```mermaid
graph TB
    Start([User Views AI Insights]) --> ComponentMount[AI Insights Component Mounts]
    
    ComponentMount --> useEffect[useEffect Hook Triggers]
    useEffect --> FetchAPI[Fetch /api/manufacturer/ai/insights]
    
    FetchAPI --> BackendAPI[Backend API Endpoint]
    BackendAPI --> AuthCheck{Authenticated?}
    AuthCheck -->|No| Return401[Return 401 Unauthorized]
    AuthCheck -->|Yes| ProcessRequest[Process Request]
    
    ProcessRequest --> AIService[AI Service Layer]
    
    AIService --> ParallelAI[Parallel AI Agent Processing]
    
    ParallelAI --> DataAnalysis[Data Analysis Agent]
    ParallelAI --> QualityPred[Quality Prediction Agent]
    ParallelAI --> Optimization[Optimization Agent]
    ParallelAI --> AnomalyDetect[Anomaly Detection Agent]
    
    DataAnalysis --> FetchProdData[Fetch Production Data]
    QualityPred --> FetchQualityData[Fetch Quality History]
    Optimization --> FetchMetrics[Fetch Performance Metrics]
    AnomalyDetect --> FetchAnomalies[Fetch Sensor Data]
    
    FetchProdData --> AnalyzePatterns[Analyze Patterns]
    FetchQualityData --> RunMLModel[Run ML Model]
    FetchMetrics --> CalculateOptimal[Calculate Optimal Settings]
    FetchAnomalies --> DetectAnomalies[Detect Anomalies]
    
    AnalyzePatterns --> GenerateInsight1[Generate Insight: Production Trend]
    RunMLModel --> GenerateInsight2[Generate Insight: Quality Prediction]
    CalculateOptimal --> GenerateInsight3[Generate Insight: Optimization]
    DetectAnomalies --> GenerateInsight4[Generate Insight: Anomaly Alert]
    
    GenerateInsight1 --> Aggregate[Aggregate All Insights]
    GenerateInsight2 --> Aggregate
    GenerateInsight3 --> Aggregate
    GenerateInsight4 --> Aggregate
    
    Aggregate --> CalculateConfidence[Calculate Confidence Scores]
    CalculateConfidence --> FormatResponse[Format Response]
    
    FormatResponse --> ReturnJSON[Return JSON Response]
    ReturnJSON --> FrontendReceive[Frontend Receives Data]
    
    FrontendReceive --> UpdateState[Update Component State]
    UpdateState --> ReRender[Re-render Component]
    ReRender --> DisplayInsights[Display AI Insights Cards]
    
    DisplayInsights --> UserViews[User Views Insights]
    
    UserViews --> UserAction{User Action?}
    UserAction -->|Click Insight| ShowDetails[Show Detailed View]
    UserAction -->|Dismiss| RemoveInsight[Remove from View]
    UserAction -->|No Action| AutoRefresh[Auto-refresh in 30s]
    
    AutoRefresh --> useEffect
    
    style Start fill:#e1f5ff
    style ParallelAI fill:#fff9c4
    style Aggregate fill:#e8f5e9
    style DisplayInsights fill:#f3e5f5
```

---

## 5. Real-time Notification Flow

```mermaid
sequenceDiagram
    participant Event
    participant Backend
    participant Database
    participant WebSocketServer
    participant FrontendWS
    participant NotificationPanel
    participant Browser
    participant User

    Event->>Backend: Production Line Alert Triggered
    Backend->>Database: Create Notification Record
    Database-->>Backend: Notification Created
    
    Backend->>WebSocketServer: Emit Notification Event
    Note over Backend,WebSocketServer: {type: 'alert', title: '...', message: '...', userId: '...'}
    
    WebSocketServer->>FrontendWS: Broadcast to Connected Clients
    Note over WebSocketServer,FrontendWS: WebSocket Message
    
    FrontendWS->>NotificationPanel: onmessage Event
    NotificationPanel->>NotificationPanel: Parse Notification Data
    NotificationPanel->>NotificationPanel: Add to State (useState)
    NotificationPanel->>NotificationPanel: Re-render Component
    
    NotificationPanel->>Browser: Check if Tab is Focused
    
    alt Tab Not Focused
        NotificationPanel->>Browser: Request Notification Permission
        Browser->>User: Show Browser Notification
        Note over Browser,User: Desktop Notification Popup
    end
    
    NotificationPanel->>NotificationPanel: Update Badge Count
    NotificationPanel->>NotificationPanel: Add to Notification List
    
    User->>NotificationPanel: Click Notification
    NotificationPanel->>NotificationPanel: Mark as Read
    NotificationPanel->>Backend: PUT /api/notifications/:id/read
    Backend->>Database: Update Notification Status
    Database-->>Backend: Updated
    Backend-->>NotificationPanel: Success
    
    User->>NotificationPanel: Click Delete
    NotificationPanel->>Backend: DELETE /api/notifications/:id
    Backend->>Database: Delete Notification
    Database-->>Backend: Deleted
    Backend-->>NotificationPanel: Success
    NotificationPanel->>NotificationPanel: Remove from State
```

---

## 6. Component Interaction Flow

```mermaid
graph TB
    Start([User Interaction]) --> IdentifyComponent{Which Component?}
    
    IdentifyComponent -->|KPI Card| KPIAction[KPI Card Action]
    IdentifyComponent -->|AI Insight| AIAction[AI Insight Action]
    IdentifyComponent -->|Notification| NotifAction[Notification Action]
    IdentifyComponent -->|Chart| ChartAction[Chart Action]
    IdentifyComponent -->|Table| TableAction[Table Action]
    
    KPIAction --> KPIHandler[onClick Handler]
    KPIHandler --> ShowKPIDetails[Show KPI Details Modal]
    ShowKPIDetails --> FetchKPIDetails[Fetch Detailed KPI Data]
    FetchKPIDetails --> DisplayModal[Display Modal with Details]
    
    AIAction --> AIHandler[onClick Handler]
    AIHandler --> ShowAIDetails[Show AI Insight Details]
    ShowAIDetails --> FetchAIDetails[Fetch AI Analysis Details]
    FetchAIDetails --> DisplayAIModal[Display AI Analysis Modal]
    
    NotifAction --> NotifHandler[onClick Handler]
    NotifHandler --> NotifType{Action Type?}
    NotifType -->|Mark Read| MarkRead[Mark as Read]
    NotifType -->|Delete| DeleteNotif[Delete Notification]
    NotifType -->|View| ViewNotif[View Notification Details]
    
    MarkRead --> UpdateNotifState[Update Notification State]
    UpdateNotifState --> APICall1[PUT /api/notifications/:id/read]
    APICall1 --> UpdateUI1[Update UI - Remove Unread Badge]
    
    DeleteNotif --> RemoveNotifState[Remove from State]
    RemoveNotifState --> APICall2[DELETE /api/notifications/:id]
    APICall2 --> UpdateUI2[Update UI - Remove from List]
    
    ViewNotif --> ShowNotifDetails[Show Notification Details]
    ShowNotifDetails --> FetchNotifDetails[Fetch Full Notification Data]
    FetchNotifDetails --> DisplayNotifModal[Display Details Modal]
    
    ChartAction --> ChartHandler[onHover/onClick Handler]
    ChartHandler --> ShowTooltip[Show Chart Tooltip]
    ChartHandler --> ShowDataPoint[Highlight Data Point]
    
    TableAction --> TableHandler[onRowClick Handler]
    TableHandler --> ShowRowDetails[Show Row Details]
    ShowRowDetails --> FetchRowData[Fetch Row Data]
    FetchRowData --> DisplayRowModal[Display Row Details Modal]
    
    DisplayModal --> UserInteracts[User Continues Interaction]
    DisplayAIModal --> UserInteracts
    UpdateUI1 --> UserInteracts
    UpdateUI2 --> UserInteracts
    DisplayNotifModal --> UserInteracts
    ShowTooltip --> UserInteracts
    DisplayRowModal --> UserInteracts
    
    style Start fill:#e1f5ff
    style IdentifyComponent fill:#fff9c4
    style UserInteracts fill:#e8f5e9
```

---

## 7. Data Fetching Flow

```mermaid
graph TB
    Start([Component Needs Data]) --> CheckCache{Cached Data?}
    
    CheckCache -->|Yes| CheckFresh{Data Fresh?}
    CheckCache -->|No| FetchFromAPI[Fetch from API]
    
    CheckFresh -->|Yes| UseCache[Use Cached Data]
    CheckFresh -->|No| FetchFromAPI
    
    FetchFromAPI --> BuildRequest[Build API Request]
    BuildRequest --> AddAuth[Add Auth Token]
    AddAuth --> AddHeaders[Add Headers]
    AddHeaders --> SendRequest[Send HTTP Request]
    
    SendRequest --> BackendReceive[Backend Receives Request]
    BackendReceive --> ValidateAuth{Valid Token?}
    
    ValidateAuth -->|No| Return401[Return 401 Unauthorized]
    ValidateAuth -->|Yes| ProcessRequest[Process Request]
    
    ProcessRequest --> CheckCacheBackend{Backend Cache?}
    CheckCacheBackend -->|Yes| ReturnCached[Return Cached Response]
    CheckCacheBackend -->|No| QueryDB[Query Database]
    
    QueryDB --> ExecuteQuery[Execute SQL Query]
    ExecuteQuery --> GetData[Get Data from DB]
    GetData --> TransformData[Transform Data]
    TransformData --> ReturnData[Return JSON Response]
    
    ReturnCached --> FrontendReceive[Frontend Receives Response]
    ReturnData --> FrontendReceive
    
    Return401 --> HandleError[Handle Error]
    HandleError --> ShowError[Show Error Message]
    ShowError --> Retry{Retry?}
    Retry -->|Yes| FetchFromAPI
    Retry -->|No| ShowFallback[Show Fallback UI]
    
    FrontendReceive --> CheckStatus{Status Code?}
    CheckStatus -->|200 OK| ParseJSON[Parse JSON]
    CheckStatus -->|4xx/5xx| HandleError
    
    ParseJSON --> ValidateData{Valid Data?}
    ValidateData -->|No| HandleError
    ValidateData -->|Yes| UpdateState[Update Component State]
    
    UpdateState --> UpdateCache[Update Cache]
    UpdateCache --> ReRender[Re-render Component]
    ReRender --> DisplayData[Display Data in UI]
    
    UseCache --> DisplayData
    
    DisplayData --> UserViews[User Views Data]
    
    style Start fill:#e1f5ff
    style FetchFromAPI fill:#fff9c4
    style DisplayData fill:#e8f5e9
    style HandleError fill:#ffebee
```

---

## 8. Manufacturer Dashboard Flow

```mermaid
graph TB
    Start([Manufacturer Dashboard Load]) --> AuthCheck{Authenticated & Persona?}
    
    AuthCheck -->|No| Redirect[Redirect to Login]
    AuthCheck -->|Yes| LoadPage[Load Dashboard Page]
    
    LoadPage --> InitState[Initialize Component State]
    InitState --> LoadLayout[Load Dashboard Layout]
    
    LoadLayout --> LoadSidebar[Sidebar Component]
    LoadLayout --> LoadHeader[Header Component]
    LoadLayout --> LoadMain[Main Content Area]
    
    LoadSidebar --> RenderNav[Render Navigation Icons]
    LoadHeader --> RenderHeader[Render Header Elements]
    LoadMain --> LoadSections[Load Dashboard Sections]
    
    LoadSections --> Section1[Section 1: KPI Cards]
    LoadSections --> Section2[Section 2: AI Features]
    LoadSections --> Section3[Section 3: Charts & Tables]
    
    Section1 --> FetchKPIs[Fetch KPI Data]
    Section2 --> FetchAI[Fetch AI Data]
    Section3 --> FetchCharts[Fetch Chart Data]
    
    FetchKPIs --> API1[GET /api/manufacturer/kpis]
    FetchAI --> API2[GET /api/manufacturer/ai/insights]
    FetchCharts --> API3[GET /api/manufacturer/charts]
    
    API1 --> Backend1[Backend Processes]
    API2 --> Backend2[Backend + AI Service]
    API3 --> Backend3[Backend Processes]
    
    Backend1 --> DB1[(Database Query)]
    Backend2 --> AIService[AI Service Processing]
    Backend3 --> DB3[(Database Query)]
    
    DB1 --> Response1[KPI Data Response]
    AIService --> Response2[AI Insights Response]
    DB3 --> Response3[Chart Data Response]
    
    Response1 --> RenderKPIs[Render KPI Cards]
    Response2 --> RenderAI[Render AI Components]
    Response3 --> RenderCharts[Render Charts]
    
    RenderKPIs --> KPI1[Total Components Card]
    RenderKPIs --> KPI2[Production Efficiency Card]
    RenderKPIs --> KPI3[Orders Fulfilled Card]
    
    RenderAI --> AI1[AI Insights Panel]
    RenderAI --> AI2[Quality Predictions]
    RenderAI --> AI3[Notifications Panel]
    
    RenderCharts --> Chart1[Current Stock Chart]
    RenderCharts --> Chart2[Defect Rates Chart]
    RenderCharts --> Chart3[Waste of Cost Chart]
    RenderCharts --> Table1[Pending Orders Table]
    RenderCharts --> Card1[Top Product Card]
    
    KPI1 --> Complete[All Components Rendered]
    KPI2 --> Complete
    KPI3 --> Complete
    AI1 --> Complete
    AI2 --> Complete
    AI3 --> Complete
    Chart1 --> Complete
    Chart2 --> Complete
    Chart3 --> Complete
    Table1 --> Complete
    Card1 --> Complete
    
    Complete --> EstablishWS[Establish WebSocket Connection]
    EstablishWS --> ListenEvents[Listen for Real-time Events]
    
    ListenEvents --> EventType{Event Type?}
    EventType -->|Notification| UpdateNotif[Update Notifications]
    EventType -->|Production Update| UpdateProduction[Update Production Data]
    EventType -->|Quality Alert| UpdateQuality[Update Quality Metrics]
    
    UpdateNotif --> ReRenderNotif[Re-render Notifications]
    UpdateProduction --> ReRenderProduction[Re-render Production Cards]
    UpdateQuality --> ReRenderQuality[Re-render Quality Chart]
    
    ReRenderNotif --> UserInteracts[User Can Interact]
    ReRenderProduction --> UserInteracts
    ReRenderQuality --> UserInteracts
    
    UserInteracts --> UserAction{User Action?}
    UserAction -->|Click Component| HandleClick[Handle Click Event]
    UserAction -->|Hover Chart| ShowTooltip[Show Tooltip]
    UserAction -->|Filter Data| ApplyFilter[Apply Filter]
    UserAction -->|Search| PerformSearch[Perform Search]
    
    HandleClick --> ShowDetails[Show Details Modal]
    ShowTooltip --> DisplayTooltip[Display Chart Tooltip]
    ApplyFilter --> RefetchData[Refetch Filtered Data]
    PerformSearch --> SearchResults[Show Search Results]
    
    ShowDetails --> UserInteracts
    DisplayTooltip --> UserInteracts
    RefetchData --> UserInteracts
    SearchResults --> UserInteracts
    
    style Start fill:#e1f5ff
    style Section2 fill:#fff9c4
    style Complete fill:#e8f5e9
    style UserInteracts fill:#f3e5f5
```

---

## Complete System Flow (ASCII Art)

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAVIGO SYSTEM COMPLETE FLOW                   │
└─────────────────────────────────────────────────────────────────┘

USER BROWSER
    │
    ├─► Navigate to https://navigo.com/manufacturer
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP ROUTER                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Route: /manufacturer                                    │ │
│  │  └─► app/manufacturer/page.tsx                          │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
    │
    ├─► Check Authentication (AuthContext)
    │       │
    │       ├─► Check localStorage for token
    │       │
    │       └─► If not authenticated → Redirect to /login
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│              MANUFACTURER DASHBOARD PAGE                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  useEffect Hook Triggers                                 │ │
│  │  ├─► Verify persona === "manufacturer"                 │ │
│  │  └─► If not → Redirect to correct dashboard             │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
    │
    ├─► Render Layout Components
    │       │
    │       ├─► ManufacturerSidebar
    │       │       └─► Navigation Icons
    │       │
    │       ├─► ManufacturerHeader
    │       │       ├─► Search Bar
    │       │       ├─► Notifications Icon
    │       │       └─► User Profile
    │       │
    │       └─► Main Content Area
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│              DASHBOARD COMPONENTS LOADING                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  KPI Cards   │  │  AI Features │  │  Charts      │       │
│  │              │  │              │  │              │       │
│  │  useEffect   │  │  useEffect   │  │  useEffect   │       │
│  │  └─► Fetch   │  │  └─► Fetch   │  │  └─► Fetch   │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │                │
│         └─────────────────┴──────────────────┘               │
│                          │                                    │
│                          ▼                                    │
│              ┌─────────────────────────┐                      │
│              │   API CALLS (Parallel)  │                      │
│              └─────────────────────────┘                      │
└───────────────────────────────────────────────────────────────┘
    │
    ├─► GET /api/manufacturer/kpis
    ├─► GET /api/manufacturer/ai/insights
    ├─► GET /api/manufacturer/quality/predictions
    ├─► GET /api/manufacturer/notifications
    ├─► GET /api/manufacturer/stock
    ├─► GET /api/manufacturer/defects
    ├─► GET /api/manufacturer/production
    ├─► GET /api/manufacturer/waste
    ├─► GET /api/manufacturer/orders
    └─► GET /api/manufacturer/top-product
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                           │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  1. Validate JWT Token                                   │ │
│  │  2. Check Authorization (persona = manufacturer)         │ │
│  │  3. Process Request                                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
    │
    ├─► Route to Appropriate Service
    │       │
    │       ├─► Data Service (for KPIs, Stock, etc.)
    │       │       │
    │       │       └─► Query Database
    │       │               │
    │       │               └─► PostgreSQL
    │       │                       │
    │       │                       └─► Return Data
    │       │
    │       └─► AI Service (for AI Insights, Predictions)
    │               │
    │               ├─► Data Analysis Agent
    │               │       │
    │               │       └─► Analyze Production Data
    │               │
    │               ├─► Quality Prediction Agent
    │               │       │
    │               │       └─► Run ML Model
    │               │               │
    │               │               └─► Generate Prediction
    │               │
    │               └─► Optimization Agent
    │                       │
    │                       └─► Calculate Optimizations
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                    RESPONSE DATA                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  JSON Response:                                         │ │
│  │  {                                                      │ │
│  │    "kpis": {...},                                      │ │
│  │    "aiInsights": [...],                                │ │
│  │    "qualityPrediction": {...},                         │ │
│  │    "notifications": [...],                              │ │
│  │    ...                                                 │ │
│  │  }                                                     │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│              FRONTEND COMPONENT UPDATES                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  1. Update Component State (useState)                   │ │
│  │  2. Trigger Re-render                                    │ │
│  │  3. Display Data in UI                                   │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
    │
    ├─► KPI Cards Display Metrics
    ├─► AI Insights Show Predictions
    ├─► Charts Render with Data
    ├─► Tables Populate with Rows
    └─► Notifications Show Alerts
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│              REAL-TIME UPDATES (WebSocket)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  WebSocket Connection Established                       │ │
│  │  └─► wss://api.navigo.com/notifications                 │ │
│  │                                                          │ │
│  │  Listen for Events:                                     │ │
│  │  ├─► Production Line Alert                              │ │
│  │  ├─► Quality Check Complete                            │ │
│  │  ├─► New Order Received                                 │ │
│  │  └─► Inventory Low Alert                                │ │
│  │                                                          │ │
│  │  On Event:                                              │ │
│  │  1. Update Notification State                           │ │
│  │  2. Show Browser Notification (if tab not focused)     │ │
│  │  3. Update Badge Count                                  │ │
│  │  4. Add to Notification List                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  User can:                                               │ │
│  │  ├─► Click on Cards → Show Details                      │ │
│  │  ├─► Hover on Charts → Show Tooltips                    │ │
│  │  ├─► Filter Notifications → Update List                 │ │
│  │  ├─► Mark Notifications as Read                         │ │
│  │  ├─► Search for Data                                    │ │
│  │  └─► Navigate to Other Pages                            │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
    │
    └─► Loop Continues (Auto-refresh, Real-time Updates)
```

---

## Key Flow Points

### 1. **Authentication Flow**
- User must authenticate before accessing dashboard
- JWT token stored in localStorage/sessionStorage
- Token validated on every API request
- Persona-based routing ensures correct dashboard

### 2. **Data Fetching Flow**
- Components fetch data independently using useEffect
- Parallel API calls for better performance
- Caching strategy to reduce API calls
- Error handling with fallback UI

### 3. **AI Pipeline Flow**
- AI Service processes requests asynchronously
- Multiple AI agents work in parallel
- ML models generate predictions
- Confidence scores included in responses

### 4. **Real-time Flow**
- WebSocket connection for live updates
- Event-driven architecture
- Browser notifications for important alerts
- State updates trigger UI re-renders

### 5. **Component Lifecycle**
- Mount → Fetch Data → Render → Update → Unmount
- useEffect hooks manage side effects
- State updates trigger re-renders
- Cleanup functions prevent memory leaks

---

## Performance Optimizations

1. **Parallel Data Fetching**: All API calls happen simultaneously
2. **Code Splitting**: Components loaded on demand
3. **Memoization**: Expensive calculations cached
4. **Virtual Scrolling**: Large lists rendered efficiently
5. **Debouncing**: Search inputs debounced
6. **Request Deduplication**: Duplicate requests prevented

---

## Error Handling Flow

```
API Request
    │
    ├─► Network Error?
    │       └─► Show "Connection Error" → Retry Button
    │
    ├─► 401 Unauthorized?
    │       └─► Clear Auth → Redirect to Login
    │
    ├─► 403 Forbidden?
    │       └─► Show "Access Denied" Message
    │
    ├─► 500 Server Error?
    │       └─► Show "Server Error" → Retry Button
    │
    └─► Success?
            └─► Update State → Render Data
```

---

This comprehensive flowchart documentation provides a complete view of how the NaviGo system works from user interaction to backend processing to AI pipeline and back to the frontend display.

