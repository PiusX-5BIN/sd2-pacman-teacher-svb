let pacman = null;
let maze = null;
let level1data = [];

function preload() {
    level1data = loadStrings("levels/level1.txt");
}

function setup() {
    createCanvas(400, 400);

    angleMode(DEGREES);

    maze = CreateMaze();
    pacman = CreatePacman();
}

function CreateMaze() {
    let mazeSprite = createSprite(200, 200, width, height);
    mazeSprite.shapeColor = color("black");

    mazeSprite["walls"] = new Group();
    mazeSprite["candies"] = new Group();
    mazeSprite["fruit"] = new Group();

    let wallSprite = null;
    for (let i = 0; i < level1data.length; ++i) {
        let rowdata = level1data[i];
        console.log(rowdata);
        for (let j = 0; j < rowdata.length; ++j) {
            let character = rowdata[j];
            let x = j * 20 + 10;
            let y = i * 20 + 10;
            if (character === "1") {
                wallSprite = createSprite(x, y, 20, 20);
                wallSprite.shapeColor = color("blue");
                mazeSprite.walls.add(wallSprite);
                // wallSprite.debug = true;
                wallSprite.immovable = true;
            } else if (character === ".") {
                let candySprite = createSprite(x, y, 5, 5);
                candySprite.shapeColor = color("white");
                candySprite.setCollider("rectangle");
                mazeSprite.candies.add(candySprite);
            } else if (character === "0") {
                let fruitSprite = createSprite(x, y, 15, 15);
                fruitSprite.shapeColor = color("red");
                mazeSprite.fruit.add(fruitSprite);
            }
        }
    }

    return mazeSprite;
}

function CreatePacman() {
    let pacmanSprite = createSprite(310, 190, 20, 20);
    pacmanSprite.shapeColor = color("gold");
    pacmanSprite.draw = DrawPacman;
    pacmanSprite["oldVelocity"] = createVector(0, 0);
    pacmanSprite.setDefaultCollider();
    pacmanSprite.limitSpeed(1);
    // pacmanSprite.debug = true;

    pacmanSprite["score"] = 0;
    pacmanSprite["trueVelocity"] = pacmanSprite.velocity.copy();
    pacmanSprite["oldPos"] = pacmanSprite.position.copy(); // weird hack, because previousPosition in p5.play is bugged

    return pacmanSprite;
}

function EatCandy(pacman, candy) {
    candy.remove();
    pacman.score++;
}

function DrawPacman() {
    fill(this.shapeColor);
    ellipse(
        this.oldPos.x - this.position.x, // weird hack, because previousPosition in p5.play is bugged
        this.oldPos.y - this.position.y, // weird hack, because previousPosition in p5.play is bugged
        this.width,
        this.height
    );

    pacman.overlap(maze.candies, EatCandy);
    pacman.collide(maze.walls);

    let tv = p5.Vector.sub(pacman.position, pacman.oldPos); // weird hack, because previousPosition in p5.play is bugged

    if (round(tv.magSq()) != 0) {
        tv.normalize();
        this.trueVelocity = tv.copy();
    }

    this.velocity = this.trueVelocity.copy();
    this.oldPos = this.position.copy(); // weird hack, because previousPosition in p5.play is bugged
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        pacman.setSpeed(2, 180);
    }
    if (keyCode === RIGHT_ARROW) {
        pacman.setSpeed(2, 0);
    }
    if (keyCode === UP_ARROW) {
        pacman.setSpeed(2, -90);
    }
    if (keyCode === DOWN_ARROW) {
        pacman.setSpeed(2, 90);
    }
}

function draw() {
    background(0);

    drawSprites();
}
