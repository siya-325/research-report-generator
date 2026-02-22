# Research Report Generator

AI-powered academic paper analysis and literature review generator.

## 🎯 Overview

This application helps researchers:
- Search academic papers from multiple sources (arXiv, Semantic Scholar, PubMed)
- Generate AI-powered literature reviews
- Identify research gaps and future work
- Create living notebooks that auto-update with new research

## 🛠️ Tech Stack

**Backend:**
- Django 4.2.7
- Django REST Framework
- PostgreSQL 15
- Python 3.9+

**Frontend:** (Coming in Week 2)
- React 18
- Vite
- Tailwind CSS

## 📁 Project Structure
```
research-report-generator/
├── backend/              # Django REST API
│   ├── config/          # Django settings
│   ├── apps/            # Django apps
│   │   └── papers/     # Paper management
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/            # React app (Week 2)
    ├── src/
    └── package.json
```

## 🚀 Setup Ins Backend Setup

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/research-report-generator.git
cd research-report-generator/backend
```

**2. Create virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

**3. Install dependencies**
```bash
pip install -r requirements.txt
```

**4. Set up environment variables**
```bash
cp .env.example .env
# Edit .env and add your actual credentials
```

**5. Create PostgreSQL database**
```bash
# Connect to PostgreSQL
psql postgres

# In PostgreSQL shell:
CREATE DATABASE research_reports_db;
CREATE USER research_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE research_reports_db TO research_user;
\c research_reports_db
GRANT ALL ON SCHEMA public TO research_user;
\q
```

**6. Run migrations**
```bash
python manage.py migrate
```

**7. Create superuser**
```bash
python manage.py createsuperuser
```

**8. Run development server**
```bash
python manage.py runserver
```

**9. Visit admin panel**
```
http://localhost:8000/admin
```

## 📊 Development Progress

- [x] **Week 1:** Django + PostgreSQL setup complete
- [x] **Week 1:** Papers app created
- [ ] **Week 2:** arXiv API integration
- [ ] **Week 3:** Multi-source search (Semantic Scholar, PubMed)
- [ ] **Week 4:** AI-powered report generation
- [ ] **Week 5+:** Living notebooks and advanced features

## 🔐 Security Notes

- Never commit `.env` file (contains secrets)
- Use `.env.example` as a template
- Change `SECRET_KEY` in production
- Use strong database passwords

## 📝 Git Workflow
```bash
# Check status
git status

# Stage changes
git add .

# Commit with message
git commit -m "Descriptive commit message"

# Push to GitHub
git push
```

## 🧪 Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=apps
```

## 📄 License

Private project - All rights reserved

## 👤 Author

**Siya Choudhary**

Building this as a learning project to master full-stack development andware engineering role.
