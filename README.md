# ProctorEye

ProctorEye is an online exam platform with a live proctoring layer. Teachers publish textual tests. Students take them in a monitored page that watches face presence, tab focus, and copy-paste.

## What it does

**Teachers**

- Sign up and sign in
- Create a test and add questions
- Publish tests for students

**Students**

- Sign up, sign in, and open the tests assigned to them
- Sit the exam with a webcam preview

**During the attempt**

- Face presence through MediaPipe Face Mesh and `react-webcam`
- Tab-switch / attention signals
- Copy-paste attempts
- Those events are posted to `POST /cheating-log` and stored in Supabase

Authentication and the exam tables live in Supabase. The Flask API is the write path for tests, questions, answers, logins, and the cheating log.

## Run

The UI calls the API at `http://127.0.0.1:5000`.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `Backend/.env`:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

```bash
# terminal 1
cd Backend
python app.py

# terminal 2
cd Frontend
npm install
npm run dev
```

## Stack

React 19, Vite, Tailwind, Flask, Supabase, MediaPipe Face Mesh.

## Limits

Face presence is a signal, not proof of identity and not proof of cheating. Lighting, camera angle, and more than one person in frame will change what the mesh reports. Review the log before treating an attempt as misconduct.
