let pacman = null;
let maze = null;
let level1data = [];
let ghosts = null;

function preload() {
    level1data = loadStrings("levels/level1.txt");
}

function setup() {
    createCanvas(400, 400);

    angleMode(DEGREES);

    maze = CreateMaze();
    pacman = CreatePacman();

    ghosts = new Group();
    let ghost = CreateGhost();
    ghosts.add(ghost);
}

function CreateGhost() {
    let spawnPos = maze.ghostSpawnPositions[2];
    let ghostSprite = createSprite(spawnPos.x, spawnPos.y, 20, 20);
    ghostSprite["target"] = pacman;
    ghostSprite.shapeColor = color('pink');

    ghostSprite.draw = DrawGhost;


    ghostSprite.setCollider("circle");


    ghostSprite.setSpeed(1, -90);

    // create 4 sensors (up, down, left, right)
    ghostSprite["senseUp"] = createSprite(
        ghostSprite.position.x,
        ghostSprite.position.y - (ghostSprite.height / 2),
        ghostSprite.width * 3 / 4,
        2
    );
    ghostSprite["senseDown"] = createSprite(
        ghostSprite.position.x,
        ghostSprite.position.y + ghostSprite.height / 2,
        ghostSprite.width * 3 / 4,
        2
    );
    ghostSprite["senseLeft"] = createSprite(
        ghostSprite.position.x - ghostSprite.width / 2,
        ghostSprite.position.y,
        2,
        ghostSprite.height * 3 / 4
    );
    ghostSprite["senseRight"] = createSprite(
        ghostSprite.position.x + ghostSprite.width / 2,
        ghostSprite.position.y,
        2,
        ghostSprite.height * 3 / 4
    );

    return ghostSprite;
}

function DrawGhost() {
    fill(this.shapeColor);
    rect(0, 0, this.width, this.height);

    this.senseUp.position.x = this.position.x;
    this.senseUp.position.y = this.position.y - this.height / 2;
    this.senseDown.position.x = this.position.x;
    this.senseDown.position.y = this.position.y + this.height / 2;
    this.senseLeft.position.x = this.position.x - this.width / 2;
    this.senseLeft.position.y = this.position.y;
    this.senseRight.position.x = this.position.x + this.width / 2;
    this.senseRight.position.y = this.position.y;

    let direction = p5.Vector.sub(this.target.position, this.position);

    let dirX = direction.x;
    let dirY = direction.y;

    let directionsToTry = [];


    let angleX = Math.sign(dirX);
    if (angleX === 0) {
        angleX = 1;
    }
    angleX *= 90; // make it a corner between -90 and 90
    angleX -= 90; // make it a corner between 0 and -180
    angleX *= -1; // flip the sign, so its between 0 and 180

    let angleY = Math.sign(dirY);
    if (angleY === 0) {
        angleY = 1;
    }
    angleY *= 90;

    if (Math.abs(dirX) > Math.abs(dirY)) {
        directionsToTry.push(angleX);
        directionsToTry.push(angleY);

    } else {
        directionsToTry.push(angleY);
        directionsToTry.push(angleX);
    }
    directionsToTry.push(-angleY);
    directionsToTry.push(angleX - 180);

    this.collide(maze.walls);

    // if (this.collide(maze.walls) === true) {
    for (let i = 0; i < directionsToTry.length; ++i) {

        if (directionsToTry[i] === 180 &&
            this.senseLeft.overlap(maze.walls) === false) {
            this.setSpeed(1, directionsToTry[i]);
            break;
            }
        else if (directionsToTry[i] === 90 &&
            this.senseDown.overlap(maze.walls) === false) {
            this.setSpeed(1, directionsToTry[i]);
            break;
        }
        else if (directionsToTry[i] === 0 &&
            this.senseRight.overlap(maze.walls) === false) {
            this.setSpeed(1, directionsToTry[i]);
            break;
        }
        else if (directionsToTry[i] === -90 &&
            this.senseUp.overlap(maze.walls) === false) {
            this.setSpeed(1, directionsToTry[i]);
            break;
        }
        // this.setSpeed(1, directionsToTry[i]);
    }
    // }

    // console.log(directionsToTry);
}

function CreateMaze() {
    let mazeSprite = createSprite(200, 200, width, height);
    mazeSprite.shapeColor = color("black");

    mazeSprite["walls"] = new Group();
    mazeSprite["candies"] = new Group();
    mazeSprite["fruit"] = new Group();
    mazeSprite["ghostSpawnPositions"] = [];

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
            } else if (character === "g") {
                let spawnPos = createVector(x, y);
                mazeSprite.ghostSpawnPositions.push(spawnPos);
            }
        }
    }

    return mazeSprite;
}

function CreatePacman() {
    let pacmanSprite = createSprite(310, 190, 20, 20);
    pacmanSprite.shapeColor = color("gold");
    pacmanSprite.draw = DrawPacman;

    // pacmanSprite.debug = true;
    pacmanSprite.setCollider("circle");

    pacmanSprite["score"] = 0;

    // create 4 sensors (up, down, left, right)
    pacmanSprite["senseUp"] = createSprite(
        pacmanSprite.position.x,
        pacmanSprite.position.y - pacmanSprite.height,
        pacmanSprite.width * 3 / 4,
        pacmanSprite.height * 3 / 4
    );
    pacmanSprite["senseDown"] = createSprite(
        pacmanSprite.position.x,
        pacmanSprite.position.y + pacmanSprite.height,
        pacmanSprite.width * 3 / 4,
        pacmanSprite.height * 3 / 4
    );
    pacmanSprite["senseLeft"] = createSprite(
        pacmanSprite.position.x - pacmanSprite.width,
        pacmanSprite.position.y,
        pacmanSprite.width * 3 / 4,
        pacmanSprite.height * 3 / 4
    );
    pacmanSprite["senseRight"] = createSprite(
        pacmanSprite.position.x + pacmanSprite.width,
        pacmanSprite.position.y,
        pacmanSprite.width * 3 / 4,
        pacmanSprite.height * 3 / 4
    );

    // make the sensors invisible by setting the alpha value to 0
    pacmanSprite.senseUp.shapeColor.setAlpha(0);
    pacmanSprite.senseDown.shapeColor.setAlpha(0);
    pacmanSprite.senseLeft.shapeColor.setAlpha(0);
    pacmanSprite.senseRight.shapeColor.setAlpha(0);

    return pacmanSprite;
}

function EatCandy(pacman, candy) {
    candy.remove();
    pacman.score++;
}

function DrawPacman() {
    fill(this.shapeColor);
    ellipse(
        0, 0,
        this.width,
        this.height
    );

    this.senseUp.position.x = this.position.x;
    this.senseUp.position.y = this.position.y - this.height;
    this.senseDown.position.x = this.position.x;
    this.senseDown.position.y = this.position.y + this.height;
    this.senseLeft.position.x = this.position.x - this.width;
    this.senseLeft.position.y = this.position.y;
    this.senseRight.position.x = this.position.x + this.width;
    this.senseRight.position.y = this.position.y;

    pacman.overlap(maze.candies, EatCandy);
    pacman.collide(maze.walls);

    if (keyIsDown(LEFT_ARROW) === true &&
        pacman.senseLeft.overlap(maze.walls) === false) {
        pacman.setSpeed(2, 180);
    }
    if (keyIsDown(RIGHT_ARROW) === true &&
        pacman.senseRight.overlap(maze.walls) === false) {
        pacman.setSpeed(2, 0);
    }
    if (keyIsDown(UP_ARROW) === true &&
        pacman.senseUp.overlap(maze.walls) === false) {
        pacman.setSpeed(2, -90);
    }
    if (keyIsDown(DOWN_ARROW) === true &&
        pacman.senseDown.overlap(maze.walls) === false) {
        pacman.setSpeed(2, 90);
    }

}

function draw() {
    background(0);

    drawSprites();
}
