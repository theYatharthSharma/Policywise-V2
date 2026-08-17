# 🛡️ PolicyWise

PolicyWise is a modern insurance management web application built to simplify the process of exploring, comparing, and managing insurance policies. The platform provides an intuitive interface for customers to browse policies, calculate premiums, and interact with an AI-powered chatbot for policy-related assistance.

This project follows a full-stack architecture with a React frontend, FastAPI backend, and PostgreSQL database.

---

## ✨ Features

### 👤 Customer Features
- User Registration & Login
- Browse Insurance Policies
- View Detailed Policy Information
- Premium Calculator
- AI Chatbot for Policy Assistance
- Responsive UI
- Secure Authentication

### 🤖 AI Features
- AI-powered chatbot for answering insurance-related queries
- Future-ready architecture for LLM integration (Ollama/OpenAI/Groq)

---

# 🏗️ Tech Stack

## Frontend
- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Backend
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- Alembic
- Uvicorn

## Database
- PostgreSQL

## Development Tools
- Git
- GitHub
- VS Code
- Postman

---

# 📂 Project Structure

```
policywise
│
├── policywise_backend
│   └── policywise_backend
│       ├── app
│       ├── requirements.txt
│       ├── .env
│       └── README.md
│
├── policywise_frontend_connected
│   └── policywise
│       ├── src
│       ├── public
│       ├── package.json
│       └── .env
│
└── .gitignore
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/theYatharthSharma/policywise.git

cd policywise
```

---

# 🔧 Backend Setup

Navigate to the backend folder:

```bash
cd policywise_backend/policywise_backend
```

Create Virtual Environment (Python 3.12 Recommended)

```bash
py -3.12 -m venv .venv
```

Activate Virtual Environment

Windows

```bash
.\.venv\Scripts\Activate
```

Install Dependencies

```bash
pip install -r requirements.txt
```

Run Backend

```bash
python -m uvicorn app.main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

# 💻 Frontend Setup

Navigate to frontend

```bash
cd policywise_frontend_connected/policywise
```

Install Dependencies

```bash
npm install
```

Run Development Server

```bash
npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# 🗄️ Database

Database Used

- PostgreSQL

Update the backend `.env` file with your database credentials.

Example

```env
DATABASE_URL=postgresql://policywise_user:policywise_pass@localhost:5432/policywise
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

# 🚀 Deployment

## Frontend

- Vercel

## Backend

- Render

## Database

- PostgreSQL (Neon, Render PostgreSQL, or Supabase)

---

# 📦 API Documentation

After running the backend, interactive API documentation is available at

```
http://127.0.0.1:8000/docs
```

---

# 🔮 Future Enhancements

- LIC Agent Dashboard
- Policy Purchase Workflow
- Payment Gateway Integration
- Claim Management
- AI Recommendation Engine
- RAG-based Knowledge Base
- Email & SMS Notifications
- Admin Analytics Dashboard

---

# 👨‍💻 Developer

**Yatharth Sharma**

GitHub:
https://github.com/theYatharthSharma

LinkedIn:
https://www.linkedin.com/in/yatharth-sharma-791167326/

---

# 📄 License

This project is developed for educational and demonstration purposes.

```

---

## ⭐ One recommendation

Your current repository structure is:

```
policywise/
│
├── policywise_backend/
│   └── policywise_backend/
│
└── policywise_frontend_connected/
    └── policywise/
```

This works, but it's more nested than necessary. A cleaner layout for future maintenance would be:

```
policywise/
│
├── backend/
├── frontend/
├── README.md
└── .gitignore
```

You don't need to change it now, especially since you've already pushed it to GitHub. But if you continue developing PolicyWise over the long term, reorganizing to this simpler structure will make the project easier to navigate and deploy.
