import requests
import sys

BASE_URL = "http://localhost:8000/api/v1"

def register_and_login(email, password, role):
    # Register
    print(f"[{role}] Registering...")
    try:
        requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "full_name": f"{role.capitalize()} User",
            "role": role
        })
    except Exception as e:
        print(f"Registration might have failed (maybe user exists): {e}")

    # Login
    print(f"[{role}] Logging in...")
    resp = requests.post(f"{BASE_URL}/auth/login", data={
        "username": email,
        "password": password
    })
    
    if resp.status_code != 200:
        print(f"Login failed: {resp.text}")
        return None
        
    return resp.json()["access_token"]

def verify_endpoints():
    print("--- Verifying RBAC ---")
    
    # 1. Setup Users
    admin_token = register_and_login("admin@test.com", "password", "admin")
    provider_token = register_and_login("provider@test.com", "password", "provider")
    customer_token = register_and_login("customer@test.com", "password", "customer")
    
    if not (admin_token and provider_token and customer_token):
        print("Failed to get tokens. Is the server running?")
        sys.exit(1)

    # 2. Test Admin Stats (Admin Only)
    print("\nTesting /admin/stats...")
    
    # Admin access
    resp = requests.get(f"{BASE_URL}/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    if resp.status_code == 200:
        print("✅ Admin accessed stats")
    else:
        print(f"❌ Admin failed to access stats: {resp.status_code}")

    # Customer access (Should Fail)
    resp = requests.get(f"{BASE_URL}/admin/stats", headers={"Authorization": f"Bearer {customer_token}"})
    if resp.status_code == 403:
        print("✅ Customer correctly denied stats")
    else:
        print(f"❌ Customer was NOT denied stats: {resp.status_code}")

    # 3. Test Provider Bookings (Provider Only)
    print("\nTesting /bookings/managed...")
    
    # Provider access
    resp = requests.get(f"{BASE_URL}/bookings/managed", headers={"Authorization": f"Bearer {provider_token}"})
    if resp.status_code == 200:
         print("✅ Provider accessed managed bookings")
    else:
         print(f"❌ Provider failed to access managed bookings: {resp.status_code}")

    # Customer access (Should Fail)
    resp = requests.get(f"{BASE_URL}/bookings/managed", headers={"Authorization": f"Bearer {customer_token}"})
    if resp.status_code == 403:
         print("✅ Customer correctly denied managed bookings")
    else:
         print(f"❌ Customer was NOT denied managed bookings: {resp.status_code}")

    # 4. Test Customer Bookings
    print("\nTesting /bookings/me...")
    resp = requests.get(f"{BASE_URL}/bookings/me", headers={"Authorization": f"Bearer {customer_token}"})
    if resp.status_code == 200:
        print("✅ Customer accessed own bookings")
    else:
        print(f"❌ Customer failed to access own bookings: {resp.status_code}")

if __name__ == "__main__":
    verify_endpoints()
