let questions = [];
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 20;
let selectedLevel = "kolay";

function startGame(level) {
  selectedLevel = level;
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("quiz-screen").classList.remove("hidden");
  loadQuestions();
}

function loadQuestions() {
  fetch("sorular.txt")
    .then(response => response.text())
    .then(text => {
      const allLines = text.trim().split("\n");
      const levelQuestions = allLines.filter(line => line.includes("?"));
      const startIndex = { kolay: 0, orta: 10, zor: 20 }[selectedLevel];
      questions = levelQuestions.slice(startIndex, startIndex + 10).map(line => {
        const parts = line.split("|");
        return {
          question: parts[0].replace(/"/g, ""),
          options: parts.slice(1, 6),
          answer: parts[6].trim(),
          explanation: parts[7]?.replace(/"/g, "") || ""
        };
      });
      showQuestion();
    });
}

function showQuestion() {
  if (currentQuestion >= questions.length) return endGame();

  const q = questions[currentQuestion];
  document.getElementById("question-text").textContent = q.question;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  const letters = ["A", "B", "C", "D", "E"];
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.textContent = `${letters[i]}. ${opt}`;
    btn.onclick = () => checkAnswer(letters[i]);
    optionsDiv.appendChild(btn);
  });

  document.getElementById("explanation").classList.add("hidden");
  timeLeft = 20;
  updateTimer();
}

function updateTimer() {
  clearInterval(timer);
  const bar = document.getElementById("timer-bar");
  timer = setInterval(() => {
    timeLeft--;
    bar.style.width = `${(timeLeft / 20) * 100}%`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      checkAnswer(null);
    }
  }, 1000);
}

function checkAnswer(choice) {
  clearInterval(timer);
  const q = questions[currentQuestion];
  const explanation = document.getElementById("explanation");
  explanation.classList.remove("hidden");
  explanation.textContent = q.explanation;

  if (choice === q.answer) {
    score += 10 + (timeLeft * 0.5);
  } else {
    score -= 2.5;
  }

  currentQuestion++;
  setTimeout(showQuestion, 2500);
}

function endGame() {
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("end-screen").classList.remove("hidden");
  document.getElementById("final-score").textContent = Math.round(score);

  const highScores = JSON.parse(localStorage.getItem("edebiyatSkorlar")) || [];
  highScores.push(Math.round(score));
  highScores.sort((a, b) => b - a);
  const top5 = highScores.slice(0, 5);
  localStorage.setItem("edebiyatSkorlar", JSON.stringify(top5));

  const hsList = document.getElementById("highscores");
  hsList.innerHTML = "";
  top5.forEach(s => {
    const li = document.createElement("li");
    li.textContent = s + " puan";
    hsList.appendChild(li);
  });
}

function restartGame() {
  score = 0;
  currentQuestion = 0;
  document.getElementById("end-screen").classList.add("hidden");
  document.getElementById("start-screen").classList.remove("hidden");
}
