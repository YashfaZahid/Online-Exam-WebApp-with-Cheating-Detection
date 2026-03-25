# ProctorEye

ProctorEye is a web-based online examination system with cheating detection features designed for both teachers and students. The platform allows teachers to create textual tests, while students can log in, view available tests, and take them in a monitored exam environment.

## Features

### Teacher
- Sign up and log in using Supabase authentication
- Create textual questions/tests
- Publish tests for students

### Student
- Sign up and log in using Supabase authentication
- View available tests on the student dashboard
- Attempt tests in a monitored exam interface

### Proctoring / Cheating Detection
- Face detection using MediaPipe
- Live webcam preview during the exam
- Copy-paste detection
- Tab switching / tab attention detection
- Suspicious activity monitoring during test attempts

## Tech Stack

- **Frontend:** React, HTML, CSS, JavaScript
- **Backend:** Flask
- **Authentication / Database:** Supabase
- **Face Detection:** MediaPipe

## Project Overview

ProctorEye is built to help conduct fair and secure online exams. Teachers can create tests and students can access them through their dashboard. During the exam, the system monitors face presence through the webcam and detects suspicious actions such as copy-paste attempts and tab switching.

## How It Works

1. Teacher signs up or logs in.
2. Teacher creates a textual test.
3. Student signs up or logs in.
4. Student opens the dashboard and sees available tests.
5. Student starts the exam.
6. The system activates webcam monitoring using MediaPipe.
7. The system tracks cheating-related behavior such as:
   - Face detection
   - Copy-paste actions
   - Tab attention / tab switching
8. Suspicious activity is recorded during the test.
