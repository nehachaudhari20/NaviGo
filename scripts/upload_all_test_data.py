#!/usr/bin/env python3
"""
Comprehensive script to upload all test data to Firestore.
Uploads vehicles, service centers, and any other required data.
"""

import json
import os
import sys
from pathlib import Path
from google.cloud import firestore

# Get project ID from environment or use default
PROJECT_ID = os.getenv("PROJECT_ID", "navigo-27206")

def upload_collection(db, collection_name: str, data_file: Path, id_field: str):
    """Upload data from JSON file to Firestore collection."""
    if not data_file.exists():
        print(f"⚠️  File not found: {data_file}")
        return 0
    
    print(f"\n📦 Uploading to '{collection_name}' collection...")
    print(f"   Source: {data_file.name}")
    
    with open(data_file, "r") as f:
        data = json.load(f)
    
    if not isinstance(data, list):
        print(f"❌ Error: Expected a list of documents in {data_file.name}")
        return 0
    
    uploaded = 0
    for item in data:
        doc_id = item.get(id_field)
        if not doc_id:
            print(f"⚠️  Warning: Skipping item due to missing '{id_field}' field")
            continue
        
        try:
            db.collection(collection_name).document(doc_id).set(item)
            print(f"   ✅ {doc_id}")
            uploaded += 1
        except Exception as e:
            print(f"   ❌ Error uploading {doc_id}: {e}")
    
    print(f"✅ Uploaded {uploaded}/{len(data)} document(s) to '{collection_name}'")
    return uploaded

def main():
    """Main upload function."""
    print("=" * 60)
    print("🚀 NaviGo Test Data Upload Script")
    print("=" * 60)
    print(f"Project ID: {PROJECT_ID}\n")
    
    try:
        # Initialize Firestore
        print("🔌 Connecting to Firestore...")
        db = firestore.Client(project=PROJECT_ID)
        print("✅ Connected to Firestore\n")
    except Exception as e:
        print(f"❌ Error connecting to Firestore: {e}")
        print("\n💡 To fix this:")
        print("   1. Run: gcloud auth application-default login")
        print("   2. Or set GOOGLE_APPLICATION_CREDENTIALS environment variable")
        print("   3. Or ensure you're running from a GCP environment with default credentials")
        sys.exit(1)
    
    # Get script directory
    script_dir = Path(__file__).parent
    test_data_dir = script_dir.parent / "test_data"
    
    total_uploaded = 0
    
    # Upload vehicles
    vehicles_file = test_data_dir / "vehicles.json"
    total_uploaded += upload_collection(db, "vehicles", vehicles_file, "vehicle_id")
    
    # Upload service centers
    service_centers_file = test_data_dir / "service_centers.json"
    total_uploaded += upload_collection(db, "service_centers", service_centers_file, "service_center_id")
    
    print("\n" + "=" * 60)
    print(f"✅ Upload Complete! Total documents uploaded: {total_uploaded}")
    print("=" * 60)
    print("\n📋 Next Steps:")
    print("   1. Upload telemetry data using the ingest_telemetry endpoint")
    print("   2. Verify data in Firestore Console:")
    print(f"      https://console.firebase.google.com/project/{PROJECT_ID}/firestore")
    print("   3. Check that vehicles and service_centers collections are populated")
    print("\n💡 To upload telemetry data:")
    print("   - Use POST request to your ingest_telemetry Cloud Function")
    print("   - Or use the test scripts in the tests/ directory")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Upload cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

