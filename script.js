const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over");
const finalScore = document.getElementById("finalScore");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const pauseBtn = document.getElementById("pauseBtn");
const shareBtn = document.getElementById("shareBtn");

let playerName = "";
let score = 0;
let gameRunning = false;
let isPaused = false; // Pause State
const shooter = { x: 0, y: 0, angle: 0 };
const bullets = [];
const enemies = [];
const bigEnemies = [];
let enemySpeed = 1;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
shooter.x = canvas.width / 2;
shooter.y = canvas.height / 2;

// Load Images
const shooterImg = new Image();
shooterImg.src = "media/shooter1.png"; // 🔥 Shooter Image

const enemyImg = new Image();
enemyImg.src = "media/zombie gifs/zombie.gif"; // 🔥 Enemy Image

const bigEnemyImg = new Image();
bigEnemyImg.src = "media/bigzombie1-final.png"; // 🔥 Enemy Image

bigEnemyImg.onload = () => console.log("Big Enemy Image Loaded");
bigEnemyImg.onerror = () => console.error("Failed to load big enemy image");

// Pause/Play Function
pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "▶ Play" : "⏸ Pause";
  if (!isPaused) {
    update(); // Resume game loop
  }
});

// Start Game
function startGame() {
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) return alert("Please Enter Player Name!");

  resetGame();
  startScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  canvas.style.display = "block";
  gameRunning = true;
  update();
}

// Reset the Game
function resetGame() {
  score = 0;
  enemySpeed = 0.5;
  bullets.length = 0;
  enemies.length = 0;
  bigEnemies.length = 0;
  gameRunning = true;
}

// Mouse Rotation
canvas.addEventListener("mousemove", (event) => {
  const dx = event.clientX - shooter.x;
  const dy = event.clientY - shooter.y;
  shooter.angle = Math.atan2(dy, dx);
});

// Touch Rotation
canvas.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  const dx = touch.clientX - shooter.x;
  const dy = touch.clientY - shooter.y;
  shooter.angle = Math.atan2(dy, dx);
});

// Shoot bullets
let gunLength = 20;
setInterval(() => {
  if (gameRunning && !isPaused) {
    const speed = 8;
    // Calculate bullet start position from gun tip
    const bulletX = shooter.x + Math.cos(shooter.angle) * gunLength;
    const bulletY = shooter.y + Math.sin(shooter.angle) * gunLength;

    bullets.push({
      x: bulletX,
      y: bulletY,
      dx: Math.cos(shooter.angle) * speed,
      dy: Math.sin(shooter.angle) * speed,
    });
  }
}, 500);

//////////////////////////
// Spawn Enemies Zombies Every 1.5s
setInterval(() => {
  if (gameRunning && !isPaused) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    switch (side) {
      case 0:
        x = Math.random() * canvas.width;
        y = 0;
        break;
      case 1:
        x = canvas.width;
        y = Math.random() * canvas.height;
        break;
      case 2:
        x = Math.random() * canvas.width;
        y = canvas.height;
        break;
      case 3:
        x = 0;
        y = Math.random() * canvas.height;
        break;
    }
    enemies.push({ x, y, speed: enemySpeed });
    enemySpeed += 0.02;
  }
}, 1500);

//////////////////////////
// Spawn BigEnemies Zombies Every 10s
setInterval(() => {
  if (gameRunning && !isPaused) {
    const side = Math.floor(Math.random() * 4); // Fixed spawn logic
    let x, y;
    switch (side) {
      case 0: // Spawn at top
        x = Math.random() * canvas.width;
        y = 0;
        break;
      case 1: // Spawn at right
        x = canvas.width;
        y = Math.random() * canvas.height;
        break;
      case 2: // Spawn at bottom
        x = Math.random() * canvas.width;
        y = canvas.height;
        break;
      case 3: // Spawn at left
        x = 0;
        y = Math.random() * canvas.height;
        break;
    }
    bigEnemies.push({ x, y, speed: enemySpeed * 0.5, health: 2 }); // Added health for multiple hits
  }
}, 10000);

////////////////////////////////////////////////
// Game Loop
function update() {
  if (!gameRunning || isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Shooter
  ctx.save();
  ctx.translate(shooter.x, shooter.y);
  ctx.rotate(shooter.angle + Math.PI / 2);
  ctx.drawImage(shooterImg, -25, -25, 50, 50);
  ctx.restore();

  // Move & Draw Bullets
  bullets.forEach((arrow, i) => {
    arrow.x += arrow.dx;
    arrow.y += arrow.dy;
    ctx.save();
    ctx.translate(arrow.x, arrow.y);
    ctx.rotate(Math.atan2(arrow.dy, arrow.dx));
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.moveTo(-10, -3);
    ctx.lineTo(0, -3);
    ctx.arc(0, 0, 3, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(-10, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (
      arrow.x < 0 ||
      arrow.x > canvas.width ||
      arrow.y < 0 ||
      arrow.y > canvas.height
    ) {
      bullets.splice(i, 1);
    }
  });

  // Move & Draw Normal Enemies
  enemies.forEach((enemy, i) => {
    const angleToshooter = Math.atan2(shooter.y - enemy.y, shooter.x - enemy.x);
    enemy.x += Math.cos(angleToshooter) * enemy.speed;
    enemy.y += Math.sin(angleToshooter) * enemy.speed;

    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(angleToshooter + 300 + Math.PI / 2);
    ctx.drawImage(enemyImg, -20, -20, 50, 50);
    ctx.restore();

    // Collision with bullets
    for (let j = bullets.length - 1; j >= 0; j--) {
      const arrow = bullets[j];
      if (Math.hypot(arrow.x - enemy.x, arrow.y - enemy.y) < 15) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score++;
        break;
      }
    }

    // Collision with shooter (Game Over)
    if (Math.hypot(enemy.x - shooter.x, enemy.y - shooter.y) < 20) {
      gameOver();
    }
  });

  // Move & Draw Big Enemies
  for (let i = bigEnemies.length - 1; i >= 0; i--) {
    const bigEnemy = bigEnemies[i];
    const angleToShooter = Math.atan2(
      shooter.y - bigEnemy.y,
      shooter.x - bigEnemy.x
    );

    // Move towards shooter
    bigEnemy.x += Math.cos(angleToShooter) * bigEnemy.speed;
    bigEnemy.y += Math.sin(angleToShooter) * bigEnemy.speed;

    // Draw Big Enemy
    ctx.save();
    ctx.translate(bigEnemy.x, bigEnemy.y);
    ctx.rotate(angleToShooter + Math.PI / 2);
    ctx.drawImage(bigEnemyImg, -40, -40, 70, 70);
    ctx.restore();

    // Bullet Collision (Big Enemy takes 3 hits to die)
    for (let j = bullets.length - 1; j >= 0; j--) {
      const arrow = bullets[j];
      if (Math.hypot(arrow.x - bigEnemy.x, arrow.y - bigEnemy.y) < 30) {
        bigEnemy.health--; // Reduce health on hit
        bullets.splice(j, 1); // Remove bullet

        if (bigEnemy.health <= 0) {
          bigEnemies.splice(i, 1); // Remove big enemy if health is 0
          score += 5;
          break;
        }
      }
    }

    // Collision with Shooter (Game Over)
    if (Math.hypot(bigEnemy.x - shooter.x, bigEnemy.y - shooter.y) < 35) {
      gameOver();
    }
  }

  requestAnimationFrame(update);
}

// Game Over
function gameOver() {
  gameRunning = false;
  canvas.style.display = "none";
  gameOverScreen.style.display = "flex";
  finalScore.innerHTML = `<b>${playerName}</b>'s score : <b>${score}</b>`;
}

// Restart Game
tryAgainBtn.addEventListener("click", () => {
  resetGame();
  startGame();
});

// Share Button Function
shareBtn.addEventListener("click", () => {
  const gameUrl = "https://zombieskill.netlify.app";
  if (navigator.share) {
    navigator
      .share({
        title: "Zombieskill Game",
        text: "Come and play the Zombieskill game!",
        url: gameUrl,
      })
      .catch((err) => console.log("Error sharing:", err));
  } else {
    alert("Sharing not supported on this browser. Copy this link: " + gameUrl);
  }
});

// Download QR of Zombieskill Game
const qrDownload = () => {
  const gameUrl = "https://zombieskill.netlify.app";
  const qrCanvas = document.createElement("canvas");
  const ctx = qrCanvas.getContext("2d");

  // Generate the QR code inside a div first
  const qrDiv = document.createElement("div");
  new QRCode(qrDiv, {
    text: gameUrl,
    width: 300, // QR code size
    height: 300,
  });

  // Wait for QR code to render
  setTimeout(() => {
    const qrImg = qrDiv.querySelector("img"); // Get generated QR code as an image
    if (qrImg) {
      const img = new Image();
      img.src = qrImg.src;
      const logo = new Image();
      logo.src = "media/zombieskill-slogo-1.png";

      img.onload = () => {
        logo.onload = () => {
          // Set canvas size (adjusted for text and logo)
          qrCanvas.width = 350;
          qrCanvas.height = 400; // Increased to fit everything

          // Background
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);

          // Draw QR code (Centered)
          ctx.drawImage(img, 25, 10, 300, 300); // Position (x: 25, y: 10), size (200x200)

          // Draw the logo above the QR code
          ctx.drawImage(logo, 20, 320, 40, 40); // Adjusted position (x: 180, y: 180)

          // Draw Text
          ctx.fillStyle = "black";
          ctx.font = "700 20px Arial";
          ctx.textAlign = "center";
          ctx.fillText("Zombies Kill Game", qrCanvas.width / 2, 330);

          ctx.fillStyle = "red";
          ctx.font = "900 28px Arial";
          ctx.fillText("Scan and Play", qrCanvas.width / 2, 360);

          ctx.fillStyle = "black";
          ctx.font = "600 14px Arial";
          ctx.fillText(
            "https://zombieskill.netlify.app",
            qrCanvas.width / 2,
            380
          );

          // Download QR
          const link = document.createElement("a");
          link.href = qrCanvas.toDataURL("image/png");
          link.download = "Zombieskill Game-QR.png";
          link.click();
        };
      };
    }
  }, 500);
};
