// Quiz Data
// const quizData = [
//   {
//     question: "Which HTML tag is used to create a hyperlink?",
//     options: ["<a>", "<link>", "<href>", "<hyperlink>"],
//     correctIndex: 0,
//   },
//   {
//     question: "Which attribute is used to provide a unique identifier in HTML?",
//     options: ["class", "id", "name", "data-id"],
//     correctIndex: 1,
//   },
//   {
//     question: "What does HTML stand for?",
//     options: [
//       "HyperText Markup Language",
//       "HighText Machine Language",
//       "Hyperlinking Text Machine Language",
//       "HyperTool Multi Language",
//     ],
//     correctIndex: 0,
//   },
// ];

let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 30;
let highScore = localStorage.getItem("highScore") || 0;
let quizData = [];

const homeScreen = document.getElementById("homeScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");

const startButton = document.getElementById("startButton");
const nextBtn = document.getElementById("nextBtn");
const restartButton = document.getElementById("restartButton");
const icon = document.getElementById("soundIcon");
const progressBar = document.getElementById("quizProgress");

const questionText = document.getElementById("questionText");
const answerOptions = document.getElementById("answerOptions");

const currentQuestionNum = document.getElementById("currentQuestionNum");
const totalQuestions = document.getElementById("totalQuestions");
const homeTotalQuestions = document.getElementById("homeTotalQuestions");
const resultTotalQuestions = document.getElementById("resultTotalQuestions");

const timerDisplay = document.getElementById("timer");
const time = document.getElementById("time");

const correctAnswers = document.getElementById("correctAnswers");
const correctPercent = document.getElementById("correctPercent");
const wrongPercent = document.getElementById("wrongPercent");
const resultFeedback = document.getElementById("resultFeedback");
const resultProgressBar = document.getElementById("resultProgressBar");
const highScoreDisplay = document.getElementById("highScore");

// Quiz Data
async function loadQuizData() {
  try {
    const res = await fetch(
      "https://opentdb.com/api.php?amount=10&type=multiple&category=18"
    );
    const data = await res.json();
    console.log(data);
    if (data.response_code === 0) {
      quizData = data.results.map((item) => {
        const options = [...item.incorrect_answers];
        const correctIndex = Math.floor(Math.random() * 4);
        options.splice(correctIndex, 0, item.correct_answer);
        return {
          question: decodeHTML(item.question),
          options: options.map(decodeHTML),
          correctIndex,
        };
      });
      localStorage.setItem("totalQuestions", quizData.length);
      homeTotalQuestions.textContent = quizData.length;
      totalQuestions.textContent = quizData.length;
      resultTotalQuestions.textContent = quizData.length;
    } else {
      alert("Failed to load quiz questions. Try again later.");
    }
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    alert("Failed to connect to the quiz server.");
  }
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

highScoreDisplay.textContent = highScore;

// Reset UI state
function resetUIState() {
  quizScreen.classList.remove("bg-warning-subtle", "bg-danger-subtle");
  quizScreen.classList.add("bg-success-subtle");
  progressBar.style.width = "0%";

  time.classList.remove("bg-warning", "bg-danger");
  time.classList.add("bg-success");

  answerOptions.innerHTML = "";
  timerDisplay.textContent = "00:30";
}
const storedTotalQuestions = localStorage.getItem("totalQuestions");
if (storedTotalQuestions) {
  homeTotalQuestions.textContent = storedTotalQuestions;
}

// Start quiz
function startQuiz() {
  resetUIState();

  homeScreen.classList.add("d-none");
  resultScreen.classList.add("d-none");
  quizScreen.classList.remove("d-none");

  currentQuestionIndex = 0;
  score = 0;

  showQuestion();
}

// Start timer
function startTimer() {
  clearInterval(timer);
  timeLeft = 30;
  updateTimerDisplay();
  timer = setInterval(() => {
    console.log("tick");
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timer);
      handleNext();
    }
    if (timeLeft > 10 && timeLeft <= 20) {
      quizScreen.classList.remove("bg-success-subtle", "bg-danger-subtle");
      quizScreen.classList.add("bg-warning-subtle");

      time.classList.remove("bg-success", "bg-danger");
      time.classList.add("bg-warning");
    }
    if (timeLeft <= 10) {
      quizScreen.classList.remove("bg-success-subtle", "bg-warning-subtle");
      quizScreen.classList.add("bg-danger-subtle");

      time.classList.remove("bg-success", "bg-warning");
      time.classList.add("bg-danger");
    }
  }, 1000);
}

// Reset and restart timer
function resetTimer() {
  clearInterval(timer);
  startTimer();
}

// Update timer text
function updateTimerDisplay() {
  timerDisplay.textContent = `00:${timeLeft < 10 ? "0" + timeLeft : timeLeft}`;
}

// Show current question
function showQuestion() {
  nextBtn.disabled = true;
  const q = quizData[currentQuestionIndex];
  questionText.textContent = q.question;
  currentQuestionNum.textContent = currentQuestionIndex + 1;
  answerOptions.innerHTML = "";

  quizScreen.classList.remove("bg-warning-subtle", "bg-danger-subtle");
  quizScreen.classList.add("bg-success-subtle");

  time.classList.remove("bg-warning", "bg-danger");
  time.classList.add("bg-success");

  q.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.className =
      "btn btn-outline-secondary border-4 fw-bold fs-5 text-start px-3";
    btn.textContent = option;
    btn.dataset.index = index;
    btn.onclick = () => selectAnswer(index);
    answerOptions.appendChild(btn);
  });
  if (currentQuestionIndex === quizData.length - 1) {
    nextBtn.innerHTML = 'Submit <i class="bi bi-chevron-right"></i>';
    nextBtn.className = "btn btn-success text-white rounded-3 fw-bold fs-4";
  }

  resetTimer();
}

// Answer selection
function selectAnswer(selectedIndex) {
  const q = quizData[currentQuestionIndex];
  const buttons = answerOptions.querySelectorAll("button");
  nextBtn.disabled = false;
  buttons.forEach((btn) => (btn.disabled = true));

  if (selectedIndex === q.correctIndex) {
    score++;
    buttons[selectedIndex].classList.replace(
      "btn-outline-secondary",
      "btn-success"
    );
    playSound("correct");
  } else {
    buttons[selectedIndex].classList.replace(
      "btn-outline-secondary",
      "btn-danger"
    );
    buttons[q.correctIndex].classList.replace(
      "btn-outline-secondary",
      "btn-success"
    );
    playSound("incorrect");
  }
  clearInterval(timer);
}

// Next button
function handleNext() {
  if (currentQuestionIndex < quizData.length - 1) {
    currentQuestionIndex++;
    quizScreen.classList.replace("bg-danger-subtle", "bg-success-subtle");
    time.classList.replace("bg-danger", "bg-success");
    progressBar.style.width =
      (currentQuestionIndex / quizData.length) * 100 + "%";
    showQuestion();
  } else {
    endQuiz();
  }
}

// End quiz and show result
function endQuiz() {
  quizScreen.classList.add("d-none");
  resultScreen.classList.remove("d-none");

  const correct = score;
  const total = quizData.length;
  const percent = Math.round((correct / total) * 100);

  correctAnswers.textContent = correct;
  correctPercent.textContent = percent;
  wrongPercent.textContent = 100 - percent;
  resultProgressBar.style.width = `${percent}%`;

  if (percent >= 80) {
    resultFeedback.textContent = "Excellent work! You're a frontend pro! 🎉";
  } else if (percent >= 50) {
    resultFeedback.textContent = "Good effort! Keep practicing! 👍";
  } else {
    resultFeedback.textContent = "Keep learning! You’ll get better! 💪";
  }

  if (score > highScore) {
    localStorage.setItem("highScore", score);
    highScoreDisplay.textContent = score;
  }
}

// Restart quiz
function restartQuiz() {
  clearInterval(timer);
  timeLeft = 30;
  score = 0;
  currentQuestionIndex = 0;

  // Reset background colors
  quizScreen.classList.remove("bg-warning-subtle", "bg-danger-subtle");
  quizScreen.classList.add("bg-success-subtle");

  time.classList.remove("bg-warning", "bg-danger");
  time.classList.add("bg-success");

  resultScreen.classList.add("d-none");
  homeScreen.classList.remove("d-none");
}

// Sound functionality
let isSoundEnabled = true;

function toggleSound() {
  icon.classList.toggle("bi-volume-up-fill");
  icon.classList.toggle("bi-volume-mute-fill");

  isSoundEnabled = !isSoundEnabled;
}

function playSound(type) {
  if (!isSoundEnabled) return;

  let audioSrc;

  switch (type) {
    case "correct":
      audioSrc = "./sounds/correct.wav";
      break;
    case "incorrect":
      audioSrc = "./sounds/incorrect.wav";
      break;
    default:
      console.warn(`Unknown sound type: ${type}`);
      return;
  }

  const audio = new Audio(audioSrc);
  audio.play().catch((err) => {
    console.error("Audio playback failed:", err);
  });
}

// Event listeners
startButton.addEventListener("click", async () => {
  await loadQuizData();
  startQuiz();
});
nextBtn.addEventListener("click", handleNext);
icon.addEventListener("click", toggleSound);
restartButton.addEventListener("click", restartQuiz);
