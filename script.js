class GomokuGame {
    constructor() {
        this.boardSize = 15;
        this.cellSize = 40;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1; // 1: 黑棋, 2: 白棋
        this.gameOver = false;
        this.moves = [];
        this.roundCount = 0;
        
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('board-overlay');
        
        this.initializeGame();
        this.setupEventListeners();
        this.drawBoard();
    }

    initializeGame() {
        this.updateGameInfo();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoMove());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
    }

    handleClick(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (col >= 0 && col < this.boardSize && row >= 0 && row < this.boardSize) {
            if (this.board[row][col] === 0) {
                this.makeMove(row, col);
            }
        }
    }

    makeMove(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.moves.push({ row, col, player: this.currentPlayer });
        this.roundCount++;
        
        this.drawPiece(row, col, this.currentPlayer);
        
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.showWinner();
        } else {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.updateGameInfo();
        }
    }

    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘背景
        this.ctx.fillStyle = '#deb887';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < this.boardSize; i++) {
            // 横线
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize / 2, i * this.cellSize + this.cellSize / 2);
            this.ctx.lineTo(this.canvas.width - this.cellSize / 2, i * this.cellSize + this.cellSize / 2);
            this.ctx.stroke();
            
            // 竖线
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize + this.cellSize / 2, this.cellSize / 2);
            this.ctx.lineTo(i * this.cellSize + this.cellSize / 2, this.canvas.height - this.cellSize / 2);
            this.ctx.stroke();
        }
        
        // 绘制天元和星位
        const starPoints = [3, 7, 11];
        this.ctx.fillStyle = '#8b4513';
        
        starPoints.forEach(i => {
            starPoints.forEach(j => {
                this.ctx.beginPath();
                this.ctx.arc(
                    i * this.cellSize + this.cellSize / 2,
                    j * this.cellSize + this.cellSize / 2,
                    4, 0, Math.PI * 2
                );
                this.ctx.fill();
            });
        });

        // 重绘所有棋子
        this.redrawAllPieces();
    }

    drawPiece(row, col, player) {
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize * 0.4;

        // 棋子阴影
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        if (player === 1) {
            // 黑棋
            const gradient = this.ctx.createRadialGradient(
                x - radius * 0.3, y - radius * 0.3, radius * 0.1,
                x, y, radius
            );
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
        } else {
            // 白棋
            const gradient = this.ctx.createRadialGradient(
                x - radius * 0.3, y - radius * 0.3, radius * 0.1,
                x, y, radius
            );
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
            this.ctx.fillStyle = gradient;
        }

        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // 重置阴影
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // 白棋边框
        if (player === 2) {
            this.ctx.strokeStyle = '#999';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    redrawAllPieces() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] !== 0) {
                    this.drawPiece(row, col, this.board[row][col]);
                }
            }
        }
    }

    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            [0, 1],   // 垂直
            [1, 0],   // 水平
            [1, 1],   // 右下对角线
            [1, -1]   // 右上对角线
        ];

        for (const [dx, dy] of directions) {
            let count = 1;

            // 正向检查
            for (let i = 1; i <= 4; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize && 
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }

            // 反向检查
            for (let i = 1; i <= 4; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize && 
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= 5) {
                return true;
            }
        }

        return false;
    }

    showWinner() {
        const winner = this.currentPlayer === 1 ? '黑棋' : '白棋';
        document.getElementById('game-status').textContent = `${winner}获胜！`;
        document.getElementById('game-status').classList.add('winning-animation');
        
        // 更新玩家状态
        this.updatePlayerDisplay();
        
        // 显示获胜提示
        setTimeout(() => {
            alert(`🎉 ${winner}获胜！游戏结束！`);
        }, 300);
    }

    updateGameInfo() {
        document.getElementById('round-count').textContent = this.roundCount;
        this.updatePlayerDisplay();
    }

    updatePlayerDisplay() {
        const blackPlayer = document.querySelector('.black-player');
        const whitePlayer = document.querySelector('.white-player');
        
        if (this.gameOver) {
            blackPlayer.classList.remove('active');
            whitePlayer.classList.remove('active');
        } else if (this.currentPlayer === 1) {
            blackPlayer.classList.add('active');
            whitePlayer.classList.remove('active');
        } else {
            blackPlayer.classList.remove('active');
            whitePlayer.classList.add('active');
        }
    }

    restartGame() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.currentPlayer = 1;
        this.gameOver = false;
        this.moves = [];
        this.roundCount = 0;
        
        document.getElementById('game-status').textContent = '进行中';
        document.getElementById('game-status').classList.remove('winning-animation');
        
        this.updateGameInfo();
        this.drawBoard();
    }

    undoMove() {
        if (this.moves.length === 0 || this.gameOver) return;
        
        const lastMove = this.moves.pop();
        this.board[lastMove.row][lastMove.col] = 0;
        this.currentPlayer = lastMove.player;
        this.roundCount--;
        
        this.updateGameInfo();
        this.drawBoard();
    }

    showHint() {
        if (this.gameOver) return;
        
        // 简单的AI提示：寻找可以形成四连的位置
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0) {
                    // 临时放置棋子检查是否形成威胁
                    this.board[row][col] = this.currentPlayer;
                    if (this.checkWin(row, col)) {
                        this.board[row][col] = 0;
                        this.highlightCell(row, col);
                        return;
                    }
                    this.board[row][col] = 0;
                }
            }
        }
        
        // 如果没有直接获胜的位置，随机选择一个空位
        const emptyCells = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.highlightCell(randomCell.row, randomCell.col);
        }
    }

    highlightCell(row, col) {
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize * 0.3;
        
        // 在overlay上绘制提示
        this.overlay.innerHTML = '';
        const hintDiv = document.createElement('div');
        hintDiv.style.position = 'absolute';
        hintDiv.style.left = `${x - radius}px`;
        hintDiv.style.top = `${y - radius}px`;
        hintDiv.style.width = `${radius * 2}px`;
        hintDiv.style.height = `${radius * 2}px`;
        hintDiv.style.border = '3px dashed #ff6b6b';
        hintDiv.style.borderRadius = '50%';
        hintDiv.style.animation = 'pulse 1s infinite';
        hintDiv.style.pointerEvents = 'none';
        
        this.overlay.appendChild(hintDiv);
        
        // 3秒后移除提示
        setTimeout(() => {
            this.overlay.innerHTML = '';
        }, 3000);
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new GomokuGame();
});
