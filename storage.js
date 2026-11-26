const Storage = {
    get(key, defaultValue = null) {
        const data = localStorage.getItem('math8_' + key);
        return data ? JSON.parse(data) : defaultValue;
    },
    
    set(key, value) {
        localStorage.setItem('math8_' + key, JSON.stringify(value));
    },
    
    saveQuizResult(score, total, chapter) {
        const results = this.get('quizResults', []);
        results.push({ score, total, chapter, date: new Date().toISOString() });
        this.set('quizResults', results);
        this.updateBestScore(score);
    },
    
    saveGameResult(game, score) {
        const results = this.get('gameResults', []);
        results.push({ game, score, date: new Date().toISOString() });
        this.set('gameResults', results);
        this.updateBestScore(score);
    },
    
    updateBestScore(score) {
        const best = this.get('bestScore', 0);
        if (score > best) this.set('bestScore', score);
    },
    
    getStats() {
        const quizResults = this.get('quizResults', []);
        const gameResults = this.get('gameResults', []);
        return {
            totalQuiz: quizResults.length,
            totalGames: gameResults.length,
            bestScore: this.get('bestScore', 0)
        };
    },
    
    addToLeaderboard(name, score) {
        const lb = this.get('leaderboard', []);
        lb.push({ name, score, date: new Date().toISOString() });
        lb.sort((a, b) => b.score - a.score);
        this.set('leaderboard', lb.slice(0, 20));
    },
    
    getLeaderboard() {
        return this.get('leaderboard', []);
    }
};

function updateHomeStats() {
    const stats = Storage.getStats();
    const el1 = document.getElementById('totalQuiz');
    const el2 = document.getElementById('totalGames');
    const el3 = document.getElementById('bestScore');
    if (el1) el1.textContent = stats.totalQuiz;
    if (el2) el2.textContent = stats.totalGames;
    if (el3) el3.textContent = stats.bestScore;
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('math8_theme', isDark ? 'dark' : 'light');
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

(function applyTheme() {
    if (localStorage.getItem('math8_theme') === 'dark') {
        document.body.classList.add('dark');
        window.addEventListener('DOMContentLoaded', () => {
            const btn = document.getElementById('themeBtn');
            if (btn) btn.textContent = '☀️';
        });
    }
})();

function playSound(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'success') {
            osc.frequency.setValueAtTime(523, ctx.currentTime);
            osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
            osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        } else {
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
        }
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
}