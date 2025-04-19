# Your Study Buddy - AI-Powered Learning PWA 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) 
<!-- Add other relevant badges here, e.g., build status, code coverage -->
<!-- [![Build Status](https://travis-ci.org/your-username/your-repo.svg?branch=master)](https://travis-ci.org/your-username/your-repo) -->
<!-- [![Coverage Status](https://coveralls.io/repos/github/your-username/your-repo/badge.svg?branch=master)](https://coveralls.io/github/your-username/your-repo?branch=master) -->

**Your Study Buddy** is a Progressive Web App (PWA) designed to provide a personalized learning experience using AI. It helps students by generating tailored quizzes and learning paths based on their selected subjects, topics, and goals.

This project uses a Flask backend (Python) with the Google Gemini API for AI features and Firebase for authentication, database (Realtime Database), and hosting. The frontend is built with vanilla HTML, CSS, and JavaScript.

<!-- Optional: Add a screenshot or GIF of the app here -->
<!-- ![App Screenshot](link/to/your/screenshot.png) -->

## 📜 Project Planning Documents

For detailed product requirements and the initial project overview, please refer to:

*   [**Product Requirements Document (PRD)**](./memory-bank/Study%20Buddy%20Product%20Requirements%20Document.md)
*   [**Project Overview**](./memory-bank/Study_Buddy_Project_Overview.md)

## ✨ Features (MVP)

*   **🔐 User Authentication:** Secure login/signup using Firebase Authentication (Email/Password and Google Sign-In).
*   **❓ AI Quiz Generation:** Generate multiple-choice quizzes on specified subjects/topics using the Gemini API.
*   **🗺️ AI Learning Path Recommendation:** Generate personalized learning steps based on user goals and recent progress.
*   **📚 Content Library (Basic):** View pre-defined content for specific subjects/topics (fetched from Firebase RTDB).
*   **📊 Progress Tracking:** Save quiz results (score, topic, timestamp) and view past performance.
*   **📱 PWA:** Basic Progressive Web App features (manifest, service worker) for installability and potential offline use.

## 🛠️ Tech Stack

*   **Backend:** Python, Flask
*   **Frontend:** HTML, CSS, Vanilla JavaScript
*   **AI:** Google Gemini API (`gemini-1.5-flash`)
*   **Database:** Firebase Realtime Database
*   **Authentication:** Firebase Authentication
*   **Hosting:** Firebase Hosting (Frontend), Firebase Cloud Functions or other service (Backend - see Deployment)

## 📂 Project Structure

```plaintext
.
├── .firebaserc             # Firebase project config
├── firebase.json           # Firebase hosting/functions config
├── progress.md             # Manual progress tracking
├── README.md               # This file
│
├── backend/
│   ├── .env.example        # Example environment variables
│   ├── .gitignore
│   ├── main.py             # Flask application logic, API endpoints
│   ├── requirements.txt    # Python dependencies
│   └── *serviceAccountKey.json # Firebase Admin SDK key (MANUALLY ADDED & GITIGNORED)
│
├── frontend/
│   ├── css/style.css
│   ├── images/icons/       # Placeholder PWA icons
│   ├── js/app.js
│   ├── js/firebase-config.js # Placeholder Firebase web config (or config added directly in index.html)
│   ├── index.html
│   ├── manifest.json       # PWA manifest
│   └── service-worker.js   # Basic service worker
│
├── memory-bank/            # Initial planning documents
│   ├── Study Buddy Product Requirements Document.md
│   └── Study_Buddy_Project_Overview.md
│
└── docs/                   # Additional documentation (if needed)
```

## 🚀 Getting Started

### Prerequisites

*   Python 3.7+ & `pip`
*   Node.js & `npm` (Optional, for `live-server` or Firebase CLI)
*   Firebase Account ([firebase.google.com](https://firebase.google.com/))
*   Google AI / Gemini API Key ([aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))

### Setup and Installation

1.  **Clone Repository:**
    ```bash
    git clone https://github.com/rahulgupta-nitjsr/YourStudyBuddy.git # Replace if you forked
    cd YourStudyBuddy
    ```

2.  **Firebase Project Setup:**
    *   Create a project in the [Firebase Console](https://console.firebase.google.com/).
    *   Enable **Authentication** (Email/Password, Google).
    *   Enable **Realtime Database** (start in test mode initially). Note the **Database URL**.
    *   Generate a **Service Account Key** (Project Settings -> Service Accounts) and save the JSON file in `backend/` (e.g., `backend/serviceAccountKey.json`). **Ensure it's gitignored!**
    *   Register a **Web App** (Project Settings -> General -> Your Apps) and copy the `firebaseConfig` object. Note your **Project ID**.

3.  **Backend Setup (`backend/` directory):**
    *   `cd backend`
    *   Create/activate virtual environment: `python -m venv venv` then `source venv/bin/activate` (or `.\venv\Scripts\activate` on Windows).
    *   Install dependencies: `pip install -r requirements.txt`
    *   Create `.env` from `.env.example`.
    *   Edit `.env`: Add `FIREBASE_DATABASE_URL`, `GEMINI_API_KEY`, and `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` (relative path to your key file).

4.  **Frontend Setup:**
    *   Open `frontend/index.html`.
    *   Paste your copied `firebaseConfig` values into the `<script type="module">` block near the end, replacing placeholders.

5.  **Firebase CLI Setup (Recommended):**
    *   `npm install -g firebase-tools`
    *   `firebase login`
    *   Edit `.firebaserc` (root directory) and replace `your-firebase-project-id` with your actual Project ID.

6.  **Populate Content (Optional):**
    *   Add sample data to your Realtime Database under `/content/<Subject>/<Topic>` (see code comments for structure).

### Running Locally

1.  **Start Backend:**
    *   In `backend/` terminal (venv active):
      ```bash
      flask run
      # Or: python main.py
      ```
    *   API typically runs at `http://127.0.0.1:5000` or `http://127.0.0.1:8080`.

2.  **Start Frontend:**
    *   **Option A (Simple):** Open `frontend/index.html` in your browser.
    *   **Option B (Live Server):** In `frontend/` terminal: `live-server` (requires `npm install -g live-server`). Usually runs at `http://127.0.0.1:8080`.
    *   **Option C (Firebase Emulator):** In root directory terminal: `firebase emulators:start --only hosting,auth,database`. Access via Hosting URL (usually `http://localhost:5000`).

## ☁️ Deployment (Example: Firebase)

*(Refer to Firebase documentation for full details)*

1.  **Backend (Cloud Functions):**
    *   Ensure Firebase CLI setup is done.
    *   Configure `functions` section in `firebase.json` (set `source`, `runtime`).
    *   Modify `backend/main.py` for Cloud Functions environment (remove `if __name__ == '__main__'`, handle env vars, use function URL).
    *   Deploy: `firebase deploy --only functions`
    *   Update frontend API calls (`fetch` URLs in `app.js`) to use the deployed function URL.

2.  **Frontend (Firebase Hosting):**
    *   Ensure `firebase.json` has `hosting.public` set to `"frontend"`.
    *   Deploy: `firebase deploy --only hosting`

## 🌱 Future Improvements

*   Dynamic subject/topic fetching.
*   Robust offline caching via Service Worker.
*   User profiles and settings.
*   Content integration within learning paths.
*   Enhanced loading states and error feedback.
*   Automated testing (Unit, Integration).
*   Secure Firebase DB rules.
*   AI prompt refinement.
*   Accessibility improvements (WCAG compliance).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
<!-- (Add more specific contribution guidelines if desired) -->

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (You'll need to create a LICENSE file, e.g., based on the MIT template). 