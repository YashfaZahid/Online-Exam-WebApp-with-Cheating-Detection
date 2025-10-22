import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import statistics

app = Flask(__name__)
CORS(app)

load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)
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
        "test_id": data.get('test_id'),
        "question_id": data.get('question_id'),
        "student_id": data.get('student_id'),
        "answer_text": data.get('answer_text')
    }).execute()
    return jsonify(result.data)

@app.route('/get-answers', methods=['GET'])
def get_answers():
    result = supabase.table('Answers').select('*').execute()
    return jsonify(result.data)


@app.route('/cheating-log', methods=['POST'])
def cheating_log():
    data = request.get_json()
    result = supabase.table("Cheating_Logs").insert({
        "student_id": data.get('student_id'),
        "test_id": data.get('test_id'),
        "event_type": data.get('event_type'),
        "event_details": data.get('event_details') or data.get('details'),
        "event-duration": data.get('event_duration'),
        "gaze-direction": data.get('gaze_direction'),
        "mouse-movement": data.get('mouse_movement')
    }).execute()

    return jsonify({"success": True, "data": result.data})


@app.route('/submit-test', methods=['POST'])
def submit_test():
    data = request.json
    student_id = data.get("student_id")
    test_id = data.get("test_id")

    # Fetch logs from cheating_logs table for that student/test
    logs = (
        supabase.table("Cheating_Logs")
        .select("*")
        .eq("student_id", student_id)
        .eq("test_id", test_id)
        .execute()
        .data
    )

    if not logs:
        return jsonify({"message": "No logs found"}), 404

    total_events = len(logs)
    focus_loss_count = sum(1 for log in logs if log["event_type"] == "window_focus")
    durations = [log["event-duration"] for log in logs if log.get("event-duration")]
    avg_focus_loss_duration = round(statistics.mean(durations), 2) if durations else 0

    gaze_left_count = sum(1 for log in logs if str(log.get("gaze-direction")).lower() == "left")
    gaze_right_count = sum(1 for log in logs if str(log.get("gaze-direction")).lower() == "right")
    gaze_durations = [log["event-duration"] for log in logs if log.get("event_type") == "gaze_return_center"]
    avg_gaze_duration = round(statistics.mean(gaze_durations), 2) if gaze_durations else 0

    mouse_leave_count = sum(1 for log in logs if log.get("mouse-movement") == "left")
    copy_count = sum(1 for log in logs if log.get("event_type") == "copy")
    paste_count = sum(1 for log in logs if log.get("event_type") == "paste")

    # Insert summarized record into ml_training_data
    supabase.table("ml-training-data").insert({
        "student_id": student_id,
        "test_id": test_id,
        "total_events": total_events,
        "focues_loss_count": focus_loss_count,  # Keep same spelling as in DB
        "avg_focus_loss_duration": avg_focus_loss_duration,
        "gaze_left_count": gaze_left_count,
        "gaze_right_count": gaze_right_count,
        "avg_gaze_duration": avg_gaze_duration,
        "mouse_leave_count": mouse_leave_count,
        "copy_count": copy_count,
        "paste_count": paste_count,
        "cheating_label": None
    }).execute()

    return jsonify({"message": "ML summary saved successfully!"})


@app.route("/reports/<teacher_id>", methods=["GET"])
def get_reports(teacher_id):
    try:
        # Just get all records for this teacher_id
        response = supabase.table("ml-training-data").select("*").eq("teacher_id", teacher_id).execute()

        if not response.data:
            return jsonify({"message": "No records found"}), 404

        return jsonify(response.data)

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True, port=5000)
