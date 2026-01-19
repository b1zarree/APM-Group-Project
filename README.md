# Agile Kanban Board Project

## Project Description
This repository contains a Single Page Application (SPA) developed for the Agile Project Management course. The project implements the Kanban methodology to provide a simple, visual task management tool.

The application allows users to create tasks, organize them across columns (To Do, In Progress, Done), and manage their workflow. Task movement is handled via action buttons ("Start", "Complete"), and all data is saved server-side using a local JSON database to ensure persistence.

## Core Features
* **Visual Board:** A standard three-column layout to track task progress.
* **Task Movement:** Users move tasks between stages using "Start" and "Complete" buttons.
* **Data Persistence:** Tasks are stored in a local JSON file on the backend.
* **CRUD Operations:** Users can create new tasks, view them, update their status, and delete them.
* **Responsive Interface:** Works on standard web browsers without complex installation.

## Technical Stack
* **Backend:** Python, FastAPI, Uvicorn
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Database:** Local JSON storage
* **Documentation:** Swagger UI (OpenAPI)
* **Project Management:** GitHub Projects

## How to Run
Follow the steps below to run the project locally.

### 1. Clone the Repository
''bash
git clone <YOUR_REPOSITORY_LINK_HERE>
cd <YOUR_PROJECT_FOLDER> 

### 2. Backend Activation
''bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

### 3. Start the Server 
''bash
python -m uvicorn main:app --reload

###  4. Run the Frontend
Since this is a static Single Page Application (SPA), no separate frontend server is required.

Navigate to the frontend folder inside the project directory.

Double-click the index.html file to open it in your web browser (Chrome or Edge recommended).

The application will automatically connect to the running backend API.
