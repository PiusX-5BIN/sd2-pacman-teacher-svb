let pacman = null;
let maze = null;
let level1data = [];
let ghosts = null;

let scaredTimer = 0;

let gameStarted = false;

function preload() {
    level1data = loadStrings("levels/level1.txt");
}

function setup() {
    createCanvas(400, 400);

    angleMode(DEGREES);

    maze = CreateMaze();
    pacman = CreatePacman();

    ghosts = new Group();
    let ghost = CreateGhost("Blinky");
    ghosts.add(ghost);
    ghost = CreateGhost("Pinky");
    ghosts.add(ghost);
    ghost = CreateGhost("Inky");
    ghosts.add(ghost);
}

function DrawGhostInky() {
    if (this.position.dist(this.target) < 1) {
        this.hasExitedStartArea = true;
        this.target = pacman.position;
    }
    this.DrawGhost();
}
function DrawGhostBlinky() {
    if (this.position.dist(this.target) < 1) {
        this.hasExitedStartArea = true;
    }

    if (this.hasExitedStartArea === true) {
        let pacmanDirection = pacman.velocity.copy().mult(40);
        this.target = pacman.position.copy().add(pacmanDirection);
    }

    this.DrawGhost();
}
function DrawGhostPinky() {
    if (this.position.dist(this.target) < 1) {
        this.hasExitedStartArea = true;
    }

    if (this.hasExitedStartArea === true) {
        let pacmanDirection = pacman.velocity.copy().mult(-40);
        this.target = pacman.position.copy().add(pacmanDirection);
    }

    this.DrawGhost();
}
function DrawGhostClyde() {
    if (this.position.dist(this.target) < 1) {
        this.hasExitedStartArea = true;
        this.target = pacman.position;
    }
    this.DrawGhost();
}

// names of ghosts: "Inky", "Blinky", "Pinky", "Clyde"
function CreateGhost(name) {
    let spawnPos = maze.ghostSpawnPositions[ghosts.length];
    let ghostSprite = createSprite(spawnPos.x, spawnPos.y, 20, 20);
    ghostSprite["target"] = maze.ghostStartPos;

    if (name === "Inky") {
        ghostSprite.shapeColor = color("cyan");
        ghostSprite.draw = DrawGhostInky;
    } else if (name === "Blinky") {
        ghostSprite.shapeColor = color("red");
        ghostSprite.draw = DrawGhostBlinky;
    } else if (name === "Pinky") {
        ghostSprite.shapeColor = color("pink");
        ghostSprite.draw = DrawGhostPinky;
    } else {
        ghostSprite.shapeColor = color("orange");
        ghostSprite.draw = DrawGhostClyde;
    }

    ghostSprite["DrawGhost"] = DrawGhost;

    ghostSprite["scared"] = false;
    ghostSprite["name"] = name;
    ghostSprite["hasExitedStartArea"] = false;

    ghostSprite["walls"] = new Group();
    for (let i = 0; i < maze.walls.length; ++i) {
        ghostSprite.walls.add(maze.walls[i]);
    }

    ghostSprite.setCollider("circle");

    // ghostSprite.setSpeed(1, -90);

    ghostSprite["sensors"] = {};

    // create 4 sensors (up, down, left, right)
    // sensor pointing up (-90°)
    ghostSprite.sensors[-90] = createSprite(
        ghostSprite.position.x,
        ghostSprite.position.y - ghostSprite.height / 2,
        (ghostSprite.width * 3) / 4,
        2
    );
    ghostSprite.sensors[-90].shapeColor.setAlpha(0);
    // sensor pointing down (90°)
    ghostSprite.sensors[90] = createSprite(
        ghostSprite.position.x,
        ghostSprite.position.y + ghostSprite.height / 2,
        (ghostSprite.width * 3) / 4,
        2
    );
    ghostSprite.sensors[90].shapeColor.setAlpha(0);
    // sensor pointing left (180°)
    ghostSprite.sensors[180] = createSprite(
        ghostSprite.position.x - ghostSprite.width / 2,
        ghostSprite.position.y,
        2,
        (ghostSprite.height * 3) / 4
    );
    ghostSprite.sensors[180].shapeColor.setAlpha(0);
    // sensor pointing right (0°)
    ghostSprite.sensors[0] = createSprite(
        ghostSprite.position.x + ghostSprite.width / 2,
        ghostSprite.position.y,
        2,
        (ghostSprite.height * 3) / 4
    );
    ghostSprite.sensors[0].shapeColor.setAlpha(0);
    // EDGE CASE: sensor pointing left (-180°)
    ghostSprite.sensors[-180] = ghostSprite.sensors[180];
    // EDGE CASE: sensor pointing right (-0°)
    ghostSprite.sensors[-0] = ghostSprite.sensors[0];
    ghostSprite.sensors[-360] = ghostSprite.sensors[0];
    ghostSprite.sensors[360] = ghostSprite.sensors[0];
    // EDGE CASE: sensor pointing down (-270°)
    ghostSprite.sensors[-270] = ghostSprite.sensors[90];

    return ghostSprite;
}

function keyPressed() {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        gameStarted = true;
    }
}

function DrawGhost() {
    fill(this.shapeColor);
    if (this.scared === true) {
        fill("blue");
    }

    circle(
        this.target.x - this.position.x,
        this.target.y - this.position.y,
        5,
        5
    );

    rect(0, 0, this.width, this.height, this.width / 2, this.width / 2, 0, 0);

    if (gameStarted === false) {
        return;
    }

    if (this.hasExitedStartArea === true) {
        this.walls.add(maze.ghostDoor);
    }

    this.sensors[-90].position.x = this.position.x;
    this.sensors[-90].position.y = this.position.y - this.height / 2;
    this.sensors[90].position.x = this.position.x;
    this.sensors[90].position.y = this.position.y + this.height / 2;
    this.sensors[180].position.x = this.position.x - this.width / 2;
    this.sensors[180].position.y = this.position.y;
    this.sensors[0].position.x = this.position.x + this.width / 2;
    this.sensors[0].position.y = this.position.y;

    let direction = p5.Vector.sub(this.target, this.position);
    if (this.scared === true) {
        direction.rotate(180);
    }

    let angle = direction.heading();
    let bestAngle = round(angle / 90) * 90;
    let secondBestAngle = 0;

    if (bestAngle === floor(angle / 90) * 90) {
        secondBestAngle = ceil(angle / 90) * 90;
    } else {
        secondBestAngle = floor(angle / 90) * 90;
    }

    let directionsToTry = [];
    directionsToTry.push(bestAngle);
    directionsToTry.push(secondBestAngle);
    directionsToTry.push(bestAngle - 180);
    directionsToTry.push(secondBestAngle - 180);

    for (let i = 0; i < directionsToTry.length; ++i) {
        let tryAngle = directionsToTry[i];

        if (this.sensors[tryAngle].overlap(this.walls) === false) {
            this.setSpeed(1, directionsToTry[i]);
            break;
        }
    }
}

function CreateMaze() {
    let mazeSprite = createSprite(200, 200, width, height);
    mazeSprite.shapeColor = color("black");

    mazeSprite["walls"] = new Group();
    mazeSprite["candies"] = new Group();
    mazeSprite["fruit"] = new Group();
    mazeSprite["ghostSpawnPositions"] = [];
    mazeSprite["ghostStartPos"] = null;
    mazeSprite["ghostDoor"] = null;

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
            } else if (character === "s") {
                mazeSprite.ghostStartPos = createVector(x, y);
            } else if (character === "d") {
                mazeSprite.ghostDoor = createSprite(x, y, 20, 20);
                mazeSprite.ghostDoor.shapeColor = color("red");
                mazeSprite.ghostDoor.setDefaultCollider();
            }
        }
    }

    return mazeSprite;
}

function CreatePacman() {
    let pacmanSprite = createSprite(210, 190, 20, 20);
    pacmanSprite.shapeColor = color("gold");
    pacmanSprite.draw = DrawPacman;
    pacmanSprite.rotateToDirection = true;

    // pacmanSprite.debug = true;
    pacmanSprite.setCollider("circle");

    pacmanSprite["score"] = 0;

    // create 4 sensors (up, down, left, right)
    pacmanSprite["senseUp"] = createSprite(
        pacmanSprite.position.x,
        pacmanSprite.position.y - pacmanSprite.height,
        (pacmanSprite.width * 3) / 4,
        (pacmanSprite.height * 3) / 4
    );
    pacmanSprite["senseDown"] = createSprite(
        pacmanSprite.position.x,
        pacmanSprite.position.y + pacmanSprite.height,
        (pacmanSprite.width * 3) / 4,
        (pacmanSprite.height * 3) / 4
    );
    pacmanSprite["senseLeft"] = createSprite(
        pacmanSprite.position.x - pacmanSprite.width,
        pacmanSprite.position.y,
        (pacmanSprite.width * 3) / 4,
        (pacmanSprite.height * 3) / 4
    );
    pacmanSprite["senseRight"] = createSprite(
        pacmanSprite.position.x + pacmanSprite.width,
        pacmanSprite.position.y,
        (pacmanSprite.width * 3) / 4,
        (pacmanSprite.height * 3) / 4
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

function EatFruit(pacman, fruit) {
    fruit.remove();
    scaredTimer = 0;
    for (let i = 0; i < ghosts.length; ++i) {
        ghosts[i].scared = true;
    }
}

function HitGhost(pacman, ghost) {
    if (ghost.scared === true) {
        ghost.position = maze.ghostSpawnPositions[0].copy();
        ghost.draw();
        ghost.target = maze.ghostStartPos;
        ghost.walls.remove(maze.ghostDoor);
        ghost.scared = false;
        ghost.target = maze.ghostStartPos;
    }
}

function DrawPacman() {
    fill(this.shapeColor);

    let minAngle = -40;
    let maxAngle = 40;

    let animationTime = 200;
    let timePassed = millis();

    let animationTimestamp = (timePassed % animationTime) / animationTime;
    let mouthAngle =
        Math.abs(lerp(minAngle, maxAngle, animationTimestamp)) + 20;

    arc(0, 0, this.width, this.height, mouthAngle / 2, -mouthAngle / 2);

    this.senseUp.position.x = this.position.x;
    this.senseUp.position.y = this.position.y - this.height;
    this.senseDown.position.x = this.position.x;
    this.senseDown.position.y = this.position.y + this.height;
    this.senseLeft.position.x = this.position.x - this.width;
    this.senseLeft.position.y = this.position.y;
    this.senseRight.position.x = this.position.x + this.width;
    this.senseRight.position.y = this.position.y;

    pacman.overlap(maze.candies, EatCandy);
    pacman.overlap(maze.fruit, EatFruit);
    pacman.overlap(ghosts, HitGhost);
    pacman.collide(maze.walls);

    if (
        keyIsDown(LEFT_ARROW) === true &&
        pacman.senseLeft.overlap(maze.walls) === false
    ) {
        pacman.setSpeed(2, 180);
    }
    if (
        keyIsDown(RIGHT_ARROW) === true &&
        pacman.senseRight.overlap(maze.walls) === false
    ) {
        pacman.setSpeed(2, 0);
    }
    if (
        keyIsDown(UP_ARROW) === true &&
        pacman.senseUp.overlap(maze.walls) === false
    ) {
        pacman.setSpeed(2, -90);
    }
    if (
        keyIsDown(DOWN_ARROW) === true &&
        pacman.senseDown.overlap(maze.walls) === false
    ) {
        pacman.setSpeed(2, 90);
    }
}

function draw() {
    background(0);

    scaredTimer += deltaTime;
    if (scaredTimer > 5000) {
        for (let i = 0; i < ghosts.length; ++i) {
            ghosts[i].scared = false;
        }
    }

    drawSprites();
}
