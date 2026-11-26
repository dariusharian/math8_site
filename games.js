function openGame(name) {
    document.getElementById('gameMenu').style.display = 'none';
    document.querySelectorAll('.game-card').forEach(c => c.style.display = 'none');
    document.getElementById('game-' + name).style.display = 'block';
    if (name === 'puzzle') initPuzzle();
}

function backToMenu() {
    document.querySelectorAll('.game-card').forEach(c => c.style.display = 'none');
    document.getElementById('gameMenu').style.display = 'grid';
    clearInterval(speedTimer);
    clearInterval(eqTimer);
}

// ============ بازی ۱: ریاضی سریع ============
let speedScore = 0;
let speedTimer = null;
let speedTimeLeft = 60;

function startSpeed() {
    speedScore = 0;
    speedTimeLeft = 60;
    document.getElementById('speedScore').textContent = 0;
    document.getElementById('speedStart').disabled = true;
    document.getElementById('speedAnswer').disabled = false;
    document.getElementById('speedSubmit').disabled = false;
    document.getElementById('speedAnswer').focus();
    nextSpeedQuestion();
    
    speedTimer = setInterval(() => {
        speedTimeLeft--;
        document.getElementById('timer').textContent = speedTimeLeft;
        if (speedTimeLeft <= 0) endSpeedGame();
    }, 1000);
}

function nextSpeedQuestion() {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let answer;
    if (op === '+') answer = a + b;
    else if (op === '-') answer = a - b;
    else answer = a * b;
    
    window.currentSpeedAnswer = answer;
    document.getElementById('speedProblem').textContent = ${a} ${op} ${b} = ?;
    document.getElementById('speedAnswer').value = '';
    document.getElementById('speedAnswer').focus();
}

function submitSpeed() {
    const val = parseInt(document.getElementById('speedAnswer').value);
    if (val === window.currentSpeedAnswer) {
        speedScore += 5;
        document.getElementById('speedScore').textContent = speedScore;
        playSound('success');
    } else {
        speedScore = Math.max(0, speedScore - 2);
        document.getElementById('speedScore').textContent = speedScore;
        playSound('error');
    }
    nextSpeedQuestion();
}

function endSpeedGame() {
    clearInterval(speedTimer);
    document.getElementById('speedStart').disabled = false;
    document.getElementById('speedAnswer').disabled = true;
    document.getElementById('speedSubmit').disabled = true;
    document.getElementById('speedProblem').textContent = ⏰ پایان! امتیاز: ${speedScore};
    if (speedScore > 0) {
        Storage.saveGameResult('ریاضی سریع', speedScore);
        const name = prompt('نام خود را برای لیدربورد وارد کنید:', 'کاربر') || 'کاربر';
        Storage.addToLeaderboard(name, speedScore);
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        if (document.getElementById('game-speed').style.display === 'block') submitSpeed();
        if (document.getElementById('game-guess').style.display === 'block') checkGuess();
        if (document.getElementById('game-equation').style.display === 'block') submitEq();
    }
});

// ============ بازی ۲: حدس عدد ============
let targetNumber = 0;
let guessCount = 0;

function startGuess() {
    targetNumber = Math.floor(Math.random() * 100) + 1;
    guessCount = 0;
    document.getElementById('guessCount').textContent = 0;
    document.getElementById('guessHint').textContent = 'یک عدد بین ۱ تا ۱۰۰ حدس بزن';
    document.getElementById('guessHint').style.color = '';
    document.getElementById('guessInput').disabled = false;
    document.getElementById('guessBtn').disabled = false;
    document.getElementById('guessInput').value = '';
    document.getElementById('guessInput').focus();
}

function checkGuess() {
    const val = parseInt(document.getElementById('guessInput').value);
    if (isNaN(val)  val < 1  val > 100) {
        document.getElementById('guessHint').textContent = '⚠️ عدد بین ۱ تا ۱۰۰ وارد کن!';
        return;
    }
    guessCount++;
    document.getElementById('guessCount').textContent = guessCount;
    const hint = document.getElementById('guessHint');
    
    if (val === targetNumber) {
        hint.textContent = 🎉 آفرین! در ${guessCount} تلاش پیدا کردی!;
        hint.style.color = '#2ecc71';
        document.getElementById('guessInput').disabled = true;
        document.getElementById('guessBtn').disabled = true;
        playSound('success');
        const score = Math.max(10, 100 - guessCount * 5);
        Storage.saveGameResult('حدس عدد', score);
        const name = prompt('نام خود را برای لیدربورد وارد کنید:', 'کاربر') || 'کاربر';
        Storage.addToLeaderboard(name, score);
    } else if (val < targetNumber) {
        hint.textContent = '⬆️ عدد بزرگ‌تری حدس بزن';
        hint.style.color = '#3498db';
        playSound('error');
    } else {
        hint.textContent = '⬇️ عدد کوچک‌تری حدس بزن';
        hint.style.color = '#e74c3c';
        playSound('error');
    }
    document.getElementById('guessInput').value = '';
    document.getElementById('guessInput').focus();
}

// ============ بازی ۳: معادله‌ساز ============
let eqScore = 0;
let currentEqX = 0;
let eqTimer = null;

function newEquation() {
    currentEqX = Math.floor(Math.random() * 20) - 10;
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 20) - 10;
    const c = a * currentEqX + b;
    
    document.getElementById('equationProblem').textContent = 
        b >= 0 ? ${a}x + ${b} = ${c} : ${a}x - ${Math.abs(b)} = ${c};
    document.getElementById('eqAnswer').value = '';
    document.getElementById('eqHint').style.color = '';
    document.getElementById('eqAnswer').focus();
    
    let timeLeft = 10;
    document.getElementById('eqHint').textContent = ⏰ ${timeLeft} ثانیه;
    clearInterval(eqTimer);
    eqTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(eqTimer);
            document.getElementById('eqHint').textContent = ⏰ زمان تمام! x = ${currentEqX};
        } else {
            document.getElementById('eqHint').textContent = ⏰ ${timeLeft} ثانیه;
        }
    }, 1000);
}

function submitEq() {
    const val = parseInt(document.getElementById('eqAnswer').value);
    if (val === currentEqX) {
        eqScore += 10;
        document.getElementById('eqScore').textContent = eqScore;
        document.getElementById('eqHint').textContent = '✅ درست بود!';
        document.getElementById('eqHint').style.color = '#2ecc71';
        clearInterval(eqTimer);
        playSound('success');
        Storage.saveGameResult('معادله‌ساز', eqScore);
        setTimeout(newEquation, 1000);
    } else {
        document.getElementById('eqHint').textContent = ❌ اشتباه بود! جواب: ${currentEqX};
        document.getElementById('eqHint').style.color = '#e74c3c';
        playSound('error');
        clearInterval(eqTimer);
        setTimeout(newEquation, 1500);
    }
}

// ============ بازی ۴: پازل جمع ============
let puzzleFirst = null;
let pairsFound = 0;
let puzzleScore = 0;

function initPuzzle() {
    puzzleFirst = null;
    pairsFound = 0;
    puzzleScore = 0;
    document.getElementById('pairsFound').textContent = 0;
    document.getElementById('puzzleScore').textContent = 0;
    
    const puzzlePairs = [
        { q: '۵+۳', a: '۸' },
        { q: '۱۰-۴', a: '۶' },
        { q: '۲×۵', a: '۱۰' },
        { q: '۱۵÷۳', a: '۵' },
        { q: '۷+۲', a: '۹' },
        { q: '۴×۲', a: '۸' }
    ];
    
    const cards = [];
    puzzlePairs.forEach((p, i) => {
cards.push({ text: p.q, pairId: i });
        cards.push({ text: p.a, pairId: i });
    });
    cards.sort(() => Math.random() - 0.5);
    
    const grid = document.getElementById('puzzleGrid');
    grid.innerHTML = '';
    cards.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.textContent = c.text;
        btn.dataset.pairId = c.pairId;
        btn.dataset.idx = idx;
        btn.onclick = () => clickPuzzle(btn);
        grid.appendChild(btn);
    });
}

function clickPuzzle(btn) {
    if (btn.classList.contains('matched')) return;
    if (puzzleFirst === btn) return;
    
    if (!puzzleFirst) {
        puzzleFirst = btn;
        btn.style.opacity = '0.6';
        return;
    }
    
    if (puzzleFirst.dataset.pairId === btn.dataset.pairId) {
        puzzleFirst.classList.add('matched');
        btn.classList.add('matched');
        puzzleFirst.style.opacity = '1';
        pairsFound++;
        puzzleScore += 10;
        document.getElementById('pairsFound').textContent = pairsFound;
        document.getElementById('puzzleScore').textContent = puzzleScore;
        playSound('success');
        puzzleFirst = null;
        
        if (pairsFound === 6) {
            setTimeout(() => {
                alert('🎉 تبریک! همه جفت‌ها را پیدا کردی!');
                Storage.saveGameResult('پازل جمع', puzzleScore);
                const name = prompt('نام خود را برای لیدربورد وارد کنید:', 'کاربر') || 'کاربر';
                Storage.addToLeaderboard(name, puzzleScore);
            }, 300);
        }
    } else {
        const first = puzzleFirst;
        puzzleFirst = null;
        first.style.opacity = '1';
        playSound('error');
        btn.style.opacity = '0.5';
        setTimeout(() => { btn.style.opacity = '1'; }, 300);
    }
}
