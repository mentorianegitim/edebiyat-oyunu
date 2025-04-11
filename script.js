let questions = [];
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 20;
let topScores = JSON.parse(localStorage.getItem("topScores")) || [];

async function loadQuestions() {
    const res = await fetch('sorular.txt');
    const data = await res.text();
    const lines = data.trim().split('\n');
    questions = lines.map(line => {
        const [q, a, b, c, d, e, correctLetter, explanation] = line.split('|');
        return {
            question: q,
            options: [a, b, c, d, e],
            correctIndex: "ABCDE".indexOf(correctLetter.trim()),
            explanation: explanation
        };
    });
    showQuestion();
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        return showScore();
    }

    const q = questions[currentQuestion];
    document.getElementById("question").innerText = q.question;
    const answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";

    q.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "option";
        btn.onclick = () => checkAnswer(index, btn);
        answersDiv.appendChild(btn);
    });

    timeLeft = 20;
    document.getElementById("timer").innerText = `Kalan Süre: ${timeLeft} saniye`;
    document.getElementById("timer-bar").style.width = "100%";

    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = `Kalan Süre: ${timeLeft} saniye`;
        document.getElementById("timer-bar").style.width = (timeLeft * 5) + "%";

        if (timeLeft <= 0) {
            clearInterval(timer);
            disableOptions();
            showCorrectAnswer(q.correctIndex);
            setTimeout(() => {
                currentQuestion++;
                showQuestion();
            }, 2000);
        }
    }, 1000);
}

function checkAnswer(selectedIndex, selectedButton) {
    clearInterval(timer);
    const q = questions[currentQuestion];
    const correctIndex = q.correctIndex;
    const options = document.querySelectorAll(".option");

    options.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctIndex) {
            btn.classList.add("correct");
        } else if (idx === selectedIndex) {
            btn.classList.add("wrong");
        }
    });

    if (selectedIndex === correctIndex) {
        score += 10 + timeLeft * 0.5;
    } else {
        score -= 2.5;
    }

    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 2000);
}

function disableOptions() {
    document.querySelectorAll(".option").forEach(btn => btn.disabled = true);
}

function showCorrectAnswer(correctIndex) {
    document.querySelectorAll(".option").forEach((btn, idx) => {
        if (idx === correctIndex) {
            btn.classList.add("correct");
        }
    });
}

function showScore() {
    document.getElementById("game").innerHTML = `
        <h2>Oyun Bitti!</h2>
        <p>Toplam Puan: ${Math.round(score)}</p>
    `;

    topScores.push(Math.round(score));
    topScores.sort((a, b) => b - a);
    topScores = topScores.slice(0, 5);
    localStorage.setItem("topScores", JSON.stringify(topScores));

    const list = topScores.map(s => `<li>${s} puan</li>`).join("");
    document.getElementById("game").innerHTML += `
        <h3>En Yüksek Skorlar:</h3>
        <ol>${list}</ol>
    `;
}

loadQuestions();
