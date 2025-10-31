RAG Study Helper AI

A full-stack application designed to assist with studying by using Retrieval-Augmented Generation (RAG) to answer questions based on your documents.

Overview

This project is an AI-powered study helper. It allows users to upload their study materials (like lecture notes, textbooks, or articles) and then ask questions about the content. The AI backend uses Retrieval-Augmented Generation (RAG) to find the most relevant information from the documents and generate accurate, context-aware answers.

This repository contains the code for both the Python backend that handles the AI logic and the TypeScript-based frontend for the user interface.

Features

AI-Powered Q&A: Chat with an AI that has access to your study materials.

Document-Grounded Answers: Get responses that are based directly on the information in your uploaded documents.

Full-Stack Application: Includes a modern web interface and a robust Python backend.

Tech Stack

Backend: Python (likely using frameworks like Flask or FastAPI)

Frontend: TypeScript, CSS, HTML (likely using a framework like React, Angular, or Vue.js)

AI: Retrieval-Augmented Generation (RAG) model

Installation and Setup

To get this project running locally, you'll need to set up both the backend and the frontend.

Prerequisites

Python 3.8+

Node.js and npm

1. Backend Setup (Python)

The backend is handled by the Python script (python.py) and files in the /backend directory.

Clone the repository:

git clone [https://github.com/vighnesh2005/RAG_study_helper_ai.git](https://github.com/vighnesh2005/RAG_study_helper_ai.git)
cd RAG_study_helper_ai


Create and activate a virtual environment:

# For macOS/Linux
python3 -m venv venv
source venv/bin/activate

# For Windows
python -m venv venv
.\venv\Scripts\activate


Install Python dependencies:
[TODO]: The repository currently has a requirements.docx file. This needs to be converted to a requirements.txt file. Once converted, the command should be:

pip install -r requirements.txt


Run the backend server:
[TODO]: Please add the command to run the Python server. (e.g., flask run, uvicorn python:app --reload, or python python.py).

# [TODO: Add backend run command here]


The backend should now be running, typically on a port like http://127.0.0.1:8000.

2. Frontend Setup (TypeScript)

The frontend code is located in the /frontend directory.

Navigate to the frontend directory:

# From the root directory
cd frontend


Install Node.js dependencies:

npm install


Start the frontend development server:
[TODO]: Please verify the start script in your package.json. The most common command is:

npm start


(Other possibilities: npm run dev or npm run serve)

Open the app:
Once the server is running, open your browser and navigate to the URL provided (e.g., http://localhost:3000 or http://localhost:5173).

Usage

[TODO]: Add instructions on how to use the application.

How does a user upload documents?

How do they ask questions?

Are there any example prompts?

Contributing

Contributions are welcome! If you have suggestions for improvements, please open an issue or submit a pull request.

Fork the repository.

Create a new branch (git checkout -b feature/YourFeatureName).

Make your changes.

Commit your changes (git commit -m 'Add some amazing feature').

Push to the branch (git push origin feature/YourFeatureName).

Open a Pull Request.

Roadmap

Convert requirements.docx to requirements.txt: This is essential for making the project easy to install for other developers.

Add Environment Variable Support: Create a .env.example file for API keys or database URLs.

Add Docker support: Create a Dockerfile and docker-compose.yml for easier setup and deployment.
