let pacman = null;
let maze = null;

function setup() {
    createCanvas(800, 400);

    angleMode(DEGREES);

    maze = CreateMaze();
    pacman = CreatePacman();
}

function CreateMaze() {
    let mazeSprite = createSprite(400, 200, width, height);
    mazeSprite.debug = true;

    return mazeSprite;
}

function CreatePacman() {
    let pacmanSprite = createSprite(400, 200, 20, 20);
    pacmanSprite.shapeColor = color("gold");
    pacmanSprite.draw = DrawPacman;
    pacmanSprite.debug = true;

    return pacmanSprite;
}

function DrawPacman() {
    fill(this.shapeColor);
    ellipse(0, 0, this.width, this.height);

    if (keyIsDown(LEFT_ARROW) === true) {
        this.setSpeed(5, 180);
    }
    if (keyIsDown(RIGHT_ARROW) === true) {
        this.setSpeed(5, 0);
    }
    if (keyIsDown(UP_ARROW) === true) {
        this.setSpeed(5, -90);
    }
    if (keyIsDown(DOWN_ARROW) === true) {
        this.setSpeed(5, 90);
    }
}

function draw() {
    background(0);

    drawSprites();
}

