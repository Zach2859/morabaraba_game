// =============================================================================
// --- BOARD DATA (VERIFIED) ---
// =============================================================================
const spotCoordinates = [ { top: '0%', left: '0%' }, { top: '0%', left: '50%' }, { top: '0%', left: '100%' }, { top: '16.67%', left: '16.67%' }, { top: '16.67%', left: '50%' }, { top: '16.67%', left: '83.33%' }, { top: '33.33%', left: '33.33%' }, { top: '33.33%', left: '50%' }, { top: '33.33%', left: '66.66%' }, { top: '50%', left: '0%' }, { top: '50%', left: '16.67%' }, { top: '50%', left: '33.33%' }, { top: '50%', left: '66.66%' }, { top: '50%', left: '83.33%' }, { top: '50%', left: '100%' }, { top: '66.66%', left: '33.33%' }, { top: '66.66%', left: '50%' }, { top: '66.66%', left: '66.66%' }, { top: '83.33%', left: '16.67%' }, { top: '83.33%', left: '50%' }, { top: '83.33%', left: '83.33%' }, { top: '100%', left: '0%' }, { top: '100%', left: '50%' }, { top: '100%', left: '100%' }];
const mills = [ [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23], [0, 9, 21], [3, 10, 18], [6, 11, 15], [1, 4, 7], [16, 19, 22], [8, 12, 17], [5, 13, 20], [2, 14, 23], [0, 3, 6], [2, 5, 8], [21, 18, 15], [23, 20, 17]];
const adjacentSpots = { 0: [1, 9, 3], 1: [0, 2, 4], 2: [1, 14, 5], 3: [4, 10, 0, 6], 4: [1, 3, 5, 7], 5: [4, 13, 2, 8], 6: [7, 11, 3], 7: [4, 6, 8], 8: [7, 12, 5], 9: [0, 10, 21], 10: [3, 9, 11, 18], 11: [6, 10, 15], 12: [8, 13, 17], 13: [5, 12, 14, 20], 14: [2, 13, 23], 15: [11, 16, 18], 16: [15, 17, 19], 17: [12, 16, 20], 18: [10, 19, 21, 15], 19: [16, 18, 20, 22], 20: [13, 19, 23, 17], 21: [9, 22, 18], 22: [19, 21, 23], 23: [14, 22, 20]};

// =============================================================================
// --- GAME STATE & LOGIC ---
// =============================================================================
let currentPlayer, gamePhase, player1CowsToPlace, player2CowsToPlace, player1CowsOnBoard, player2CowsOnBoard, boardState, selectedSpot;
let player1Score = 0; let player2Score = 0; let scoreHistory = [];
let player1Name = "Player 1", player2Name = "Player 2";
let player1Color = "#ffffff", player2Color = "#000000";
let gameMode = 'pvp';
const ui = {};

function initializeGame() { currentPlayer = 1; gamePhase = 'placing'; player1CowsToPlace = 12; player2CowsToPlace = 12; player1CowsOnBoard = 0; player2CowsOnBoard = 0; boardState = Array(24).fill(0); selectedSpot = null; ui.boardContainer.querySelectorAll('.spot').forEach(spot => spot.remove()); createSpots(); ui.gameOverOverlay.classList.add('hidden'); updateAllUI(); }
window.onload = function() { Object.assign(ui, { statusText: document.getElementById('status-text'), p1ToPlace: document.getElementById('p1-to-place'), p1OnBoard: document.getElementById('p1-on-board'), p2ToPlace: document.getElementById('p2-to-place'), p2OnBoard: document.getElementById('p2-on-board'), p1Panel: document.getElementById('player1-panel'), p2Panel: document.getElementById('player2-panel'), boardContainer: document.getElementById('board-container'), gameOverOverlay: document.getElementById('game-over-overlay'), gameOverMessage: document.getElementById('game-over-message'), newGameButton: document.getElementById('new-game-button'), p1Score: document.getElementById('p1-score'), p2Score: document.getElementById('p2-score'), historyList: document.getElementById('history-list'), setupOverlay: document.getElementById('setup-overlay'), startGameButton: document.getElementById('start-game-button'), p1NameInput: document.getElementById('p1-name-input'), p2NameInput: document.getElementById('p2-name-input'), p1ColorPalette: document.getElementById('p1-color-palette'), p2ColorPalette: document.getElementById('p2-color-palette'), p1NameDisplay: document.getElementById('p1-name-display'), p2NameDisplay: document.getElementById('p2-name-display'), p2SetupSection: document.getElementById('p2-setup-section'), vsHumanButton: document.getElementById('vs-human-button'), vsAiButton: document.getElementById('vs-ai-button'), closeSetupButton: document.getElementById('close-setup-button')}); setupGameSetupScreen(); };
function setupGameSetupScreen() { const colors = ["#ffffff", "#000000", "#001f3f", "#ff3b30", "#34c759", "#007aff", "#ffcc00", "#af52de", "#5856d6"]; ui.p1NameInput.value = localStorage.getItem('morabaraba_p1Name') || 'Player 1'; ui.p2NameInput.value = localStorage.getItem('morabaraba_p2Name') || 'Player 2'; player1Color = localStorage.getItem('morabaraba_p1Color') || '#ffffff'; player2Color = localStorage.getItem('morabaraba_p2Color') || '#000000'; const createPalette = (palette, playerNum) => { palette.innerHTML = ''; colors.forEach(color => { const swatch = document.createElement('div'); swatch.className = 'color-swatch'; swatch.style.backgroundColor = color; if ((playerNum === 1 && color === player1Color) || (playerNum === 2 && color === player2Color)) swatch.classList.add('selected'); swatch.addEventListener('click', () => { if (playerNum === 1) player1Color = color; else player2Color = color; createPalette(ui.p1ColorPalette, 1); createPalette(ui.p2ColorPalette, 2); }); palette.appendChild(swatch); }); }; createPalette(ui.p1ColorPalette, 1); createPalette(ui.p2ColorPalette, 2); ui.vsHumanButton.addEventListener('click', () => { gameMode = 'pvp'; ui.p2SetupSection.classList.remove('hidden'); ui.startGameButton.classList.remove('hidden'); }); ui.vsAiButton.addEventListener('click', () => { gameMode = 'pva'; ui.p2SetupSection.classList.add('hidden'); startGame(); }); ui.startGameButton.addEventListener('click', startGame); ui.newGameButton.addEventListener('click', () => ui.setupOverlay.classList.remove('hidden')); ui.closeSetupButton.addEventListener('click', () => ui.setupOverlay.classList.add('hidden')); }
function startGame() { player1Name = ui.p1NameInput.value.trim() || 'Player 1'; localStorage.setItem('morabaraba_p1Name', player1Name); localStorage.setItem('morabaraba_p1Color', player1Color); document.documentElement.style.setProperty('--p1-color', player1Color); if (gameMode === 'pvp') { player2Name = ui.p2NameInput.value.trim() || 'Player 2'; localStorage.setItem('morabaraba_p2Name', player2Name); localStorage.setItem('morabaraba_p2Color', player2Color); } else { player2Name = "AI Opponent"; player2Color = "#001f3f"; } document.documentElement.style.setProperty('--p2-color', player2Color); ui.setupOverlay.classList.add('hidden'); loadHistory(); initializeGame(); }
function createSpots() { for (let i = 0; i < spotCoordinates.length; i++) { const spotElement = document.createElement('div'); spotElement.className = 'spot empty'; spotElement.style.top = spotCoordinates[i].top; spotElement.style.left = spotCoordinates[i].left; spotElement.dataset.id = i; ui.boardContainer.appendChild(spotElement); spotElement.addEventListener('click', () => handleSpotClick(spotElement)); } }

function handleSpotClick(spotElement) {
    if (gamePhase === 'gameover' || (currentPlayer === 2 && gameMode === 'pva')) return;
    const spotId = parseInt(spotElement.dataset.id);
    if (gamePhase === 'removing') {
        if (isValidToRemove(spotId)) {
            const mill = checkForMill(spotId, 2); // Opponent is always P2 when human is removing
            removePiece(spotId); if (mill) highlightMill(mill, false); clearHighlights();
            if (checkWinCondition()) return;
            const newPhase = determinePhaseForPlayer(currentPlayer); switchPlayer(newPhase);
        }
    } else { processMove(spotId, spotElement); }
    updateAllUI();
}

function processMove(spotId, spotElement) {
    const currentPhase = determinePhaseForPlayer(currentPlayer);
    if (currentPhase === 'placing') {
        if (boardState[spotId] === 0) {
            placePiece(spotId); const mill = checkForMill(spotId, currentPlayer);
            if (mill) { gamePhase = 'removing'; highlightMill(mill, true); highlightRemovablePieces(true); } 
            else { const newPhase = (player1CowsToPlace === 0 && player2CowsToPlace === 0) ? 'moving' : 'placing'; switchPlayer(newPhase); }
        }
    } else { // Moving or Flying
        if (selectedSpot === null) { if (boardState[spotId] === currentPlayer) { selectedSpot = spotId; spotElement.classList.add('selected'); }
        } else {
            const fromElement = document.querySelector(`[data-id='${selectedSpot}']`); if (fromElement) fromElement.classList.remove('selected');
            if (isValidMove(selectedSpot, spotId)) {
                const oldMill = checkForMill(selectedSpot, currentPlayer); movePiece(selectedSpot, spotId);
                if (oldMill) highlightMill(oldMill, false);
                const newMill = checkForMill(spotId, currentPlayer);
                if (newMill) { gamePhase = 'removing'; highlightMill(newMill, true); highlightRemovablePieces(true); } 
                else { switchPlayer(determinePhaseForPlayer(currentPlayer === 1 ? 2 : 1)); }
            }
            selectedSpot = null;
        }
    }
}

// --- REWRITTEN AI LOGIC ---
function aiTakeTurn() {
    setTimeout(() => {
        // --- PART 1: AI makes a move (place/move/fly) ---
        const possibleMoves = getAllPossibleMoves(2);
        if (possibleMoves.length === 0) { endGame(1); return; }

        let bestMoveScore = -1;
        let bestMoves = [];
        for (const move of possibleMoves) {
            const score = scoreMove(move);
            if (score > bestMoveScore) { bestMoveScore = score; bestMoves = [move]; } 
            else if (score === bestMoveScore) { bestMoves.push(move); }
        }
        const finalMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

        // Execute the chosen move
        let moveMadeAt = -1;
        if (finalMove.to !== undefined) {
            movePiece(finalMove.from, finalMove.to);
            moveMadeAt = finalMove.to;
        } else {
            placePiece(finalMove.spot);
            moveMadeAt = finalMove.spot;
        }
        updateAllUI();

        // --- PART 2: Check if that move resulted in a mill ---
        const mill = checkForMill(moveMadeAt, 2);
        if (mill) {
            gamePhase = 'removing';
            highlightMill(mill, true);
            updateAllUI(); // Show the mill glow

            // AI gets a second action: remove a piece
            setTimeout(() => {
                const removable = [];
                for (let i = 0; i < 24; i++) if (isValidToRemove(i)) removable.push({ spot: i, score: scoreRemoval(i) });

                if (removable.length > 0) {
                    removable.sort((a, b) => b.score - a.score);
                    const bestSpotToRemove = removable[0].spot;
                    removePiece(bestSpotToRemove);
                    highlightMill(mill, false);
                    if (checkWinCondition()) return;
                }
                switchPlayer(determinePhaseForPlayer(2));
                updateAllUI();
            }, 1000); // Delay for the removal action
        } else {
            // If no mill, just switch to the next player
            switchPlayer(determinePhaseForPlayer(1));
            updateAllUI();
        }
    }, 1000); // Initial delay for the AI's turn
}

function scoreRemoval(spotId) {
    boardState[spotId] = 0; let score = 1;
    for (const mill of mills) {
        if (mill.includes(spotId)) {
            const [a, b, c] = mill;
            if ((boardState[a] === 1 && boardState[b] === 1 && boardState[c] === 0) || (boardState[a] === 1 && boardState[c] === 1 && boardState[b] === 0) || (boardState[b] === 1 && boardState[c] === 1 && boardState[a] === 0)) {
                score = 50; break;
            }
        }
    }
    boardState[spotId] = 1; return score;
}
function scoreMove(move) {
    let score = 0;
    if (move.to !== undefined) { boardState[move.to] = 2; boardState[move.from] = 0; } else { boardState[move.spot] = 2; }
    if (checkForMill(move.to !== undefined ? move.to : move.spot, 2)) {
        score = 100;
    } else {
        for (const mill of mills) {
            const [a, b, c] = mill;
            const targetSpot = move.to !== undefined ? move.to : move.spot;
            if (mill.includes(targetSpot)) {
                if ((boardState[a] === 1 && boardState[b] === 1 && c === targetSpot) || (boardState[a] === 1 && boardState[c] === 1 && b === targetSpot) || (boardState[b] === 1 && boardState[c] === 1 && a === targetSpot)) {
                    score = 50; break;
                }
            }
        }
    }
    if (move.to !== undefined) { boardState[move.from] = 2; boardState[move.to] = 0; } else { boardState[move.spot] = 0; }
    return score + 1;
}
function getAllPossibleMoves(player) {
    const moves = [];
    const phase = determinePhaseForPlayer(player);
    if (phase === 'placing') { for (let i = 0; i < 24; i++) if (boardState[i] === 0) moves.push({ spot: i });
    } else {
        for (let fromId = 0; fromId < 24; fromId++) {
            if (boardState[fromId] === player) {
                if (phase === 'flying') { for (let toId = 0; toId < 24; toId++) if (boardState[toId] === 0) moves.push({ from: fromId, to: toId });
                } else { adjacentSpots[fromId].forEach(toId => { if (boardState[toId] === 0) moves.push({ from: fromId, to: toId }); }); }
            }
        }
    }
    return moves;
}

function placePiece(spotId) { boardState[spotId] = currentPlayer; if (currentPlayer === 1) { player1CowsToPlace--; player1CowsOnBoard++; } else { player2CowsToPlace--; player2CowsOnBoard++; } }
function removePiece(spotId) { const opponent = boardState[spotId]; boardState[spotId] = 0; if (opponent === 1) player1CowsOnBoard--; else player2CowsOnBoard--; }
function movePiece(fromId, toId) { boardState[toId] = boardState[fromId]; boardState[fromId] = 0; }
function isValidMove(fromId, toId) { if (boardState[toId] !== 0) return false; if (determinePhaseForPlayer(currentPlayer) === 'flying') return true; return adjacentSpots[fromId].includes(toId); }
function isValidToRemove(spotId) { const opponent = (currentPlayer === 1) ? 2 : 1; if (boardState[spotId] !== opponent) return false; if (!checkForMill(spotId, opponent)) return true; let allInMills = true; for (let i = 0; i < boardState.length; i++) { if (boardState[i] === opponent && !checkForMill(i, opponent)) { allInMills = false; break; } } return allInMills; }
function checkForMill(spotId, player) { for (const mill of mills) { if (mill.includes(spotId)) { const [a, b, c] = mill; if (boardState[a] === player && boardState[b] === player && boardState[c] === player) return mill; } } return null; }
function determinePhaseForPlayer(player) { if (player1CowsToPlace > 0 || player2CowsToPlace > 0) return 'placing'; const cows = (player === 1) ? player1CowsOnBoard : player2CowsOnBoard; return (cows === 3) ? 'flying' : 'moving'; }
function switchPlayer(newPhase) { currentPlayer = (currentPlayer === 1) ? 2 : 1; gamePhase = newPhase; if (currentPlayer === 2 && gameMode === 'pva' && gamePhase !== 'gameover') aiTakeTurn(); }
function checkWinCondition() { if (player1CowsToPlace === 0 && player2CowsToPlace === 0) { if (player2CowsOnBoard < 3) { endGame(1); return true; } if (player1CowsOnBoard < 3) { endGame(2); return true; } } return false; }
function endGame(winner) { gamePhase = 'gameover'; if (winner === 1) player1Score += 3; else player2Score += 3; addHistory(winner); updateAllUI(); ui.gameOverMessage.textContent = `${(winner === 1 ? player1Name : player2Name)} Wins! (+3 Points)`; ui.gameOverOverlay.classList.remove('hidden'); }
function loadHistory() { const savedHistory = localStorage.getItem('morabarabaHistory'); if (savedHistory) scoreHistory = JSON.parse(savedHistory); updateHistoryUI(); }
function addHistory(winner) { const now = new Date(); const winnerName = (winner === 1) ? player1Name : player2Name; const newEntry = { winner: winnerName, date: now.toLocaleString() }; scoreHistory.unshift(newEntry); if (scoreHistory.length > 10) scoreHistory.pop(); localStorage.setItem('morabarabaHistory', JSON.stringify(scoreHistory)); updateHistoryUI(); }
function updateHistoryUI() { ui.historyList.innerHTML = ''; if (scoreHistory.length === 0) { ui.historyList.innerHTML = '<li>No games played yet.</li>'; } else { scoreHistory.forEach(entry => { const li = document.createElement('li'); li.innerHTML = `${entry.winner} won <span class="date">${entry.date}</span>`; ui.historyList.appendChild(li); }); } }
function updateAllUI() {
    for (let i = 0; i < 24; i++) {
        const spotElement = document.querySelector(`[data-id='${i}']`);
        if(spotElement) {
            spotElement.className = 'spot';
            if (boardState[i] === 1) spotElement.classList.add('player1');
            else if (boardState[i] === 2) spotElement.classList.add('player2');
            else spotElement.classList.add('empty');
        }
    }
    ui.p1ToPlace.textContent = player1CowsToPlace; ui.p1OnBoard.textContent = player1CowsOnBoard;
    ui.p2ToPlace.textContent = player2CowsToPlace; ui.p2OnBoard.textContent = player2CowsOnBoard;
    ui.p1Score.textContent = player1Score; ui.p2Score.textContent = player2Score;
    ui.p1NameDisplay.textContent = player1Name; ui.p2NameDisplay.textContent = player2Name;
    ui.p1Panel.classList.toggle('active', currentPlayer === 1 && gamePhase !== 'gameover');
    ui.p2Panel.classList.toggle('active', currentPlayer === 2 && gamePhase !== 'gameover');
    if (gamePhase === 'gameover') { ui.statusText.textContent = "Game Over!";
    } else if (gamePhase === 'removing') {
        ui.statusText.textContent = `${(currentPlayer === 1 ? player1Name : player2Name)} formed a mill! Remove an opponent's piece.`;
    } else {
        const phaseForCurrentPlayer = determinePhaseForPlayer(currentPlayer);
        ui.statusText.textContent = `${(currentPlayer === 1 ? player1Name : player2Name)}'s Turn (${phaseForCurrentPlayer})`;
    }
}
function highlightMill(mill, add) { mill.forEach(spotId => { const spot = document.querySelector(`[data-id='${spotId}']`); if (spot) spot.classList.toggle('in-mill', add); }); }
function highlightRemovablePieces(add) { for (let i = 0; i < boardState.length; i++) { if (isValidToRemove(i)) { const spot = document.querySelector(`[data-id='${i}']`); if (spot) spot.classList.toggle('removable', add); } } }
function clearHighlights() { document.querySelectorAll('.in-mill, .removable, .selected').forEach(el => el.classList.remove('in-mill', 'removable', 'selected')); }