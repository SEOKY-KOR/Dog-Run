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
    
    // 여기에 배경, 캐릭터, 장애물 등을 그리는 코드가 들어갑니다.
}
