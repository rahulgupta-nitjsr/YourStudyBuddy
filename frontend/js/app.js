// Basic App Logic & Service Worker Registration

// --- DOM Elements ---
// const authButton = document.getElementById('auth-button'); // Removed
// const authModal = document.getElementById('auth-modal'); // Removed
// const closeModalButton = document.querySelector('.close-button'); // Removed
// const emailInput = document.getElementById('email'); // Removed
// const passwordInput = document.getElementById('password'); // Removed
// const emailSignInButton = document.getElementById('email-signin-button'); // Removed
// const emailSignUpButton = document.getElementById('email-signup-button'); // Removed
// const googleSignInButton = document.getElementById('google-signin-button'); // Removed
// const authErrorElement = document.getElementById('auth-error'); // Removed
// const userInfoElement = document.getElementById('user-info'); // Removed
const appContentElement = document.getElementById('app-content');
// const loggedOutView = document.getElementById('logged-out-view'); // Renamed/Replaced
// const loggedInView = document.getElementById('loggedInView'); // Renamed/Replaced

// --- New Name Entry Elements (Add these IDs to index.html) ---
const nameEntryView = document.getElementById('name-entry-view');
const nameInput = document.getElementById('name-input');
const startButton = document.getElementById('start-button');
const welcomeMessageElement = document.getElementById('welcome-message'); // Element to show "Welcome, [Name]!"
const mainAppView = document.getElementById('main-app-view'); // Container for the main app features

// Quiz Generator Elements
const subjectSelect = document.getElementById('subject');
const topicInput = document.getElementById('topic');
const difficultySelect = document.getElementById('difficulty');
const generateQuizButton = document.getElementById('generate-quiz-btn');

// Quiz Display Elements
const quizDisplaySection = document.getElementById('quiz-display');
const quizDetailsElement = document.getElementById('quiz-details');
const quizQuestionsElement = document.getElementById('quiz-questions');
const submitQuizButton = document.getElementById('submit-quiz-btn');
const quizResultsElement = document.getElementById('quiz-results');

// Learning Path Generator Elements
const lpSubjectSelect = document.getElementById('lp-subject');
const lpGoalInput = document.getElementById('lp-goal');
const generateLpButton = document.getElementById('generate-lp-btn');

// Learning Path Display Elements
const lpDisplaySection = document.getElementById('learning-path-display');
const lpDetailsElement = document.getElementById('lp-details');
const lpStepsElement = document.getElementById('lp-steps');

// Content Library Elements
const contentSubjectSelect = document.getElementById('content-subject');
const contentTopicSelect = document.getElementById('content-topic');
const viewContentButton = document.getElementById('view-content-btn');
const contentDisplaySection = document.getElementById('content-display');
const contentTitleElement = document.getElementById('content-title');
const contentBodyElement = document.getElementById('content-body');

// Progress Display Elements
const viewProgressButton = document.getElementById('view-progress-btn');
const progressListElement = document.getElementById('progress-list');

// --- Placeholder for Content Structure (Replace with dynamic fetching later) ---
const contentIndex = {
    "Math": ["Algebra Basics", "Geometry Fundamentals"], // Example topics
    "Science": ["Photosynthesis", "Cellular Respiration", "Newton's Laws"],
    "English": ["Essay Writing", "Figurative Language"],
    "History": ["World War I", "The Roman Empire"]
};

// --- Remove Firebase Auth Setup ---
/*
const {
    auth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    googleProvider,
    connectAuthEmulator
} = window.firebaseAuth;
*/

// --- Firebase Database Setup (Keep for now, might be used for progress) ---
const {
    db, // Assuming db is the database instance
    connectDatabaseEmulator // Add this import
} = window.firebaseDb || {}; // Add default empty object in case it's not defined

let currentQuizData = null; // To store the current quiz for submission
let currentUserName = null; // Store the entered user name

document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    // --- Connect to Emulators (Keep DB connection if needed) ---
    try {
        if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
            console.log("Connecting to Firebase Emulators...");
            /* Remove Auth Emulator connection
            if (auth && connectAuthEmulator) {
                connectAuthEmulator(auth, "http://127.0.0.1:9099");
                console.log("Auth Emulator connected.");
            } else {
                console.warn("Auth or connectAuthEmulator not available.");
            }
            */
            if (db && connectDatabaseEmulator) {
                connectDatabaseEmulator(db, "127.0.0.1", 9000);
                console.log("Database Emulator connected.");
            } else {
                console.warn("Database or connectDatabaseEmulator not available.");
            }
        } else {
            console.log("Not running on localhost, connecting to live Firebase services.");
        }
    } catch (error) {
        console.error("Error connecting to emulators:", error);
    }
    // --------------------------

    // initializeAuth(); // Removed
    initializeApp(); // New initialization function
    initializeContentLibrary(); // Initialize content library interactions
    initializeProgressView(); // Initialize progress view interactions
    initializeFeatureButtons(); // Add listeners for quiz/lp buttons etc.
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
} else {
    console.log('Service Worker not supported in this browser.');
}

// --- Remove Auth Modal Logic ---
/*
function openAuthModal() { ... }
function closeAuthModal() { ... }
window.onclick = function(event) { ... }
*/

// --- Remove Authentication Logic ---
/*
function initializeAuth() { ... }
function handleEmailSignUp() { ... }
function handleEmailSignIn() { ... }
function handleGoogleSignIn() { ... }
function handleSignOut() { ... }
*/

// --- New App Initialization and Name Handling ---
function initializeApp() {
    // Check if a name is already stored (e.g., from sessionStorage if implemented)
    // For now, just show the name entry view by default
    showNameEntryView();

    // Add listener for the start button
    startButton?.addEventListener('click', handleStart);
}

function handleStart() {
    const name = nameInput?.value.trim();
    if (name) {
        currentUserName = name;
        console.log(`User started session as: ${currentUserName}`);
        // Store name if needed (e.g., sessionStorage.setItem('userName', currentUserName);)
        showMainAppView();
    } else {
        alert('Please enter your name to start.');
        nameInput?.focus();
    }
}

// --- Simplified UI Update Functions ---

function showNameEntryView() {
    if (nameEntryView) nameEntryView.style.display = 'block';
    if (mainAppView) mainAppView.style.display = 'none';
    if (welcomeMessageElement) welcomeMessageElement.textContent = '';
    // Reset other app sections if necessary
    if (quizDisplaySection) quizDisplaySection.style.display = 'none';
    if (lpDisplaySection) lpDisplaySection.style.display = 'none';
    if (contentDisplaySection) contentDisplaySection.style.display = 'none';
    if (progressListElement) progressListElement.style.display = 'none';
}

function showMainAppView() {
    if (nameEntryView) nameEntryView.style.display = 'none';
    if (mainAppView) mainAppView.style.display = 'block';
    if (welcomeMessageElement) welcomeMessageElement.textContent = `Welcome, ${currentUserName}!`;
}

// Add event listeners for core app features
function initializeFeatureButtons() {
    generateQuizButton?.addEventListener('click', fetchAndDisplayQuiz);
    submitQuizButton?.addEventListener('click', submitQuiz);
    generateLpButton?.addEventListener('click', fetchAndDisplayLearningPath);
    // View Content button listener is added in initializeContentLibrary
    // View Progress button listener is added in initializeProgressView
}


// --- Remove Old UI Update Functions ---
/*
function updateUIForLoggedInUser(user) { ... }
function updateUIForLoggedOutUser() { ... }
*/

// --- Quiz Logic (Updated) ---

async function fetchAndDisplayQuiz() {
    // Check if user has entered a name instead of auth state
    if (!currentUserName) {
        alert("Please enter your name first.");
        showNameEntryView(); // Redirect to name entry
        return;
    }

    const subject = subjectSelect.value;
    const topic = topicInput.value;
    const difficulty = difficultySelect.value;

    if (!topic) {
        alert("Please enter a topic for the quiz.");
        topicInput.focus();
        return;
    }

    // Show loading state (optional)
    quizQuestionsElement.innerHTML = '<p>Generating quiz...</p>';
    quizDisplaySection.style.display = 'block';
    quizDetailsElement.innerHTML = '';
    quizResultsElement.innerHTML = '';
    submitQuizButton.style.display = 'none';

    try {
        // Remove getIdToken
        // const idToken = await auth.currentUser.getIdToken();
        console.log(`Fetching quiz for Subject: ${subject}, Topic: ${topic}, Difficulty: ${difficulty}`);

        const response = await fetch('/api/quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Remove Authorization header
                // 'Authorization': `Bearer ${idToken}`
            },
            // Add userName to the body if backend needs it
            body: JSON.stringify({ subject, topic, difficulty, num_questions: 5 /*, userName: currentUserName */ })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.'}));
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const quizData = await response.json();
        console.log('Quiz data received:', quizData);

        if (quizData && quizData.questions && quizData.questions.length > 0) {
            currentQuizData = quizData; // Store for submission
            renderQuiz(quizData);
        } else {
            throw new Error("Received empty or invalid quiz data from server.");
        }

    } catch (error) {
        console.error('Error fetching or displaying quiz:', error);
        quizQuestionsElement.innerHTML = `<p style="color: red;">Error generating quiz: ${error.message}</p>`;
        quizDisplaySection.style.display = 'block'; // Ensure section is visible to show error
    }
}

function renderQuiz(quizData) {
    quizDetailsElement.innerHTML = `
        <p><strong>Subject:</strong> ${quizData.subject || 'N/A'}</p>
        <p><strong>Topic:</strong> ${quizData.topic || 'N/A'}</p>
    `;
    quizQuestionsElement.innerHTML = ''; // Clear previous questions/loading message

    quizData.questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');
        questionDiv.innerHTML = `
            <p><strong>${index + 1}. ${q.question_text || 'Question text missing'}</strong></p>
            <div class="options">
                ${(q.options || []).map((option, i) => `
                    <label>
                        <input type="radio" name="question-${index}" value="${option}" required>
                        ${option}
                    </label><br>
                `).join('')}
            </div>
        `;
        quizQuestionsElement.appendChild(questionDiv);
    });

    if (quizData.questions.length > 0) {
        submitQuizButton.style.display = 'block'; // Show submit button
        quizDisplaySection.style.display = 'block';
        quizResultsElement.innerHTML = ''; // Clear previous results
    }
}

function submitQuiz() {
    if (!currentQuizData || !currentQuizData.questions) return;

    let score = 0;
    const resultsHTML = [];
    const userAnswers = [];

    currentQuizData.questions.forEach((q, index) => {
        const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
        const userAnswer = selectedOption ? selectedOption.value : null;
        userAnswers.push({ question: q.question_text, answer: userAnswer });

        const isCorrect = userAnswer === q.correct_answer;
        if (isCorrect) {
            score++;
        }

        resultsHTML.push(`
            <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                <p><strong>${index + 1}. ${q.question_text}</strong></p>
                <p>Your answer: ${userAnswer || 'Not answered'} ${isCorrect ? '✔️' : '❌'}</p>
                ${!isCorrect ? `<p>Correct answer: ${q.correct_answer}</p>` : ''}
                ${q.explanation ? `<p><small><i>Explanation:</i> ${q.explanation}</small></p>` : ''}
            </div>
        `);
    });

    const percentage = (score / currentQuizData.questions.length) * 100;
    quizResultsElement.innerHTML = `
        <h3>Quiz Results</h3>
        <p><strong>Your score: ${score} out of ${currentQuizData.questions.length} (${percentage.toFixed(1)}%)</strong></p>
        ${resultsHTML.join('')}
    `;

    submitQuizButton.style.display = 'none';

    // Save progress
    saveProgressToBackend(currentQuizData, score, userAnswers);
}


// saveProgressToBackend updated
async function saveProgressToBackend(quizData, score, userAnswers) {
    // Check for username instead of auth user
    if (!currentUserName) return;

    const progressData = {
        // Use userName for associating progress if needed by backend
        userName: currentUserName,
        quizId: `${quizData.subject}-${quizData.topic}-${Date.now()}`, // Simple unique ID
        subject: quizData.subject,
        topic: quizData.topic,
        difficulty: quizData.difficulty,
        score: score,
        totalQuestions: quizData.questions.length,
        timestamp: new Date().toISOString(),
        // userAnswers: userAnswers // Optional: Save detailed answers
    };

    try {
        // Remove getIdToken
        // const idToken = await auth.currentUser.getIdToken();
        const response = await fetch('/api/progress', {
            method: 'POST',
            headers: {
                 'Content-Type': 'application/json'
                 // Remove Authorization header
                 // 'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify(progressData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error.'}));
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        console.log("Progress saved successfully:", result.message);
        // Optionally show a success message to the user

    } catch (error) {
        console.error("Error saving progress:", error);
        // Optionally show an error message to the user
        alert("Could not save your quiz progress.");
    }
}

// --- Learning Path Logic (Updated) ---

async function fetchAndDisplayLearningPath() {
    // Check for username
    if (!currentUserName) {
        alert("Please enter your name first.");
        showNameEntryView();
        return;
    }

    const subject = lpSubjectSelect.value;
    const goal = lpGoalInput.value;

    if (!goal) {
        alert("Please enter a learning goal.");
        lpGoalInput.focus();
        return;
    }

    // Show loading state
    lpStepsElement.innerHTML = '<p>Generating learning path...</p>';
    lpDisplaySection.style.display = 'block';
    lpDetailsElement.innerHTML = '';

    try {
        // Remove getIdToken
        // const idToken = await auth.currentUser.getIdToken();
        console.log(`Fetching learning path for Subject: ${subject}, Goal: ${goal}`);

        const response = await fetch('/api/learning-path', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Remove Authorization header
                // 'Authorization': `Bearer ${idToken}`
            },
            // Add userName if needed by backend
            body: JSON.stringify({ subject, goal /*, userName: currentUserName */ })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.'}));
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const pathData = await response.json();
        console.log('Learning Path data received:', pathData);

        if (pathData && pathData.steps && pathData.steps.length > 0) {
            renderLearningPath(pathData);
        } else {
             throw new Error("Received empty or invalid learning path data from server.");
        }

    } catch (error) {
        console.error('Error fetching or displaying learning path:', error);
        lpStepsElement.innerHTML = `<p style="color: red;">Error generating learning path: ${error.message}</p>`;
        lpDisplaySection.style.display = 'block'; // Ensure section is visible to show error
    }
}

function renderLearningPath(pathData) {
    lpDetailsElement.innerHTML = `
        <p><strong>Subject:</strong> ${pathData.subject || 'N/A'}</p>
        <p><strong>Goal:</strong> ${pathData.goal || 'N/A'}</p>
    `;
    lpStepsElement.innerHTML = ''; // Clear previous steps/loading message

    const ol = document.createElement('ol'); // Use ordered list for steps
    pathData.steps.forEach(step => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${step.title || 'Step title missing'}</strong>
            <p>${step.description || ''}</p>
            ${step.suggested_activity ? `<p><em>Suggested Activity:</em> ${step.suggested_activity}</p>` : ''}
        `;
        ol.appendChild(li);
    });
    lpStepsElement.appendChild(ol);

    lpDisplaySection.style.display = 'block'; // Ensure section is visible
}

// --- Content Library Logic (Updated) ---

function initializeContentLibrary() {
    contentSubjectSelect?.addEventListener('change', handleSubjectChange);
    viewContentButton?.addEventListener('click', fetchAndDisplayContent);
    // Initially populate subjects (optional, could be dynamic)
}

function handleSubjectChange() {
    const selectedSubject = contentSubjectSelect.value;
    contentTopicSelect.innerHTML = '<option value="" disabled selected>Select Topic</option>'; // Reset topics
    contentTopicSelect.disabled = true;
    viewContentButton.disabled = true;
    contentDisplaySection.style.display = 'none'; // Hide previous content

    if (selectedSubject && contentIndex[selectedSubject]) {
        const topics = contentIndex[selectedSubject];
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic; // Use topic name as value
            option.textContent = topic;
            contentTopicSelect.appendChild(option);
        });
        contentTopicSelect.disabled = false;
        // Add listener for topic change to enable button
        contentTopicSelect.addEventListener('change', () => {
             viewContentButton.disabled = !contentTopicSelect.value;
        }, { once: true }); // Remove listener after first change if desired, or handle differently
    } else {
         // Handle case where subject has no topics or is invalid
    }
}

async function fetchAndDisplayContent() {
    // Check for username
    if (!currentUserName) {
        alert("Please enter your name first.");
        showNameEntryView();
        return;
    }

    const subject = contentSubjectSelect.value;
    const topic = contentTopicSelect.value;

    if (!subject || !topic) {
        alert("Please select both a subject and a topic.");
        return;
    }

    // Show loading state
    contentTitleElement.textContent = 'Loading Content...';
    contentBodyElement.innerHTML = '';
    contentDisplaySection.style.display = 'block';

    try {
        // Remove getIdToken
        // const idToken = await auth.currentUser.getIdToken();
        console.log(`Fetching content for Subject: ${subject}, Topic: ${topic}`);

        const encodedSubject = encodeURIComponent(subject);
        const encodedTopic = encodeURIComponent(topic);

        const response = await fetch(`/api/content/${encodedSubject}/${encodedTopic}`, {
            method: 'GET',
            headers: {
                // Remove Authorization header
                // 'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.'}));
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const contentData = await response.json();
        console.log('Content data received:', contentData);

        if (contentData && contentData.content) {
             renderContent(contentData.content);
        } else {
             throw new Error("Received empty or invalid content data from server.");
        }

    } catch (error) {
        console.error('Error fetching or displaying content:', error);
        contentTitleElement.textContent = 'Error';
        contentBodyElement.innerHTML = `<p style="color: red;">Error loading content: ${error.message}</p>`;
        contentDisplaySection.style.display = 'block';
    }
}

function renderContent(content) {
    contentTitleElement.textContent = content.title || 'Content Title Missing';
    
    let bodyHTML = '';
    if (content.text) {
        // Basic rendering, consider using a Markdown library if content is Markdown
        bodyHTML += `<p>${content.text.replace(/\n/g, '<br>')}</p>`; 
    }

    if (content.resources && content.resources.length > 0) {
        bodyHTML += '<h4>Additional Resources:</h4><ul>';
        content.resources.forEach(resource => {
            bodyHTML += `<li>`;
            if (resource.url) {
                bodyHTML += `<a href="${resource.url}" target="_blank" rel="noopener noreferrer">${resource.type || 'Link'}: ${resource.description || resource.url}</a>`;
            } else {
                bodyHTML += `${resource.type || 'Resource'}: ${resource.description || 'No details'}`;
            }
            bodyHTML += `</li>`;
        });
        bodyHTML += '</ul>';
    }

    if (!bodyHTML) {
         bodyHTML = '<p>No content available for this topic yet.</p>';
    }
    
    contentBodyElement.innerHTML = bodyHTML;
    contentDisplaySection.style.display = 'block';
}

// --- Progress Display Logic (Updated) ---

function initializeProgressView() {
     viewProgressButton?.addEventListener('click', fetchAndDisplayProgress);
}

async function fetchAndDisplayProgress() {
    // Check for username
    if (!currentUserName) {
        alert("Please enter your name first.");
        showNameEntryView();
        return;
    }

    progressListElement.innerHTML = '<p>Loading progress...</p>';
    progressListElement.style.display = 'block';

    try {
        // Remove getIdToken
        // const idToken = await auth.currentUser.getIdToken();
        // Add userName as query parameter if backend needs it
        console.log(`Fetching progress for user: ${currentUserName}`);

        // Adjust API endpoint if needed (e.g., /api/progress?user=...)
        const response = await fetch('/api/progress', { // Or `/api/progress?userName=${encodeURIComponent(currentUserName)}`
            method: 'GET',
            headers: {
                // Remove Authorization header
                // 'Authorization': `Bearer ${idToken}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response.'}));
            throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
        }

        const progressData = await response.json();
        console.log('Progress data received:', progressData);

        // Assuming backend filters by userName or returns all progress for simplicity now
        renderProgress(progressData.progress);

    } catch (error) {
        console.error('Error fetching or displaying progress:', error);
        progressListElement.innerHTML = `<p style="color: red;">Error loading progress: ${error.message}</p>`;
        progressListElement.style.display = 'block';
    }
}

function renderProgress(progress) {
    if (!progress || Object.keys(progress).length === 0) {
        progressListElement.innerHTML = '<p>No progress data found yet. Take a quiz!</p>';
        return;
    }

    // Firebase RTDB often returns data as an object with push IDs as keys.
    // Convert to an array and sort by timestamp (descending) for display.
    const progressArray = Object.keys(progress).map(key => ({ id: key, ...progress[key] }));
    progressArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); 

    let progressHTML = '<ul>';
    progressArray.forEach(item => {
        progressHTML += `
            <li>
                <strong>${item.subject || 'N/A'} - ${item.topic || 'N/A'}</strong> (${item.difficulty || 'N/A'}) <br>
                Score: ${item.score} / ${item.totalQuestions || 'N/A'} 
                <small>(${new Date(item.timestamp).toLocaleString()})</small>
            </li>
        `;
    });
    progressHTML += '</ul>';

    progressListElement.innerHTML = progressHTML;
}

// --- Remove Placeholder API calls ---
/*
async function fetchQuiz(subject, topic) { ... }
*/

// Example function structure
// async function fetchQuiz(subject, topic) {
//     try {
//         const response = await fetch('/api/quiz', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 // Add Authorization header if needed: 'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
//             },
//             body: JSON.stringify({ subject, topic, difficulty: 'medium' }) // Example data
//         });
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log('Quiz data:', data);
//         // TODO: Render quiz data
//     } catch (error) {
//         console.error('Error fetching quiz:', error);
//         // TODO: Show error to user
//     }
// } 