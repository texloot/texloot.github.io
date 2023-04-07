const timeLimitText = document.getElementById("timeLimitText");
const timeLimitInput = document.getElementById("timeLimitInput");

timeLimitInput.onchange = () => {
    if(parseInt(timeLimitInput.value) === 61){
        timeLimitText.innerHTML = "&#8734 minutes";
    }else if(parseInt(timeLimitInput.value) === 1) {
        timeLimitText.innerHTML = timeLimitInput.value + " minute";
    }else{
        timeLimitText.innerHTML = timeLimitInput.value + " minutes";
    }
}

const timeBonusText = document.getElementById("timeBonusText");
const timeBonusInput = document.getElementById("timeBonusInput");

timeBonusInput.onchange = () => {
    if(parseInt(timeBonusInput.value) === 1) {
        timeBonusText.innerHTML = timeBonusInput.value + " secound";
    }else{
        timeBonusText.innerHTML = timeBonusInput.value + " secounds";
    }
}

function startLocalGame(){
    console.log("start game (local) clicked");

    let timeLimit = parseInt(timeLimitInput.value) === 61 ? 300 : parseInt(timeLimitInput.value)
    game.start(timeLimit, parseInt(timeBonusInput.value));

    Section.update(Section.GAME);
}
