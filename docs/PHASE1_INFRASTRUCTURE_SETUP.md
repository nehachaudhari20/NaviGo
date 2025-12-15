# Phase 1: Infrastructure Setup - Step by Step

## 🎯 Approach
Complete one component fully before moving to the next.

---

## Component 1: Pub/Sub Topics Setup

### Topics to Create (9 topics total)

1. **`navigo-telemetry-ingested`**
   - Description: Triggered when telemetry data is stored in Firestore
   - Subscriber: Data Analysis Agent

2. **`navigo-anomaly-detected`**
   - Description: Triggered when anomaly is detected
   - Subscriber: Master Orchestrator

3. **`navigo-diagnosis-complete`**
   - Description: Triggered when diagnosis agent completes
   - Subscriber: Master Orchestrator

4. **`navigo-rca-complete`**
   - Description: Triggered when RCA agent completes
   - Subscriber: Master Orchestrator

5. **`navigo-scheduling-complete`**
   - Description: Triggered when scheduling agent completes
   - Subscriber: Master Orchestrator

6. **`navigo-engagement-complete`**
   - Description: Triggered when engagement agent completes
   - Subscriber: Master Orchestrator

7. **`navigo-feedback-complete`**
   - Description: Triggered when feedback agent completes
   - Subscriber: Master Orchestrator

8. **`navigo-manufacturing-complete`**
   - Description: Triggered when manufacturing agent completes
   - Subscriber: None (end of pipeline)

9. **`navigo-human-review-required`**
   - Description: Triggered when confidence < 85%
   - Subscriber: None (manual review)

### Implementation Steps

#### Step 1.1: Create Topics via gcloud CLI

```bash
# Set project
gcloud config set project navigo-27206

# Create all topics
gcloud pubsub topics create navigo-telemetry-ingested
gcloud pubsub topics create navigo-anomaly-detected
gcloud pubsub topics create navigo-diagnosis-complete
gcloud pubsub topics create navigo-rca-complete
gcloud pubsub topics create navigo-scheduling-complete
gcloud pubsub topics create navigo-engagement-complete
gcloud pubsub topics create navigo-feedback-complete
gcloud pubsub topics create navigo-manufacturing-complete
gcloud pubsub topics create navigo-human-review-required
```

#### Step 1.2: Verify Topics Created

```bash
# List all topics
gcloud pubsub topics list | grep navigo
```

#### Step 1.3: Create Dead-Letter Topics (Error Handling)

```bash
# Dead-letter topics for failed messages
gcloud pubsub topics create navigo-telemetry-ingested-dlq
gcloud pubsub topics create navigo-anomaly-detected-dlq
gcloud pubsub topics create navigo-diagnosis-complete-dlq
gcloud pubsub topics create navigo-rca-complete-dlq
gcloud pubsub topics create navigo-scheduling-complete-dlq
gcloud pubsub topics create navigo-engagement-complete-dlq
gcloud pubsub topics create navigo-feedback-complete-dlq
gcloud pubsub topics create navigo-manufacturing-complete-dlq
```

### ✅ Component 1 Checklist

- [ ] All 9 main topics created
- [ ] All 9 dead-letter topics created
- [ ] Topics verified via `gcloud pubsub topics list`
- [ ] Topics visible in Google Cloud Console

### 📝 Notes
- Topics are created in project: `navigo-27206`
- Dead-letter topics will be used for error handling
- No subscriptions needed yet (will be created when Cloud Functions are deployed)

---

## Component 2: Firestore Collections Setup

### Collections to Create (10 collections)

1. **`telemetry_events`** - Raw vehicle telemetry data
2. **`anomaly_cases`** - Detected anomalies
3. **`diagnosis_results`** - Diagnosis agent outputs
4. **`rca_results`** - RCA agent outputs
5. **`scheduling_results`** - Scheduling agent outputs
6. **`engagement_results`** - Engagement agent outputs
7. **`feedback_results`** - Feedback agent outputs
8. **`manufacturing_insights`** - Manufacturing agent outputs
9. **`human_reviews`** - Cases requiring human review
10. **`pipeline_states`** - Pipeline state tracking

### Implementation Steps

#### Step 2.1: Create Firestore Database (if not exists)

```bash
# Check if Firestore is enabled
gcloud firestore databases list

# If not exists, create (Native mode)
gcloud firestore databases create --location=us-central1
```

#### Step 2.2: Create Collections via Python Script

Firestore collections are created automatically when first document is written, but we'll create a setup script to initialize with proper indexes.

#### Step 2.3: Create Composite Indexes

Indexes needed for efficient queries:

**telemetry_events:**
- `vehicle_id` + `timestamp_utc` (descending)
- `timestamp_utc` (descending)

**anomaly_cases:**
- `vehicle_id` + `created_at` (descending)
- `status` + `created_at` (descending)

**pipeline_states:**
- `vehicle_id` + `updated_at` (descending)
- `status` + `updated_at` (descending)

**human_reviews:**
- `review_status` + `created_at` (descending)
- `confidence_score` + `created_at` (descending)

### ✅ Component 2 Checklist

- [ ] Firestore database exists
- [ ] All 10 collections documented (will be auto-created on first write)
- [ ] Composite indexes created
- [ ] Indexes verified in Firestore Console

---

## Component 3: BigQuery Setup

### Datasets and Tables to Create

**Dataset:** `telemetry`
**Tables:**
1. `telemetry_events`
2. `anomaly_cases`
3. `diagnosis_results`
4. `rca_results`
5. `scheduling_results`
6. `engagement_results`
7. `feedback_results`
8. `manufacturing_insights`
9. `human_reviews`
10. `pipeline_states`

### Implementation Steps

#### Step 3.1: Create BigQuery Dataset

```bash
# Create dataset
bq mk --dataset --location=US navigo-27206:telemetry
```

#### Step 3.2: Create Tables with Schemas

Each table schema mirrors Firestore collection structure.

### ✅ Component 3 Checklist

- [ ] BigQuery dataset `telemetry` created
- [ ] All 10 tables created with proper schemas
- [ ] Tables verified in BigQuery Console

---

## Component 4: Cloud Functions Environment Setup

### Setup Steps

#### Step 4.1: Enable Required APIs

```bash
# Enable Cloud Functions API
gcloud services enable cloudfunctions.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Enable Pub/Sub API
gcloud services enable pubsub.googleapis.com

# Enable Firestore API
gcloud services enable firestore.googleapis.com

# Enable BigQuery API
gcloud services enable bigquery.googleapis.com

# Enable Vertex AI API (for Gemini)
gcloud services enable aiplatform.googleapis.com
```

#### Step 4.2: Set Up Service Accounts

```bash
# Create service account for Cloud Functions
gcloud iam service-accounts create navigo-functions \
    --display-name="NaviGo Cloud Functions Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding navigo-27206 \
    --member="serviceAccount:navigo-functions@navigo-27206.iam.gserviceaccount.com" \
    --role="roles/pubsub.publisher"

gcloud projects add-iam-policy-binding navigo-27206 \
    --member="serviceAccount:navigo-functions@navigo-27206.iam.gserviceaccount.com" \
    --role="roles/pubsub.subscriber"

gcloud projects add-iam-policy-binding navigo-27206 \
    --member="serviceAccount:navigo-functions@navigo-27206.iam.gserviceaccount.com" \
    --role="roles/datastore.user"

gcloud projects add-iam-policy-binding navigo-27206 \
    --member="serviceAccount:navigo-functions@navigo-27206.iam.gserviceaccount.com" \
    --role="roles/bigquery.dataEditor"

gcloud projects add-iam-policy-binding navigo-27206 \
    --member="serviceAccount:navigo-functions@navigo-27206.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"
```

#### Step 4.3: Set Up Environment Variables

```bash
# Set project-wide environment variables
gcloud functions config set-env-vars \
    PROJECT_ID=navigo-27206 \
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### ✅ Component 4 Checklist

- [ ] All required APIs enabled
- [ ] Service account created with proper permissions
- [ ] Environment variables configured
- [ ] Cloud Functions environment ready

---

## 🎯 Phase 1 Complete Checklist

- [ ] Component 1: All Pub/Sub topics created
- [ ] Component 2: Firestore collections and indexes set up
- [ ] Component 3: BigQuery dataset and tables created
- [ ] Component 4: Cloud Functions environment ready

---

## 📋 Next Steps After Phase 1

Once Phase 1 is complete, we'll move to:
- **Phase 2**: Ingestion Layer (HTTP endpoint + Firestore trigger)

---

## 🚀 Let's Start!

**Component 1 is ready to implement.** 

Should I create the scripts/commands to set up Component 1 (Pub/Sub Topics) now?

