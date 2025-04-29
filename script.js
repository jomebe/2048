document.addEventListener('DOMContentLoaded', () => {
    // 게임 관련 변수들
    const gridSize = 4;
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameOver = false;
    let won = false;
    let keepPlaying = false;
    let movedTiles = []; // 이동한 타일 추적

    // DOM 요소들
    const gridContainer = document.getElementById('grid-container');
    const scoreDisplay = document.getElementById('score');
    const bestScoreDisplay = document.getElementById('best-score');
    const newGameButton = document.getElementById('new-game-button');
    const tryAgainButton = document.getElementById('try-again-button');
    const keepGoingButton = document.getElementById('keep-going-button');
    const tryNewButton = document.getElementById('try-new-button');
    const gameOverMessage = document.getElementById('game-over');
    const gameWonMessage = document.getElementById('game-won');

    // 초기 설정
    init();

    // 게임 초기화 함수
    function init() {
        // 최고 점수 불러오기
        bestScoreDisplay.textContent = bestScore;
        
        // 그리드 초기화
        createGrid();
        
        // 이벤트 리스너 등록
        document.addEventListener('keydown', handleKeyPress);
        newGameButton.addEventListener('click', resetGame);
        tryAgainButton.addEventListener('click', resetGame);
        keepGoingButton.addEventListener('click', continueGame);
        tryNewButton.addEventListener('click', resetGame);
        
        // 모바일 스와이프 이벤트 등록
        setupTouchEvents();
        
        // 초기 게임 상태 설정
        resetGame();
    }

    // 그리드 생성 함수
    function createGrid() {
        gridContainer.innerHTML = '';
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-col', j);
                gridContainer.appendChild(cell);
            }
        }
    }

    // 게임 리셋 함수
    function resetGame() {
        // 그리드 초기화
        grid = [];
        for (let i = 0; i < gridSize; i++) {
            grid[i] = [];
            for (let j = 0; j < gridSize; j++) {
                grid[i][j] = 0;
            }
        }
        
        // 점수 초기화
        score = 0;
        scoreDisplay.textContent = score;
        
        // 게임 상태 초기화
        gameOver = false;
        won = false;
        keepPlaying = false;
        movedTiles = [];
        
        // 게임 메시지 숨기기
        gameOverMessage.style.display = 'none';
        gameWonMessage.style.display = 'none';
        
        // 초기 타일 2개 추가
        addRandomTile();
        addRandomTile();
        
        // 화면 업데이트
        updateGridDisplay();
    }

    // 게임 계속하기 함수
    function continueGame() {
        keepPlaying = true;
        gameWonMessage.style.display = 'none';
    }

    // 그리드 디스플레이 업데이트 함수
    function updateGridDisplay() {
        // 기존 타일 제거
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        // 새로운 타일 추가
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (grid[i][j] !== 0) {
                    const value = grid[i][j];
                    const cellPosition = document.querySelector(`.grid-cell[data-row="${i}"][data-col="${j}"]`);
                    
                    const tile = document.createElement('div');
                    tile.classList.add('tile', `tile-${value}`);
                    tile.textContent = value;
                    
                    // 이동 애니메이션 적용 (실제로 이동한 타일만)
                    const movement = movedTiles.find(m => m.newRow === i && m.newCol === j);
                    if (movement) {
                        const animClass = getAnimationClass(movement.direction);
                        if (animClass) {
                            tile.classList.add(animClass);
                        }
                    }
                    
                    cellPosition.appendChild(tile);
                }
            }
        }
        
        // 이동한 타일 초기화 (다음 이동을 위해)
        movedTiles = [];
    }

    // 방향에 따른 애니메이션 클래스 결정 함수
    function getAnimationClass(direction) {
        switch (direction) {
            case 'up': return 'tile-move-up';
            case 'down': return 'tile-move-down';
            case 'left': return 'tile-move-left';
            case 'right': return 'tile-move-right';
            default: return '';
        }
    }

    // 랜덤 타일 추가 함수
    function addRandomTile() {
        const emptyCells = [];
        
        // 빈 셀 찾기
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        // 빈 셀이 없으면 종료
        if (emptyCells.length === 0) {
            return;
        }
        
        // 랜덤 위치 선택
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // 90% 확률로 2, 10% 확률로 4 추가
        grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        
        // 새 타일에 애니메이션 추가
        setTimeout(() => {
            const cellPosition = document.querySelector(`.grid-cell[data-row="${randomCell.row}"][data-col="${randomCell.col}"]`);
            if (cellPosition.querySelector('.tile')) {
                cellPosition.querySelector('.tile').classList.add('tile-new');
            }
        }, 50);
    }

    // 키보드 이벤트 핸들러
    function handleKeyPress(event) {
        if (gameOver && !keepPlaying) return;
        
        let moved = false;
        
        switch (event.key) {
            case 'ArrowUp':
                moved = moveUp();
                break;
            case 'ArrowDown':
                moved = moveDown();
                break;
            case 'ArrowLeft':
                moved = moveLeft();
                break;
            case 'ArrowRight':
                moved = moveRight();
                break;
            default:
                return;
        }
        
        if (moved) {
            // 새 타일 추가
            addRandomTile();
            
            // 점수 업데이트
            scoreDisplay.textContent = score;
            
            // 최고 점수 업데이트
            if (score > bestScore) {
                bestScore = score;
                bestScoreDisplay.textContent = bestScore;
                localStorage.setItem('bestScore', bestScore);
            }
            
            // 게임 상태 체크
            checkGameState();
            
            // 화면 업데이트
            updateGridDisplay();
        }
    }
    
    // 터치 이벤트 설정
    function setupTouchEvents() {
        let startX, startY, endX, endY;
        const minSwipeDistance = 50;
        
        gridContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        gridContainer.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) return;
            
            let moved = false;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 수평 스와이프
                if (deltaX > 0) {
                    moved = moveRight();
                } else {
                    moved = moveLeft();
                }
            } else {
                // 수직 스와이프
                if (deltaY > 0) {
                    moved = moveDown();
                } else {
                    moved = moveUp();
                }
            }
            
            if (moved) {
                addRandomTile();
                scoreDisplay.textContent = score;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestScoreDisplay.textContent = bestScore;
                    localStorage.setItem('bestScore', bestScore);
                }
                
                checkGameState();
                updateGridDisplay();
            }
            
            startX = null;
            startY = null;
        });
    }

    // 위로 이동 함수
    function moveUp() {
        let moved = false;
        
        for (let j = 0; j < gridSize; j++) {
            for (let i = 1; i < gridSize; i++) {
                if (grid[i][j] !== 0) {
                    let row = i;
                    const originalRow = i;
                    
                    while (row > 0 && grid[row - 1][j] === 0) {
                        grid[row - 1][j] = grid[row][j];
                        grid[row][j] = 0;
                        row--;
                        moved = true;
                    }
                    
                    if (row > 0 && grid[row - 1][j] === grid[row][j]) {
                        grid[row - 1][j] *= 2;
                        score += grid[row - 1][j];
                        grid[row][j] = 0;
                        row--;
                        moved = true;
                    }
                    
                    // 타일이 실제로 이동한 경우만 추적
                    if (row !== originalRow) {
                        movedTiles.push({
                            value: grid[row][j],
                            newRow: row,
                            newCol: j,
                            direction: 'up'
                        });
                    }
                }
            }
        }
        
        return moved;
    }

    // 아래로 이동 함수
    function moveDown() {
        let moved = false;
        
        for (let j = 0; j < gridSize; j++) {
            for (let i = gridSize - 2; i >= 0; i--) {
                if (grid[i][j] !== 0) {
                    let row = i;
                    const originalRow = i;
                    
                    while (row < gridSize - 1 && grid[row + 1][j] === 0) {
                        grid[row + 1][j] = grid[row][j];
                        grid[row][j] = 0;
                        row++;
                        moved = true;
                    }
                    
                    if (row < gridSize - 1 && grid[row + 1][j] === grid[row][j]) {
                        grid[row + 1][j] *= 2;
                        score += grid[row + 1][j];
                        grid[row][j] = 0;
                        row++;
                        moved = true;
                    }
                    
                    // 타일이 실제로 이동한 경우만 추적
                    if (row !== originalRow) {
                        movedTiles.push({
                            value: grid[row][j],
                            newRow: row,
                            newCol: j,
                            direction: 'down'
                        });
                    }
                }
            }
        }
        
        return moved;
    }

    // 왼쪽으로 이동 함수
    function moveLeft() {
        let moved = false;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 1; j < gridSize; j++) {
                if (grid[i][j] !== 0) {
                    let col = j;
                    const originalCol = j;
                    
                    while (col > 0 && grid[i][col - 1] === 0) {
                        grid[i][col - 1] = grid[i][col];
                        grid[i][col] = 0;
                        col--;
                        moved = true;
                    }
                    
                    if (col > 0 && grid[i][col - 1] === grid[i][col]) {
                        grid[i][col - 1] *= 2;
                        score += grid[i][col - 1];
                        grid[i][col] = 0;
                        col--;
                        moved = true;
                    }
                    
                    // 타일이 실제로 이동한 경우만 추적
                    if (col !== originalCol) {
                        movedTiles.push({
                            value: grid[i][col],
                            newRow: i,
                            newCol: col,
                            direction: 'left'
                        });
                    }
                }
            }
        }
        
        return moved;
    }

    // 오른쪽으로 이동 함수
    function moveRight() {
        let moved = false;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = gridSize - 2; j >= 0; j--) {
                if (grid[i][j] !== 0) {
                    let col = j;
                    const originalCol = j;
                    
                    while (col < gridSize - 1 && grid[i][col + 1] === 0) {
                        grid[i][col + 1] = grid[i][col];
                        grid[i][col] = 0;
                        col++;
                        moved = true;
                    }
                    
                    if (col < gridSize - 1 && grid[i][col + 1] === grid[i][col]) {
                        grid[i][col + 1] *= 2;
                        score += grid[i][col + 1];
                        grid[i][col] = 0;
                        col++;
                        moved = true;
                    }
                    
                    // 타일이 실제로 이동한 경우만 추적
                    if (col !== originalCol) {
                        movedTiles.push({
                            value: grid[i][col],
                            newRow: i,
                            newCol: col,
                            direction: 'right'
                        });
                    }
                }
            }
        }
        
        return moved;
    }

    // 게임 상태 체크 함수
    function checkGameState() {
        // 2048 타일 체크 (승리 조건)
        if (!won && !keepPlaying) {
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    if (grid[i][j] === 2048) {
                        won = true;
                        gameWonMessage.style.display = 'flex';
                        return;
                    }
                }
            }
        }
        
        // 빈 셀이 있는지 체크
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (grid[i][j] === 0) {
                    return; // 빈 셀이 있으면 계속 진행
                }
            }
        }
        
        // 인접한 타일 중 같은 값이 있는지 체크
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const currentValue = grid[i][j];
                
                // 우측 타일 체크
                if (j < gridSize - 1 && grid[i][j + 1] === currentValue) {
                    return; // 이동 가능
                }
                
                // 하단 타일 체크
                if (i < gridSize - 1 && grid[i + 1][j] === currentValue) {
                    return; // 이동 가능
                }
            }
        }
        
        // 이동 불가능하면 게임 오버
        gameOver = true;
        gameOverMessage.style.display = 'flex';
    }
});