import urllib.request
import json

print("=== Testing Backend API Tests ===\n")

try:
    with urllib.request.urlopen('http://127.0.0.1:8000/') as response:
        data = json.loads(response.read().decode())
        print("Root API: OK")
        print(f"  Name: {data['name']}")

    print("\n1. Testing Dashboard Stats...")
    with urllib.request.urlopen('http://127.0.0.1:8000/api/dashboard/stats') as response:
        data = json.loads(response.read().decode())
        print("  Dashboard: OK")
        print(f"    Crafts: {data['craft_count']}")
        print(f"    Lives: {data['live_count']}")
        print(f"    Works: {data['work_count']}")

    print("\n2. Testing Crafts List...")
    with urllib.request.urlopen('http://127.0.0.1:8000/api/crafts') as response:
        data = json.loads(response.read().decode())
        print(f"  Found {len(data)} crafts")
        for craft in data[:3]:
            print(f"    - {craft['title']}")

    print("\n3. Testing Craft Categories...")
    with urllib.request.urlopen('http://127.0.0.1:8000/api/crafts/categories') as response:
        data = json.loads(response.read().decode())
        print(f"  Found {len(data)} categories")
        for cat in data:
            print(f"    - {cat['icon']} {cat['name']}")

    print("\n4. Testing Search API...")
    with urllib.request.urlopen('http://127.0.0.1:8000/api/search?q=青花瓷') as response:
        data = json.loads(response.read().decode())
        print(f"  Total results: {data['total']}")
        print(f"  Query: {data['query']}")
        print(f"  Results:")
        for result in data['results'][:3]:
            print(f"    - [{result['type']}] {result['title']}")

    print("\n5. Testing Works List...")
    with urllib.request.urlopen('http://127.0.0.1:8000/api/works') as response:
        data = json.loads(response.read().decode())
        print(f"  Found {len(data)} works")
        for work in data[:3]:
            verified = "✓" if work['quality_verified'] else "✗"
            print(f"    {verified} {work['title']}")

    print("\n6. Testing Craft Detail...")
    with urllib.request.urlopen('http://127.0.0.1:8000/api/crafts/1') as response:
        data = json.loads(response.read().decode())
        print(f"  Craft: {data['title']}")
        print(f"  Difficulty: {data['difficulty_level']}")
        print(f"  Steps: {len(data['steps'])}")

    print("\n7. Testing Live Rooms...")
    with urllib.request.urlopen('http://127.0.0.1:8000/api/live') as response:
        data = json.loads(response.read().decode())
        print(f"  Found {len(data)} live rooms")

    print("\n" + "="*50)
    print("All API tests passed successfully!")
    print("="*50)

except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()
