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
let gameSpeed = 150;

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

    // Draw snake body (draw from tail to head so head is on top)
    for (let i = snake.length - 1; i >= 0; i--) {
        const segment = snake[i];
        const centerX = segment.x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = segment.y * GRID_SIZE + GRID_SIZE / 2;

        if (i === 0) {
            // Draw head
            ctx.fillStyle = '#4ecca3';
            ctx.beginPath();
            ctx.arc(centerX, centerY, GRID_SIZE / 2 - 1, 0, Math.PI * 2);
            ctx.fill();

            // Head highlight
            ctx.fillStyle = '#6ee6bc';
            ctx.beginPath();
            ctx.arc(centerX - 2, centerY - 2, GRID_SIZE / 4, 0, Math.PI * 2);
            ctx.fill();

            // Eyes - position based on direction
            const eyeOffsetX = direction.x * 3;
            const eyeOffsetY = direction.y * 3;

            // Eye whites
            ctx.fillStyle = '#fff';
            if (direction.x !== 0) {
                // Moving horizontally
                ctx.beginPath();
                ctx.arc(centerX + eyeOffsetX, centerY - 4, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX + eyeOffsetX, centerY + 4, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Moving vertically or stationary
                ctx.beginPath();
                ctx.arc(centerX - 4, centerY + eyeOffsetY, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX + 4, centerY + eyeOffsetY, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            // Pupils
            ctx.fillStyle = '#1a1a2e';
            if (direction.x !== 0) {
                ctx.beginPath();
                ctx.arc(centerX + eyeOffsetX + direction.x, centerY - 4, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX + eyeOffsetX + direction.x, centerY + 4, 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(centerX - 4, centerY + eyeOffsetY + direction.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(centerX + 4, centerY + eyeOffsetY + direction.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Tongue (only when moving)
            if (direction.x !== 0 || direction.y !== 0) {
                ctx.strokeStyle = '#ff6b6b';
                ctx.lineWidth = 2;
                ctx.beginPath();
                const tongueStartX = centerX + direction.x * 8;
                const tongueStartY = centerY + direction.y * 8;
                ctx.moveTo(tongueStartX, tongueStartY);
                ctx.lineTo(tongueStartX + direction.x * 6, tongueStartY + direction.y * 6);
                // Fork
                ctx.moveTo(tongueStartX + direction.x * 6, tongueStartY + direction.y * 6);
                if (direction.x !== 0) {
                    ctx.lineTo(tongueStartX + direction.x * 8, tongueStartY - 3);
                    ctx.moveTo(tongueStartX + direction.x * 6, tongueStartY + direction.y * 6);
                    ctx.lineTo(tongueStartX + direction.x * 8, tongueStartY + 3);
                } else {
                    ctx.lineTo(tongueStartX - 3, tongueStartY + direction.y * 8);
                    ctx.moveTo(tongueStartX + direction.x * 6, tongueStartY + direction.y * 6);
                    ctx.lineTo(tongueStartX + 3, tongueStartY + direction.y * 8);
                }
                ctx.stroke();
            }
        } else {
            // Draw body segment as circle
            const alpha = 1 - (i / snake.length) * 0.4;
            ctx.fillStyle = `rgba(78, 204, 163, ${alpha})`;
            ctx.beginPath();
            ctx.arc(centerX, centerY, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
            ctx.fill();

            // Body segment highlight
            ctx.fillStyle = `rgba(110, 230, 188, ${alpha})`;
            ctx.beginPath();
            ctx.arc(centerX - 2, centerY - 2, GRID_SIZE / 4 - 1, 0, Math.PI * 2);
            ctx.fill();

            // Draw connector between segments for smoother look
            if (i < snake.length - 1) {
                const nextSegment = snake[i + 1];
                const nextCenterX = nextSegment.x * GRID_SIZE + GRID_SIZE / 2;
                const nextCenterY = nextSegment.y * GRID_SIZE + GRID_SIZE / 2;

                ctx.fillStyle = `rgba(78, 204, 163, ${alpha})`;
                ctx.fillRect(
                    Math.min(centerX, nextCenterX) - GRID_SIZE / 2 + 2,
                    Math.min(centerY, nextCenterY) - GRID_SIZE / 2 + 2,
                    Math.abs(nextCenterX - centerX) + GRID_SIZE - 4,
                    Math.abs(nextCenterY - centerY) + GRID_SIZE - 4
                );
            }
        }
    }

    // Draw apple
    const appleX = food.x * GRID_SIZE + GRID_SIZE / 2;
    const appleY = food.y * GRID_SIZE + GRID_SIZE / 2;

    // Apple body (red)
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(appleX, appleY + 1, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Apple darker side
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(appleX + 2, appleY + 2, GRID_SIZE / 2 - 4, 0, Math.PI * 2);
    ctx.fill();

    // Apple main body overlay
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(appleX - 1, appleY, GRID_SIZE / 2 - 3, 0, Math.PI * 2);
    ctx.fill();

    // Apple shine/highlight
    ctx.fillStyle = '#ff7675';
    ctx.beginPath();
    ctx.arc(appleX - 4, appleY - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(appleX, appleY - 6);
    ctx.lineTo(appleX + 1, appleY - 10);
    ctx.stroke();

    // Leaf
    ctx.fillStyle = '#27ae60';
    ctx.beginPath();
    ctx.ellipse(appleX + 4, appleY - 8, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Leaf vein
    ctx.strokeStyle = '#1e8449';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(appleX + 2, appleY - 7);
    ctx.lineTo(appleX + 6, appleY - 9);
    ctx.stroke();
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
        if (gameSpeed > 80) {
            gameSpeed -= 1;
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
    gameSpeed = 150;
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
