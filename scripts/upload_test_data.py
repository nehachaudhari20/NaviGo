#!/usr/bin/env python3
"""
Script to upload comprehensive test data to Firestore.
This uploads vehicles and service centers data required for all agents.
"""

import json
import os
import sys
from pathlib import Path
from google.cloud import firestore

# Get project ID from environment or use default
PROJECT_ID = os.getenv("PROJECT_ID", "navigo-27206")

def upload_test_data():
    """Upload vehicles and service centers data to Firestore."""
    
    # Initialize Firestore
    db = firestore.Client(project=PROJECT_ID)
    
    # Get script directory
    script_dir = Path(__file__).parent
    test_data_dir = script_dir.parent / "test_data"
    
    # Load and upload vehicle data
    vehicles_file = test_data_dir / "vehicles.json"
    if vehicles_file.exists():
        print(f"📦 Loading vehicles from {vehicles_file}")
        with open(vehicles_file, "r") as f:
            vehicles = json.load(f)
        
        for vehicle in vehicles:
            vehicle_id = vehicle["vehicle_id"]
            db.collection("vehicles").document(vehicle_id).set(vehicle)
            print(f"  ✅ Uploaded vehicle: {vehicle_id} ({vehicle.get('owner_name', 'N/A')})")
        
        print(f"✅ Uploaded {len(vehicles)} vehicle(s)\n")
    else:
        print(f"⚠️  Vehicles file not found: {vehicles_file}\n")
    
    # Load and upload service center data
    service_centers_file = test_data_dir / "service_centers.json"
    if service_centers_file.exists():
        print(f"📦 Loading service centers from {service_centers_file}")
        with open(service_centers_file, "r") as f:
            service_centers = json.load(f)
        
        for center in service_centers:
            center_id = center["service_center_id"]
            db.collection("service_centers").document(center_id).set(center)
            print(f"  ✅ Uploaded service center: {center_id} ({center.get('name', 'N/A')})")
        
        print(f"✅ Uploaded {len(service_centers)} service center(s)\n")
    else:
        print(f"⚠️  Service centers file not found: {service_centers_file}\n")
    
    print("=" * 60)
    print("✅ All test data uploaded successfully!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Upload telemetry data using ingest_telemetry endpoint")
    print("2. Verify data flow through all agents")
    print("3. Check Firestore collections for generated data")

if __name__ == "__main__":
    try:
        upload_test_data()
    except Exception as e:
        print(f"❌ Error uploading test data: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

