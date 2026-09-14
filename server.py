from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor, Json


# ============================================================
# NEXORA AI 6.7
# USER SYSTEM + USER-SPECIFIC MEMORY
# ============================================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "https://nexora-ai-1-r9y5.onrender.com"
            ]
        }
    }
)


# ============================================================
# FILES
# ============================================================

USERS_FILE = "users.json"
USER_MEMORY_FILE = "nexora_users_memory.json"

MAX_HISTORY = 30


# ============================================================
# DEFAULT USER MEMORY
# ============================================================

def create_default_memory():
    return {
        "last_question": "",
        "last_topic": "",
        "last_subject": "",
        "last_answer": "",
        "last_intent": "",
        "conversation_count": 0,
        "saved_memories": [],
        "conversation_history": [],
        "last_updated": ""
    }


# ============================================================
# DATABASE / STORAGE
# ============================================================

DATABASE_URL = os.environ.get("DATABASE_URL")


def get_db_connection():

    if not DATABASE_URL:
        return None

    return psycopg2.connect(DATABASE_URL)


def init_database():

    if not DATABASE_URL:

        print(
            "DATABASE_URL not found. "
            "Using local JSON storage."
        )

        return

    connection = get_db_connection()

    try:

        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_memory (
                username TEXT PRIMARY KEY,
                memory JSONB NOT NULL
            )
        """)

        connection.commit()

        cursor.close()

        print(
            "PostgreSQL database initialized successfully."
        )

    finally:

        connection.close()


# ============================================================
# USER ACCOUNT STORAGE
# ============================================================

def load_users():

    if not DATABASE_URL:

        if not os.path.exists(USERS_FILE):
            return []

        try:

            with open(
                USERS_FILE,
                "r",
                encoding="utf-8"
            ) as file:

                data = json.load(file)

            if isinstance(data, list):
                return data

            return []

        except Exception as error:

            print("Users load error:", error)

            return []

    connection = get_db_connection()

    try:

        cursor = connection.cursor(
            cursor_factory=RealDictCursor
        )

        cursor.execute("""
            SELECT
                username,
                password_hash,
                created_at
            FROM users
            ORDER BY username
        """)

        users = cursor.fetchall()

        cursor.close()

        return [
            dict(user)
            for user in users
        ]

    except Exception as error:

        print("Users load error:", error)

        return []

    finally:

        connection.close()


def save_users(users):

    if not DATABASE_URL:

        try:

            with open(
                USERS_FILE,
                "w",
                encoding="utf-8"
            ) as file:

                json.dump(
                    users,
                    file,
                    indent=4,
                    ensure_ascii=False
                )

            return True

        except Exception as error:

            print("Users save error:", error)

            return False

    connection = get_db_connection()

    try:

        cursor = connection.cursor()

        for user in users:

            cursor.execute(
                """
                INSERT INTO users
                (
                    username,
                    password_hash,
                    created_at
                )
                VALUES (%s, %s, %s)

                ON CONFLICT (username)
                DO UPDATE SET
                    password_hash =
                        EXCLUDED.password_hash,
                    created_at =
                        EXCLUDED.created_at
                """,
                (
                    user.get("username"),
                    user.get("password_hash"),
                    user.get(
                        "created_at",
                        ""
                    )
                )
            )

        connection.commit()

        cursor.close()

        return True

    except Exception as error:

        connection.rollback()

        print("Users save error:", error)

        return False

    finally:

        connection.close()


# ============================================================
# USER MEMORY STORAGE
# ============================================================

def load_all_user_memory():

    if not DATABASE_URL:

        if not os.path.exists(
            USER_MEMORY_FILE
        ):
            return {}

        try:

            with open(
                USER_MEMORY_FILE,
                "r",
                encoding="utf-8"
            ) as file:

                data = json.load(file)

            if isinstance(data, dict):
                return data

            return {}

        except Exception as error:

            print(
                "User memory load error:",
                error
            )

            return {}

    connection = get_db_connection()

    try:

        cursor = connection.cursor()

        cursor.execute("""
            SELECT username, memory
            FROM user_memory
        """)

        rows = cursor.fetchall()

        cursor.close()

        result = {}

        for username, memory in rows:

            result[username] = memory

        return result

    except Exception as error:

        print(
            "User memory load error:",
            error
        )

        return {}

    finally:

        connection.close()


def save_all_user_memory(all_memory):

    if not DATABASE_URL:

        try:

            with open(
                USER_MEMORY_FILE,
                "w",
                encoding="utf-8"
            ) as file:

                json.dump(
                    all_memory,
                    file,
                    indent=4,
                    ensure_ascii=False
                )

            return True

        except Exception as error:

            print(
                "User memory save error:",
                error
            )

            return False

    connection = get_db_connection()

    try:

        cursor = connection.cursor()

        for username, memory in all_memory.items():

            cursor.execute(
                """
                INSERT INTO user_memory
                (
                    username,
                    memory
                )
                VALUES (%s, %s)

                ON CONFLICT (username)
                DO UPDATE SET
                    memory =
                        EXCLUDED.memory
                """,
                (
                    username,
                    Json(memory)
                )
            )

        connection.commit()

        cursor.close()

        return True

    except Exception as error:

        connection.rollback()

        print(
            "User memory save error:",
            error
        )

        return False

    finally:

        connection.close()


def get_user_memory(username):

    all_memory = load_all_user_memory()

    key = username.lower()

    if key not in all_memory:

        all_memory[key] = create_default_memory()

        save_all_user_memory(
            all_memory
        )

    memory = all_memory[key]

    default = create_default_memory()

    for field, value in default.items():

        if field not in memory:

            memory[field] = value

    return memory


def save_user_memory(
    username,
    memory
):

    all_memory = load_all_user_memory()

    key = username.lower()

    all_memory[key] = memory

    save_all_user_memory(
        all_memory
    )


# ============================================================
# INITIALIZE DATABASE
# ============================================================

try:

    init_database()

except Exception as error:

    print(
        "Database initialization error:",
        error
    )


# ============================================================
# CHECK USER
# ============================================================

def find_user(username):

    users = load_users()

    for user in users:

        if user.get(
            "username",
            ""
        ).lower() == username.lower():

            return user

    return None


# ============================================================
# SIGN UP
# ============================================================

@app.route(
    "/signup",
    methods=["POST"]
)
def signup():

    data = request.get_json(
        silent=True
    ) or {}

    username = str(
        data.get(
            "username",
            ""
        )
    ).strip()

    password = str(
        data.get(
            "password",
            ""
        )
    )

    if not username or not password:

        return jsonify({
            "message":
            "Username and password are required."
        }), 400

    if len(username) < 3:

        return jsonify({
            "message":
            "Username must be at least 3 characters."
        }), 400

    if len(password) < 6:

        return jsonify({
            "message":
            "Password must be at least 6 characters."
        }), 400

    if find_user(username):

        return jsonify({
            "message":
            "Username already exists."
        }), 409

    users = load_users()

    new_user = {
        "username": username,
        "password_hash":
            generate_password_hash(
                password
            ),
        "created_at":
            datetime.now().isoformat()
    }

    users.append(new_user)

    if not save_users(users):

        return jsonify({
            "message":
            "Could not save account."
        }), 500

    get_user_memory(username)

    print(
        f"New user created: {username}"
    )

    return jsonify({
        "message":
        "Account created successfully.",
        "username":
        username
    }), 201


# ============================================================
# LOGIN
# ============================================================

@app.route(
    "/login",
    methods=["POST"]
)
def login():

    data = request.get_json(
        silent=True
    ) or {}

    username = str(
        data.get(
            "username",
            ""
        )
    ).strip()

    password = str(
        data.get(
            "password",
            ""
        )
    )

    if not username or not password:

        return jsonify({
            "message":
            "Username and password are required."
        }), 400

    user = find_user(username)

    if user is None:

        return jsonify({
            "message":
            "Invalid username or password."
        }), 401

    password_hash = user.get(
        "password_hash",
        ""
    )

    if not check_password_hash(
        password_hash,
        password
    ):

        return jsonify({
            "message":
            "Invalid username or password."
        }), 401

    get_user_memory(
        user["username"]
    )

    print(
        f"User logged in: "
        f"{user['username']}"
    )

    return jsonify({
        "message":
        "Login successful.",
        "username":
        user["username"]
    }), 200


# ============================================================
# HISTORY
# ============================================================

def add_to_history(
    memory,
    user_message,
    ai_reply
):

    history_item = {

        "user":
            user_message,

        "assistant":
            ai_reply,

        "time":
            datetime.now().isoformat()
    }

    memory[
        "conversation_history"
    ].append(
        history_item
    )

    if len(
        memory["conversation_history"]
    ) > MAX_HISTORY:

        memory[
            "conversation_history"
        ] = memory[
            "conversation_history"
        ][-MAX_HISTORY:]


def get_recent_history(
    memory,
    limit=30
):

    return memory[
        "conversation_history"
    ][-limit:]


# ============================================================
# TOPIC DETECTION
# ============================================================

def detect_topic(text):

    text = text.lower()

    topics = {

        "technology": [
            "computer",
            "phone",
            "android",
            "iphone",
            "python",
            "code",
            "coding",
            "software",
            "app",
            "website",
            "internet"
        ],

        "education": [
            "school",
            "jamb",
            "waec",
            "neco",
            "exam",
            "study",
            "university",
            "admission"
        ],

        "music": [
            "song",
            "music",
            "sing",
            "singer",
            "guitar",
            "piano",
            "bass",
            "drum"
        ],

        "business": [
            "money",
            "business",
            "job",
            "income",
            "salary",
            "sell",
            "customer"
        ],

        "social_media": [
            "tiktok",
            "instagram",
            "facebook",
            "youtube",
            "followers",
            "views",
            "likes"
        ],

        "sports": [
            "football",
            "soccer",
            "basketball",
            "match",
            "player",
            "goal"
        ]
    }

    for topic, words in topics.items():

        for word in words:

            if word in text:

                return topic

    return ""


# ============================================================
# SUBJECT DETECTION
# ============================================================

def detect_subject(text):

    text = text.lower()

    subjects = {

        "physics": [
            "physics",
            "force",
            "motion",
            "energy",
            "velocity",
            "acceleration"
        ],

        "chemistry": [
            "chemistry",
            "atom",
            "molecule",
            "acid",
            "base",
            "titration"
        ],

        "biology": [
            "biology",
            "cell",
            "plant",
            "animal",
            "digestion",
            "respiration"
        ],

        "mathematics": [
            "math",
            "mathematics",
            "equation",
            "algebra",
            "calculation"
        ],

        "english": [
            "english",
            "grammar",
            "vocabulary",
            "pronunciation"
        ]
    }

    for subject, words in subjects.items():

        for word in words:

            if word in text:

                return subject

    return ""


# ============================================================
# CONTEXT DETECTION
# ============================================================

def has_context_reference(text):

    text = text.lower()

    references = [
        "it",
        "that",
        "this",
        "he",
        "she",
        "they",
        "them",
        "the one",
        "what about",
        "and",
        "also",
        "then",
        "why",
        "how about"
    ]

    return any(
        text.startswith(
            word + " "
        )
        or text == word
        for word in references
    )


def is_follow_up(text):

    text = text.lower().strip()

    follow_up_words = [
        "why",
        "how",
        "what about",
        "and",
        "also",
        "then",
        "really",
        "are you sure",
        "explain",
        "tell me more",
        "which one",
        "how so"
    ]

    return (
        len(text.split()) <= 8
        or any(
            text.startswith(word)
            for word in follow_up_words
        )
    )


def resolve_context(
    text,
    memory
):

    if not memory["last_question"]:

        return text

    if (
        has_context_reference(text)
        or is_follow_up(text)
    ):

        return (
            "Previous topic: "
            + memory["last_question"]
            + "\nCurrent message: "
            + text
        )

    return text


# ============================================================
# INTENT
# ============================================================

def detect_intent(text):

    text = text.lower()

    if any(
        word in text
        for word in [
            "hello",
            "hi",
            "hey",
            "yo",
            "sup"
        ]
    ):

        return "greeting"

    if any(
        word in text
        for word in [
            "thank",
            "thanks"
        ]
    ):

        return "thanks"

    if any(
        word in text
        for word in [
            "who are you",
            "what are you",
            "your name"
        ]
    ):

        return "identity"

    if any(
        word in text
        for word in [
            "help",
            "assist"
        ]
    ):

        return "help"

    if "?" in text:

        return "question"

    return "general"


# ============================================================
# KNOWLEDGE ENGINE
# ============================================================

def knowledge_search(question):

    text = question.lower()

    knowledge = {

        "what is python":
            "Python is a popular programming language known for being readable and beginner-friendly.",

        "what is ai":
            "AI, or artificial intelligence, is technology that allows computers to perform tasks that normally require human intelligence.",

        "what is html":
            "HTML stands for HyperText Markup Language. It is used to structure webpages.",

        "what is css":
            "CSS stands for Cascading Style Sheets. It controls the appearance and layout of webpages.",

        "what is javascript":
            "JavaScript is a programming language commonly used to make webpages interactive.",

        "what is flask":
            "Flask is a lightweight Python web framework used to build web applications and APIs."
    }

    for key, answer in knowledge.items():

        if key in text:

            return answer

    return None


# ============================================================
# RESPONSE ENGINE
# ============================================================

def contextual_response(
    question,
    memory
):

    text = question.lower().strip()

    intent = detect_intent(text)

    if intent == "greeting":

        return (
            "Hey! 👋 I'm NEXORA. "
            "What are we working on today?"
        )

    if intent == "thanks":

        return (
            "You're welcome! 😎 "
            "I'm always ready for the next task."
        )

    if intent == "identity":

        return (
            "I'm NEXORA AI — your personal AI assistant "
            "built with a Flask backend and a web interface."
        )

    if intent == "help":

        return (
            "I can help with coding, learning, explanations, "
            "ideas, writing, technology and general questions."
        )

    knowledge_answer = knowledge_search(text)

    if knowledge_answer:

        return knowledge_answer

    topic = detect_topic(text)

    subject = detect_subject(text)

    if subject:

        return (
            f"I detected that you're asking about "
            f"{subject}. Give me the exact question "
            "and I'll help you work through it."
        )

    if topic:

        return (
            f"I detected the topic as {topic}. "
            "Tell me exactly what you want to know "
            "and we'll go from there."
        )

    if (
        memory["last_question"]
        and is_follow_up(text)
    ):

        return (
            "Based on what we were discussing before, "
            f"you were asking about: "
            f"{memory['last_question']}\n\n"
            "Give me a little more detail and "
            "I'll continue from there."
        )

    return (
        "I understand the message, but I need "
        "a little more detail to give you "
        "a useful answer."
    )


def generate_response(
    question,
    memory
):

    resolved_question = resolve_context(
        question,
        memory
    )

    answer = contextual_response(
        resolved_question,
        memory
    )

    return answer


# ============================================================
# SAVE CONTEXT
# ============================================================

def save_context(
    memory,
    question,
    answer
):

    memory["last_question"] = question

    memory["last_answer"] = answer

    memory["last_topic"] = detect_topic(
        question
    )

    memory["last_subject"] = detect_subject(
        question
    )

    memory["last_intent"] = detect_intent(
        question
    )

    memory["conversation_count"] += 1

    memory["last_updated"] = (
        datetime.now().isoformat()
    )


# ============================================================
# CHAT
# ============================================================

@app.route(
    "/chat",
    methods=["POST"]
)
def chat():

    data = request.get_json(
        silent=True
    ) or {}

    username = str(
        data.get(
            "username",
            ""
        )
    ).strip()

    question = str(
        data.get(
            "message",
            ""
        )
    ).strip()

    if not username:

        return jsonify({
            "reply":
            "Please log in before chatting with NEXORA."
        }), 401

    if not question:

        return jsonify({
            "reply":
            "Please enter a message."
        }), 400

    user = find_user(username)

    if user is None:

        return jsonify({
            "reply":
            "User account not found. Please log in again."
        }), 401

    user_memory = get_user_memory(
        user["username"]
    )

    answer = generate_response(
        question,
        user_memory
    )

    add_to_history(
        user_memory,
        question,
        answer
    )

    save_context(
        user_memory,
        question,
        answer
    )

    save_user_memory(
        user["username"],
        user_memory
    )

    return jsonify({
        "reply": answer,
        "username":
            user["username"]
    })


# ============================================================
# CLEAR USER MEMORY
# ============================================================

@app.route(
    "/clear",
    methods=["POST"]
)
def clear():

    data = request.get_json(
        silent=True
    ) or {}

    username = str(
        data.get(
            "username",
            ""
        )
    ).strip()

    if not username:

        return jsonify({
            "message":
            "Please log in first."
        }), 401

    user = find_user(username)

    if user is None:

        return jsonify({
            "message":
            "User account not found."
        }), 401

    new_memory = create_default_memory()

    save_user_memory(
        user["username"],
        new_memory
    )

    return jsonify({
        "message":
        "Your NEXORA memory has been cleared."
    })


# ============================================================
# USER HISTORY
# ============================================================

@app.route(
    "/history",
    methods=["GET"]
)
def history():

    username = request.args.get(
        "username",
        ""
    ).strip()

    if not username:

        return jsonify({
            "message":
            "Username is required.",
            "history": []
        }), 400

    user = find_user(username)

    if user is None:

        return jsonify({
            "message":
            "User account not found.",
            "history": []
        }), 404

    user_memory = get_user_memory(
        user["username"]
    )

    return jsonify({
        "username":
            user["username"],

        "history":
            get_recent_history(
                user_memory,
                30
            )
    })


# ============================================================
# USER PROFILE
# ============================================================

@app.route(
    "/profile",
    methods=["GET"]
)
def profile():

    username = request.args.get(
        "username",
        ""
    ).strip()

    if not username:

        return jsonify({
            "message":
            "Username is required."
        }), 400

    user = find_user(username)

    if user is None:

        return jsonify({
            "message":
            "User account not found."
        }), 404

    user_memory = get_user_memory(
        user["username"]
    )

    return jsonify({

        "username":
            user["username"],

        "created_at":
            user.get(
                "created_at",
                ""
            ),

        "conversation_count":
            user_memory.get(
                "conversation_count",
                0
            ),

        "last_updated":
            user_memory.get(
                "last_updated",
                ""
            )
    })


# ============================================================
# STATUS
# ============================================================

@app.route(
    "/status",
    methods=["GET"]
)
def status():

    all_memory = load_all_user_memory()

    return jsonify({

        "status":
            "online",

        "version":
            "6.7",

        "knowledge_engine":
            True,

        "context_engine":
            True,

        "conversation_history":
            True,

        "user_system":
            True,

        "user_specific_memory":
            True,

        "database":
            bool(DATABASE_URL),

        "users":
            len(load_users()),

        "memory_profiles":
            len(all_memory)
    })


# ============================================================
# HOME / HEALTH CHECK
# ============================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "name":
            "NEXORA AI",

        "version":
            "6.7",

        "status":
            "online",

        "message":
            "NEXORA backend is running."
    })


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print("")
    print("==========================================")
    print("           NEXORA AI 6.7")
    print("==========================================")
    print("KNOWLEDGE EXPANSION ACTIVE")
    print("CONTEXT ENGINE ACTIVE")
    print("CONVERSATION HISTORY ACTIVE")
    print("USER SYSTEM ACTIVE")
    print("SIGNUP + LOGIN ACTIVE")
    print("USER-SPECIFIC MEMORY ACTIVE")
    print("USER-SPECIFIC HISTORY ACTIVE")

    if DATABASE_URL:
        print("POSTGRESQL DATABASE ACTIVE")
    else:
        print("LOCAL JSON STORAGE ACTIVE")

    print("==========================================")
    print("Server: http://127.0.0.1:5000")
    print("==========================================")
    print("")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )