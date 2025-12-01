import requests
import json

BASE_URL = "http://localhost:5000/api/auth"

def test_auth():
    username = "testuser_" + str(int(time.time()))
    password = "testpassword"

    print(f"Testing with username: {username}")

    # 1. Register
    print("1. Registering...")
    res = requests.post(f"{BASE_URL}/register", json={"username": username, "password": password})
    print(f"Status: {res.status_code}, Response: {res.text}")
    if res.status_code != 201:
        print("Registration failed")
        return

    # 2. Login
    print("\n2. Logging in...")
    res = requests.post(f"{BASE_URL}/login", json={"username": username, "password": password})
    print(f"Status: {res.status_code}, Response: {res.text}")
    if res.status_code != 200:
        print("Login failed")
        return
    
    token = res.json().get('token')
    print(f"Token received: {token[:20]}...")

    # 3. Get Me
    print("\n3. Getting User Info...")
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get(f"{BASE_URL}/me", headers=headers)
    print(f"Status: {res.status_code}, Response: {res.text}")
    
    if res.status_code == 200:
        print("\nSUCCESS: Auth flow working correctly!")
    else:
        print("\nFAILURE: Get Me failed")

if __name__ == "__main__":
    import time
    test_auth()
