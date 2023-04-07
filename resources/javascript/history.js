const history = {
    index: -1,
    moves: new Array(),

    addMove(historyMove) {

        this.moves.push(historyMove);
        this.updateIndex();
        historyDisplay.setHistoryHTML(this.moves);
        historyDisplay.highlightHistoryItem(this.index, true);

    },

    updateIndex() {
        this.index = this.moves.length - 1;
    },

    goToMoveAndUpdateDisplay(ind) {

        if (ind >= this.moves.length) {
            return;
        }

        console.log(ind);
        console.log(this.moves.length);

        let latestChanges = this.goToMove(ind);
        gameDisplay.updateMinions();
        gameDisplay.updateMinions(latestChanges);
        historyDisplay.highlightHistoryItem(this.index);

        if (ind === this.moves.length - 1) {
            historyDisplay.leaveHistoryMode();
        } else {
            historyDisplay.enterHistoryMode();
        }
    },

    goToMove(index) {

        let latestChanges = null;

        if (index < -1 || index >= this.moves.length) {
            console.log("index out of bounds");
            return latestChanges;
        }
        if (index === 0) {
            game.initBoard();
            this.index = 0;
            let executeMove = JSONmoveToExecutable(this.moves[0]);
            executeMove.execute((changedPos) => { 
                latestChanges = changedPos;
                console.log({ Executed: this.moves[0] })
             });
        } else if (index === -1) {
            game.initBoard();
            this.index = -1;
        } else if (index < this.index) {
            //Go backwards in time

            //Standard setup
            game.initBoard();

            //Start the moves from the beginning
            this.index = 0;
            for (let i = 0; i <= index; i++) {
                //Every History Move Excecution has to be SYNCHRON not ASYNCHRON!

                let executeMove = JSONmoveToExecutable(this.moves[i]);
                executeMove.execute((changedPos) => {
                    latestChanges = changedPos;
                    console.log({ Executed: this.moves[i] }) 
                });

                this.index = i;
            }

        } else if (index > this.index) {
            //Go forward in time
            for (let i = this.index + 1; i <= index; i++) {
                let executeMove = JSONmoveToExecutable(this.moves[i]);
                executeMove.execute((changedPos) => {
                    latestChanges = changedPos;
                    console.log({ Executed: this.moves[i] }) 
                });
                //NEED TO CHANGE THIS LATER
                this.index = i;
            }
        }

        if (this.moves.length - 1 === this.index) {
            game.blockMove = false;
        } else {
            game.blockMove = true;
        }

        game.generateValidMoves();
        gameDisplay.unselectMinion();

        return latestChanges;
    },

    forward: function() {
        this.goToMoveAndUpdateDisplay(this.index + 1);
    },

    backward: function() {
        this.goToMoveAndUpdateDisplay(this.index - 1);
    },

    toward: function(ind) {
        this.goToMoveAndUpdateDisplay(ind)
    },

    latestMove: function() {
        this.toward(this.moves.length - 1);
    },

    autoplay() {
        this.index = 0;

        this.moves.forEach(move => {
            console.log(move);
            this.index++;
        });
    }
}