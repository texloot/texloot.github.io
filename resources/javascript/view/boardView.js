class ChessField {
    constructor(x, y, node, contentNode) {
        this.x = x;
        this.y = y;

        this.node = node;
        this.contentNode = contentNode;
        this.node.onclick = function() { gameDisplay.fieldClicked(x, y); }
    }
}

function createChessFieldsArray() {
    //horizontal array
    let newArray = new Array(board.BOARDWIDTH);

    //store vertical arrays in horizontal array
    for (let x = 0; x < board.BOARDWIDTH; x++) {
        newArray[x] = new Array(board.BOARDWIDTH);
    }

    return newArray;
}

const gameDisplay = {

    boardNode: document.getElementById("chessBoard"),
    selectedFields: null,

    chessFields: createChessFieldsArray(),

    oldChanges: null,

    /**
     *Do all the CSS stuff and actually create the grid in the DOM <- cascading style sheet
     */
    createGrid: function() {

        for (let y = 0; y < board.BOARDWIDTH; y++) {
            for (let x = 0; x < board.BOARDWIDTH; x++) {
                let newFieldNode = document.createElement("div");

                //debug
                newFieldNode.setAttribute("x", x);
                newFieldNode.setAttribute("y", y);

                //set css class
                newFieldNode.classList.add("gridItem");

                //Differentiate between black and white
                if (y % 2 == 0 && x % 2 == 0 || y % 2 != 0 && x % 2 != 0) {
                    newFieldNode.classList.add("white");
                } else {
                    newFieldNode.classList.add("black");
                }

                let newFieldContentNode = document.createElement("div");
                newFieldNode.appendChild(newFieldContentNode);

                this.boardNode.appendChild(newFieldNode);

                let newField = new ChessField(x, y, newFieldNode, newFieldContentNode);
                //save reference in a multi dimensional array for better access
                this.chessFields[x][y] = newField;
            }
        }
    },

    /**
     * Updates the given positions in the DOM
     * @param {Array} changedPositions is a list of pos. that have changed during the turn.
     * Only these will be updated
     */
    updateMinions: function(changedPositions = null) {

        if(this.oldChanges !== null){
            this.oldChanges.forEach((currentPosition) => {
                let node = this.chessFields[currentPosition.x][currentPosition.y].node;
                node.classList.remove("change");
                node.classList.remove("minionChange"); 
            });
        }

        if (changedPositions === null) {

            //Remove all Minions from the Board
            let currentMinionNodes = [...this.boardNode.getElementsByClassName("minion")];
            let NodesLen = currentMinionNodes.length;
            for (let i = 0; i < NodesLen; i++) {
                currentMinionNodes[i].className = "";
            }

            //Display Minions on a the Board
            for (let i = 0; i < board.boardMinions.length; i++) {
                this.chessFields[board.boardMinions[i].x][board.boardMinions[i].y]
                    .contentNode.classList.add("minion", board.boardMinions[i].spriteCss.color, board.boardMinions[i].spriteCss.type);
            }

            this.oldChanges = null;
            
        } else {

            changedPositions.forEach((currentPosition) => {
                //display change happend:
                let node = this.chessFields[currentPosition.x][currentPosition.y].node;
                node.classList.add("change");
                //change content:
                let currentContentNode = this.chessFields[currentPosition.x][currentPosition.y].contentNode;
                //remove old Minion from node
                currentContentNode.className = "";
                //add new Minion node
                let currentMinion = board.getMinionAt(currentPosition.x, currentPosition.y);
                if (currentMinion){
                    currentContentNode.classList.add("minion", currentMinion.spriteCss.color, currentMinion.spriteCss.type);
                    node.classList.add("minionChange"); 
                } 
            });

            this.oldChanges = changedPositions;
        }
    },

    /**
     * Highlights the clicked minion and visualises the player's option to make a turn.
     * @param {Minion} newSelectedMinion 
     */
    selectMinion: function(selectedMinion) {

        //Store to unselect later
        this.selectedFields = new Array();

        //Highlight selected Minion
        this.chessFields[selectedMinion.x][selectedMinion.y].node.classList.add("selected");
        this.selectedFields.push({
            pos: this.chessFields[selectedMinion.x][selectedMinion.y],
            cssClass: "selected",
        });

        //Add css of the move class to each move of the selected minion
        let moves = selectedMinion.validMoves;

        for (let i = 0; i < moves.length; i++) {
            //Add the move color to the field node
            this.chessFields[moves[i].x][moves[i].y].node.classList.add(moves[i].cssClassName);
            this.selectedFields.push({
                pos: this.chessFields[moves[i].x][moves[i].y],
                cssClass: moves[i].cssClassName,
            });
        }

    },

    /**
     * Remove CSS properties of selected, possible move/beat fields.
     * Should be used when the player clicks a neutral positon or after making a turn.
     */
    unselectMinion: function() {
        //Delete highlighted fields
        this.selectedFields.forEach((currentField) => {
            currentField.pos.node.classList.remove(currentField.cssClass);
        });
    },

    unselectAll: function() {
        oldSelectedMinion = this.boardNode.getElementsByClassName("selected");
        while (oldSelectedMinion.length) {
            oldSelectedMinion[0].classList.remove("selected");
        }

        let deleteClasses = Object.values(CSS_MOVE_CLASSES);

        deleteClasses.forEach((cssClass) => {
            let oldMoves = this.boardNode.getElementsByClassName(cssClass);
            while (oldMoves.length) {
                oldMoves[0].classList.remove(cssClass);
            }
        });
    },

    /**
     * Will be called when a field was clicked.
     * @param {Number} x x-Position of the clicked field
     * @param {Number} y y-Position of the clicked field
     */
    fieldClicked: function(x, y) {
        game.fieldClicked(x, y);
    },

}

