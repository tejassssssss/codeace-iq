# 🚀 CodeAce IQ

**CodeAce IQ** is a web-based quiz application built using **HTML**, **CSS**, and **JavaScript** that helps users test and improve their knowledge across various development topics.

---

## 🎮 Features

### ✅ Two Modes of Play

**Daily Challenge**
- You can play this only once per day.
- It gives 5 random questions from all topics.
- Once played, the button is disabled until the next day.

**Start Quiz (Normal Mode)**
- You can choose a specific topic.
- Select the number of questions: 5, 10, 15, 20, 25, or 30.
- Topics available: HTML, CSS, JavaScript, SQL, React.js, Node.js, Express.js, Python, or All Topics.

---

### ⏱️ Timer
- Each question has a 15-second timer.
- If time runs out, it shows an explanation in orange text.

---

### 🧠 Multiple Choice Questions (MCQs)
- Each topic has 20 questions stored in a JSON file.
- Correct answers show feedback in green with an explanation.
- Wrong answers show feedback in red with an explanation.

---

### 📈 Score Tracking
- Score is updated after each question.
- End of quiz shows message like:  
  `🎉 Quiz completed! Your final score is X.`
- Restart Quiz option appears after normal mode.

---

### 💾 Progress Tracking (Local Storage)
- Saves your progress for the normal quiz (topic-based).
- Daily Challenge tracks the date to limit one play per day.
