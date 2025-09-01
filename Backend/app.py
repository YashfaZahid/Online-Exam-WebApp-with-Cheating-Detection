import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv

# ------------------------
# Flask Config
# ------------------------
app = Flask(__name__)
CORS(app)

# ------------------------
# Supabase Setup
# ------------------------
load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# ------------------------
# Routes: Supabase Features
# ------------------------
@app.route('/add-question', methods=['POST'])
def add_question():
    data = request.get_json()
    question_text = data.get('question_text')
    test_id = data.get('test_id')
    result = supabase.table('Questions').insert({
        "question_text": question_text,
        "test_id": test_id
    }).execute()
    return jsonify(result.data)

@app.route('/get-questions/<int:test_id>', methods=['GET'])
def get_questions(test_id):
    result = supabase.table('Questions').select('*').eq('test_id', test_id).execute()
    return jsonify(result.data)

@app.route('/add-test', methods=['POST'])
def add_test():
    data = request.get_json()
    title = data.get('title')
    teacher_id = data.get('teacher_id')
    result = supabase.table('Tests').insert({
        "title": title,
        "teacher_id": teacher_id
    }).execute()
    if result.data:
        return jsonify({"success": True, "id": result.data[0]["id"]})
    return jsonify({"success": False}), 400

@app.route('/get-tests', methods=['GET'])
def get_tests():
    result = supabase.table('Tests').select('*').execute()
    return jsonify(result.data)

@app.route('/add-student', methods=['POST'])
def add_student():
    data = request.get_json()
    result = supabase.table('Students').insert({
        "username": data.get('username'),
        "password": data.get('password'),
        "email": data.get('email')
    }).execute()
    return jsonify(result.data)

@app.route('/student-login', methods=['POST'])
def student_login():
    data = request.get_json()
    username = data.get('username', "").strip()
    password = data.get('password', "").strip()
    result = supabase.table('Students').select('*').eq('username', username).eq('password', password).execute()
    if result.data:
        return jsonify({"success": True, "id": result.data[0]["id"]})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/teacher-login', methods=['POST'])
def teacher_login():
    data = request.get_json()
    username = data.get('username', "").strip()
    password = data.get('password', "").strip()
    result = supabase.table('Teachers').select('id,username,password').eq('username', username).eq('password', password).execute()
    if result.data:
        user = result.data[0]
        return jsonify({"success": True, "id": user["id"], "username": user["username"]})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/get-teachers', methods=['GET'])
def get_teachers():
    result = supabase.table('Teachers').select('*').execute()
    return jsonify(result.data)

@app.route('/add-answer', methods=['POST'])
def add_answer():
    data = request.get_json()
    result = supabase.table('Answers').insert({
        "question_id": data.get('question_id'),
        "student_id": data.get('student_id'),
        "answer_text": data.get('answer_text')
    }).execute()
    return jsonify(result.data)

@app.route('/get-answers', methods=['GET'])
def get_answers():
    result = supabase.table('Answers').select('*').execute()
    return jsonify(result.data)

# ------------------------
# Cheating Logs Route (Corrected)
# ------------------------
@app.route("/cheating-log", methods=["POST"])
def cheating_log():
    data = request.get_json()
    student_id = data.get("student_id")
    test_id = data.get("test_id")

    # Validate student
    student_check = supabase.table("Students").select("*").eq("id", student_id).execute()
    if not student_check.data:
        return jsonify({"success": False, "error": f"Student ID {student_id} does not exist"}), 400

    # Validate test
    test_check = supabase.table("Tests").select("*").eq("id", test_id).execute()
    if not test_check.data:
        return jsonify({"success": False, "error": f"Test ID {test_id} does not exist"}), 400

    # Insert cheating log
    event_details = data.get("event_details") or data.get("details")
    result = supabase.table("Cheating_Logs").insert({
        "student_id": student_id,
        "test_id": test_id,
        "event_type": data.get("event_type"),
        "event_details": event_details
    }).execute()

    if result.error:
        return jsonify({"success": False, "error": result.error}), 400

    return jsonify({"success": True, "data": result.data})

# ------------------------
# Run App
# ------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)
