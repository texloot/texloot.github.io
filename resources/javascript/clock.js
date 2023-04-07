class Clock{
    constructor(team, endTimeInMinutes, bonusInSecounds){
        this.timeLeft = endTimeInMinutes*60*1000;
        this.bonus = bonusInSecounds*1000;
        this.team = team;

        this.intervalId = null;
        clockDisplay.updateDisplay(this.team, this.timeLeft);
    }

    start(){
        this.bufferTime = Date.now();

        let self = this;
        this.intervalId = setInterval(function(){self.countDown()}, 1000);

        clockDisplay.activate(this.team);
    }
    
    stop(){
        clearInterval(this.intervalId);
        this.countDown(this);

        this.timeLeft += this.bonus;
        clockDisplay.updateDisplay(this.team, this.timeLeft);
        
        clockDisplay.deactivate(this.team);
    }

    countDown(){
        let now = Date.now();
        let pastTime = now - this.bufferTime;
        this.bufferTime = now;

        this.timeLeft -= pastTime;

        if(this.isExpired()){
            this.timeLeft = 0;
            clockDisplay.updateDisplay(this.team, this.timeLeft);
            clearInterval(this.intervalId);
            this.onExpired();
        }

        clockDisplay.updateDisplay(this.team, this.timeLeft);
    }

    isExpired(){
        if(this.timeLeft < 0){
            return true;
        }else{
            return false;
        }
    }

    onExpired(){
        //debug
        console.log("clock " + this.team + " expired! (no onExpired event subscription)");
    }

}

const clockDisplay = {

    playerClocks: [document.getElementById("blackClock"), document.getElementById("whiteClock")],

    updateDisplay: function(team, timeLeft){

        let minutesStr = String(Math.floor(timeLeft/1000/60));
        let secoundsStr = String(Math.round(timeLeft/1000) % 60);

        if(minutesStr.length < 2) minutesStr = "0" + minutesStr;
        if(secoundsStr.length < 2) secoundsStr = "0" + secoundsStr;

        this.playerClocks[team].innerHTML = "" 
        + minutesStr + ":"
        + secoundsStr;
    },

    activate: function(team){
        this.playerClocks[team].classList.add("active");
    },

    deactivate: function(team){
        this.playerClocks[team].classList.remove("active");
    }
}