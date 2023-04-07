const GameEndModal = {
    nodes: {
        frame: $('#gameEndModal'),
        mainMenuBtn: $('#mainMenuBtn'),
        rematchBtn: $('#rematchBtn'),
        closeBtn: $('#analyseBtn')
    },

    show(reason, winnerTeam = null){

        //set Winner
        if(winnerTeam === TEAM.BLACK || winnerTeam === TEAM.WHITE){
            this.nodes.frame.setAttribute('data-winner', `${TEAM.teamToString(winnerTeam)}`);
        }else{
            this.nodes.frame.setAttribute('data-winner', "DRAW");  
        }
        //set reason
        this.nodes.frame.setAttribute('data-reason', reason);

        //set event listner
        this.nodes.mainMenuBtn.addEventListener("click", () => this.mainMenuBtnOnClick());
        this.nodes.rematchBtn.addEventListener("click", () => this.rematchBtnOnClick());

        this.nodes.closeBtn.addEventListener("click", () => this.close());

        //showModal
        this.nodes.frame.classList.remove("hide");
    },

    mainMenuBtnOnClick(){
        //gotoMainMenu
        alert("gotoMainMenu");
    },

    rematchBtnOnClick(){
        //restartTheGame
        alert("newGame");
    },

    close(){
        //closeModal
        this.nodes.frame.classList.add("hide");
    },
}

const ResignConformationModal = {
    show(){
        BoolModalQueue.newBoolModal(
            "Are you sure you want to resign?",
            "yes",
            "no",
            () => this.accept(),
            () => this.decline(),
        )
    },
    accept() {
        console.log("resign conformination acc");
    },
    decline() {
        console.log("resign conformination dec");
    }
}

const DrawConformationModal = {
    show(){
        BoolModalQueue.newBoolModal(
            "Are you sure you want to offer a draw?",
            "yes",
            "no",
            () => this.accept(),
            () => this.decline(),
        )
    },
    accept() {
        console.log("draw conformination acc");
    },
    decline() {
        console.log("draw conformination dec");
    }
}

const DrawRequestModal = {
    show(){
        BoolModalQueue.newBoolModal(
            "your opponent offers a draw",
            "accept",
            "deny",
            () => this.accept(),
            () => this.decline(),
        )
    },
    accept() {
        console.log("draw request acc");
    },
    decline() {
        console.log("draw request dec");
    }
}

const BoolModalQueue = {

    nodes: {
        frame: $('#BoolModal'),
        question: $('#BoolModalQuestion'),
        acceptButton: $('#BoolModalAccept'),
        declineButton: $('#BoolModalDecline'),
        closeButton: $('#BoolModalClose'),
    },

    openModals: new Array(),
    newBoolModal(question, accAnswer, decAnswer, accMethod, decMethod){
        this.openModals.push({question, accAnswer, decAnswer, accMethod, decMethod})
        if(this.openModals.length === 1){
            this.showNextModal();
        }
    },

    showNextModal(){
        if(this.openModals.length > 0){
            //fill modal
            this.nodes.question.innerHTML = this.openModals[0].question;
            this.nodes.acceptButton.innerHTML = this.openModals[0].accAnswer;
            this.nodes.declineButton.innerHTML = this.openModals[0].decAnswer;
            this.nodes.acceptButton.onclick =  () => {
                this.openModals[0].accMethod();
                this.closeCurrentModal();
            }
            this.nodes.declineButton.onclick =  () => {
                this.openModals[0].decMethod();
                this.closeCurrentModal();
            }
            this.nodes.closeButton.onclick =  () => {
                this.openModals[0].decMethod();
                this.closeCurrentModal();
            }
            //show modal
            this.nodes.frame.classList.remove("hide");
        }
    },

    closeCurrentModal(){
        //hide Modal
        this.nodes.frame.classList.add("hide");
        //clear click events
        this.nodes.acceptButton.onclick = null;
        this.nodes.declineButton.onclick = null;
        this.nodes.closeButton.onclick = null;
        //delete Modal from queue
        this.openModals.shift();
        this.showNextModal();
    },

    clear(){
        this.nodes.frame.classList.remove("hide");
        //clear click events
        this.nodes.acceptButton.onclick = null;
        this.nodes.declineButton.onclick = null;
        this.nodes.closeButton.onclick = null;
        
        this.openModals = new Array();
    }
}