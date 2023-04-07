

const historyDisplay = {

    historyNode: document.getElementById('historylist'),

    historyHighlightNode: null,

    getLetterFromXPos(xPos) {
        return String.fromCharCode(97 + xPos);
    },

    generateHistoryHTML(historyArray) {
        let resultString = '';

        for (let i = 0; i < historyArray.length; i++) {
            let move = historyArray[i];
            let side = (i % 2) ? `black` : `white`;

            resultString = resultString + `
            <div class="historyitem" data-listitem="${i}" onclick="history.toward(${i})">
                <div class="movepicture ${side} ${move.minion.toLowerCase()}"></div>
                <div class="movenum">${Math.round((i+1)/2)}</div>
                <div class="movetitle">${this.getLetterFromXPos(move.targetX)}${8-move.targetY}</div>
            </div>`
        }

        return resultString;
    },

    setHistoryHTML(gameHistory) {
        this.historyNode.innerHTML = this.generateHistoryHTML(gameHistory);
        
        this.highlightHistoryItem(gameHistory.length - 1);
    },

    scrollToHistoryItem(index) {
        let listitem = this.historyNode.querySelector(`.historyitem[data-listitem="${String(index)}"]`);
        listitem.scrollIntoView({ block: "nearest", behavior: 'smooth' });
    },

    highlightHistoryItem(index, moveRight = false) {

        if (this.historyHighlightNode) {
            this.historyHighlightNode.classList.remove("highlighted");
        }

        if (index < 0) {
            return;
        }

        this.historyHighlightNode = this.historyNode.querySelector(`.historyitem[data-listitem="${String(index)}"]`);
        this.historyHighlightNode.classList.add("highlighted");

        this.scrollToHistoryItem(index);
    },

    enterHistoryMode() {
        document.querySelector('#gameWrapper').classList.add('historymode');
        console.log('entering history')
    },

    leaveHistoryMode() {
        document.querySelector('#gameWrapper').classList.remove('historymode');
        console.log('leaving history')
    }
}

historyDisplay.historyNode.onwheel = function(event){
    const direction = Math.sign(event.deltaY);
    historyDisplay.historyNode.scrollLeft += 25*direction;
}