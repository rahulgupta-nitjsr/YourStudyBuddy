import os
import json
from flask import Flask, jsonify, request, make_response
from dotenv import load_dotenv
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, db, auth
from functools import wraps

# --- Initialization ---
load_dotenv()

# Initialize Firebase Admin SDK
# IMPORTANT: Replace with your actual path to the service account key
# or use environment variables for deployment.
SERVICE_ACCOUNT_KEY_PATH = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY_PATH', 'path/to/your/serviceAccountKey.json')
FIREBASE_DB_URL = os.getenv('FIREBASE_DATABASE_URL')

try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred, {
        'databaseURL': FIREBASE_DB_URL
    })
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    # Handle initialization error appropriately (e.g., exit or run without DB features)

# Configure Google Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY not found in environment variables.")
    model = None
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash') # Using flash for speed/cost
        print("Google Gemini API configured successfully.")
    except Exception as e:
        print(f"Error configuring Google Gemini API: {e}")
        model = None # Ensure model is None if config fails

app = Flask(__name__)

# --- Decorators ---
def token_required(f):
    """Decorator to verify Firebase ID token."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        uid = verify_firebase_token(request)
        if not uid:
            return jsonify(error="Unauthorized - Token missing or invalid"), 401
        # Pass the uid to the decorated function if needed
        # kwargs['uid'] = uid 
        # Or store it in Flask's g object: g.user_id = uid
        return f(*args, **kwargs)
    return decorated_function

# --- Helper Functions ---
def verify_firebase_token(request):
    """Verifies the Firebase ID token in the Authorization header."""
    id_token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    if not id_token:
        return None
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token['uid']
    except Exception as e:
        print(f"Error verifying Firebase token: {e}")
        return None

def parse_quiz_from_llm(llm_output_text):
    """Attempts to parse structured JSON quiz data from the LLM text output."""
    try:
        # Try to find JSON block assuming it might be wrapped in markdown
        json_start = llm_output_text.find('```json')
        json_end = llm_output_text.rfind('```')
        
        if json_start != -1 and json_end != -1 and json_start < json_end:
            json_str = llm_output_text[json_start + 7 : json_end].strip()
        else:
             # Fallback: Assume the entire text might be JSON or find first '{' and last '}'
            first_brace = llm_output_text.find('{')
            last_brace = llm_output_text.rfind('}')
            if first_brace != -1 and last_brace != -1:
                 json_str = llm_output_text[first_brace : last_brace + 1]
            else:
                 raise ValueError("No JSON object found in LLM output")

        quiz_data = json.loads(json_str)
        
        # Basic validation (can be extended)
        if not isinstance(quiz_data, dict) or 'questions' not in quiz_data:
             raise ValueError("Invalid quiz structure: 'questions' key missing")
        if not isinstance(quiz_data['questions'], list):
             raise ValueError("Invalid quiz structure: 'questions' should be a list")

        # Further validation of question structure can be added here
        # e.g., check for question text, options, answer within each question

        return quiz_data
    except (json.JSONDecodeError, ValueError, KeyError) as e:
        print(f"Error parsing quiz JSON from LLM output: {e}\nRaw output:\n{llm_output_text}")
        return None # Indicate parsing failure

def parse_learning_path_from_llm(llm_output_text):
    """Attempts to parse structured JSON learning path data from the LLM text output."""
    try:
        # Similar parsing logic as for quizzes, adjusting for expected structure
        json_start = llm_output_text.find('```json')
        json_end = llm_output_text.rfind('```')
        
        if json_start != -1 and json_end != -1 and json_start < json_end:
            json_str = llm_output_text[json_start + 7 : json_end].strip()
        else:
            first_brace = llm_output_text.find('{')
            last_brace = llm_output_text.rfind('}')
            if first_brace != -1 and last_brace != -1:
                 json_str = llm_output_text[first_brace : last_brace + 1]
            else:
                 raise ValueError("No JSON object found in LLM output for learning path")

        path_data = json.loads(json_str)
        
        # Basic validation for learning path structure
        if not isinstance(path_data, dict) or 'steps' not in path_data:
             raise ValueError("Invalid path structure: 'steps' key missing")
        if not isinstance(path_data['steps'], list):
             raise ValueError("Invalid path structure: 'steps' should be a list")
        # Could add more checks here (e.g., each step has title, description)

        return path_data
    except (json.JSONDecodeError, ValueError, KeyError) as e:
        print(f"Error parsing learning path JSON from LLM output: {e}\nRaw output:\n{llm_output_text}")
        return None # Indicate parsing failure

# --- API Endpoints ---

@app.route('/')
def home():
    return jsonify(message="Welcome to the Your Study Buddy API!")

@app.route('/api/quiz', methods=['POST'])
# @token_required # Require authentication <-- Comment out or remove this line
def generate_quiz():
    # uid is implicitly verified by @token_required
    if not model:
        return jsonify(error="AI Model not configured"), 503
    data = request.json
    if not data:
        return jsonify(error="Missing request body"), 400
        
    subject = data.get('subject')
    topic = data.get('topic')
    difficulty = data.get('difficulty', 'medium') # Default difficulty
    num_questions = data.get('num_questions', 5) # Default number of questions

    if not all([subject, topic]):
        return jsonify(error="Missing required fields: subject, topic"), 400

    prompt = f"""
    Generate a {num_questions}-question multiple-choice quiz about the topic '{topic}' within the subject '{subject}' suitable for a high school student at a '{difficulty}' difficulty level. 

    Format the output STRICTLY as a JSON object with the following structure:
    {{
      "subject": "{subject}",
      "topic": "{topic}",
      "difficulty": "{difficulty}",
      "questions": [
        {{
          "question_text": "The text of the first question?",
          "options": [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
          ],
          "correct_answer": "Option B", 
          "explanation": "A brief explanation why this is the correct answer."
        }},
        // ... more questions
      ]
    }}
    Ensure the JSON is valid. Do not include any text before or after the JSON object. Only output the JSON.
    """

    try:
        print(f"Sending prompt to Gemini for quiz: Subject={subject}, Topic={topic}, Difficulty={difficulty}")
        response = model.generate_content(prompt)
        
        print("Received response from Gemini.")
        # print(f"Raw LLM Response Text:\n{response.text}") # DEBUG

        # Attempt to parse the structured JSON from the response
        quiz_data = parse_quiz_from_llm(response.text)

        if quiz_data:
            return jsonify(quiz_data), 200
        else:
            # If parsing fails, return an error but maybe include raw text for debugging
            print(f"Failed to parse structured quiz data from LLM response for topic: {topic}")
            return jsonify(error="Failed to generate structured quiz data from AI model.", raw_ai_output=response.text), 500

    except Exception as e:
        print(f"Error calling Gemini API or processing response: {e}")
        return jsonify(error=f"An error occurred while generating the quiz: {e}"), 500

@app.route('/api/learning-path', methods=['POST'])
@token_required # Require authentication
def get_learning_path():
    uid = verify_firebase_token(request) # Get uid for fetching progress
    if not model:
        return jsonify(error="AI Model not configured"), 503

    data = request.json
    if not data:
        return jsonify(error="Missing request body"), 400
        
    subject = data.get('subject')
    learning_goal = data.get('goal') # e.g., "Understand basic algebra", "Prepare for chemistry test on acids"
    current_knowledge = data.get('knowledge', 'beginner') # Could be more detailed later

    if not all([subject, learning_goal]):
        return jsonify(error="Missing required fields: subject, goal"), 400

    # Optional: Fetch user's recent progress to inform the path
    user_progress_summary = "No past progress available."
    try:
        progress_ref = db.reference(f'/users/{uid}/progress')
        # Fetch last N items or summarize (simplified here)
        recent_progress = progress_ref.order_by_child('timestamp').limit_to_last(5).get()
        if recent_progress:
            # Simple summary - could be more sophisticated
            summary_parts = []
            if isinstance(recent_progress, dict):
                 for key, item in recent_progress.items():
                      if isinstance(item, dict):
                           summary_parts.append(f"Topic: {item.get('topic', 'N/A')}, Score: {item.get('score', 'N/A')}/{item.get('totalQuestions', 'N/A')}")
            if summary_parts:
                 user_progress_summary = "Recent activities: " + "; ".join(summary_parts)
    except Exception as e:
        print(f"Warning: Could not fetch progress for user {uid} to inform learning path: {e}")

    prompt = f"""
    Create a personalized learning path for a high school student studying '{subject}'.
    Their learning goal is: "{learning_goal}".
    Their self-assessed knowledge level is: '{current_knowledge}'.
    Consider their recent activity: {user_progress_summary}

    Generate a sequence of learning steps (around 5-7 steps typically). Each step should include a topic or concept and a brief suggested activity (e.g., 'Read about X', 'Take a quiz on Y', 'Watch a video on Z'). 

    Format the output STRICTLY as a JSON object with the following structure:
    {{
      "subject": "{subject}",
      "goal": "{learning_goal}",
      "steps": [
        {{
          "step_number": 1,
          "title": "Introduction to [Concept]",
          "description": "Start by reading the introductory chapter on [Concept].",
          "suggested_activity": "Read chapter 3 / Watch intro video link [optional placeholder]"
        }},
        {{
          "step_number": 2,
          "title": "Practice [Concept] Basics",
          "description": "Work through basic practice problems.",
          "suggested_activity": "Complete exercises 1-5 / Take 'Basic [Concept]' quiz"
        }},
        // ... more steps
      ]
    }}
    Ensure the JSON is valid. Only output the JSON.
    """

    try:
        print(f"Sending prompt to Gemini for learning path: Subject={subject}, Goal={learning_goal}")
        response = model.generate_content(prompt)
        print("Received response from Gemini for learning path.")
        
        path_data = parse_learning_path_from_llm(response.text)

        if path_data:
            return jsonify(path_data), 200
        else:
            print(f"Failed to parse structured learning path data from LLM response for goal: {learning_goal}")
            return jsonify(error="Failed to generate structured learning path data from AI model.", raw_ai_output=response.text), 500

    except Exception as e:
        print(f"Error calling Gemini API or processing learning path response: {e}")
        return jsonify(error=f"An error occurred while generating the learning path: {e}"), 500

@app.route('/api/content/<subject>/<topic>', methods=['GET'])
@token_required # Optional: Might not need auth just to view content
def get_content(subject, topic):
    # TODO: Implement content retrieval from Firebase DB (or another source)
    # Example structure in Firebase DB: /content/{subject}/{topic} = { text: "...", video_url: "..." }
    try:
        content_ref = db.reference(f'/content/{subject}/{topic}')
        content = content_ref.get()
        if content:
            # Convert lists/dicts fetched from Firebase if necessary
            return jsonify(content=content), 200
        else:
             # Optional: Try generating placeholder content if not found?
             # return jsonify(error="Content not found"), 404
             placeholder = {
                  "title": f"{topic} in {subject}",
                  "text": f"Detailed content for {topic} in {subject} is not yet available. You can try generating a quiz on this topic!",
                  "resources": []
             }
             return jsonify(content=placeholder), 200 # Return placeholder instead of 404
             
    except Exception as e:
        print(f"Error retrieving content for {subject}/{topic}: {e}")
        return jsonify(error="Failed to retrieve content."), 500

@app.route('/api/progress', methods=['POST'])
@token_required # Require authentication
def save_progress():
    uid = verify_firebase_token(request) # Get uid securely
    data = request.json
    if not data:
        return jsonify(error="Missing request body"), 400
    if 'quizId' not in data or 'score' not in data or 'timestamp' not in data:
         return jsonify(error="Missing required progress data fields"), 400
    try:
        progress_ref = db.reference(f'/users/{uid}/progress')
        progress_ref.push(data) 
        return jsonify(message="Progress saved successfully"), 201
    except Exception as e:
        print(f"Error saving progress for user {uid}: {e}")
        return jsonify(error="Failed to save progress."), 500

@app.route('/api/progress', methods=['GET'])
@token_required # Require authentication
def get_progress():
    uid = verify_firebase_token(request) # Get uid securely
    try:
        progress_ref = db.reference(f'/users/{uid}/progress')
        progress_data = progress_ref.get()
        return jsonify(progress=progress_data if progress_data else {}), 200
    except Exception as e:
        print(f"Error retrieving progress for user {uid}: {e}")
        return jsonify(error="Failed to retrieve progress."), 500

# Add more endpoints as needed

if __name__ == '__main__':
    # Use Gunicorn for production deployment, not app.run(debug=True)
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 8080))) 