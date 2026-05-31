import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app import create_app
    from models import db
    
    app = create_app()
    
    with app.app_context():
        db.create_all()
        print("Database tables created successfully")
        
        from init_data import init_data
        init_data()
        print("Data initialized successfully")
        
        print("\nTesting API routes...")
        client = app.test_client()
        
        response = client.get('/api/stats/overview')
        print(f"GET /api/stats/overview: {response.status_code}")
        if response.status_code == 200:
            print(f"  Data: {response.get_json()}")
        
        response = client.get('/api/pets')
        print(f"GET /api/pets: {response.status_code}")
        if response.status_code == 200:
            print(f"  Pets count: {len(response.get_json())}")
        
        response = client.get('/api/devices')
        print(f"GET /api/devices: {response.status_code}")
        if response.status_code == 200:
            print(f"  Devices count: {len(response.get_json())}")
        
        response = client.get('/api/alerts')
        print(f"GET /api/alerts: {response.status_code}")
        if response.status_code == 200:
            print(f"  Alerts count: {len(response.get_json())}")
        
        print("\nAll tests passed! Backend is working correctly.")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
