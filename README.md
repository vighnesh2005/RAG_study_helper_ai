# 📘 RAG Study Helper AI

A full-stack application designed to assist with studying by using **Retrieval-Augmented Generation (RAG)** to answer questions based on your documents.

---

## 🧠 Overview

**RAG Study Helper AI** is an AI-powered study assistant that allows users to upload their study materials — such as lecture notes, textbooks, or articles — and then ask questions about the content.
The backend uses a **Retrieval-Augmented Generation (RAG)** pipeline to search for the most relevant information within your uploaded documents and generate accurate, context-aware answers.

This repository includes:

* A **Python backend** handling the AI logic.
* A **TypeScript-based frontend** providing an intuitive and interactive user interface.

---

## ✨ Features

* **AI-Powered Q&A:** Chat with an AI that has direct access to your study materials.
* **Document-Grounded Answers:** Receive responses sourced directly from your uploaded content.
* **Full-Stack Application:** Combines a modern web frontend with a robust Python backend.

---

## 🧮 Tech Stack

**Backend:** Python (Flask or FastAPI)
**Frontend:** TypeScript, HTML, CSS (React, Angular, or Vue.js)
**AI Core:** Retrieval-Augmented Generation (RAG) architecture

---

## ⚙️ Installation and Setup

To run this project locally, you’ll need to configure both the backend and the frontend.

### 🗾 Prerequisites

* Python **3.8+**
* Node.js and **npm**

---

### 🔧 1. Backend Setup (Python)

The backend is managed by the `python.py` script and other files in the `/backend` directory.

#### Clone the Repository

```bash
git clone https://github.com/vighnesh2005/RAG_study_helper_ai.git
cd RAG_study_helper_ai
```

#### Create and Activate a Virtual Environment

```bash
# For macOS/Linux
python3 -m venv venv
source venv/bin/activate

# For Windows
python -m venv venv
.\venv\Scripts\activate
```

#### Install Python Dependencies

> ⚠️ The repository currently includes a `requirements.docx` file.
> Convert it to `requirements.txt` first.

Once converted:

```bash
pip install -r requirements.txt
```

#### Run the Backend Server

> 🛠️ **TODO:** Add the correct command to run the Python server (e.g.):

```bash
flask run
# or
uvicorn python:app --reload
# or
python python.py
```

Once running, the backend will typically be available at:
👉 `http://127.0.0.1:8000`

---

### 💻 2. Frontend Setup (TypeScript)

The frontend code resides in the `/frontend` directory.

#### Navigate to Frontend Directory

```bash
cd frontend
```

#### Install Dependencies

```bash
npm install
```

#### Start the Frontend Development Server

> 🛠️ **TODO:** Confirm the start command in your `package.json`.
> Most common commands:

```bash
npm start
# or
npm run dev
# or
npm run serve
```

Once the frontend is running, open your browser and visit:
👉 `http://localhost:3000` or `http://localhost:5173`

---

## 🚀 Usage

> 🛠️ **TODO:** Add detailed usage instructions.

* How can users upload documents?
* How do users ask questions?
* Include example prompts for better understanding.

---

## 🤝 Contributing

Contributions are welcome!
If you have ideas for improvements, please open an issue or submit a pull request.

**To contribute:**

1. Fork the repository
2. Create a new branch

   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. Make your changes
4. Commit your updates

   ```bash
   git commit -m "Add some amazing feature"
   ```
5. Push to your branch

   ```bash
   git push origin feature/YourFeatureName
   ```
6. Open a Pull Request

---

## 🟞️ Roadmap

* [ ] Convert `requirements.docx` → `requirements.txt` for easier dependency management
* [ ] Add `.env.example` for environment variable configuration
* [ ] Implement Docker support (`Dockerfile`, `docker-compose.yml`) for simplified setup and deployment

---

## 📄 License

This project is open-source and available under the **MIT License**.

d feedback are always welcome!
