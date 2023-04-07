/**
 * A Move consists of an (x,y) Position. This is a primary key.
 * When the field with that (x,y) is clicked the move gets executed.
 * 
 * Every move has a beatPosition. Moves that will beat other minions
 * store this position. This is relevant for en passant, where the minion beats and moves
 * somewhere else.
 * 
 * If the beatPostion is null, the move is friendly and does not beat a minion
 * 
 * Moves can be complex and get validated by the board. Hence the board calls the simulate() method
 * and then distributes the move to the minions.
 * 
 * NOTE: Some moves get interrupted and continued later
 */

/**
 * Takes a team and updates all pseudomoves of the other team
 * @param {Team} team 
 */
function updatePseudoMovesOfOtherTeam(team) {
    if (team === TEAM.WHITE) {
        board.updateMinionPseudoMovesOfTeam(TEAM.BLACK);
    } else if (team === TEAM.BLACK) {
        board.updateMinionPseudoMovesOfTeam(TEAM.WHITE);
    }
}



const CSS_MOVE_CLASSES = {
    basicMove: "basicMove",
    basicBeat: "basicBeat",
    enPassantMove: "enPassantMove",
    castlingMove: "castlingMove",
    promotionMove: "promotionMove",
    promotionBeat: "promotionBeat"
}

/**
 * The User Interface for the Piece Selection during the PawnPromotionMove
 */
const pawnPromotionGui = {
    node: document.getElementById("gamePawnPromotion"),

    queenBtn: document.getElementById("queenBtn"),
    rookBtn: document.getElementById("rookBtn"),
    knightBtn: document.getElementById("knightBtn"),
    bishopBtn: document.getElementById("bishopBtn"),

    /**
     * Shows the interface and configure the buttions necessary for the PawnPromotionMove.
     * Every button resolves with his Minion Name.
     * NOTE: The Method ends before the Buttons resolve.
     * @param {function} resolve
     */
    promotionSelection: function(resolve) {
        this.node.classList.remove("hide");

        let teamCssClass = game.currentTeam === TEAM.WHITE ? "white" : "black";

        //make sure every Minion has the color of the player's team
        this.queenBtn.childNodes[0].classList.add(teamCssClass);
        this.rookBtn.childNodes[0].classList.add(teamCssClass);
        this.knightBtn.childNodes[0].classList.add(teamCssClass);
        this.bishopBtn.childNodes[0].classList.add(teamCssClass);

        let selectionBtnClicked = (name) => {

            //remove the added clickevents
            this.queenBtn.onclick = null;
            this.rookBtn.onclick = null;
            this.knightBtn.onclick = null;
            this.bishopBtn.onclick = null;

            //remove the color again
            this.queenBtn.childNodes[0].classList.remove(teamCssClass);
            this.rookBtn.childNodes[0].classList.remove(teamCssClass);
            this.knightBtn.childNodes[0].classList.remove(teamCssClass);
            this.bishopBtn.childNodes[0].classList.remove(teamCssClass);

            this.node.classList.add("hide");

            resolve(name);
        }

        this.queenBtn.onclick = () => selectionBtnClicked("Queen");
        this.rookBtn.onclick = () => selectionBtnClicked("Rook");
        this.knightBtn.onclick = () => selectionBtnClicked("Knight");
        this.bishopBtn.onclick = () => selectionBtnClicked("Bishop");
    }
}

class BoardPosition {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class move {
    constructor(minion, x, y) {
        this.x = x;
        this.y = y;
        this.minion = minion;
        this.beatPos = null;
        this.startX = this.minion.x;
        this.startY = this.minion.y;
    }
}

class basicMove extends move {

    constructor(minion, x, y) {
        super(minion, x, y);
        this.cssClassName = CSS_MOVE_CLASSES.basicMove;
    }

    execute(resolveExecute) {

        //the display will only update these
        let changedFields = new Array();
        changedFields.push(new BoardPosition(this.minion.x, this.minion.y));
        changedFields.push(new BoardPosition(this.x, this.y));

        //Move Minion
        board.moveMinionTo(this.minion, this.x, this.y);

        if (this.minion.moved === null) {
            this.minion.moved = game.gameTurns;
        }

        resolveExecute(changedFields);
    }

    simulate() {
        let currentX = this.minion.x;
        let currentY = this.minion.y;

        board.moveMinionTo(this.minion, this.x, this.y);

        updatePseudoMovesOfOtherTeam(this.minion.team);

        let result = !(game.isCheck(this.minion.team));

        board.moveMinionTo(this.minion, currentX, currentY);

        //doublecheck
        //updatePseudoMovesOfOtherTeam(this.minion.team);

        return result;
    }

    toJSON() {
        //NOTE toJson does not work after execution
        return {
            type: this.constructor.name,
            startX: this.startX,
            startY: this.startY,
            targetX: this.x,
            targetY: this.y,
            minion: this.minion.name
        };
    }
}

class basicBeat extends move {

    constructor(minion, x, y) {
        super(minion, x, y);
        this.cssClassName = CSS_MOVE_CLASSES.basicBeat;
        this.beatPos = {};
        this.beatPos.x = this.x;
        this.beatPos.y = this.y;
    }

    execute(resolveExecute) {

        //the display will only update these
        let changedFields = new Array();
        changedFields.push(new BoardPosition(this.minion.x, this.minion.y));
        changedFields.push(new BoardPosition(this.x, this.y));

        //add Minion to the beaten Minion list
        board.beatenMinions.push(board.getMinionAt(this.x, this.y));

        //remove Minion from data structure
        board.deleteMinionAt(this.x, this.y);

        //Move Minion
        board.moveMinionTo(this.minion, this.x, this.y);

        if (this.minion.moved === null) {
            this.minion.moved = game.gameTurns;
        }

        resolveExecute(changedFields);
    }

    simulate() {

        let beatMinion = board.getMinionAt(this.x, this.y);

        let currentX = this.minion.x;
        let currentY = this.minion.y;

        //remove Minion from data structure
        board.deleteMinionAt(this.x, this.y);
        //Move Minion
        board.moveMinionTo(this.minion, this.x, this.y);

        if (this.minion.team === TEAM.WHITE) {
            board.updateMinionPseudoMovesOfTeam(TEAM.BLACK);
        } else if (this.minion.team === TEAM.BLACK) {
            board.updateMinionPseudoMovesOfTeam(TEAM.WHITE);
        }

        let result = !(game.isCheck(this.minion.team));

        board.moveMinionTo(this.minion, currentX, currentY);
        board.placeMinionOnBoard(beatMinion);

        //doublecheck
        //updatePseudoMovesOfOtherTeam(this.minion.team);

        return result;


    }

    toJSON() {
        //NOTE toJson does not work after execution
        return {
            type: this.constructor.name,
            startX: this.startX,
            startY: this.startY,
            targetX: this.x,
            targetY: this.y,
            minion: this.minion.name
        };
    }

}

class enPassantMove extends move {

    constructor(minion, x, y) {
        super(minion, x, y);
        this.cssClassName = CSS_MOVE_CLASSES.enPassantMove;

        this.beatMinionY = (this.minion.team === TEAM.WHITE) ? 1 : -1;

        this.beatPos = {};
        this.beatPos.x = this.x;
        this.beatPos.y = this.y + this.beatMinionY;
    }

    execute(resolveExecute) {

        //the display will only update these
        let changedFields = new Array();
        changedFields.push(new BoardPosition(this.minion.x, this.minion.y));
        changedFields.push(new BoardPosition(this.x, this.y));
        changedFields.push(this.beatPos);

        //White: y+1 at destination
        //black: y-1 at destination

        //add Minion to the beaten Minion list
        board.beatenMinions.push(board.getMinionAt(this.x, this.y + this.beatMinionY));

        //remove Minion from data structure
        board.deleteMinionAt(this.x, this.y + this.beatMinionY);

        //Move Minion
        board.moveMinionTo(this.minion, this.x, this.y);

        if (this.minion.moved === null) {
            this.minion.moved = game.gameTurns;
        }

        resolveExecute(changedFields);
    }

    simulate() {

        let beatMinion = board.getMinionAt(this.x, this.y + this.beatMinionY);

        let currentX = this.minion.x;
        let currentY = this.minion.y;

        //remove Minion from data structure
        board.deleteMinionAt(this.x, this.y + this.beatMinionY);
        //Move Minion
        board.moveMinionTo(this.minion, this.x, this.y);

        updatePseudoMovesOfOtherTeam(this.minion.team);

        let result = !(game.isCheck(this.minion.team));

        board.moveMinionTo(this.minion, currentX, currentY);
        board.placeMinionOnBoard(beatMinion);

        //doublecheck
        //updatePseudoMovesOfOtherTeam(this.minion.team);

        return result;

    }

    toJSON() {
        //NOTE toJson does not work after execution
        return {
            type: this.constructor.name,
            startX: this.startX,
            startY: this.startY,
            targetX: this.x,
            targetY: this.y,
            minion: this.minion.name
        };
    }
}

class castlingMove extends move {

    constructor(minion, x, y, castlingRook, sideOfBoard) {
        super(minion, x, y);
        this.cssClassName = CSS_MOVE_CLASSES.castlingMove;
        this.castlingRook = castlingRook;
        this.sideOfBoard = sideOfBoard;
        this.RookStartX = this.castlingRook.x;
        this.RockStartY = this.castlingRook.y;
    }

    execute(resolveExecute) {

        //the display will only update these
        let changedFields = new Array();
        changedFields.push(new BoardPosition(this.minion.x, this.minion.y));
        changedFields.push(new BoardPosition(this.x, this.y));

        //where the rook stood
        changedFields.push(new BoardPosition(this.castlingRook.x, this.castlingRook.y));

        //Move the king
        board.moveMinionTo(this.minion, this.x, this.y);

        //Move the rook
        if (this.sideOfBoard === "left") {
            board.moveMinionTo(this.castlingRook, 3, this.y);
        } else if (this.sideOfBoard === "right") {
            board.moveMinionTo(this.castlingRook, BOARDWIDTH - 3, this.y);
        }

        //where the rook stands after
        changedFields.push(new BoardPosition(this.castlingRook.x, this.castlingRook.y));

        if (this.minion.moved === null) {
            this.minion.moved = game.gameTurns;
        }

        resolveExecute(changedFields);
    }

    simulate() {
        let currentX = this.minion.x;
        let currentY = this.minion.y;

        let result = true;

        //Left or right castling?
        if (this.sideOfBoard === "left") {

            //Move him one left
            board.moveMinionTo(this.minion, this.minion.x - 1, this.minion.y);

            updatePseudoMovesOfOtherTeam(this.minion.team);

            if ((game.isCheck(this.minion.team))) {
                result = false;
            }

            //Move him left once more
            board.moveMinionTo(this.minion, this.minion.x - 1, this.minion.y);

            updatePseudoMovesOfOtherTeam(this.minion.team);

            if ((game.isCheck(this.minion.team))) {
                result = false;
            }

            //Move him back to where he was
            board.moveMinionTo(this.minion, currentX, currentY);
        }
        //right castling
        else if (this.sideOfBoard === "right") {
            //Move him right left
            board.moveMinionTo(this.minion, this.minion.x + 1, this.minion.y);

            updatePseudoMovesOfOtherTeam(this.minion.team);

            if ((game.isCheck(this.minion.team))) {
                result = false;
            }

            //Move him right once more
            board.moveMinionTo(this.minion, this.minion.x + 1, this.minion.y);

            updatePseudoMovesOfOtherTeam(this.minion.team);

            if ((game.isCheck(this.minion.team))) {
                result = false;
            }

            //Move him back to where he was
            board.moveMinionTo(this.minion, currentX, currentY);
        }

        //doublecheck
        //updatePseudoMovesOfOtherTeam(this.minion.team);


        return result;


    }

    toJSON() {
        //NOTE toJson does not work after execution
        return {
            type: this.constructor.name,
            startX: this.startX,
            startY: this.startY,
            targetX: this.x,
            targetY: this.y,
            rookX: this.RookStartX,
            rookY: this.RockStartY,
            sideOfBoard: this.sideOfBoard,
            minion: this.minion.name
        };
    }
}

class promotionMove extends move {

    constructor(minion, x, y, chosenMinionName = null) {
        super(minion, x, y);
        this.cssClassName = CSS_MOVE_CLASSES.promotionMove;
        this.chosenMinionName = chosenMinionName;
    }

    execute(resolveExecute) {

        //the display will only update these
        let changedFields = new Array();
        changedFields.push(new BoardPosition(this.minion.x, this.minion.y));
        changedFields.push(new BoardPosition(this.x, this.y));

        if (this.chosenMinionName === null) {
            //Display the selection box
            let p = new Promise((resolve, reject) => pawnPromotionGui.promotionSelection(resolve));

            p.then((selectionName) => {
                this.chosenMinionName = selectionName;
                this.continue(selectionName);
                resolveExecute(changedFields);
            });
        } else {
            this.continue(this.chosenMinionName);
            resolveExecute(this.chosenMinionName);
        }
    }

    continue (selectionName) {

        //remove Minion from data structure
        board.deleteMinionAt(this.minion.x, this.minion.y);

        let newSelectedMinion = new MINIONCLASSES[selectionName](this.minion.team, this.x, this.y);

        board.placeMinionOnBoard(newSelectedMinion);

        if (this.minion.moved === null) {
            this.minion.moved = game.gameTurns;
        }
    }

    simulate() {
        let currentX = this.minion.x;
        let currentY = this.minion.y;

        board.moveMinionTo(this.minion, this.x, this.y);

        updatePseudoMovesOfOtherTeam(this.minion.team);

        let result = !(game.isCheck(this.minion.team));

        board.moveMinionTo(this.minion, currentX, currentY);

        //doublecheck
        //updatePseudoMovesOfOtherTeam(this.minion.team);

        return result;


    }

    toJSON() {
        //NOTE toJson does not work after execution
        return {
            type: this.constructor.name,
            startX: this.startX,
            startY: this.startY,
            targetX: this.x,
            targetY: this.y,
            chosenMinionName: this.chosenMinionName,
            minion: this.minion.name
        };
    }
}

class promotionBeat extends move {

    constructor(minion, x, y, chosenMinionName = null) {
        super(minion, x, y);
        this.cssClassName = CSS_MOVE_CLASSES.promotionBeat;

        this.beatPos = {};
        this.beatPos.x = this.x;
        this.beatPos.y = this.y;

        this.chosenMinionName = chosenMinionName;
    }

    execute(resolveExecute) {

        //the display will only update these
        let changedFields = new Array();
        changedFields.push(new BoardPosition(this.minion.x, this.minion.y));
        changedFields.push(new BoardPosition(this.x, this.y));

        if (this.chosenMinionName === null) {
            //Display the selection box
            let p = new Promise((resolve, reject) => pawnPromotionGui.promotionSelection(resolve));

            p.then((selectionName) => {
                this.chosenMinionName = selectionName;
                this.continue(selectionName);
                resolveExecute(changedFields);
            });
        } else {
            this.continue(this.chosenMinionName);
            resolveExecute(changedFields);
        }
    }

    continue (selectionName) {
        //add beaten Minion to the beaten Minion list
        board.beatenMinions.push(board.getMinionAt(this.x, this.y));

        //remove beaten Minion from data structure
        board.deleteMinionAt(this.x, this.y);

        //Delete the attacking minion where he is standing right now
        board.deleteMinionAt(this.minion.x, this.minion.y);

        let newSelectedMinion = new MINIONCLASSES[selectionName](this.minion.team, this.x, this.y);

        //Place the new minion
        board.placeMinionOnBoard(newSelectedMinion);

        if (this.minion.moved === null) {
            this.minion.moved = game.gameTurns;
        }

    }

    simulate() {

        let beatMinion = board.getMinionAt(this.x, this.y);

        let currentX = this.minion.x;
        let currentY = this.minion.y;

        //remove Minion from data structure
        board.deleteMinionAt(this.x, this.y);
        //Move Minion
        board.moveMinionTo(this.minion, this.x, this.y);

        if (this.minion.team === TEAM.WHITE) {
            board.updateMinionPseudoMovesOfTeam(TEAM.BLACK);
        } else if (this.minion.team === TEAM.BLACK) {
            board.updateMinionPseudoMovesOfTeam(TEAM.WHITE);
        }

        let result = !(game.isCheck(this.minion.team));

        board.moveMinionTo(this.minion, currentX, currentY);
        board.placeMinionOnBoard(beatMinion);

        //doublecheck
        //updatePseudoMovesOfOtherTeam(this.minion.team);

        return result;


    }

    toJSON() {
        //NOTE toJson does not work after execution
        return {
            type: this.constructor.name,
            startX: this.startX,
            startY: this.startY,
            targetX: this.x,
            targetY: this.y,
            chosenMinionName: this.chosenMinionName,
            minion: this.minion.name
        };
    }

}

function JSONmoveToExecutable(JSONmove) {

    //maybe optimize with switch/case
    let moveClasses = {
        basicMove: () => { return new basicMove(board.getMinionAt(JSONmove.startX, JSONmove.startY), JSONmove.targetX, JSONmove.targetY) },
        basicBeat: () => { return new basicBeat(board.getMinionAt(JSONmove.startX, JSONmove.startY), JSONmove.targetX, JSONmove.targetY) },
        enPassantMove: () => { return new enPassantMove(board.getMinionAt(JSONmove.startX, JSONmove.startY), JSONmove.targetX, JSONmove.targetY) },
        castlingMove: () => { return new castlingMove(board.getMinionAt(JSONmove.startX, JSONmove.startY), JSONmove.targetX, JSONmove.targetY, board.getMinionAt(JSONmove.rookX, JSONmove.rookY), JSONmove.sideOfBoard) },
        promotionMove: () => { return new promotionMove(board.getMinionAt(JSONmove.startX, JSONmove.startY), JSONmove.targetX, JSONmove.targetY, JSONmove.chosenMinionName) },
        promotionBeat: () => { return new promotionBeat(board.getMinionAt(JSONmove.startX, JSONmove.startY), JSONmove.targetX, JSONmove.targetY, JSONmove.chosenMinionName) },
    }

    return moveClasses[JSONmove.type]();
}