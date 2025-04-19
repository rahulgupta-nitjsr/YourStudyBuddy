# Your Study Buddy - AI-Powered Learning PWA

Your Study Buddy is a Progressive Web App (PWA) designed to provide a personalized learning experience using AI. It helps students by generating tailored quizzes and learning paths based on their selected subjects, topics, and goals.

This project uses a Flask backend (Python) with the Google Gemini API for AI features and Firebase for authentication, database (Realtime Database), and hosting. The frontend is built with vanilla HTML, CSS, and JavaScript.

## Features (MVP)

*   **User Authentication:** Secure login/signup using Firebase Authentication (Email/Password and Google Sign-In).
*   **AI Quiz Generation:** Generate multiple-choice quizzes on specified subjects/topics using the Gemini API.
*   **AI Learning Path Recommendation:** Generate personalized learning steps based on user goals and recent progress (fetched from saved quiz results).
*   **Content Library (Basic):** View pre-defined content for specific subjects/topics (fetched from Firebase RTDB).
*   **Progress Tracking:** Save quiz results (score, topic, timestamp) to Firebase RTDB and view past performance.
*   **PWA:** Basic Progressive Web App features (manifest, service worker for potential offline caching).

## Project Structure

```
.firebaserc             # Firebase project config
firebase.json           # Firebase hosting/functions config
progress.md             # Manual progress tracking
README.md               # This file

backend/
├── .env.example        # Example environment variables
├── .gitignore          # Backend gitignore
├── main.py             # Flask application logic, API endpoints
├── requirements.txt    # Python dependencies
└── *serviceAccountKey.json # Firebase Admin SDK key (MANUALLY ADDED & GITIGNORED)

frontend/
├── css/
│   └── style.css       # Frontend styling
├── images/
│   └── icons/          # Placeholder PWA icons
├── js/
│   ├── app.js          # Core frontend logic (Auth, API calls, rendering)
│   └── firebase-config.js # Placeholder for Firebase web config
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
└── service-worker.js   # Basic service worker

docs/                   # Additional documentation (if needed)
```

## Setup and Installation

**Prerequisites:**

*   Python 3.7+
*   `pip` (Python package installer)
*   Node.js and `npm` (Optional, only if you want to use a local dev server like `live-server`)
*   Firebase Account ([https://firebase.google.com/](https://firebase.google.com/))
*   Google AI / Gemini API Key ([https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))

**Steps:**

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd your-study-buddy
    ```

2.  **Firebase Project Setup:**
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Create a new Firebase project.
    *   **Authentication:** Navigate to Authentication -> Sign-in method. Enable "Email/Password" and "Google" providers.
    *   **Realtime Database:** Navigate to Realtime Database -> Create database. Start in **test mode** for initial development (remember to configure security rules for production!). Copy the Database URL (e.g., `https://your-project-id-default-rtdb.firebaseio.com`).
    *   **Service Account Key:** Go to Project settings (gear icon) -> Service accounts. Click "Generate new private key" and save the downloaded JSON file securely inside the `backend/` directory (e.g., `backend/serviceAccountKey.json`). **Ensure this file name is added to `backend/.gitignore` if it isn't already!**
    *   **Web App Config:** Go to Project settings -> General. Scroll down to "Your apps". Click the Web icon (`</>`) to register a web app. Give it a nickname and copy the `firebaseConfig` object provided.
    *   **Project ID:** Note your Firebase Project ID (found in Project settings).

3.  **Backend Setup:**
    *   Navigate to the `backend` directory: `cd backend`
    *   Create and activate a Python virtual environment:
        ```bash
        python -m venv venv
        # Windows
        .\venv\Scripts\activate
        # macOS/Linux
        source venv/bin/activate
        ```
    *   Install dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    *   Create a `.env` file by copying `.env.example`: `cp .env.example .env` (or manually create `backend/.env`).
    *   Edit the `.env` file:
        *   Set `FIREBASE_DATABASE_URL` to your Firebase Realtime Database URL.
        *   Set `GEMINI_API_KEY` to your Google AI / Gemini API key.
        *   Add `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` pointing to the relative path of your downloaded service account key file (e.g., `FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./serviceAccountKey.json`).

4.  **Frontend Setup:**
    *   Navigate to the `frontend` directory: `cd ../frontend` (from `backend`)
    *   Open `frontend/index.html` in a text editor.
    *   Find the `<script type="module">` block near the end.
    *   Replace the placeholder `firebaseConfig` values with the actual configuration object you copied from the Firebase console.

5.  **Firebase CLI (Optional but Recommended):**
    *   Install the Firebase CLI: `npm install -g firebase-tools`
    *   Log in: `firebase login`
    *   Update `.firebaserc` (in the project root) with your Firebase Project ID, replacing `your-firebase-project-id`.

6.  **Populate Initial Content (Optional):**
    *   Go to your Firebase Realtime Database in the console.
    *   Manually add data under the `/content` node following the example structure shown in the comments within `frontend/js/app.js` or `backend/main.py` (`/content/<Subject>/<Topic> = { title: "...", text: "...", resources: [...] }`).

## Running the Application

1.  **Run the Backend (Flask Server):**
    *   Open a terminal in the `backend` directory.
    *   Ensure your virtual environment is activated.
    *   Run the Flask development server:
        ```bash
        flask run
        # Or using python directly:
        # python main.py
        ```
    *   The backend API should now be running, typically on `http://127.0.0.1:5000` (or the port specified, like 8080, if running `main.py` directly).

2.  **Run the Frontend:**
    *   **Option A (Simple):** Open the `frontend/index.html` file directly in your web browser.
    *   **Option B (Using a Local Server):** This is recommended to avoid potential CORS issues if the backend API runs on a different port.
        *   Install `live-server` (if you haven't already): `npm install -g live-server`
        *   Navigate to the `frontend` directory in your terminal.
        *   Run `live-server`:
            ```bash
            live-server
            ```
        *   This will open the frontend in your browser, usually at `http://127.0.0.1:8080`.
    *   **Option C (Firebase Local Emulator - Recommended for Full Testing):**
        *   Ensure Firebase CLI is installed and configured (`.firebaserc` updated).
        *   In the project root directory, run:
            ```bash
            firebase emulators:start --only hosting,auth,database
            ```
        *   This will start emulators for Hosting, Auth, and Database. Access the frontend via the Hosting URL provided (usually `http://localhost:5000`). The Emulator UI (usually `http://localhost:4000`) allows you to inspect Auth users and Database contents.

## Deployment (Firebase Hosting & Cloud Functions - Example)

*This provides basic instructions. Refer to Firebase documentation for details.* 

1.  **Backend (Cloud Functions):**
    *   Ensure Firebase CLI is installed and logged in (`firebase login`).
    *   Make sure your project ID is set in `.firebaserc`.
    *   Uncomment or add the `functions` section in `firebase.json`:
        ```json
        {
          "functions": {
            "source": "backend",
            "runtime": "python311" // Or python310, python312 etc.
          },
          "hosting": { ... } 
        }
        ```
    *   Modify `backend/main.py`:
        *   Remove the `if __name__ == '__main__':` block.
        *   You might need to adjust how environment variables (especially the service key) are handled for Cloud Functions (e.g., using runtime environment variables instead of a `.env` file).
        *   Ensure API endpoints don't rely on `127.0.0.1`.
    *   Deploy functions:
        ```bash
        firebase deploy --only functions
        ```
    *   Update frontend API calls in `frontend/js/app.js` to use the deployed function URL instead of relative paths like `/api/quiz`.

2.  **Frontend (Firebase Hosting):**
    *   Ensure `firebase.json` has the correct `"public": "frontend"` setting.
    *   Deploy the frontend:
        ```bash
        firebase deploy --only hosting
        ```

## Future Improvements / TODOs

*   Fetch subject/topic lists dynamically from the database instead of hardcoding.
*   Improve Service Worker for robust offline caching.
*   Add more sophisticated user profile features.
*   Integrate content viewing directly into learning path steps.
*   Implement better loading states and user feedback.
*   Add unit and integration tests.
*   Secure Firebase Realtime Database rules.
*   Refine AI prompts for better results and error handling.
*   Improve accessibility. 