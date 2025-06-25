// 페이지 로드가 완료되면 게임을 시작합니다.
window.addEventListener('load', function(){
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;

    /**
     * 키보드 입력을 처리하는 클래스
     * 'z', 'x', 'c' 키의 눌림 상태를 배열로 관리합니다.
     */
    class InputHandler {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', e => {
                const key = e.key.toLowerCase();
                if ((key === 'z' || key === 'x' || key === 'c') && this.keys.indexOf(key) === -1){
                    this.keys.push(key);
                }
            });
            window.addEventListener('keyup', e => {
                const key = e.key.toLowerCase();
                if (key === 'z' || key === 'x' || key === 'c'){
                    this.keys.splice(this.keys.indexOf(key), 1);
                }
            });
        }
    }

    /**
     * 주인공 강아지를 정의하는 클래스
     */
    class Player {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 60;
            this.height = 60;
            this.x = 100;
            this.y = this.gameHeight - this.height;
            // this.image = document.getElementById('playerImage'); // 이미지 사용할 경우
            this.vy = 0; // 수직 속도 (Velocity Y)
            this.weight = 0.8; // 중력
            this.jumpPower = -20;
            this.canDoubleJump = true;
            this.isSliding = false;
            this.slideTimer = 0;
            this.slideDuration = 1000; // 1초간 슬라이드
        }
        draw(context){
            // context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.fillStyle = 'brown';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        update(input, deltaTime){
            // 1. 충돌 감지 로직 (이후에 추가)

            // 2. 입력 처리
            if (input.includes('z') && this.onGround()){
                this.vy = this.jumpPower;
                this.canDoubleJump = true;
            } else if (input.includes('x') && !this.onGround() && this.canDoubleJump) {
                this.vy = this.jumpPower * 0.8; // 이중 점프는 조금 낮게
                this.canDoubleJump = false;
            } else if (input.includes('c') && this.onGround() && !this.isSliding) {
                this.isSliding = true;
                this.slideTimer = this.slideDuration;
                this.height = this.height / 2; // 슬라이드 시 높이 감소
                this.y += this.height;
            }

            // 3. 슬라이드 상태 관리
            if (this.isSliding) {
                this.slideTimer -= deltaTime;
                if (this.slideTimer <= 0) {
                    this.isSliding = false;
                    this.y -= this.height; // 원래 위치로 복귀
                    this.height = this.height * 2; // 원래 높이로 복귀
                }
            }

            // 4. 수직 움직임 (중력)
            this.y += this.vy;
            if (!this.onGround()){
                this.vy += this.weight;
            } else {
                this.vy = 0;
                this.y = this.gameHeight - this.height; // 땅을 뚫지 않도록 보정
                this.canDoubleJump = true; // 땅에 닿으면 이중 점프 가능
            }
        }
        onGround(){
            return this.y >= this.gameHeight - this.height;
        }
    }

    /**
     * 무한 스크롤 배경을 처리하는 클래스
     */
    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            // this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = this.gameWidth; // 배경 이미지는 캔버스 너비와 같다고 가정
            this.height = this.gameHeight;
            this.speed = 3;
        }
        draw(context){
            // context.drawImage(this.image, this.x, this.y, this.width, this.height);
            // 두 번째 이미지를 그려서 끊김없이 연결
            // context.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
            
            // 이미지가 없을 때 임시 배경
            context.fillStyle = '#87CEEB';
            context.fillRect(0, 0, this.width, this.height);
        }
        update(){
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0; // 이미지가 화면 밖으로 나가면 위치 초기화
        }
    }

    /**
     * 장애물을 정의하는 클래스
     */
    class Obstacle {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 50;
            this.height = Math.random() * 50 + 50; // 높이 랜덤
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.speed = 5;
            this.markedForDeletion = false;
        }
        draw(context){
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        update(){
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.markedForDeletion = true;
        }
    }

    /**
     * 화면에 떠다니는 텍스트(점수, 아이템 효과 등)를 처리하는 클래스
     */
    function displayStatusText(context, score) {
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 20, 50);
        // 여기에 체력, 시간 등 추가
    }


    // --- 게임 로직의 핵심 부분 ---

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let obstacleTimer = 0;
    let obstacleInterval = 1500; // 1.5초마다 장애물 생성
    let obstacles = [];
    let score = 0;
    let gameOver = false;

    /**
     * 장애물과 아이템을 생성하고 관리하는 함수
     */
    function handleObstacles(deltaTime){
        if (obstacleTimer > obstacleInterval){
            obstacles.push(new Obstacle(canvas.width, canvas.height));
            obstacleTimer = 0;
        } else {
            obstacleTimer += deltaTime;
        }
        obstacles.forEach(obstacle => {
            obstacle.update(deltaTime);
            // 충돌 감지
            if (
                player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y
            ) {
                gameOver = true; // 충돌 시 게임 오버
            }
        });
        // 화면 밖으로 나간 장애물 제거
        obstacles = obstacles.filter(obstacle => !obstacle.markedForDeletion);
    }
    
    /**
     * 게임의 메인 루프 (심장)
     * 매 프레임마다 게임 상태를 업데이트하고 화면에 그립니다.
     */
    function animate(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        background.draw(ctx);
        // background.update(); // 배경 스크롤 시 주석 해제

        player.draw(ctx);
        player.update(input.keys, deltaTime);

        handleObstacles(deltaTime);
        
        displayStatusText(ctx, score);

        if (!gameOver) {
            requestAnimationFrame(animate);
        } else {
            // 게임 오버 화면 표시
            ctx.textAlign = 'center';
            ctx.fillStyle = 'black';
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        }
    }

    // 첫 프레임 시작
    animate(0);
});
