#!/bin/bash

# Component 1: Verify Pub/Sub Topics
# Project: navigo-27206

PROJECT_ID="navigo-27206"

echo "🔍 Verifying Pub/Sub Topics for NaviGo..."
echo "Project: $PROJECT_ID"
echo ""

# Set project
gcloud config set project $PROJECT_ID

# List all navigo topics
echo "📨 Main Topics:"
gcloud pubsub topics list --project=$PROJECT_ID | grep "navigo-" | grep -v "dlq" || echo "No topics found"

echo ""
echo "📨 Dead-Letter Topics:"
gcloud pubsub topics list --project=$PROJECT_ID | grep "navigo-.*-dlq" || echo "No DLQ topics found"

echo ""
echo "📊 Topic Count:"
MAIN_COUNT=$(gcloud pubsub topics list --project=$PROJECT_ID | grep "navigo-" | grep -v "dlq" | wc -l)
DLQ_COUNT=$(gcloud pubsub topics list --project=$PROJECT_ID | grep "navigo-.*-dlq" | wc -l)

echo "Main topics: $MAIN_COUNT"
echo "Dead-letter topics: $DLQ_COUNT"
echo "Total: $((MAIN_COUNT + DLQ_COUNT))"

echo ""
if [ "$MAIN_COUNT" -eq 9 ] && [ "$DLQ_COUNT" -eq 8 ]; then
    echo "✅ All topics verified successfully!"
else
    echo "⚠️  Expected 9 main topics and 8 DLQ topics"
    echo "   Found $MAIN_COUNT main topics and $DLQ_COUNT DLQ topics"
fi

