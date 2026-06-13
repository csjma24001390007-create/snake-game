const board = document.getElementById('board');
const scoreBox = document.getElementById('scoreBox');
const highscoreBox = document.getElementById('highscore');
const speedInput = document.getElementById('speedInput');
const speedValue = document.getElementById('speedValue');
const btnUp = document.getElementById('btnUp');
const btnDown = document.getElementById('btnDown');
const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');

// highscore setup (persisted)
let highscoreVal = 0;
const _storedHigh = localStorage.getItem('highscore');
if (_storedHigh !== null) {
    highscoreVal = parseInt(_storedHigh, 10) || 0;
    if (highscoreBox) highscoreBox.innerHTML = "HighScore: " + highscoreVal;
} else {
    localStorage.setItem('highscore', '0');
    if (highscoreBox) highscoreBox.innerHTML = "HighScore: 0";
}

// game constants
let direction = { x: 0, y: 0 };
let foodsound = new Audio('duck-toy-sound.mp3');
let gameover = new Audio('bone-crack.mp3');
let movesound = new Audio('huh_37bAoRo.mp3');
let musicsound = new Audio('pedro-neves-instrumental.mp3');
musicsound.loop = true;
let hasStarted = false;
let speed = 9;
const storedSpeed = localStorage.getItem('gameSpeed');
if (storedSpeed !== null) {
    speed = Math.min(Math.max(parseInt(storedSpeed, 10) || 9, 1), 20);
}
let lastPaintTime = 0;
let snakearr = [{ x: 13, y: 15 }];
let food = { x: 3, y: 7 };
let score = 0;
const useHeadImage = true; // set true when snakehead.png is present in the html folder

if (speedInput) speedInput.value = String(speed);
if (speedValue) speedValue.innerText = String(speed);
if (speedInput) {
    speedInput.addEventListener('input', e => {
        const newSpeed = parseInt(e.target.value, 10);
        if (!Number.isNaN(newSpeed)) {
            speed = Math.min(Math.max(newSpeed, 1), 20);
            if (speedValue) speedValue.innerText = String(speed);
            localStorage.setItem('gameSpeed', String(speed));
        }
    });
}

// Touch / mobile controls
let touchStartX = null;
let touchStartY = null;
const SWIPE_THRESHOLD = 30; // pixels

board.addEventListener('touchstart', e => {
    if (!hasStarted) {
        hasStarted = true;
        musicsound.play().catch(() => {});
    }
    const t = e.changedTouches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
}, { passive: true });

board.addEventListener('touchend', e => {
    const t = e.changedTouches[0];
    if (touchStartX === null || touchStartY === null) return;
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx > 0 && direction.x !== -1) { direction = { x: 1, y: 0 }; movesound.play(); }
        else if (dx < 0 && direction.x !== 1) { direction = { x: -1, y: 0 }; movesound.play(); }
    } else if (Math.abs(dy) > SWIPE_THRESHOLD) {
        if (dy > 0 && direction.y !== -1) { direction = { x: 0, y: 1 }; movesound.play(); }
        else if (dy < 0 && direction.y !== 1) { direction = { x: 0, y: -1 }; movesound.play(); }
    }
    touchStartX = null;
    touchStartY = null;
}, { passive: true });

function bindTouchButton(btn, dir) {
    if (!btn) return;
    const handler = e => {
        e.preventDefault();
        if (!hasStarted) { hasStarted = true; musicsound.play().catch(() => {}); }
        if (dir.x !== direction.x || dir.y !== direction.y) {
            direction = dir;
            movesound.play();
        }
    };
    btn.addEventListener('touchstart', handler, { passive: false });
    btn.addEventListener('mousedown', e => { e.preventDefault(); handler(e); });
}

bindTouchButton(btnUp, { x: 0, y: -1 });
bindTouchButton(btnDown, { x: 0, y: 1 });
bindTouchButton(btnLeft, { x: -1, y: 0 });
bindTouchButton(btnRight, { x: 1, y: 0 });

// game functions
function main(ctime){
    window.requestAnimationFrame(main);
    if ((ctime - lastPaintTime) / 1000 < 1 / speed) {
        return;
    }
    lastPaintTime = ctime;
    gameEngine();
}

function isCollide(snake) {
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            return true;
        }
    }
    return (
        snake[0].x < 1 ||
        snake[0].x > 18 ||
        snake[0].y < 1 ||
        snake[0].y > 18
    );
}

function gameEngine(){
    if (isCollide(snakearr)) {
        gameover.play();
        musicsound.pause();
        musicsound.currentTime = 0;
        hasStarted = false;
        alert("game over press any ket to play again");
        direction = { x: 0, y: 0 };
        snakearr = [{ x: 13, y: 15 }];
        food = { x: 3, y: 7 };
        score = 0;
        if (scoreBox) scoreBox.innerHTML = "Score: 0";
        
    }
// if you have eaten the food and increment the score and generation of new food
    if (snakearr[0].x === food.x && snakearr[0].y === food.y) {
        foodsound.play();
        score += 1;
        if (score > highscoreVal) {
            highscoreVal = score;
            localStorage.setItem('highscore', String(highscoreVal));
            if (highscoreBox) highscoreBox.innerHTML = "HighScore: " + highscoreVal;
        }
        if (scoreBox) scoreBox.innerHTML = "Score: " + score;
        snakearr.unshift({ x: snakearr[0].x + direction.x, y: snakearr[0].y + direction.y });
        food = {
            x: Math.round(1 + (18 - 1) * Math.random()),
            y: Math.round(1 + (18 - 1) * Math.random())
        };
    }
//moving the snake
    for (let i = snakearr.length - 2; i >= 0; i--) {
        snakearr[i + 1] = { ...snakearr[i] };
    }
    snakearr[0].x += direction.x;
    snakearr[0].y += direction.y;

    
        
        
        
        
        
    
        // display the snake 
        function getHeadDirectionClass() {
            if (direction.x === 1) return 'head-right';
            if (direction.x === -1) return 'head-left';
            if (direction.y === 1) return 'head-down';
            return 'head-up';
        }

        board.innerHTML = "";
        snakearr.forEach((e, index) => {
            const snakeElement = document.createElement('div');
            snakeElement.style.gridRowStart = e.y;
            snakeElement.style.gridColumnStart = e.x;
            if (index === 0) {
                snakeElement.classList.add('head', getHeadDirectionClass());
                if (useHeadImage) {
                    snakeElement.classList.add('head-image');
                }
            } else {
                snakeElement.classList.add('snake');
            }
            board.appendChild(snakeElement);
        });
        // display the food
        const foodElement = document.createElement('div');
        foodElement.style.gridRowStart = food.y;
        foodElement.style.gridColumnStart = food.x;
        foodElement.classList.add('food');
        board.appendChild(foodElement);

    }
    










// main logic start here
window.requestAnimationFrame(main);
window.addEventListener('keydown', e => {
    let newDirection = { x: direction.x, y: direction.y };
    switch (e.key) {
        case 'ArrowUp':
            if (direction.y !== 1) newDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y !== -1) newDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x !== 1) newDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x !== -1) newDirection = { x: 1, y: 0 };
            break;
        default:
            return;
    }

    if (!hasStarted) {
        hasStarted = true;
        musicsound.play().catch(() => {
            console.warn('Music play blocked until user interaction.');
        });
    }

    if (newDirection.x !== direction.x || newDirection.y !== direction.y) {
        direction = newDirection;
        movesound.play();
    }
});