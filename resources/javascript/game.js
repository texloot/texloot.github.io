const TEAM = {
    BLACK: 0,
    WHITE: 1,
    teamToString(team) { return Object.keys(this)[team]; }
};

const game = {
    time: 0,
    gameTurns: 0,
    currentTeam: TEAM.WHITE,
    selectedMinion: null,

    /**
     * Tests for a check situation. Only takes given player into consideration.
     * @param {"enum TEAM"} team 
     */
    isCheck(team) {

        //Select king according to player        
        let king = (team === TEAM.BLACK) ? board.blackKing : board.whiteKing;

        //Get all enemy minions
        let enemyMinions = board.boardMinions.filter(elem => (elem.team !== king.team))
            //Loop through enemy minions and find their moves, which can possibly beat the king
        return enemyMinions.some(function(currentMinion) {

            let beats = currentMinion.pseudoMoves;

            beats = beats.filter(elem => (elem.beatPos !== null));

            return (
                beats.some(function(currentbeat) {
                    return (currentbeat.beatPos.x === king.x) && (currentbeat.beatPos.y === king.y);
                })
            );

        });

    },

    /**
     * Tests for a check Mate situation. Only takes given player into consideration.
     * @param {"enum TEAM"} team 
     */
    noMovePossible(team) {

        //Select king according to player        
        let king = (team === TEAM.BLACK) ? board.blackKing : board.whiteKing;

        if (king.validMoves.length > 0) {
            return false;
        }

        let allMinions = board.boardMinions;

        if (allMinions.some(minion => ((minion.team === team) && (minion.validMoves.length > 0)))) {
            return false;
        }

        return true;

    },

    nextTurn() {

        this.clocks[this.currentTeam].stop();

        if (this.currentTeam === TEAM.WHITE) {
            this.currentTeam = TEAM.BLACK;
        } else if (this.currentTeam === TEAM.BLACK) {
            this.currentTeam = TEAM.WHITE;
        }
        this.gameTurns++;
        this.generateValidMoves();


        if(this.noMovePossible(this.currentTeam)){
            if (this.isCheck(this.currentTeam)) {
                //check + nomovepossible = checkmate
                if (this.currentTeam === TEAM.WHITE) {
                    this.gameEnd("white is checkmate", TEAM.BLACK);
                } else if (this.currentTeam === TEAM.BLACK) {
                    this.gameEnd("black is checkmate", TEAM.WHITE);
                }
            }else{
                this.gameEnd("no possible move left: Stalemate");
                /* other auto draws we should consider to implement:
                - 5 x times the same situation in a course
                - 75 moves without a pawn moved or a capture happend
                - no checkmate possible:
                    -king versus king
                    -king and bishop versus king
                    -king and knight versus king
                    -king and bishop versus king and bishop with the bishops on the same color.
                    -and more ....
                    */
            }
        }
        
        if(this.gameRunning){
            this.clocks[this.currentTeam].start();
        }
    },

    generateValidMoves(team = null) {
        board.updateMinionPseudoMoves();

        let allMinions = [...board.boardMinions];

        if (team !== null) {
            allMinions = allMinions.filter(minion => (minion.team === team));
        }

        allMinions.forEach(function(currentMinion) {

            let pseudoMoves = [...currentMinion.pseudoMoves];
            let validMoves = new Array();

            pseudoMoves.forEach(function(move) {
                if (move.simulate()) {
                    validMoves.push(move);
                }
            });
            updatePseudoMovesOfOtherTeam(currentMinion.team);
            currentMinion.validMoves = validMoves;
        });

        if(this.isCheck(this.currentTeam)){
            //remove castlingmoves if team is checkmate
            let king = (team === TEAM.BLACK) ? board.blackKing : board.whiteKing;
            king.validMoves = king.validMoves.filter((move) => (move.constructor.name != castlingMove.name))
        }

    },

    /** block the fieldclick function */
    blockFieldClicked: false,

    blockMove: false,

    /**
     * Whenever the player clicks a field, the display module will notify game.
     * @param {Number} x 
     * @param {Number} y 
     */
    fieldClicked(x, y) {

        if (this.blockFieldClicked) return;

        //Debug purposes
        console.log({ minion: board.getMinionAt(x, y) });

        /* Select a friendly minion after another one was selected already. Lets you select different
        minions rapidly */
        if (board.isFieldOccupied(x, y) && board.getMinionAt(x, y).team === this.currentTeam) {

            if (this.selectedMinion !== null) {
                gameDisplay.unselectMinion();
            }

            //Select
            this.selectedMinion = board.getMinionAt(x, y);
            gameDisplay.selectMinion(this.selectedMinion);

            //Neutral field or enemy minion clicked
        } else if (this.selectedMinion !== null) {
            //Was a move clicked?

            if (!this.blockMove && this.gameRunning) {
                let moves = this.selectedMinion.validMoves;
                for (let i = 0; i < moves.length; i++) {
                    //Found a move
                    if (moves[i].x === x && moves[i].y === y) {

                        //block other click actions
                        this.blockFieldClicked = true;

                        p = new Promise((resolve, reject) => { moves[i].execute(resolve); })
                        p.then((changedPositions) => {
                            gameDisplay.updateMinions(changedPositions);
                            this.nextTurn();
                            this.blockFieldClicked = false;

                            //encode move candidate to JSON
                            let JSONmove = moves[i].toJSON();
                            history.addMove(JSONmove);
                            // not needed anymore history.updateIndex();
                        })
                        break;
                    }
                }
            }
            //Unselect
            gameDisplay.unselectMinion();
            this.selectedMinion = null;


        }

    },


    start(timeLimitInMinutes, timeBonusInSecounds) {
        this.clocks = new Array(2);
        this.clocks[0] = new Clock(0, timeLimitInMinutes, timeBonusInSecounds);
        this.clocks[1] = new Clock(1, timeLimitInMinutes, timeBonusInSecounds);
        this.clocks[0].onExpired = () => this.gameEnd("time is up", 1);
        this.clocks[1].onExpired = () => this.gameEnd("time is up", 0);

        this.initBoard();
        gameDisplay.updateMinions();
        this.generateValidMoves();

        this.clocks[TEAM.WHITE].start();

        this.blockFieldClicked = false;
        this.blockMove = false;
        this.gameRunning = true;
    },

    initBoard() {
        //remove old game
        board.clear();

        //TEAM BLACK MINIONS

        //Place all black pawns on the board
        for (var x = 0; x < board.BOARDWIDTH; x++) {
            var pawn = new Pawn(TEAM.BLACK, x, 1);
            board.placeMinionOnBoard(pawn);
        }

        var rook1Black = new Rook(TEAM.BLACK, 0, 0);
        board.placeMinionOnBoard(rook1Black);

        var rook2Black = new Rook(TEAM.BLACK, (board.BOARDWIDTH - 1), 0);
        board.placeMinionOnBoard(rook2Black);

        var knight1Black = new Knight(TEAM.BLACK, 1, 0);
        board.placeMinionOnBoard(knight1Black);

        var knight2Black = new Knight(TEAM.BLACK, (board.BOARDWIDTH - 2), 0);
        board.placeMinionOnBoard(knight2Black);

        var bishop1Black = new Bishop(TEAM.BLACK, 2, 0);
        board.placeMinionOnBoard(bishop1Black);

        var bishop2Black = new Bishop(TEAM.BLACK, (board.BOARDWIDTH - 3), 0);
        board.placeMinionOnBoard(bishop2Black);

        var queenBlack = new Queen(TEAM.BLACK, 3, 0);
        board.placeMinionOnBoard(queenBlack);

        var kingBlack = new King(TEAM.BLACK, (board.BOARDWIDTH - 4), 0);
        board.placeMinionOnBoard(kingBlack);
        board.blackKing = kingBlack;

        //TEAM WHITE MINIONS

        //Place all white pawns
        for (var x = 0; x < board.BOARDWIDTH; x++) {
            var pawn = new Pawn(TEAM.WHITE, x, board.BOARDWIDTH - 2);
            board.placeMinionOnBoard(pawn);
        }

        var rook1White = new Rook(TEAM.WHITE, 0, (board.BOARDWIDTH - 1));
        board.placeMinionOnBoard(rook1White);

        var rook2White = new Rook(TEAM.WHITE, (board.BOARDWIDTH - 1), (board.BOARDWIDTH - 1));
        board.placeMinionOnBoard(rook2White);

        var knight1White = new Knight(TEAM.WHITE, 1, (board.BOARDWIDTH - 1));
        board.placeMinionOnBoard(knight1White);

        var knight2White = new Knight(TEAM.WHITE, (board.BOARDWIDTH - 2), (board.BOARDWIDTH - 1));
        board.placeMinionOnBoard(knight2White);

        var bishop1White = new Bishop(TEAM.WHITE, 2, (board.BOARDWIDTH - 1));
        board.placeMinionOnBoard(bishop1White);

        var bishop2White = new Bishop(TEAM.WHITE, (board.BOARDWIDTH - 3), (board.BOARDWIDTH - 1));
        board.placeMinionOnBoard(bishop2White);

        var queenWhite = new Queen(TEAM.WHITE, 3, (board.BOARDWIDTH - 1));
        board.placeMinionOnBoard(queenWhite);

        var kingWhite = new King(TEAM.WHITE, (board.BOARDWIDTH - 4), (board.BOARDWIDTH - 1));
        board.placeMinionOnBoard(kingWhite);
        board.whiteKing = kingWhite;

    },
    
    gameRunning: true,

    gameEnd(reason, team = null){
        
        if(team != null){
            let teamNameArray = new Array("Black", "White");
            debugMsg(teamNameArray[team] + " has won!");
        }

        GameEndModal.show(reason, team);
        this.gameRunning = false;
    }
    
};