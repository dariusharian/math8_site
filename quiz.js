let currentChapter = null;
let currentQ = 0;
let score = 0;
let answered = false;

function initChapterSelect() {
    const container = document.getElementById('chapterSelect');
    Object.keys(questions).forEach(key => {
        const btn = document.createElement('button');
        btn.textContent = questions[key].name;
        btn.onclick = () => startQuiz(key);
        container.appendChild(btn);
    });
}

function startQuiz(chapter) {
    currentChapter = chapter;
    currentQ = 0;
    score = 0;
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'block';
    loadQuestion();
}

function loadQuestion() {
    answered = false;
    const chapterData = questions[currentChapter];
    const q = chapterData.questions[currentQ];
    const total = chapterData.questions.length;

    document.getElementById('score').textContent = score;
    document.getElementById('progressText').textContent = سوال ${currentQ + 1} از ${total};
    document.getElementById('progressFill').style.width = ${(currentQ / total) * 100}%;
    document.getElementById('questionText').textContent = q.q;
    document.getElementById('explainBox').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(i, btn, q);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected, btn, q) {
    if (answered) return;
    answered = true;
    const options = document.getElementById('options').children;
    
    if (selected === q.answer) {
        score += 10;
        btn.classList.add('correct');
        playSound('success');
    } else {
        btn.classList.add('wrong');
        options[q.answer].classList.add('correct');
        playSound('error');
    }
    
    document.getElementById('score').textContent = score;
    
    const explainBox = document.getElementById('explainBox');
    explainBox.textContent = '💡 ' + q.explain;
    explainBox.style.display = 'block';
    document.getElementById('nextBtn').style.display = 'inline-block';
}

function nextQuestion() {
    currentQ++;
    const total = questions[currentChapter].questions.length;
    if (currentQ < total) {
        loadQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('endScreen').style.display = 'block';
    const total = questions[currentChapter].questions.length;
    document.getElementById('finalScore').textContent = ${score} از ${total * 10};
    
    const percent = (score / (total * 10)) * 100;
    let msg = '';
    if (percent === 100) msg = '🏆 عالی! نمره کامل!';
    else if (percent >= 80) msg = '🌟 خیلی خوب!';
    else if (percent >= 60) msg = '👍 خوب، بازم تمرین کن!';
    else msg = '💪 نیاز به تمرین بیشتر داری!';
    document.getElementById('endMsg').textContent = msg;
    
    Storage.saveQuizResult(score, total * 10, questions[currentChapter].name);
    
    if (score > 0) {
        const name = prompt('نام خود را برای لیدربورد وارد کنید:', 'کاربر') || 'کاربر';
        Storage.addToLeaderboard(name, score);
    }
}

initChapterSelect();