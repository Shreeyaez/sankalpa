# SETUP STEPS
**Pre Requirement**
Set python version == 3.11
`python --version`
If not 3.11 install python 3.11

**Initial Setup (once)**
`python -m venv .venv`
`.venv\Scripts\activate`
`pip install requirements.txt`
`python manage.py makemigrations`
`python manage.py migrate`
`python manage.py runserver`

**Run (always)**
`.venv\Scripts\activate`
`python manage.py runserver`

# 📘 Project Monitoring System – Backend API Documentation

**Base URL (Development)**

```
http://localhost:8000/api/
```

**Authentication Type**

* Session-based authentication (cookies)
* Login required for all endpoints except `register` and `login`

---

## 🔐 AUTHENTICATION – `accounts`
1️⃣ First call (before login or POST)
GET /api/accounts/csrf/


Response:

{"detail":"CSRF cookie set"}


Browser also receives csrftoken cookie.

2️⃣ Send CSRF token in headers

For every POST / PUT / DELETE:

fetch(url, {
  method: "POST",
  credentials: "include",
  headers: {
    "X-CSRFToken": csrfToken,
    "Content-Type": "application/json"
  }
})

### Register User

```
POST /accounts/register/
```

**Request Body**

```json
{
  "user_id": "eng001",
  "full_name": "Ram Sharma",
  "email": "ram@example.com",
  "password": "StrongPass123",
  "role": "USER"
}
```

**Response – 201 CREATED**

```json
{
  "id": 1,
  "user_id": "eng001",
  "full_name": "Ram Sharma",
  "email": "ram@example.com",
  "role": "USER",
  "is_active": true,
  "created_at": "2026-02-07T10:20:30Z"
}
```

---

### Login

```
POST /auth/login/
```

**Request**

```json
{
  "email": "ram@example.com",
  "password": "StrongPass123"
}
```

**Response – 200 OK**

```json
{
  "id": 1,
  "user_id": "eng001",
  "full_name": "Ram Sharma",
  "email": "ram@example.com",
  "role": "USER",
  "is_active": true
}
```

---

### Get Current User

```
GET /auth/me/
```

**Response – 200 OK**

```json
{
  "id": 1,
  "user_id": "eng001",
  "full_name": "Ram Sharma",
  "email": "ram@example.com",
  "role": "USER"
}
```

---

### Logout

```
POST /auth/logout/
```

**Response**

```json
{ "detail": "Successfully logged out" }
```

---

## 📚 LOOKUPS – `lookups`

### Priority Levels

```
GET /lookups/priority-levels/
POST /lookups/priority-levels/
```

**Example Response**

```json
[
  { "id": 1, "name": "High" },
  { "id": 2, "name": "Medium" }
]
```

---

### Project Types

```
GET /lookups/project-types/
```

---

### Road Types

```
GET /lookups/road-types/
```

---

### Delay Types

```
GET /lookups/delay-types/
```

---

### Alert Types

```
GET /lookups/alert-types/
```

---

### Budget Sources

```
GET /lookups/budget-sources/
```

---

### Fiscal Years

```
GET /lookups/fiscal-years/
```

**Response**

```json
{ "id": 1, "year_label": "2081/82" }
```

---

## 📍 LOCATIONS – `locations`

### Locations

```
GET /locations/location/
POST /locations/location/
```

**Request**

```json
{
  "place_or_street": "New Road Chowk"
}
```

**Response**

```json
{
  "id": 1,
  "ward_no": 16,
  "municipality": "Kathmandu",
  "district": "Kathmandu",
  "province": "Bagmati",
  "place_or_street": "New Road Chowk"
}
```

---

## 👷 ENGINEERS – `engineers`

### Engineers

```
GET /engineers/engineer/
POST /engineers/engineer/
```

**Request**

```json
{
  "account": 1,
  "ward_no": 16,
  "role": "ENGINEER"
}
```

---

## 🪑 CHAIRPERSONS – `chairpersons`

### Chairpersons

```
GET /chairpersons/chairperson/
POST /chairpersons/chairperson/
```

**Request**

```json
{
  "account": 2,
  "term_start": "2025-01-01",
  "term_end": "2029-12-31"
}
```

---

## 🏗️ CONTRACTORS – `contractors`

### Contractors

```
GET /contractors/contractor/
POST /contractors/contractor/
```

**Request**

```json
{
    "contractor_name": "",
    "address": "",
    "registration_no": "",
    "latest_renewal_date": null,
    "email": "",
    "contractor_type": null,
    "pan_vat_no": "",
    "contact_number": "",
    "company_name": "",
    "company_phone": "",
    "company_email": "",
    "company_address": "",
    "municipality": "",
    "district": "",
    "registration_certificate": null,
    "pan_vat_certificate": null,
    "suchidarta_flagged": false,
    "is_active": false
}
```

---

## 📂 PROJECTS – `projects`

### Projects

```
GET /projects/project/
POST /projects/project/
```

**Request**

```json
{
  "project_code": "RD-001",
  "project_name": "Ward 16 Road Upgrade",
  "priority": 1,
  "project_type": 1,
  "location": 1,
  "budget_source": 1,
  "fiscal_year": 1,
  "assigned_engineer": 1,
  "chairperson": 1,
  "contractor": 1,
  "planned_start_date": "2026-01-01",
  "planned_completion_date": "2026-06-01",
  "planned_duration_days": 150
}
```

---

## 🛣️ ROADS – `roads`

### Road Details

```
GET /roads/road/
POST /roads/road/
```

**Request**

```json
{
  "project": 1,
  "road_length_km": 2.5,
  "road_width_m": 6.0,
  "road_type": 1
}
```

---

## 🎯 MILESTONES – `milestones`

### Milestones

```
GET /milestones/milestone/
POST /milestones/milestone/
```

**Request**

```json
{
  "project": 1,
  "milestone_name": "Base Layer Completion",
  "milestone_order": 1,
  "weight": 25.0,
  "planned_start_date": "2026-01-05",
  "planned_end_date": "2026-02-10",
  "is_critical_path": true
}
```

---

## 📅 WEEKLY LOGS – `logs`

### Weekly Logs

```
GET /logs/weekly-logs/
POST /logs/weekly-logs/
```

**Request**

```json
{
  "project": 1,
  "log_date": "2026-02-01",
  "milestone": 1,
  "weather_conditions": "Sunny",
  "crew_size": 15,
  "equipment_used": "Roller, Excavator",
  "work_progress_detail": "Base preparation completed",
  "area_completed": "500m stretch",
  "next_week_plan": "Asphalt layering",
  "log_photo": "sample photo file",
  "created_by": 1
}
```

---

### Delay Logs

```
GET /logs/delay-logs/
POST /logs/delay-logs/
```

```json
{
  "project": 1,
  "log_date": "2026-02-05",
  "delay_type": 1,
  "delay_description": "Heavy rainfall",
  "actions_taken": "Work rescheduled",
  "reported_by": 1
}
```

---

## 🔔 ALERTS – `alerts`

### Alerts

```
GET /alerts/alerts/
```

**Response**

```json
{
  "id": 1,
  "alert_type": 2,
  "project": 1,
  "message": "Milestone completed",
  "is_read": false,
  "created_at": "2026-02-07T10:45:00Z"
}
```

---

## 🧾 AUDIT LOGS – `audit`

### Audit Logs (Read-only)

```
GET /audit/audit-log/
```

**Response**

```json
{
  "table_name": "projects",
  "record_id": 1,
  "action": "UPDATE",
  "old_data": "{...}",
  "new_data": "{...}",
  "changed_by": 1,
  "changed_at": "2026-02-07T11:00:00Z"
}
```

---

## 🔒 Permissions Summary (Current)

| Role               | Access          |
| ------------------ | --------------- |
| Unauthenticated    | Register, Login |
| Authenticated USER | All CRUD        |
| ADMIN              | Same (for now)  |


