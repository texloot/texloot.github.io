/**
 * A section is a HTML part of the page. It is used to navigate between menu, game, options... etc
 */

let hamburgerIcon = document.getElementById("hamburger-icon");

hamburgerIcon.onclick = () => {
  hamburgerIcon.classList.toggle("open");
}

const Section = {}
Section.MENU = document.getElementById("menuWrapper");
Section.GAME = document.getElementById("gameWrapper");
Section.CREATELOCALGAME = document.getElementById("createLocalGameView");
Section.current = Section.MENU;

Section.update = function(newSection){
    Section.current = newSection;
    Section.current.scrollIntoView({ left: 0, block: 'start', behavior: 'smooth' });
}

Section.clip = function(){
    Section.current.scrollIntoView(true);
}


function playOffline(){
    console.log("play offline clicked");
    Section.update(Section.CREATELOCALGAME);
}



window.onbeforeunload = () => window.scrollTo(0, 0);

window.onresize = () => Section.clip();

window.onload = () => {
    gameDisplay.createGrid();
}




/* Get the documentElement (<html>) to display the page in fullscreen */
const docelem = document.documentElement;

/* View in fullscreen */
window.openFullscreen = function(){
  if (docelem.requestFullscreen) {
    docelem.requestFullscreen();
  } else if (docelem.mozRequestFullScreen) { /* Firefox */
    docelem.mozRequestFullScreen();
  } else if (docelem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (docelem.msRequestFullscreen) { /* IE/Edge */
    docelem.msRequestFullscreen();
  }
}
/* Close fullscreen */
window.closeFullscreen = function() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
}