# 🛡️ PolicyWise

**PolicyWise** is a full-stack insurance management platform designed to simplify how customers explore, understand, and manage insurance policies.

The platform provides customers with a centralized interface to browse available policies, view policy details, calculate premiums, and get assistance through an AI-powered chatbot.

The project is built using a **React + TypeScript frontend**, **FastAPI backend**, and **PostgreSQL database**, with a modular architecture designed for future AI, agent, and policy-management capabilities.

---

## ✨ Features

### 👤 Customer Features

* 🔐 User registration and authentication
* 🔑 Secure JWT-based login
* 📋 Browse available insurance policies
* 📄 View detailed policy information
* 🧮 Premium calculation
* 🤖 AI-powered policy assistance
* 📱 Responsive user interface
* 👨‍💼 Connect with insurance agents for assistance

### 🤖 AI Features

* AI-powered chatbot for insurance-related queries
* Architecture prepared for LLM integration
* Support planned for local and cloud-based models such as:

  * Ollama
  * OpenAI
  * Groq
* Future support for RAG-based insurance knowledge retrieval

### 🔮 Planned Features

* 👨‍💼 LIC Agent Dashboard
* 🛒 Policy purchase workflow
* 💳 Payment gateway integration
* 📑 Claim management
* 🧠 AI-based policy recommendation
* 📚 RAG-powered insurance knowledge base
* 📧 Email and SMS notifications
* 📊 Admin analytics dashboard

---

# 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      Customer       │
                    │   Web Application   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │ TypeScript + Vite   │
                    └──────────┬──────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    │                     │
                    │ Authentication      │
                    │ Policy Management   │
                    │ Premium Calculator  │
                    │ AI Integration      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │      Database       │
                    └─────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios

## Backend

* Python 3.12
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* Alembic
* Uvicorn

## Database

* PostgreSQL

## AI / LLM

The architecture is designed to support:

* Ollama
* OpenAI
* Groq
* RAG pipelines
* Vector databases

## Development Tools

* Git
* GitHub
* VS Code
* Postman
* PostgreSQL / pgAdmin

---

# 📂 Project Structure

The repository follows a clean full-stack structure:

```text
PolicyWise/
│
├── backend/
│   ├── app/
│   │   ├── ...
│   │
│   ├── requirements.txt
│   ├── .env
│   └── .venv/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

> `.venv`, `node_modules`, and environment files are excluded from Git through `.gitignore`.

---

# ⚙️ Local Development Setup

## Prerequisites

Make sure you have the following installed:

* Python **3.12**
* Node.js
* npm
* PostgreSQL
* Git

---

# 🔧 Backend Setup

### 1. Navigate to the backend

```bash
cd backend
```

### 2. Create a Python 3.12 virtual environment

Windows:

```powershell
py -3.12 -m venv .venv
```

### 3. Activate the virtual environment

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

You should see:

```text
(.venv)
```

in your terminal.

### 4. Verify Python

```powershell
python --version
```

Expected:

```text
Python 3.12.x
```

### 5. Install dependencies

```powershell
pip install -r requirements.txt
```

### 6. Configure environment variables

Create a `.env` file inside the `backend` directory.

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/policywise

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30
```

> Never commit your actual `.env` file or database credentials to GitHub.

### 7. Start the backend

From the `backend` directory:

```powershell
uvicorn app.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

### 8. Open API documentation

FastAPI Swagger UI:

```text
http://127.0.0.1:8000/docs
```

Alternative ReDoc documentation:

```text
http://127.0.0.1:8000/redoc
```

---

# 💻 Frontend Setup

Open a new terminal.

### 1. Navigate to frontend

From the project root:

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🗄️ Database Setup

PolicyWise uses **PostgreSQL** for persistent application data.

Create a PostgreSQL database:

```sql
CREATE DATABASE policywise;
```

Then configure the connection inside:

```text
backend/.env
```

Example:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/policywise
```

Database migrations are handled using **Alembic**.

If migrations are configured in the project, run:

```powershell
cd backend
alembic upgrade head
```

---

# 🔐 Authentication

PolicyWise uses JWT-based authentication for protected API endpoints.

The authentication flow is:

```text
User
 │
 ▼
Registration / Login
 │
 ▼
FastAPI Authentication API
 │
 ▼
Password Verification
 │
 ▼
JWT Access Token
 │
 ▼
Authenticated API Requests
```

Sensitive credentials and secrets should always be stored in environment variables rather than committed to source control.

---

# 🤖 AI Integration

The PolicyWise AI layer is designed to provide insurance-related assistance through a conversational interface.

The planned architecture allows integration with multiple LLM providers:

```text
                    User
                      │
                      ▼
                AI Chatbot UI
                      │
                      ▼
                FastAPI Backend
                      │
              ┌───────┴────────┐
              ▼                ▼
        Knowledge Base       LLM
              │                │
              ▼                ▼
             RAG          Ollama / OpenAI /
                          Groq / Other LLM
```

Future iterations can introduce:

* Embedding models
* Vector databases
* Retrieval-Augmented Generation (RAG)
* Policy document ingestion
* Semantic search
* Context-aware recommendations

---

# 🚀 Deployment

The application can be deployed using:

### Frontend

* Vercel

### Backend

* Render
* Railway
* AWS
* Other Python-compatible cloud platforms

### Database

* PostgreSQL
* Neon
* Supabase
* Render PostgreSQL

Deployment configuration may vary depending on the selected infrastructure.

---

# 🧪 Development Workflow

Recommended workflow:

```bash
# Pull latest changes
git pull

# Create/activate backend environment
cd backend
.\.venv\Scripts\Activate.ps1

# Run backend
uvicorn app.main:app --reload
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

---

# 🔄 Git Workflow

Create a feature branch before making significant changes:

```bash
git checkout -b feature/your-feature
```

After completing the feature:

```bash
git add .
git commit -m "Add your feature"
git push -u origin feature/your-feature
```

Then create a Pull Request on GitHub.

For small personal changes, you can work directly on `main` if the repository workflow allows it.

---

# 🔒 Environment & Security

The following files/directories should **not** be committed:

```text
.env
.env.*
backend/.venv/
frontend/node_modules/
frontend/dist/
__pycache__/
*.pyc
```

Never commit:

* Database passwords
* JWT secret keys
* API keys
* LLM provider credentials
* Access tokens
* Private credentials

Use `.env.example` to document required environment variables without exposing their values.

---

# 📌 Current Project Status

**Status:** Active Development

PolicyWise currently focuses on the core insurance customer experience:

* User authentication
* Policy browsing
* Policy information
* Premium calculation
* AI chatbot foundation
* Full-stack React + FastAPI architecture
* PostgreSQL database integration

The architecture is being expanded toward a more complete insurance-management platform with dedicated agent workflows and AI-powered capabilities.

---

# 🗺️ Roadmap

### Phase 1 — Core Platform

* [x] React frontend
* [x] FastAPI backend
* [x] PostgreSQL integration
* [x] Authentication
* [x] Policy browsing
* [x] Premium calculator
* [x] Basic AI chatbot interface

### Phase 2 — Agent Platform

* [ ] Agent authentication
* [ ] Agent dashboard
* [ ] Customer management
* [ ] Policy management
* [ ] Lead management
* [ ] Agent-customer communication
* [ ] Agent analytics

### Phase 3 — AI Platform

* [ ] LLM integration
* [ ] Insurance knowledge base
* [ ] RAG pipeline
* [ ] Policy recommendation engine
* [ ] Intelligent document processing
* [ ] AI-assisted agent workflows

### Phase 4 — Insurance Operations

* [ ] Policy purchase workflow
* [ ] Payment integration
* [ ] Claim management
* [ ] Notifications
* [ ] Administrative dashboard
* [ ] Advanced analytics

---

# 👨‍💻 Developer

**Yatharth Sharma**

B.Tech IT | AI/ML & Software Development

GitHub:
https://github.com/theYatharthSharma

LinkedIn:
https://www.linkedin.com/in/yatharth-sharma-791167326/

---

# 📄 License

This project is currently developed for **educational, demonstration, and development purposes**.

---

## ⭐ PolicyWise

> Making insurance simpler, smarter, and easier to understand.
