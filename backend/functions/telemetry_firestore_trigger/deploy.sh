#!/bin/bash

# Deploy telemetry_firestore_trigger function with bytes handling fix

echo "🚀 Deploying telemetry-firestore-trigger function..."
echo ""

cd "$(dirname "$0")"

gcloud functions deploy telemetry-firestore-trigger \
  --gen2 \
  --runtime=python311 \
  --region=us-central1 \
  --source=. \
  --entry-point=telemetry_firestore_trigger \
  --trigger-event-filters="type=google.cloud.firestore.document.v1.written" \
  --trigger-event-filters="database=(default)" \
  --trigger-event-filters="document=telemetry_events/{event_id}" \
  --project=navigo-27206 \
  --service-account=navigo-functions@navigo-27206.iam.gserviceaccount.com \
  --allow-unauthenticated

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Wait 1-2 minutes for deployment to propagate"
echo "2. Upload telemetry via frontend: http://localhost:3000"
echo "3. Check logs: gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=telemetry-firestore-trigger\" --project=navigo-27206 --limit=10"
