from locust import HttpUser, task, between
import random
import string


class HDBUser(HttpUser):
    # Your API server
    host = "http://localhost:3001"
    wait_time = between(1, 3)

    def on_start(self):
        """
        Runs once per simulated user:
        - Load towns & flat types (for valid filters / POST data)
        - Sign up + login to get JWT for /api/insights, /api/account, etc.
        """
        self.towns = []
        self.flat_types = []
        self.token = None
        self.headers = {}

        self.load_reference_data()
        self.signup_and_login()

    # ---------- HELPER: load towns + flat types ----------

    def load_reference_data(self):
        # /api/towns returns objects with town_name etc.
        with self.client.get("/api/towns", name="GET /api/towns (init)", catch_response=True) as resp:
            if resp.status_code == 200:
                data = resp.json()
                self.towns = [row.get("town_name") for row in data if row.get("town_name")]
            else:
                resp.failure(f"failed to load towns: {resp.text}")

        # /api/flat-types (no query) returns list of strings
        with self.client.get("/api/flat-types", name="GET /api/flat-types (init)", catch_response=True) as resp:
            if resp.status_code == 200:
                self.flat_types = resp.json()
            else:
                resp.failure(f"failed to load flat types: {resp.text}")

        # simple fallback so tests still run even if above fails
        if not self.towns:
            self.towns = ["BEDOK", "ANG MO KIO", "QUEENSTOWN"]
        if not self.flat_types:
            self.flat_types = ["3 ROOM", "4 ROOM", "5 ROOM"]

    # ---------- HELPER: signup + login (Mongo/JWT) ----------

    def signup_and_login(self):
        suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
        username = f"locust_{suffix}"
        password = "password123"

        # Try signup
        with self.client.post(
            "/api/auth/signup",
            json={
                "username": username,
                "email": f"{username}@example.com",
                "password": password,
                "phone": "12345678",
            },
            name="POST /api/auth/signup",
            catch_response=True,
        ) as resp:
            if resp.status_code in (200, 201):
                self.token = resp.json().get("token")
            elif resp.status_code == 400 and "username already exists" in resp.text:
                resp.success()  # not critical
            else:
                resp.failure(f"signup failed: {resp.text}")

        # If no token yet, try login
        if not self.token:
            with self.client.post(
                "/api/auth/login",
                json={"username": username, "password": password},
                name="POST /api/auth/login",
                catch_response=True,
            ) as resp:
                if resp.status_code == 200:
                    self.token = resp.json().get("token")
                else:
                    resp.failure(f"login failed: {resp.text}")

        if self.token:
            self.headers = {"Authorization": f"Bearer {self.token}"}

    # ======================================================
    #                     TASKS
    # ======================================================

    @task(3)
    def view_dashboard_metrics(self):
        """
        Simulate user opening the main metrics dashboard.
        Hits your Postgres analytics endpoints.
        """
        # global metrics (no filters)
        self.client.get("/api/metrics/total-transactions",
                        name="GET /api/metrics/total-transactions")
        self.client.get("/api/metrics/avg-price-by-town",
                        name="GET /api/metrics/avg-price-by-town")
        self.client.get("/api/metrics/yearly-trend",
                        name="GET /api/metrics/yearly-trend")
        self.client.get("/api/metrics/price-per-sqm",
                        name="GET /api/metrics/price-per-sqm")

        # also the older analytics endpoint
        self.client.get("/api/analytics/avg-price-by-town",
                        name="GET /api/analytics/avg-price-by-town")

    @task(2)
    def view_filtered_metrics(self):
        """
        Metrics with filters (town + flatType).
        Uses your buildFilters() logic: town, flatType, flatModel.
        """
        town = random.choice(self.towns)
        flat_type = random.choice(self.flat_types)

        params = {
            "town": town,
            "flatType": flat_type,
        }

        self.client.get("/api/metrics/total-transactions",
                        params=params,
                        name="GET /api/metrics/total-transactions?filters")

        self.client.get("/api/metrics/avg-price-by-town",
                        params=params,
                        name="GET /api/metrics/avg-price-by-town?filters")

        self.client.get("/api/metrics/yearly-trend",
                        params=params,
                        name="GET /api/metrics/yearly-trend?filters")

        self.client.get("/api/metrics/price-per-sqm",
                        params=params,
                        name="GET /api/metrics/price-per-sqm?filters")

        # also load flat-models for this combination
        self.client.get("/api/flat-models",
                        params={"town": town, "flatType": flat_type},
                        name="GET /api/flat-models?town&flatType")

    @task(3)
    def browse_resales_table(self):
        """
        Simulate admin/data manager viewing the table
        and searching by keyword.
        """
        # no search
        self.client.get("/api/resales/table",
                        name="GET /api/resales/table")

        # search mode
        keyword = random.choice(["2020", "4 ROOM", "500000", "STREET"])
        self.client.get(f"/api/resales/table?q={keyword}",
                        name="GET /api/resales/table?q")

    @task(1)
    def create_resale_record(self):
        """
        Simulate admin creating a new resale record.
        Hits your INSERT into resale_transactions (Postgres write).
        """
        payload = {
            "town": random.choice(self.towns),
            "block": str(random.randint(1, 999)),
            "streetName": "LOCUST TEST STREET",
            "price": random.randint(300000, 800000),
            "floorArea": random.randint(60, 120),
            "floorRange": random.choice(["01-05", "06-10", "11-15"]),
            "flatType": random.choice(self.flat_types),
            "leaseLeft": random.randint(30, 90),
        }

        self.client.post("/api/resales",
                         json=payload,
                         name="POST /api/resales")

    @task(2)
    def district_overview(self):
        """
        Simulate user opening District Overview page.
        This hits Mongo aggregation + Postgres query.
        """
        self.client.get("/api/insights/district-overview",
                        name="GET /api/insights/district-overview")

    @task(1)
    def public_insights_and_mine(self):
        """
        View public insights + user's own insights (auth).
        """
        self.client.get("/api/insights",
                        name="GET /api/insights")

        if self.headers:
            self.client.get("/api/insights/mine",
                            headers=self.headers,
                            name="GET /api/insights/mine")

    @task(1)
    def submit_insight(self):
        """
        Simulate logged-in user submitting a rating/comment.
        Tests Mongo write + JWT auth + your /api/insights POST handler.
        """
        if not self.headers:
            return

        payload = {
            "town": random.choice(self.towns),
            "comment": random.choice([
                "Convenient and near MRT.",
                "Good food options nearby.",
                "Quiet neighbourhood with parks.",
            ]),
            "rating": random.randint(1, 5),
            "tags": ["locust", "test"],
        }

        self.client.post("/api/insights",
                         headers=self.headers,
                         json=payload,
                         name="POST /api/insights")

    @task(1)
    def account_me_and_update(self):
        """
        Hit /api/auth/me and /api/account to test user profile flows.
        """
        if not self.headers:
            return

        # get profile
        self.client.get("/api/auth/me",
                        headers=self.headers,
                        name="GET /api/auth/me")

        # small update (change email only)
        new_email = f"locust_{random.randint(1, 9999)}@example.com"
        self.client.put("/api/account",
                        headers=self.headers,
                        json={"email": new_email},
                        name="PUT /api/account")
