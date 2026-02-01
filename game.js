const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Game state
let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isPaused = false;
let gameSpeed = 100;

// Initialize high score display
highScoreElement.textContent = highScore;

// Initialize snake
function initSnake() {
    snake = [
        { x: Math.floor(TILE_COUNT / 2), y: Math.floor(TILE_COUNT / 2) }
    ];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
}

// Generate random food position
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = newFood;
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (subtle)
    ctx.strokeStyle = 'rgba(78, 204, 163, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#4ecca3';
        } else {
            // Body with gradient effect
            const alpha = 1 - (index / snake.length) * 0.5;
            ctx.fillStyle = `rgba(78, 204, 163, ${alpha})`;
        }
        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );

        // Add rounded corners effect
        ctx.fillStyle = index === 0 ? '#6ee6bc' : `rgba(110, 230, 188, ${1 - (index / snake.length) * 0.5})`;
        ctx.fillRect(
            segment.x * GRID_SIZE + 3,
            segment.y * GRID_SIZE + 3,
            GRID_SIZE - 6,
            GRID_SIZE - 6
        );
    });

    // Draw food
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Food shine effect
    ctx.fillStyle = '#ff8787';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2 - 3,
        food.y * GRID_SIZE + GRID_SIZE / 2 - 3,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Update game state
function update() {
    // Apply direction change
    direction = { ...nextDirection };

    // If no direction, don't move
    if (direction.x === 0 && direction.y === 0) {
        return;
    }

    // Calculate new head position
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };

    // Check wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();

        // Increase speed slightly
        if (gameSpeed > 50) {
            gameSpeed -= 2;
            restartGameLoop();
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Game over handler
function gameOver() {
    clearInterval(gameLoop);
    gameLoop = null;

    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }

    // Flash effect
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Game over text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);

    startBtn.textContent = 'Play Again';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

// Game loop
function gameLoopFn() {
    update();
    draw();
}

// Restart game loop with new speed
function restartGameLoop() {
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = setInterval(gameLoopFn, gameSpeed);
    }
}

// Start game
function startGame() {
    initSnake();
    generateFood();
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 100;
    isPaused = false;

    startBtn.disabled = true;
    pauseBtn.disabled = false;
    pauseBtn.textContent = 'Pause';

    draw();
    gameLoop = setInterval(gameLoopFn, gameSpeed);
}

// Pause/Resume game
function togglePause() {
    if (isPaused) {
        gameLoop = setInterval(gameLoopFn, gameSpeed);
        pauseBtn.textContent = 'Pause';
        isPaused = false;
    } else {
        clearInterval(gameLoop);
        gameLoop = null;
        pauseBtn.textContent = 'Resume';
        isPaused = true;

        // Draw pause overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Paused', canvas.width / 2, canvas.height / 2);
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    // Prevent scrolling with arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }

    // Start game with any key if not running
    if (!gameLoop && !isPaused && e.key !== ' ') {
        startGame();
    }

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y !== 1) {
                nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
        case ' ':
            if (gameLoop || isPaused) {
                togglePause();
            }
            break;
        case 'Escape':
            if (gameLoop) {
                togglePause();
            }
            break;
    }
});

// Button controls
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

// Mobile controls
document.getElementById('upBtn').addEventListener('click', () => {
    if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
});
document.getElementById('downBtn').addEventListener('click', () => {
    if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
});
document.getElementById('leftBtn').addEventListener('click', () => {
    if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
});
document.getElementById('rightBtn').addEventListener('click', () => {
    if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
});

// Touch swipe controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Minimum swipe distance
    const minSwipe = 30;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > minSwipe && direction.x !== -1) {
            nextDirection = { x: 1, y: 0 };
        } else if (diffX < -minSwipe && direction.x !== 1) {
            nextDirection = { x: -1, y: 0 };
        }
    } else {
        // Vertical swipe
        if (diffY > minSwipe && direction.y !== -1) {
            nextDirection = { x: 0, y: 1 };
        } else if (diffY < -minSwipe && direction.y !== 1) {
            nextDirection = { x: 0, y: -1 };
        }
    }

    touchStartX = 0;
    touchStartY = 0;
});

// Initial draw
draw();
