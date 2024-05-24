let score = 0;
let time = 10;
let timer;

document.getElementById('clickButton').addEventListener('click', () => {
    score++;
    document.getElementById('score').innerText = `Score: ${score}`;
});

function countdown() {
    if (time > 0) {
        time--;
        document.getElementById('time').innerText = `Time: ${time}`;
    } else {
        clearInterval(timer);
        showGameOverPopup();
    }
}

function startGame() {
    score = 0;
    time = 10;
    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('time').innerText = `Time: ${time}`;
    document.getElementById('clickButton').disabled = false;
    timer = setInterval(countdown, 1000);
}

function showGameOverPopup() {
    const modal = document.getElementById('gameOverModal');
    const finalScore = document.getElementById('finalScore');
    finalScore.innerText = `Your score is: ${score}`;
    modal.style.display = 'block';

    updateHighScoreBoard(score);
}

function updateHighScoreBoard(newScore) {
    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    highScores.push(newScore);
    highScores.sort((a, b) => b - a);
    if (highScores.length > 5) highScores.pop(); // Keep only top 5 scores
    localStorage.setItem('highScores', JSON.stringify(highScores));

    const highScoreList = document.getElementById('highScoreList');
    highScoreList.innerHTML = highScores.map((score, index) => `<li>${index + 1}. ${score}</li>`).join('');
}

const closeButton = document.getElementById('closeButton');
closeButton.addEventListener('click', () => {
    const modal = document.getElementById('gameOverModal');
    modal.style.display = 'none';
    const startGameModal = document.getElementById('startGameModal');
    startGameModal.style.display = 'block';
});

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', () => {
    const startGameModal = document.getElementById('startGameModal');
    startGameModal.style.display = 'none';
    startGame();
});

window.onload = () => {
    const startGameModal = document.getElementById('startGameModal');
    startGameModal.style.display = 'block';

    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const highScoreList = document.getElementById('highScoreList');
    highScoreList.innerHTML = highScores.map((score, index) => `<li>#${index + 1} ${score}</li>`).join('');
};
