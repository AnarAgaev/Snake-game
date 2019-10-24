'use strict';

let canvas = document.getElementById('canvas'),
    ctx    = canvas.getContext('2d'),
    width  = canvas.width = 500,
    height = canvas.height = 500,
    
    /**
     * Calculate the width and height in cells
     */
    blockSize      = 10,                                                // ehe size of one block, block is 10x10px
    widthInBlocks  = width / blockSize,                                 // width of the canvas in blocks
    heightInBlocks = height / blockSize,                                // height of the canvas in blocks
    score          = 0,                                                 // plus one snake will eat an apple
    directions     = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' }, // convert the key codes in directions

    /**
     * Draw a frame for canvas
     */
    drawBorder = function () {
        ctx.fillStyle = 'gold';
        ctx.fillRect(0, 0, width, blockSize);
        ctx.fillRect(0, height - blockSize, width, blockSize);
        ctx.fillRect(0, 0, blockSize, height);
        ctx.fillRect(width - blockSize, 0, blockSize, height);
    },

    /**
     * Write the score of the game in the upper left corner
     */
    drawScore = function () {
        ctx.font         = '18px Courier';
        ctx.fillStyle    = 'rgba(255, 255, 255, .7)';
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Score: ' + score, blockSize*2, blockSize*2);
    },

    /** 
     * Cancel the setInterval action and print the message End of game 
     */
    gameOver = function () {
        clearInterval(intervalId);
        ctx.font         = '50px Courier';
        ctx.fillStyle    = 'gold';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Game Over', + width / 2, height / 2);
    },

    /**
     * Draw a circle
     */
    circle = function (x, y, radius, fillCircle) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        fillCircle ? ctx.fill() : ctx.stroke();
    };

class Block {
    constructor (col, row) {
        this.col = col;
        this.row = row;
    }

    /**
     * Draw a square at the cell position
     * @param {string} color 
     */
    drawSquare (color) {
        let x = this.col * blockSize,
            y = this.row * blockSize;
        ctx.fillStyle = color;
        ctx.fillRect(x, y , blockSize, blockSize);
    }
    
    /**
     * Draw a circle at the cell position
     * @param {string} color
     */
    drawCircle  (color) {
        let centerX = this.col * blockSize + blockSize / 2,
            centerY = this.row * blockSize + blockSize / 2;
        ctx.fillStyle = color;
        circle(centerX, centerY , blockSize / 2, true);
    }

    /**
     * Checking the blocks for the fact that they are in one cell
     * @param {*} otherBlock 
     */
    equal (otherBlock) {
        return this.col === otherBlock.col && this.row === otherBlock.row;
    }
}

class Snake {
    constructor () {
        this.segments = [
            new Block(7, 5),
            new Block(6, 5),
            new Block(5, 5)
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.bodyColors = ['blue', 'yellow'];
    }

    /**
     * Draw a square for each snake body segment
     */
    draw () {
        for (let i = 0; i < this.segments.length; i++) {
            this.segments[i].drawSquare(
                i == 0 
                ? 'red' 
                : (i % 2) 
                    ? this.bodyColors[0] 
                    : this.bodyColors[1]);            
        }
    }

    /**
     * Create a new head and add it to the beginning of the snake 
     * in order to move the snake in the current direction
     */
    move () {
        let head = this.segments[0],
            newHead;
        
        this.direction = this.nextDirection;

        if (this.direction === 'right') {
            newHead = new Block(head.col + 1, head.row);
        } else if (this.direction === 'down') {
            newHead = new Block(head.col, head.row + 1);
        } else if (this.direction === 'left') {
            newHead = new Block(head.col - 1, head.row);
        } else if (this.direction === 'up') {
            newHead = new Block(head.col, head.row - 1);
        }

        if (this.checkCollision(newHead)) {
            gameOver();
            return;
        }

        this.segments.unshift(newHead);

        if (newHead.equal(apple.position)) {
            score++;
            apple.move();
        } else {
            this.segments.pop();
        }
    }

    /**
     * Check if the snake collided with a wall or its own body
     * @param {*} head 
     */
    checkCollision (head) {
        let leftCollision   = (head.col === 0),
            topCollision    = (head.row === 0),
            rightCollision  = (head.col === widthInBlocks - 1),
            bottomCollision = (head.row === heightInBlocks - 1),
            wallCollision   = leftCollision || topCollision || rightCollision || bottomCollision,
            selfCollision   = false; // храним значение не столкнулась ли змейка с собственным телом

        // проверка на столкновение с собственным телом
        for (let i = 0; i < this.segments.length; i++) {
            if (head.equal(this.segments[i])) {
                selfCollision = true;
            }
        }

        return wallCollision || selfCollision;
    }

    /**
     * We set the following direction of movement of the snake based on an unpressed key
     * @param {string} newDirection 
     */
    setDirection (newDirection) {
        if (this.direction === 'up' && newDirection === 'down') {
            return;
        } else if (this.direction === 'right' && newDirection === 'left') {
            return;
        } else if (this.direction === 'down' && newDirection === 'up') {
            return;
        } else if (this.direction === 'left' && newDirection === 'right') {
            return;
        }

        this.nextDirection = newDirection;
    }
}

class Apple {
    constructor () {
        this.position = new Block(10, 10);
    }

    /**
     * Draw a circle in the apple position
     */
    draw () {
        this.position.drawCircle('limegreen');
    }

    /**
     * Move the apple to the next position
     */
    move () {
        let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1,
            randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
        this.position = new Block(randomCol, randomRow);
    }
}

/**
 * Create an apple and a snake and start the game cycle
 */
let snake = new Snake(),
    apple = new Apple(),
    intervalId = setInterval(() => {
        ctx.clearRect(0, 0, width, height);
        drawScore();
        snake.move();
        snake.draw();
        apple.draw();
        drawBorder();
    }, 100);

document.body.addEventListener('keydown', event => {
    let newDirection = directions[event.keyCode];

    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
});


/**
 * Colors for colorize some text
 */
let colors = [
        'crimson', 
        'blue', 
        'green', 
        'gold', 
        'blueviolet', 
        'darkorchid', 
        'deeppink', 
        'dodgerblue', 
        'lawngreen', 
        'magenta', 
        'yellowgreen', 
        'mediumslateblue', 
        'tomato', 
        'slateblue', 
        'orangered', 
        'mediumvioletred'
    ],
    title = document.getElementById('title');

/**
 * Colorize title
 * @param {object} titleID
 */
function colorizeTitle(title) {
    let titleContent = title.innerHTML;

    title.innerHTML = '';

    /**
     * Make new title
     */
    for (let i = 0; i < titleContent.length; i++) {
        let newElement = document.createElement('span');

        newElement.innerHTML = titleContent[i] == ' ' ? '&nbsp;' : titleContent[i];
        title.appendChild(newElement);
    }

    /**
     * Colorize title
     */
    colorize(title.querySelectorAll('span'));
}

/**
 * Colorize a text function
 * @param {object} titleID
 */
function colorize(title) {
    for (let i = 0; i < title.length; i++) {
        title[i].style.color = getRandomItemOfArray(colors);
    }

    setInterval(() => {
        title[Math.floor(Math.random() * title.length)].style.color = getRandomItemOfArray(colors);
    }, 300);
}

/**
 * Get random item from an array
 * @param {array} array for get random item from them
 */
function getRandomItemOfArray(array) {
    if (Array.isArray(array)) {
        return array[Math.floor(Math.random() * array.length)];
    }

    console.log(new TypeError("Object isn't array!"));
}

colorizeTitle(title);