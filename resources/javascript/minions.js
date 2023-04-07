/**
 * Some general info on usage:
 * The possibleBeats function of every class also includes friendly minions.
 * 
 * Every minion has pseudoMoves and pseudoBeats. Both are lists of type: boardPosition.
 * PseudoMoves and pseudoBeats must be generated first by calling the updatePseudoMoves() function.
 * Then they deliver the basic movement pattern of the particular minion with regard to the
 * dimensions of the board and the positions of the other minions on the board.
 * 
 * To filter the moves that could possibly leave the current player in a check situation,
 * the board will simulate the pseudoMoves and pseudoBeats of all minions. Validated are then stored
 * inside the validMoves / validBeats variables of the corresponding minion. 
 */

/**
 * A little helper to prevent friendly fire. A boardPosition only gets added, if there is an enemy minion.
 * USE: Instead of beats.push(...)
 * @param {boardPosition} boardPosition 
 * @param {Array} boardPositionList 
 */



function pushBeatPositionFromMinionToList(beatPosition, minion, boardPositionList){
    if(board.getMinionAt(beatPosition.x, beatPosition.y).team !== minion.team){
        boardPositionList.push(beatPosition);
    }
}

class Minion{
    
    constructor(team, x, y){

        //Note: Underscore seperates the value property from the getter/setter
        this.team = team;
        this.x = x;
        this.y = y;
        this.moved = null;
        this.pseudoMoves = new Array();
        this.validMoves = new Array();
        this.name = this.constructor.name;

        if(team === TEAM.BLACK){
            this.spriteCss = {
                color: "black",
                type: null
            };
        }else if(team === TEAM.WHITE){
            this.spriteCss = {
                color: "white",
                type: null
            };
        }

    }
}

    
/*
    _
   (_)
  (___)
  _|_|_
 (_____)
 /_____\
*/
class Pawn extends Minion{

    constructor(team, x, y){
        super(team, x, y);

        this.spriteCss.type = "pawn"; 

        //black minions have direction 1, white minions direction -1
        this.direction = (this.team == TEAM.BLACK) ? 1 : -1;
    }
        
    updatePseudoMoves(){
        let moves = new Array();

        //The y-Value of the destination where the minion will move next
        let forwardStep = (this.y)+(1*this.direction);

        //The y-value of the destination where the minion will move in a double step
        let largeForwardStep = (this.y)+(2*this.direction);

        let promotionPossible = ((forwardStep === BOARDWIDTH-1) || (forwardStep === 0)) ? true : false;

        if(board.isValidPos(this.x, forwardStep)){
            if(!(board.isFieldOccupied(this.x, forwardStep))){

                //Promotion
                if(promotionPossible){
                    moves.push(new promotionMove(this, this.x, forwardStep));
                }
                //Normal move forward
                else{
                    moves.push(new basicMove(this, this.x, forwardStep));
                }

                if((this.moved === null) && board.isValidPos(this.x, largeForwardStep)){
                    if(!(board.isFieldOccupied(this.x, largeForwardStep))){
                        moves.push(new basicMove(this, this.x, largeForwardStep));
                    }   
                }
            }
        }
        
        //BEATS

        let beats = new Array();
        
        let beatPos1 = (this.x)-1;
        let beatPos2 = (this.x)+1;
        
        if(board.isValidPos(beatPos1,forwardStep)){
            if(board.isFieldOccupied(beatPos1,forwardStep)){
                //Promotion
                if(promotionPossible){
                    console.log("promotion!!!move");
                    pushBeatPositionFromMinionToList(new promotionBeat(this, beatPos1, forwardStep), this, beats);
                }
                //Normal beat
                else{
                    pushBeatPositionFromMinionToList(new basicBeat(this, beatPos1, forwardStep), this, beats);
                }
                
            }
        }
        if(board.isValidPos(beatPos2,forwardStep)){
            if(board.isFieldOccupied(beatPos2,forwardStep)){
                //Promotion
                if(promotionPossible){
                    console.log("promotion!!!beat");
                    pushBeatPositionFromMinionToList(new promotionBeat(this, beatPos2, forwardStep), this, beats);
                }
                //Normal beat
                else{
                    pushBeatPositionFromMinionToList(new basicBeat(this, beatPos2, forwardStep), this, beats);
                }
            }
        }

        //en passant
        let enPassants = new Array();

        let rank = (this.team === TEAM.BLACK) ? 4 : 3;
        let enPassantPossible = (this.y === rank) ? true : false;
        if(enPassantPossible){
            console.log("enpassant possible");
        }

        if(enPassantPossible){

            if(board.isValidPos(this.x - 1, this.y)){
                //Is a minion standing left to me?
                if(board.isFieldOccupied(this.x - 1, this.y)){
                    
                    //Yes, and here it is
                    let leftMinion = board.getMinionAt(this.x - 1,this.y);

                    if(leftMinion.moved === (game.gameTurns-1)){
                        if(board.isFieldOccupied(this.x - 1, forwardStep) === false){
                            enPassants.push(new enPassantMove(this, this.x - 1, forwardStep));
                        }
                    }
                }
            }

            if(board.isValidPos(this.x + 1, this.y)){
                //Is a minion standing right to me?
                if(board.isFieldOccupied(this.x + 1, this.y)){
                    
                    //Yes, and here it is
                    let rightMinion = board.getMinionAt(this.x + 1, this.y);

                    if(rightMinion.moved === (game.gameTurns-1)){
                        if(board.isFieldOccupied(this.x + 1, forwardStep) === false){
                            enPassants.push(new enPassantMove(this, this.x + 1, forwardStep));
                        }
                    }
                }
            }
            
        }

        this.pseudoMoves = moves.concat(beats, enPassants);
    }
}


/*     
   _O    
  / //\  
 {     } 
  \___/  
  (___)  
   |_|   
  /   \  
 (_____) 
(_______)
/_______\
*/
class Bishop extends Minion{

    constructor(team, x, y){
        super(team, x, y);
        this.spriteCss.type = "bishop";
    }

    updatePseudoMoves(){
        let moves = new Array();
        let beats = new Array();

        //Diagonal right down
        for(let i = 1; i < board.BOARDWIDTH; i++){
            var currentX = (this.x) + i;
            var currentY = (this.y) + i;

            if(!(board.isValidPos(currentX, currentY))){
                break;
            }
            if(board.isFieldOccupied(currentX, currentY)){
                pushBeatPositionFromMinionToList(new basicBeat(this, currentX, currentY), this, beats);
                break;
            }
            moves.push(new basicMove(this, currentX, currentY));
        }

        //Diagonal left down
        for(let i = 1; i < board.BOARDWIDTH; i++){
            var currentX = (this.x) - i;
            var currentY = (this.y) + i;

            if(!(board.isValidPos(currentX, currentY))){
                break;
            }
            if(board.isFieldOccupied(currentX, currentY)){
                pushBeatPositionFromMinionToList(new basicBeat(this, currentX, currentY), this, beats);
                break;
            }
            moves.push(new basicMove(this, currentX, currentY));
        }

        //Diagonal left up
        for(let i = 1; i < board.BOARDWIDTH; i++){
            var currentX = (this.x) - i;
            var currentY = (this.y) - i;

            if(!(board.isValidPos(currentX, currentY))){
                break;
            }
            if(board.isFieldOccupied(currentX, currentY)){
                pushBeatPositionFromMinionToList(new basicBeat(this, currentX, currentY), this, beats);
                break;
            }
            moves.push(new basicMove(this, currentX, currentY));
        }

        //Diagonal right up
        for(let i = 1; i < board.BOARDWIDTH; i++){
            var currentX = (this.x) + i;
            var currentY = (this.y) - i;

            if(!(board.isValidPos(currentX, currentY))){
                break;
            }
            if(board.isFieldOccupied(currentX, currentY)){
                pushBeatPositionFromMinionToList(new basicBeat(this, currentX, currentY), this, beats);
                break;
            }
            moves.push(new basicMove(this, currentX, currentY));
        }

        this.pseudoMoves = moves.concat(beats);
            
    }
}
/*
   .::.
   _::_
 _/____\_
 \      /
  \____/
  (____)
   |  |
   |__|
  /    \
 (______)
(________)
/________\
 */
class King extends Minion{

    constructor(team, x, y){
        super(team, x, y);
        this.spriteCss.type = "king";
    }
    
    updatePseudoMoves(){
        let moves = new Array();
        let beats = new Array();

        //Find out all positions the knight can move to
        for(let i = -1; i < 2; i++){
            for(let j = -1; j < 2; j++){
                //This condition is met whenever the knight can jump somewhere

                    var currentX = this.x + i;
                    var currentY = this.y + j;

                    if(board.isValidPos(currentX, currentY)){
                        if(board.isFieldOccupied(currentX,currentY)){
                            pushBeatPositionFromMinionToList(new basicBeat(this, currentX, currentY), this, beats);
                        }
                        else{
                            moves.push(new basicMove(this, currentX, currentY));
                        }
                    }
            }
        }

        //Castling

        let castlings = new Array();

        //did i move already?
        if(this.moved === null){
            //Left rook
            if(board.isFieldOccupied(0, this.y)){
                let leftRook = board.getMinionAt(0, this.y);
                //Is this really a rook?
                if((leftRook.name === "Rook") && (leftRook.moved === null)){
                    //is the way clear?
                    if( !(board.isFieldOccupied(1,this.y))
                    && !(board.isFieldOccupied(2,this.y))
                    && !(board.isFieldOccupied(3,this.y)) ){
                        castlings.push(new castlingMove(this,2,this.y,leftRook,"left"));
                    }
                }
            }
            //right rook
            if(board.isFieldOccupied((BOARDWIDTH-1), this.y)){
                let rightRook = board.getMinionAt((BOARDWIDTH-1), this.y);
                //Is this really a rook?
                if((rightRook.name === "Rook") && (rightRook.moved === null)){
                    //is the way clear
                    if( !(board.isFieldOccupied(BOARDWIDTH - 2,this.y))
                    && !(board.isFieldOccupied(BOARDWIDTH - 3,this.y))){
                        castlings.push(new castlingMove(this,BOARDWIDTH - 2,this.y,rightRook,"right"));
                    }
                }
            }
        }

        this.pseudoMoves = moves.concat(beats, castlings);
        
    }
}

/*
   ^^__   
  /  - \_ 
<|    __< 
<|    \   
<|     \  
<|______\ 
 _|____|_ 
(________)
/________\
*/
class Knight extends Minion{

    constructor(team, x, y){
        super(team, x, y);
        this.spriteCss.type = "knight";
    }
    
    updatePseudoMoves(){
        let moves = new Array();
        let beats = new Array();

        //Find out all positions the knight can move to
        for(let i = -2; i < 3; i++){
            for(let j = -2; j < 3; j++){
                //This condition is met whenever the knight can jump somewhere
                if((Math.abs(i) + Math.abs(j)) == 3){

                    var currentX = this.x + i;
                    var currentY = this.y + j;

                    if(board.isValidPos(currentX, currentY)){
                        if(board.isFieldOccupied(currentX,currentY)){
                            pushBeatPositionFromMinionToList(new basicBeat(this, currentX, currentY), this, beats);
                        }
                        else{
                            moves.push(new basicMove(this, currentX, currentY));
                        }
                    }
                }
            }
        }

        this.pseudoMoves = moves.concat(beats);
        
    }
}


/*
   _()_   
 _/____\_ 
 \      / 
  \____/  
  (____)  
   |  |   
   |__|   
  /    \  
 (______) 
(________)
/________\
*/
class Queen extends Minion{
        
    constructor(team, x, y){
        super(team, x, y);
        this.spriteCss.type = "queen";
    }

    updatePseudoMoves(){
        
        let moves = new Array();
        let beats = new Array();

        //Diagonal right down
        for(let i = 1; i < board.BOARDWIDTH; i++){
            var currentX = (this.x) + i;
            var currentY = (this.y) + i;

            if(!(board.isValidPos(currentX, currentY))){
                break;
            }
            if(board.isFieldOccupied(currentX, currentY)){
                pushBeatPositionFromMinionToList(new basicBeat(this, currentX, currentY), this, beats);
                break;
            }
            moves.push(new basicMove(this, currentX, currentY));
        }

        //Diagonal left down
        for(let i = 1; i < board.BOARDWIDTH; i++){
            var currentX = (this.x) - i;
            var currentY = (this.y) + i;

            if(!(board.isValidPos(currentX, currentY))){
                break;
            }
            if(board.isFieldOccupied(currentX, currentY)){
                pushBeatPositionFromMinionToList(new basicBeat(this, currentX, currentY), this, beats);
                break;
            }
            moves.push(new basicMove(this, currentX, currentY));
        }

        //Diagonal left up
        for(let i = 1; i < board.BOARDWIDTH; i++){
            var currentX = (this.x) - i;
            var currentY = (this.y) - i;

            if(!(board.isValidPos(currentX, currentY))){
                break;
            }
            if(board.isFieldOccupied(currentX, currentY)){
                pushBeatPositionFromMinionToList(new basicBeat(this, currentX, currentY), this, beats);
                break;
            }
            moves.push(new basicMove(this, currentX, currentY));
        }

        //Diagonal right up
        for(let i = 1; i < board.BOARDWIDTH; i++){
            var currentX = (this.x) + i;
            var currentY = (this.y) - i;

            if(!(board.isValidPos(currentX, currentY))){
                break;
            }
            if(board.isFieldOccupied(currentX, currentY)){
                pushBeatPositionFromMinionToList(new basicBeat(this, currentX, currentY), this, beats);
                break;
            }
            moves.push(new basicMove(this, currentX, currentY));
        }

        for(let xRight = (this.x)+1; xRight < board.BOARDWIDTH; xRight++){
            if(!(board.isValidPos(xRight,this.y))){
                break;
            }
            if(board.isFieldOccupied(xRight,this.y)){
                pushBeatPositionFromMinionToList(new basicBeat(this, xRight, this.y), this, beats);
                break;
            }
            moves.push(new basicMove(this, xRight, this.y));
        }

        for(let xLeft = (this.x)-1; xLeft < board.BOARDWIDTH; xLeft--){
            if(!(board.isValidPos(xLeft,this.y))){
                break;
            }
            if(board.isFieldOccupied(xLeft,this.y)){
                pushBeatPositionFromMinionToList(new basicBeat(this, xLeft, this.y), this, beats)
                break;
            }
            moves.push(new basicMove(this, xLeft, this.y));
        }

        for(let yUp = (this.y)+1; yUp < board.BOARDWIDTH; yUp++){
            if(!(board.isValidPos(this.x, yUp))){
                break;
            }
            if(board.isFieldOccupied(this.x,yUp)){
                pushBeatPositionFromMinionToList(new basicBeat(this, this.x, yUp), this, beats);
                break;
            }
            moves.push(new basicMove(this, this.x, yUp));
        }

        for(let yDown = (this.y)-1; yDown < board.BOARDWIDTH; yDown--){
            if(!(board.isValidPos(this.x,yDown))){
                break;
            }
            if(board.isFieldOccupied(this.x,yDown)){
                pushBeatPositionFromMinionToList(new basicBeat(this, this.x, yDown), this, beats);
                break;
            }
            moves.push(new basicMove(this, this.x,yDown));
        }
        this.pseudoMoves = moves.concat(beats);
        
    }
}

/*

 | || || | 
 |_______| 
 \__ ___ /
  |___|_|
 (_______)
 /_______\
*/
class Rook extends Minion{

    constructor(team, x, y){
        super(team, x, y);
        this.spriteCss.type = "rook";
    }

    /**
     * Choose between moves or beats, just insert the right string
     * @returns list of minionPositions
     * @param {String} select 
     */
    updatePseudoMoves(){
        let moves = new Array();
        let beats = new Array();

        for(let xRight = (this.x)+1; xRight < board.BOARDWIDTH; xRight++){
            if(!(board.isValidPos(xRight,this.y))){
                break;
            }
            if(board.isFieldOccupied(xRight,this.y)){
                pushBeatPositionFromMinionToList(new basicBeat(this, xRight, this.y), this, beats);
                break;
            }
            moves.push(new basicMove(this, xRight, this.y));
        }

        for(let xLeft = (this.x)-1; xLeft < board.BOARDWIDTH; xLeft--){
            if(!(board.isValidPos(xLeft,this.y))){
                break;
            }
            if(board.isFieldOccupied(xLeft,this.y)){
                pushBeatPositionFromMinionToList(new basicBeat(this, xLeft, this.y), this, beats)
                break;
            }
            moves.push(new basicMove(this, xLeft, this.y));
        }

        for(let yUp = (this.y)+1; yUp < board.BOARDWIDTH; yUp++){
            if(!(board.isValidPos(this.x, yUp))){
                break;
            }
            if(board.isFieldOccupied(this.x,yUp)){
                pushBeatPositionFromMinionToList(new basicBeat(this, this.x, yUp), this, beats);
                break;
            }
            moves.push(new basicMove(this, this.x, yUp));
        }

        for(let yDown = (this.y)-1; yDown < board.BOARDWIDTH; yDown--){
            if(!(board.isValidPos(this.x,yDown))){
                break;
            }
            if(board.isFieldOccupied(this.x,yDown)){
                pushBeatPositionFromMinionToList(new basicBeat(this, this.x, yDown), this, beats);
                break;
            }
            moves.push(new basicMove(this, this.x,yDown));
        }
        this.pseudoMoves = moves.concat(beats);
        
    }
}
//Minion classes enum
const MINIONCLASSES = {
    Rook: Rook,
    Pawn: Pawn,
    King: King,
    Knight: Knight,
    Queen: Queen,
    Bishop: Bishop
}