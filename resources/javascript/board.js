const BOARDWIDTH = 8;

/**
 * Creates a new multidimensinal BOARDWIDTH*BOARDWIDTH array and assigns null to every index
 */
function createBoardMinionsGrid(){
    let verticalArray = new Array(BOARDWIDTH);
     //creating mutidimensinal boardArray
    for(let x = 0; x < BOARDWIDTH; x++){
        let horizontalArray = new Array(BOARDWIDTH);
        horizontalArray.fill(null);
        verticalArray[x] = horizontalArray;
    }

    return verticalArray;
}

const board = {

    BOARDWIDTH: BOARDWIDTH,
    
    //Array stores
    boardMinions: new Array(),
    beatenMinions: new Array(),

    whiteKing: undefined,
    blackKing: undefined,

    //all unoccupied fields have the value 'undefined' 
    boardMinionsGrid: createBoardMinionsGrid(),

    /**
     * Given a minion object: Places it on the board and manages to maintain both data structures:
     * - boardminions
     * - boardminionsGrid
     * NOTE: Only use at the beginning.
     * @param {Minion} minion to be placed on the board.
     */
    placeMinionOnBoard: function(minion){
        //Append to list
        this.boardMinions.push(minion);
        //Place in grid
        this.boardMinionsGrid[minion.x][minion.y] = minion;
    },
    
    /**
     * Checks if a minion is standing on the field with the given coordinates.
     * NOTE: Check valid positions in advance!
     * @param {Number} x 
     * @param {Number} y 
     * @returns true if field is Occupied, false if field is empty
     */
    isFieldOccupied: function(x,y) {
        //Minion standing on the given x and y
        return (this.getMinionAt(x,y)  !== false) ? true : false;
    },

    /**
     * Checks whether the given coordinates are inside the board. If not, returns false.
     * If x and y are between [0:BOARDWIDTH-1] true will be returned.
     * @example isValidPos(8,8) will return false on a BOARDWIDTH:8 board.
     * @param {Number} x 
     * @param {Number} y 
     */
    isValidPos: function(x,y) {
        return x >= 0 && x < board.BOARDWIDTH && y >= 0 && y < board.BOARDWIDTH ? true : false;
    },

    /**
     * Returns the minion at the given position. If there is no minion, return false
     * NOTE: Always check first if x and y are valid.
     * @param {Number} x 
     * @param {Number} y 
     */
    getMinionAt: function(x,y){
        if(this.boardMinionsGrid[x][y] !== null){
            return this.boardMinionsGrid[x][y];
        }else{
            return false;
        }
    },

    /**
     * Deletes the minion at the given position entirely out of the data structure.
     * @param {Number} x 
     * @param {Number} y 
     * @returns true if deletion was successful
     * @returns false if deletion was unsuccessful
     */
    deleteMinionAt: function(x,y){

        if(this.isFieldOccupied(x,y)){
            let delMinionIndex = this.boardMinions.indexOf(this.getMinionAt(x, y));
            this.boardMinions.splice(delMinionIndex,1);
    
            this.boardMinionsGrid[x][y] = null;

            return true;
        }else{
            return false;
        }

    },

    /**
     * Moves the given minion from its current position to the given position. Lets it know the new positon.
     * NOTE: Check position and occupation in advance. Do not forget board.updateMinionMoves() !!!
     * @param {Minion} minion The minion which should be moved
     * @param {Number} x The x-position where it should be moved
     * @param {Number} y The y-position where it should be moved
     */
    moveMinionTo(minion,x,y){
        
        this.boardMinionsGrid[minion.x][minion.y] = null;
        this.boardMinionsGrid[x][y] = minion;

        this.updateMinionPosition(minion, x, y);
    },

    /**
     * Let a minion know he is standing on a new field
     * @param {Minion} minion
     * @param {Number} x 
     * @param {Number} y 
     */
    updateMinionPosition(minion, x, y){
        minion.x = x;
        minion.y = y;
    },


    /**
     * Tells all minions to recalculate their possible moves and beats.
     */
    updateMinionPseudoMoves: function(){
        this.boardMinions.forEach(function(currentMinion){currentMinion.updatePseudoMoves();});
    },

    updateMinionPseudoMovesOfTeam: function(team){
        this.boardMinions.forEach(function(currentMinion){
            if(currentMinion.team === team){
                currentMinion.updatePseudoMoves();
            }
        });
    },

    //Take all the minions from the board
    clear: function(){
        while(board.boardMinions.length){
            let currentMinion = board.boardMinions[0];
            board.deleteMinionAt(currentMinion.x, currentMinion.y);
        }
    },

    /**
     * Returns a JSON object which represents the current game situation.
     */
    save: function(){
        //properties of the minions we want to store in the json object
        //IMPORTANT: Use the private variables inside the constructor such as _x
        let propertiesToSave = ['name','team','x','y','moved']

        //array of JSONminion objects
        let resultMinions = new Array();

        for(let i = 0; i < board.boardMinions.length; i++){

            let currentMinion = board.boardMinions[i];
            
            //Create json minion
            let currentJSONminion  = {}, key;
            for (key in currentMinion) {
                if(propertiesToSave.includes(key)){
                    currentJSONminion[key] = currentMinion[key];
                }
            }
            resultMinions.push(currentJSONminion);
        }

        //Result is the final object that will be stringified and read by the load function afterwards
        let result = {
            gameTurns: game.gameTurns,
            currentTeam: game.currentTeam,
            minions: resultMinions
        }
        return JSON.stringify(result);
    },
    /**
     * Takes a JSON object and will set the board accordingly.
     */
    load: function(JSONsaveGame){

        //Clear current board situation
        this.clear();

        //parse the given json object
        let minionsList = JSON.parse(JSONsaveGame).minions;

        //Create all the minions out of the JSON minions
        for(let i = 0; i < minionsList.length; i++){

            //IMPORTANT: This minion uses the private variable names, such as _x , _y
            let currentMinion = minionsList[i];

            let newMinion = new MINIONCLASSES[currentMinion.name](currentMinion.team, currentMinion.x, currentMinion.y);
            //Create a minion accordingly

            newMinion.moved = currentMinion.moved;
            this.placeMinionOnBoard(newMinion);
        }
    }
}