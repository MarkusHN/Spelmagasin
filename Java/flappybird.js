// Global variables for the game board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Global variables for the bird
let birdWidth = 34; // Width of the bird
let birdHeight = 24; // Height of the bird
let birdX = boardWidth / 8; // Initial X position of the bird
let birdY = boardHeight / 2; // Initial Y position of the bird
let birdImg;

// Object representing the bird
let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// Global variables for the pipes
let pipeArray = [];
let pipeWidth = 64; // Width of the pipes
let pipeHeight = 512; // Height of the pipes
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// Physics variables
let velocityX = -2; // Horizontal velocity of the pipes (moving left)
let velocityY = 0; // Vertical velocity of the bird (jump speed)
let gravity = 0.4; // Gravity affecting the bird

// Game status variables
let gameOver = false; // Flag indicating whether the game is over
let score = 0; // Player's score

// Flag indicating whether the game has started
let gameStarted = false;

// Define an array to store high scores
let highScores = [];

// Function to load high scores from local storage
function loadHighScores() {
    let storedScores = localStorage.getItem("flappyBirdHighScores");
    if (storedScores) {
        highScores = JSON.parse(storedScores);
    }
    console.log("Loaded high scores:", highScores);
}

// Function to save high scores to local storage
function saveHighScores() {
    localStorage.setItem("flappyBirdHighScores", JSON.stringify(highScores));
    console.log("Saved high scores:", highScores);
}

// Function to update and display high score board
function updateHighScoreBoard() {
    // Sort high scores in descending order
    highScores.sort((a, b) => b - a);

    // Display top 5 high scores
    let highScoreList = document.getElementById("highScoreList");
    highScoreList.innerHTML = "<h2>High Scores:</h2>";
    for (let i = 0; i < Math.min(5, highScores.length); i++) {
        highScoreList.innerHTML += "<p>" + (i + 1) + ". " + highScores[i] + "</p>";
    }
}

// Function to update high scores when a new score is achieved
function updateHighScores(newScore) {
    console.log("New score:", newScore);
    // Add new score to the array if it's higher than the 5th highest score
    if (highScores.length < 5 || newScore > highScores[highScores.length - 1]) {
        highScores.push(newScore);
    }

    // Sort high scores in descending order and keep only top 5
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5);

    // Save high scores to local storage
    saveHighScores();

    // Update and display high score board
    updateHighScoreBoard();
}

// Function to reset high scores
function resetHighScores() {
    // Clear the high scores array
    highScores = [];

    // Save the empty array to local storage
    saveHighScores();

    // Update and display the high score board
    updateHighScoreBoard();
}

// Function to initialize the game
function initializeGame() {
    // Reset game status variables
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    velocityY = 0;
}

// Call loadHighScores function when the game starts to load existing high scores
window.onload = function () {
    // Load and display high scores
    loadHighScores();
    updateHighScoreBoard();

    // Initialize the game board
    board = document.getElementById("board");
    context = board.getContext("2d");

    // Load images when they are ready
    birdImg = new Image();
    birdImg.src = "Images/flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "Images/Pipetop.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "Images/Pipebottom.png";

    updateCanvasSize(); // Update canvas size
    setInterval(placePipes, 1500); //every 1.5 seconds

    document.addEventListener("keydown", moveBird);
    addStartButton();
    requestAnimationFrame(update);
};

// Function to update the canvas size based on the screen size
function updateCanvasSize() {
    // Adjust canvas dimensions based on the screen size
    boardWidth = window.innerWidth < 360 ? window.innerWidth : 360;
    boardHeight = window.innerHeight < 640 ? window.innerHeight : 640;

    // Update canvas size
    board.width = boardWidth;
    board.height = boardHeight;
}

// Call updateCanvasSize function when the window is resized
window.addEventListener("resize", updateCanvasSize);

// Main game loop to update the game state
function update() {
    if (!gameOver) {
        context.clearRect(0, 0, board.width, board.height);

        // Update bird position based on gravity
        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY, 0);
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

        // Check if bird falls out of the board
        if (bird.y > board.height) {
            gameOver = true;
            // Add game over animation here
            gameOverAnimation();
            updateHighScores(score);
            addRestartButton();
            return;
        }

        // Update and draw pipes
        for (let i = 0; i < pipeArray.length; i++) {
            let pipe = pipeArray[i];
            pipe.x += velocityX;
            context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

            // Increase score if bird passes a pipe
            if (!pipe.passed && bird.x > pipe.x + pipe.width) {
                score += 0.5; //because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
                pipe.passed = true;
            }

            // Check for collision with pipes
            if (detectCollision(bird, pipe)) {
                gameOver = true;
                // Add game over animation here
                gameOverAnimation();
                updateHighScores(score);
                addRestartButton();
                return;
            }
        }

        // Remove pipes that are out of the board
        while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift(); //removes the first element from the array
        }

        // Draw score
        context.fillStyle = "white";
        context.font = "45px sans-serif";
        context.fillText(score, 5, 45);
    }
    requestAnimationFrame(update);
}

// Function for game over animation
function gameOverAnimation() {
    // Add your game over animation code here
    // For example, you can display a "Game Over" message with a fade-in effect
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, board.width, board.height); // Dark overlay
    context.fillStyle = "white";
    context.font = "50px sans-serif";
    let gameOverText = "Game Over";
    let textWidth = context.measureText(gameOverText).width;
    let textX = (boardWidth - textWidth) / 2;
    let textY = boardHeight / 2;
    context.fillText(gameOverText, textX, textY);
}

// Function to place pipes
function placePipes() {
    if (gameOver || !gameStarted) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };

    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

// Function to handle bird movement
function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX" || e.code == "") {
        if (!gameStarted) {
            gameStarted = true;
            velocityY = -6;
        } else {
            velocityY = -6;
        }
    }

    // Reset game if it's over
    if (gameOver) {
        initializeGame();
        gameStarted = true;
        velocityY = -6;
    }
}

// Function called when a touch event is detected
function touchHandler(event) {
    event.preventDefault();
    if (!gameStarted) {
        gameStarted = true;
        velocityY = -6;
    } else {
        jump();
    }

    // Reset game if it's over
    if (gameOver) {
        initializeGame();
        gameStarted = true;
        velocityY = -6;
    }
}

// Add event listeners for touch events
document.addEventListener("touchstart", touchHandler);
document.addEventListener("touchend", touchHandler);
document.addEventListener("touchcancel", touchHandler);
document.addEventListener("touchmove", touchHandler);

// Function to handle bird movement (jump)
function jump() {
    velocityY = -6;
}

// Function to detect collision between two objects
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

// Function to add the start button
function addStartButton() {
    let startButton = document.createElement("button");
    startButton.innerHTML = "Start Game";
    startButton.id = "startButton";
    startButton.style.position = "absolute";
    startButton.style.left = "50%";
    startButton.style.top = "70%";
    startButton.style.transform = "translate(-50%, -50%)";
    startButton.style.padding = "10px 20px";
    startButton.style.fontSize = "20px";
    startButton.style.zIndex = "10";
    startButton.style.backgroundColor = "#ff0";
    startButton.style.border = "2px solid #000";
    startButton.style.color = "#000";
    document.body.appendChild(startButton);

    startButton.addEventListener("click", function () {
        startButton.remove();
        initializeGame();
        gameStarted = true;
        requestAnimationFrame(update);
    });
}

// Function to add the restart button
function addRestartButton() {
    let restartButton = document.createElement("button");
    restartButton.innerHTML = "Restart Game";
    restartButton.id = "restartButton";
    restartButton.style.position = "absolute";
    restartButton.style.left = "50%";
    restartButton.style.top = "70%";
    restartButton.style.transform = "translate(-50%, -50%)";
    restartButton.style.padding = "10px 20px";
    restartButton.style.fontSize = "20px";
    restartButton.style.zIndex = "10";
    restartButton.style.backgroundColor = "#ff0";
    restartButton.style.border = "2px solid #000";
    restartButton.style.color = "#000";
    document.body.appendChild(restartButton);

    restartButton.addEventListener("click", function () {
        restartButton.remove();
        initializeGame();
        gameStarted = true;
        requestAnimationFrame(update);
        startButton.remove();
    });
}