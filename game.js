class Player {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 50; // 캐릭터 너비
        this.height = 50; // 캐릭터 높이
        this.x = 50;
        this.y = this.gameHeight - this.height; // 바닥에 서 있도록
        this.vy = 0; // 수직 속도 (Velocity Y)
        this.weight = 1; // 중력 값
        this.jumpPower = -20; // 점프 시 수직 속도
        this.canDoubleJump = true;
        this.health = 100;
    }

    draw(context) {
        context.fillStyle = 'brown'; // 임시로 갈색 사각형으로 표시
        context.fillRect(this.x, this.y, this.width, this.height);
    }

    update(input) {
        // 키 입력 처리
        if (input.includes('z') && this.onGround()) { // 'z'를 누르고 땅에 있으면
            this.vy = this.jumpPower;
        }
        // 이중 점프 로직 추가 ('x' 키)
        // 슬라이드 로직 추가 ('c' 키)

        // 수직 움직임 (중력 적용)
        this.y += this.vy;
        if (!this.onGround()) {
            this.vy += this.weight;
        } else {
            this.vy = 0;
            this.y = this.gameHeight - this.height; // 땅을 뚫지 않도록
        }
    }
    
    // 땅에 있는지 확인하는 함수
    onGround() {
        return this.y >= this.gameHeight - this.height;
    }
}

class InputHandler {
    constructor() {
        this.keys = [];
        // 키를 눌렀을 때
        window.addEventListener('keydown', e => {
            if ((e.key === 'z' || e.key === 'x' || e.key === 'c') 
                && this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            }
        });
        // 키를 뗐을 때
        window.addEventListener('keyup', e => {
            if (e.key === 'z' || e.key === 'x' || e.key === 'c') {
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });
    }
}

class Obstacle {
    constructor(gameWidth, gameHeight) {
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.width = 40;
        this.height = 80;
        this.x = this.gameWidth; // 화면 오른쪽 끝에서 시작
        this.y = this.gameHeight - this.height; // 바닥에 생성
        this.speed = 5; // 왼쪽으로 이동하는 속도
    }
    
    draw(context) {
        context.fillStyle = 'red';
        context.fillRect(this.x, this.y, this.width, this.height);
    }
    
    update() {
        this.x -= this.speed;
    }
}

// 1. 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // 캔버스에 그림을 그릴 때 사용하는 붓(context)

// 캔버스 크기 설정
canvas.width = 800;
canvas.height = 400;

// 게임의 핵심! 게임 루프 함수
function gameLoop() {
    // 1. UPDATE: 게임 상태 업데이트
    update();
    
    // 2. DRAW: 화면에 그리기
    draw();

    // 3. 다음 프레임에 gameLoop 함수를 다시 호출
    // 이것이 계속해서 게임을 실행하게 만드는 원리입니다.
    requestAnimationFrame(gameLoop);
}

// 최초 게임 루프 실행
gameLoop();

// --- 앞으로 만들 함수들 ---
function update() {
    // 여기에 캐릭터, 장애물 등의 상태 업데이트 로직이 들어갑니다.
}

function draw() {
    // 매 프레임마다 캔버스를 깨끗하게 지웁니다.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

// game.js 파일 상단에 클래스들을 붙여넣거나 import 합니다.

// --- 캔버스 설정 (기존 코드) ---

// 1. 객체 생성
const player = new Player(canvas.width, canvas.height);
const input = new InputHandler();
const obstacles = []; // 장애물들을 담을 배열

let obstacleTimer = 0;
const obstacleInterval = 2000; // 2초마다 장애물 생성

// 2. 게임 루프 수정
function gameLoop(timestamp) { // timestamp는 requestAnimationFrame이 제공
    // ... 기존 루프 코드
}

function update() {
    player.update(input.keys);

    // 장애물 생성 로직
    if (obstacleTimer > obstacleInterval) {
        obstacles.push(new Obstacle(canvas.width, canvas.height));
        obstacleTimer = 0;
    } else {
        // deltaTime을 사용해야 프레임 속도와 관계없이 일정하게 시간이 흐름
        // deltaTime 계산: let deltaTime = timestamp - lastTime; lastTime = timestamp;
        obstacleTimer += 16; // 간단히 16ms(60fps 기준)를 더하는 방식
    }

    // 모든 장애물 업데이트 및 충돌 검사
    obstacles.forEach(obstacle => {
        obstacle.update();
        
        // 충돌 감지 (AABB: Axis-Aligned Bounding Box)
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            
            // 충돌 발생!
            console.log('Collision!');
            // 여기서 게임 오버 처리 또는 체력 감소 로직을 넣습니다.
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    obstacles.forEach(obstacle => {
        obstacle.draw(ctx);
    });
}

// --- 게임 루프 최초 실행 (기존 코드) ---
    // 여기에 배경, 캐릭터, 장애물 등을 그리는 코드가 들어갑니다.
}
