let currentQuestionIndex = 0;
let score = 0;
let allQuestions = [];
let questions = [];
let timer;
let timeLeft = 15;
let hasAnswered = false;

let currentMode = null; // 'topic' or 'daily'
let lastCompletedMode = null;

const todayDate = new Date().toISOString().split('T')[0];
const lastDailyDate = localStorage.getItem('lastDailyDate');

const dailyBtn = document.getElementById('daily-challenge-btn');
if (lastDailyDate === todayDate) {
  dailyBtn.disabled = true;
}

let savedProgress = JSON.parse(localStorage.getItem('quizProgress'));
if (savedProgress && savedProgress.mode === 'topic') {
  currentMode = 'topic';
  currentQuestionIndex = savedProgress.currentQuestionIndex || 0;
  score = savedProgress.score || 0;
  document.getElementById('score').innerText = `Score: ${score}`;
}

fetch('questions.json')
  .then(response => response.json())
  .then(data => {
    allQuestions = data;
    if (savedProgress && savedProgress.mode === 'topic') {
      filterQuestionsByTopic();
      loadQuestion(currentQuestionIndex);
    }
  });

function showFeedback(message, type) {
  const feedback = document.getElementById('feedback');
  feedback.innerText = message;
  feedback.style.color =
    type === 'correct' ? 'green' :
    type === 'wrong' ? 'red' :
    type === 'timeout' ? 'orange' :
    'white';  // default to white for other messages, including completion messages
  feedback.style.fontWeight = 'bold';
}


function filterQuestionsByTopic() {
  if (currentMode === 'daily') return;

  currentMode = 'topic';
  const selectedTopic = document.getElementById('category-select').value;
  const questionCountSelect = document.getElementById('question-count');
  const questionCount = questionCountSelect ? parseInt(questionCountSelect.value, 10) : 10;

  let filtered = selectedTopic === 'all'
    ? shuffleArray(allQuestions)
    : shuffleArray(allQuestions.filter(q => q.topic === selectedTopic));

  questions = filtered.slice(0, questionCount);
  currentQuestionIndex = 0;
  score = 0;

  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('restart-btn').style.display = 'none';
  document.getElementById('feedback').innerText = '';
  document.getElementById('category-select').disabled = false;

  const savedProgress = {
    currentQuestionIndex,
    score,
    topic: selectedTopic,
    mode: 'topic'
  };
  localStorage.setItem('quizProgress', JSON.stringify(savedProgress));

  if (questions.length > 0) {
    loadQuestion(currentQuestionIndex);
  } else {
    document.getElementById('question').innerText = "No questions available for this topic.";
    document.getElementById('options').innerHTML = '';
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('timer').innerText = '';
  }
}

function loadQuestion(index) {
  hasAnswered = false;
  timeLeft = 15;
  document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
  document.getElementById('feedback').innerText = '';
  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
    if (timeLeft === 0) {
      clearInterval(timer);
      handleAnswer(-1, 0, questions[index].explanation);
    }
  }, 1000);

  const question = questions[index];
  document.getElementById('question').innerText = question.question;

  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';

  const originalOptions = question.options.map((text, i) => ({
    text,
    isCorrect: i === question.correctAnswerIndex
  }));
  const shuffledOptions = shuffleArray(originalOptions);

  shuffledOptions.forEach(option => {
    const li = document.createElement('li');
    li.innerText = option.text;
    li.addEventListener('click', () => {
      clearInterval(timer);
      handleAnswer(option.isCorrect ? 0 : 1, 0, question.explanation);
    });
    optionsContainer.appendChild(li);
  });

  document.getElementById('next-btn').style.display = 'none';
}

function saveProgress() {
  const progressData = {
    currentQuestionIndex,
    score,
    mode: currentMode,
  };
  if (currentMode === 'topic') {
    progressData.topic = document.getElementById('category-select').value;
  } else if (currentMode === 'daily') {
    progressData.questions = questions;
  }
  localStorage.setItem('quizProgress', JSON.stringify(progressData));
}

function handleAnswer(selectedIndex, correctIndex, explanation) {
  if (hasAnswered) return;
  hasAnswered = true;

  clearInterval(timer);

  const options = document.querySelectorAll('#options li');
  options.forEach(option => option.style.pointerEvents = 'none');

  if (selectedIndex === -1) {
    showFeedback(`⏰ Time's up!\n\n${explanation}`, 'timeout');
  } else if (selectedIndex === 0) {
    showFeedback(`✅ Correct Answer!\n\n${explanation}`, 'correct');
    score++;
    document.getElementById('score').innerText = `Score: ${score}`;
  } else if (selectedIndex === 1) {
    showFeedback(`❌ Wrong Answer.\n\n${explanation}`, 'wrong');
  }

  saveProgress();

  document.getElementById('next-btn').style.display = 'inline-block';
}

document.getElementById('next-btn').addEventListener('click', () => {
  currentQuestionIndex++;
  saveProgress();

  if (currentQuestionIndex < questions.length) {
    loadQuestion(currentQuestionIndex);
    document.getElementById('next-btn').style.display = 'none';
  } else {
    let finalMsg = `🎉 Quiz completed! Your final score is ${score}.`;
    if (currentMode === 'daily') {
      finalMsg += `\n✅ You've already completed today's Daily Challenge. Come back tomorrow!`;
    }
    showFeedback(finalMsg, 'done');

    lastCompletedMode = currentMode;

    document.getElementById('next-btn').style.display = 'none';

    if (currentMode === 'daily') {
      document.getElementById('restart-btn').style.display = 'none';
    } else {
      document.getElementById('restart-btn').style.display = 'inline-block';
    }

    document.getElementById('category-select').disabled = false;
    dailyBtn.disabled = true;
    currentMode = null;
  }
});

document.getElementById('restart-btn').addEventListener('click', () => {
  if (lastCompletedMode === 'daily' && lastDailyDate === todayDate) {
    showFeedback("✅ You've already completed today's Daily Challenge. Come back tomorrow!", 'done');
    return;
  }

  localStorage.removeItem('quizProgress');
  savedProgress = null;
  currentQuestionIndex = 0;
  score = 0;
  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('restart-btn').style.display = 'none';
  document.getElementById('feedback').innerText = '';
  document.getElementById('question').innerText = '';
  document.getElementById('options').innerHTML = '';
  document.getElementById('timer').innerText = '';
  document.getElementById('category-select').disabled = false;

  filterQuestionsByTopic();
});

document.getElementById('category-select').addEventListener('change', () => {
  if (currentMode === 'daily') return;
  savedProgress = null;
  filterQuestionsByTopic();
});

document.getElementById('question-count')?.addEventListener('change', () => {
  if (currentMode === 'daily') return;
  savedProgress = null;
  filterQuestionsByTopic();
});

dailyBtn.addEventListener('click', () => {
  if (dailyBtn.disabled) return; // Safety check: do nothing if disabled
  startDailyChallenge();
});

function startDailyChallenge() {
  if (allQuestions.length === 0) {
    alert('Questions are not loaded yet, please wait...');
    return;
  }

  // Disable button and save date immediately
  dailyBtn.disabled = true;
  localStorage.setItem('lastDailyDate', todayDate);

  currentMode = 'daily';
  questions = shuffleArray(allQuestions).slice(0, 5);
  currentQuestionIndex = 0;
  score = 0;

  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('restart-btn').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('feedback').innerText = '';
  document.getElementById('category-select').disabled = true;

  saveProgress();
  loadQuestion(currentQuestionIndex);
}

function shuffleArray(arr) {
  let array = arr.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
