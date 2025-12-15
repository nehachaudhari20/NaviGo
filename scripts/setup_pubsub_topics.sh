#!/bin/bash

# Component 1: Pub/Sub Topics Setup Script
# Project: navigo-27206

set -e  # Exit on error

PROJECT_ID="navigo-27206"

echo "🚀 Setting up Pub/Sub Topics for NaviGo..."
echo "Project: $PROJECT_ID"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# Main Topics
echo "📨 Creating main Pub/Sub topics..."

gcloud pubsub topics create navigo-telemetry-ingested \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-telemetry-ingested" \
    || echo "⚠️  Topic may already exist: navigo-telemetry-ingested"

gcloud pubsub topics create navigo-anomaly-detected \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-anomaly-detected" \
    || echo "⚠️  Topic may already exist: navigo-anomaly-detected"

gcloud pubsub topics create navigo-diagnosis-complete \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-diagnosis-complete" \
    || echo "⚠️  Topic may already exist: navigo-diagnosis-complete"

gcloud pubsub topics create navigo-rca-complete \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-rca-complete" \
    || echo "⚠️  Topic may already exist: navigo-rca-complete"

gcloud pubsub topics create navigo-scheduling-complete \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-scheduling-complete" \
    || echo "⚠️  Topic may already exist: navigo-scheduling-complete"

gcloud pubsub topics create navigo-engagement-complete \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-engagement-complete" \
    || echo "⚠️  Topic may already exist: navigo-engagement-complete"

gcloud pubsub topics create navigo-feedback-complete \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-feedback-complete" \
    || echo "⚠️  Topic may already exist: navigo-feedback-complete"

gcloud pubsub topics create navigo-manufacturing-complete \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-manufacturing-complete" \
    || echo "⚠️  Topic may already exist: navigo-manufacturing-complete"

gcloud pubsub topics create navigo-human-review-required \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-human-review-required" \
    || echo "⚠️  Topic may already exist: navigo-human-review-required"

echo ""
echo "📨 Creating dead-letter topics for error handling..."

# Dead-Letter Topics
gcloud pubsub topics create navigo-telemetry-ingested-dlq \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-telemetry-ingested-dlq" \
    || echo "⚠️  Topic may already exist: navigo-telemetry-ingested-dlq"

gcloud pubsub topics create navigo-anomaly-detected-dlq \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-anomaly-detected-dlq" \
    || echo "⚠️  Topic may already exist: navigo-anomaly-detected-dlq"

gcloud pubsub topics create navigo-diagnosis-complete-dlq \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-diagnosis-complete-dlq" \
    || echo "⚠️  Topic may already exist: navigo-diagnosis-complete-dlq"

gcloud pubsub topics create navigo-rca-complete-dlq \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-rca-complete-dlq" \
    || echo "⚠️  Topic may already exist: navigo-rca-complete-dlq"

gcloud pubsub topics create navigo-scheduling-complete-dlq \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-scheduling-complete-dlq" \
    || echo "⚠️  Topic may already exist: navigo-scheduling-complete-dlq"

gcloud pubsub topics create navigo-engagement-complete-dlq \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-engagement-complete-dlq" \
    || echo "⚠️  Topic may already exist: navigo-engagement-complete-dlq"

gcloud pubsub topics create navigo-feedback-complete-dlq \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-feedback-complete-dlq" \
    || echo "⚠️  Topic may already exist: navigo-feedback-complete-dlq"

gcloud pubsub topics create navigo-manufacturing-complete-dlq \
    --project=$PROJECT_ID \
    && echo "✅ Created: navigo-manufacturing-complete-dlq" \
    || echo "⚠️  Topic may already exist: navigo-manufacturing-complete-dlq"

echo ""
echo "✅ Pub/Sub Topics Setup Complete!"
echo ""
echo "📋 Verifying topics..."
gcloud pubsub topics list --project=$PROJECT_ID | grep navigo

echo ""
echo "🎉 Component 1 Complete! All Pub/Sub topics are ready."

