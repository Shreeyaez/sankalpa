# 📁Road Project Monitoring System

A full-stack web application for managing infrastructure and construction projects — tracking contractors, engineers, chairpersons, delay logs, measurements, materials, and more. Built for municipal-level project oversight with role-based access control and Nepali language support.

---

## ✨ Features

### 📊 Dashboard
- At-a-glance summary of all projects by status
- Quick stats for ongoing, delayed, completed, and cancelled projects

### 📁 Road Project Management
- Create, edit, and cancel projects with full detail tracking
- Filter projects by status: Coming Soon, Ongoing, Delayed, Completed, Cancelled
- Search across project name, code, location, contractor, engineer, and chairperson
- View per-project pages with tabs for Overview, Measurements, Abstract, Materials, Gantt, and Weekly Logs

### ⏱ Delay Logs
- Standalone delay log listing across all projects
- Per-project delay log view with stats (Total, Resolved, Ongoing/Critical)
- Add, edit, and delete delay logs with delay type, estimated days, progress, and status tracking

### 🏗 Contractors
- Full contractor registry with company info, PAN/VAT, registration certificates
- Nepal-specific location picker (District → Municipality → Ward) for contractor and company address
- Suchidarta approval status tracking
- Search by name, company, type, or contact

### 👷 Engineers & Chairpersons
- Manage assigned engineers and chairpersons per project
- View detailed profiles

### 🔐 Role-Based Access Control
- **Admin / Engineer**: full read-write access
- **Chairperson**: read-only view (no add/edit/delete)

### 🌐 Internationalisation
- Nepali and English language support via `react-i18next`

### 📅 Nepali Date Support
- BS (Bikram Sambat) date picker for date fields

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| react-i18next | Internationalisation |
| Axios | API communication |
| Recharts | Charts and Gantt view |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.x | Language |
| Django 4.x | Web framework |
| Django REST Framework | REST API |
| SQLite / PostgreSQL | Database |
| Django CORS Headers | CORS handling |

### Deployment
| Layer | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Local server |

---

## 🖥 UI Overview

### Projects List
Displays all projects in a table with status filter tabs and a live search bar. Each row shows the project code, name, location, assigned contractor, engineer, chairperson, and status badge. Admins and engineers see Edit and Cancel action buttons; chairpersons see View only.

### Project Detail
A tabbed layout per project covering:
- **Overview** — key project metadata and timeline
- **Measurement** — measurement entries and records
- **Abstract** — cost abstracts
- **Materials** — material tracking
- **Gantt** — visual timeline
- **Weekly Logs** — week-by-week progress

### Delay Logs
A dedicated section accessible from the sidebar showing all delay logs across every project. Each entry captures the delay type, estimated delay in days, current progress percentage, description, corrective actions taken, schedule impact, and resolution status (Ongoing / Critical / Resolved).

### Contractors
A searchable list of contractors with company details and Suchidarta approval status. The Add/Edit form includes cascading Nepal location dropdowns (District → Municipality → Ward) that build a structured address string automatically.

### Sidebar Navigation
Collapsible sidebar with sections for Dashboard, Projects, Contractors, Delay Logs, Past Records, Audit Trail, and Officials (Engineers, Chairpersons). The Delay Logs item shows a red badge count for delayed projects missing documentation.

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- pip
- Git

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

### 2. Backend Setup (Django)

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

**Configure environment:**

Create a `.env` file in the `backend/` directory:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-app.vercel.app
DATABASE_URL=sqlite:///db.sqlite3
```

**Run migrations and start the server:**

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The backend will be available at `http://localhost:8000`.

---

### 3. Frontend Setup (React)

```bash
cd frontend
npm install
```

**Configure environment:**

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

**Start the development server:**

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

### 4. Deploying the Frontend to Vercel

1. Push your frontend code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Set the **Root Directory** to `frontend/` (if monorepo)
4. Add the environment variable:
   ```
   VITE_API_BASE_URL=http://your-local-backend-ip:8000
   ```
5. Click **Deploy**

> **Note:** Since the backend is hosted locally, you'll need to expose it over a public URL for the Vercel-hosted frontend to reach it. Tools like [ngrok](https://ngrok.com) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) can help during development.

---

### 5. Admin Panel

Django's built-in admin is available at:

```
http://localhost:8000/admin
```

Log in with the superuser credentials you created above.

---

## 📂 Project Structure

```
project-root/
├── backend/                  # Django project
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/               # Settings, URLs, WSGI
│   └── apps/
│       ├── projects/
│       ├── contractors/
│       ├── engineers/
│       ├── delay_logs/
│       └── auth/
│
└── frontend/                 # React project
    ├── public/
    ├── src/
    │   ├── api/              # Axios API clients
    │   ├── auth/             # Auth guards and login
    │   ├── components/       # Shared components (Sidebar, Topbar, etc.)
    │   ├── constants/        # Role definitions
    │   ├── context/          # AuthContext
    │   ├── data/             # Static data (Nepal geo)
    │   ├── pages/
    │   │   ├── projects/
    │   │   ├── contractors/
    │   │   ├── engineers/
    │   │   ├── chairpersons/
    │   │   └── delay/
    │   └── i18n/             # Translation files
    ├── .env
    └── vite.config.js
```

---

## 📝 License

This project is intended for internal municipal use. All rights reserved.
