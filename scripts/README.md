# NaviGo Infrastructure Setup Scripts

## Component 1: Pub/Sub Topics

### Prerequisites
- Google Cloud SDK installed (`gcloud`)
- Authenticated with Google Cloud (`gcloud auth login`)
- Project `navigo-27206` set as default or specified

### Setup Script

**File:** `setup_pubsub_topics.sh`

**Usage:**
```bash
# Make executable
chmod +x scripts/setup_pubsub_topics.sh

# Run script
./scripts/setup_pubsub_topics.sh
```

**What it does:**
- Creates 9 main Pub/Sub topics
- Creates 8 dead-letter topics (for error handling)
- Verifies all topics are created

### Verification Script

**File:** `verify_pubsub_topics.sh`

**Usage:**
```bash
# Make executable
chmod +x scripts/verify_pubsub_topics.sh

# Run script
./scripts/verify_pubsub_topics.sh
```

**What it does:**
- Lists all navigo-related topics
- Counts main topics and DLQ topics
- Verifies expected count (9 main + 8 DLQ)

### Manual Commands (Alternative)

If you prefer to run commands manually:

```bash
# Set project
gcloud config set project navigo-27206

# Create main topics
gcloud pubsub topics create navigo-telemetry-ingested
gcloud pubsub topics create navigo-anomaly-detected
gcloud pubsub topics create navigo-diagnosis-complete
gcloud pubsub topics create navigo-rca-complete
gcloud pubsub topics create navigo-scheduling-complete
gcloud pubsub topics create navigo-engagement-complete
gcloud pubsub topics create navigo-feedback-complete
gcloud pubsub topics create navigo-manufacturing-complete
gcloud pubsub topics create navigo-human-review-required

# Create dead-letter topics
gcloud pubsub topics create navigo-telemetry-ingested-dlq
gcloud pubsub topics create navigo-anomaly-detected-dlq
gcloud pubsub topics create navigo-diagnosis-complete-dlq
gcloud pubsub topics create navigo-rca-complete-dlq
gcloud pubsub topics create navigo-scheduling-complete-dlq
gcloud pubsub topics create navigo-engagement-complete-dlq
gcloud pubsub topics create navigo-feedback-complete-dlq
gcloud pubsub topics create navigo-manufacturing-complete-dlq

# Verify
gcloud pubsub topics list | grep navigo
```

### Expected Output

After running setup script, you should see:
- ✅ 9 main topics created
- ✅ 8 dead-letter topics created
- ✅ Verification shows all topics

### Troubleshooting

**Error: "Topic already exists"**
- This is OK - the topic was already created
- Script will continue with other topics

**Error: "Permission denied"**
- Check you're authenticated: `gcloud auth login`
- Check project permissions: `gcloud projects list`

**Error: "Project not found"**
- Verify project ID: `gcloud config get-value project`
- Set correct project: `gcloud config set project navigo-27206`

### Next Steps

Once Component 1 is complete:
1. Verify all topics exist
2. Check in Google Cloud Console
3. Move to Component 2: Firestore Collections

