# NaviGo Dependencies Guide

This document explains all dependencies used in the NaviGo project and how to install them.

## Quick Start

### Install All Dependencies
```bash
pip install -r requirements.txt
```

### Install with Development Tools
```bash
pip install -r requirements-dev.txt
```

## Dependency Categories

### 1. Core Framework & Runtime

#### `functions-framework==3.5.0`
- **Purpose**: Google Cloud Functions framework
- **Used by**: All Cloud Functions
- **Why**: Enables HTTP and Pub/Sub triggered functions

#### `flask==3.0.0`
- **Purpose**: Web framework for HTTP endpoints
- **Used by**: `ingest_telemetry`, `twilio_webhook`, `submit_feedback`
- **Why**: Handles HTTP requests and responses

### 2. Google Cloud Platform Services

#### `google-cloud-firestore==2.13.1`
- **Purpose**: Firestore NoSQL database client
- **Used by**: All agents (data storage)
- **Why**: Stores telemetry, cases, bookings, vehicles, service centers

#### `google-cloud-pubsub==2.18.4`
- **Purpose**: Pub/Sub message queuing service
- **Used by**: All Pub/Sub triggered agents
- **Why**: Enables asynchronous agent communication

#### `google-cloud-bigquery==3.13.0`
- **Purpose**: BigQuery data warehouse client
- **Used by**: All agents (analytics storage)
- **Why**: Stores analytics data for reporting

#### `google-cloud-aiplatform==1.38.1`
- **Purpose**: Vertex AI / Gemini API client
- **Used by**: All AI agents (data_analysis, diagnosis, rca, scheduling, engagement, feedback, manufacturing)
- **Why**: Provides access to Gemini 2.5 Flash model

### 3. Data Validation & Processing

#### `pydantic==2.5.0`
- **Purpose**: Data validation library
- **Used by**: `ingest_telemetry` (telemetry schema validation)
- **Why**: Validates incoming telemetry data structure

### 4. Communication Services

#### `twilio>=8.0.0`
- **Purpose**: Twilio API client for voice calls and SMS
- **Used by**: `communication_agent`, `twilio_webhook`
- **Why**: Enables automated customer calls

### 5. Utilities

#### `pytz==2024.1`
- **Purpose**: Timezone handling library
- **Used by**: `scheduling_agent` (timezone-aware slot generation)
- **Why**: Converts between service center timezones and UTC

## Installation by Function Type

### HTTP Triggered Functions
```bash
pip install functions-framework flask google-cloud-firestore pydantic
```

### Pub/Sub Triggered Functions (AI Agents)
```bash
pip install functions-framework google-cloud-firestore google-cloud-pubsub google-cloud-bigquery google-cloud-aiplatform
```

### Communication Functions
```bash
pip install functions-framework google-cloud-firestore google-cloud-pubsub twilio flask
```

### Scheduling Agent (with timezone support)
```bash
pip install functions-framework google-cloud-firestore google-cloud-pubsub google-cloud-bigquery google-cloud-aiplatform pytz
```

## Version Compatibility

### Python Version
- **Required**: Python 3.9 or higher
- **Recommended**: Python 3.11 or 3.12

### Google Cloud Functions
- **Runtime**: Python 3.11 (recommended)
- **Framework**: Functions Framework 3.5.0

## Dependency Usage by Function

| Function | Dependencies |
|----------|-------------|
| `ingest_telemetry` | flask, google-cloud-firestore, pydantic |
| `telemetry_firestore_trigger` | google-cloud-firestore, google-cloud-pubsub, google-cloud-bigquery |
| `data_analysis_agent` | google-cloud-firestore, google-cloud-pubsub, google-cloud-bigquery, google-cloud-aiplatform |
| `diagnosis_agent` | google-cloud-firestore, google-cloud-pubsub, google-cloud-bigquery, google-cloud-aiplatform |
| `rca_agent` | google-cloud-firestore, google-cloud-pubsub, google-cloud-bigquery, google-cloud-aiplatform |
| `scheduling_agent` | google-cloud-firestore, google-cloud-pubsub, google-cloud-bigquery, google-cloud-aiplatform, pytz |
| `engagement_agent` | google-cloud-firestore, google-cloud-pubsub, google-cloud-bigquery, google-cloud-aiplatform |
| `communication_agent` | google-cloud-firestore, google-cloud-pubsub, twilio |
| `twilio_webhook` | google-cloud-firestore, google-cloud-pubsub, twilio, flask |
| `feedback_agent` | google-cloud-firestore, google-cloud-pubsub, google-cloud-bigquery, google-cloud-aiplatform |
| `manufacturing_agent` | google-cloud-firestore, google-cloud-pubsub, google-cloud-bigquery, google-cloud-aiplatform |
| `master_orchestrator` | google-cloud-firestore, google-cloud-pubsub |
| `submit_feedback` | flask, google-cloud-firestore |

## Local Development Setup

### 1. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Install Development Tools (Optional)
```bash
pip install -r requirements-dev.txt
```

### 4. Set Up Google Cloud Credentials
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

## Updating Dependencies

### Check for Updates
```bash
pip list --outdated
```

### Update Specific Package
```bash
pip install --upgrade package-name
```

### Update All Packages
```bash
pip install --upgrade -r requirements.txt
```

## Troubleshooting

### Issue: `ModuleNotFoundError`
**Solution**: Ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Issue: Version Conflicts
**Solution**: Use virtual environment to isolate dependencies:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Google Cloud Authentication
**Solution**: Set up application default credentials:
```bash
gcloud auth application-default login
```

### Issue: Twilio Import Error
**Solution**: Ensure Twilio is installed:
```bash
pip install twilio>=8.0.0
```

## Production Deployment

When deploying to Google Cloud Functions, each function's `requirements.txt` is used. The general `requirements.txt` file is for:
- Local development
- Testing scripts
- Utility scripts (like `upload_test_data.py`)

## Security Notes

- All Google Cloud dependencies use service account authentication
- Twilio credentials should be stored in environment variables or Secret Manager
- Never commit API keys or credentials to version control

## License Compatibility

All dependencies are open-source and compatible with the project's license.

