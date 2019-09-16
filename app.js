// -------------------------- get the elements ----------------------- //
const deskbar = document.querySelector('#deskbar');
const screen = document.querySelector('#desktop');
const menuLink = document.querySelector('#primaryNav');
const tabsList = document.querySelector('#tabsList');
const clock = document.getElementById('theTime');
const desktop = document.querySelector('#contentarea');

// -------------------------- create events -------------------------- //
  screen.addEventListener('click', toggleMenu);
  tabsList.addEventListener('click', activateTab);
  menuLink.addEventListener('click', openWindow);
  menuLink.addEventListener('click', generateTab);
  menuLink.addEventListener('click', activateWindowWithMenuLink);


// -------------------------- set the time --------------------------- //
function pad(num) {
  return ("0"+num).slice(-2);
}
let theTime = new Date(),
    day = theTime.toLocaleDateString('us-US', { weekday: 'long' }),
    hours = theTime.getHours(),
    mins = theTime.getMinutes(),
    theCurrentTime = day + ' ' + pad(hours) + ':' + pad(mins);
clock.innerHTML = theCurrentTime;

function updateClock() {
  setInterval(function(){
    function pad(num) {
      return ("0"+num).slice(-2);
    }
    let theTime = new Date(),
        day = theTime.toLocaleDateString('us-US', { weekday: 'long' }),
        hours = theTime.getHours(),
        mins = theTime.getMinutes(),
        theCurrentTime = day + ' ' + pad(hours) + ':' + pad(mins);
    clock.innerHTML = theCurrentTime;
  },1000);
}
updateClock();


// -------------------------- toggle menu ---------------------------- //
function toggleMenu(e) {
  if(e.target.classList.contains('toggleMenu')) {
    deskbar.classList.toggle('open');
  } else {
    deskbar.classList.remove('open');
  }
}


// -------------------------- open windows --------------------------- //
function openWindow(e) {
  let windows = document.querySelectorAll('.window');
  let openWindows = [];
  
  windows.forEach(function(theWindow){
    openWindows.push(theWindow.getAttribute('data-window'));
  });

  if(e.target.classList.contains('menuLink') && !openWindows.includes(e.target.getAttribute('data-link'))) {
    let newWindow =`<div class="window" id="${e.target.getAttribute('data-link')}" data-window="${e.target.getAttribute('data-link')}">
      <header class="header"></header>
      <span class="close"></span>
      <div class="headerContent">
        ${e.target.innerText}
        <span class="minimize"></span>
      </div>
      <article>
        <div class="content"></div>
        <footer></footer>
      </article>
    </div>`;
    desktop.insertAdjacentHTML('beforeend', newWindow);
    fetchPage(e.target.href, e.target.getAttribute('data-link'));
    window.scrollTo(0, 0);
    e.preventDefault();
  }
  windows = document.querySelectorAll('.window');

  // create add event listener for each new window
  windows.forEach(function(theWindow){
    theWindow.addEventListener('click', closeWindow);
    theWindow.addEventListener('click', closeTab);
    theWindow.addEventListener('click', activateWindow);
    
    if(window.matchMedia("(min-width: 960px)").matches) {
      theWindow.getElementsByClassName('headerContent')[0].onmousedown = function(event) {
        let shiftX = event.clientX - theWindow.getBoundingClientRect().left;
        let shiftY = event.clientY - theWindow.getBoundingClientRect().top;
  
        deactivateAllWindows();
        
        theWindow.classList.add('activeWindow');
        theWindow.style.zIndex = 15;
        
        desktop.append(theWindow);
        moveAt(event.pageX, event.pageY);
      
        // centers the window at (pageX, pageY) coordinates
        function moveAt(pageX, pageY) {
          theWindow.style.left = pageX - shiftX + 'px';
          theWindow.style.top = pageY - shiftY + 'px';
        }
      
        function onMouseMove(event) {
          moveAt(event.pageX, event.pageY);
        }
      
        // move the window on mousemove
        document.addEventListener('mousemove', onMouseMove);
      
        // drop the window, remove unneeded handlers
        theWindow.onmouseup = function() {
          document.removeEventListener('mousemove', onMouseMove);
          theWindow.onmouseup = null;
        };

        document.addEventListener('keydown', function(e){
          if (e.key == 'Escape') {
            document.removeEventListener('mousemove', onMouseMove);
            theWindow.onmouseup = null;
          }
        });

        document.addEventListener('contextmenu', function(e){
          document.removeEventListener('mousemove', onMouseMove);
          theWindow.onmouseup = null;
          e.preventDefault();
        }, false);

      };
      theWindow.ondragstart = function() {
        return false;
      };
    }
  });
}


// ------------------------- deactivate all windows ------------------ //
function deactivateAllWindows() {
  let windows = document.querySelectorAll('.window');
  windows.forEach(function(theWindow) {
    theWindow.classList.remove('activeWindow');
    theWindow.style.zIndex = 14;
  });
}

// -------------------------- fetch html content --------------------- //
function fetchPage(url, attribute) {
  let windows = document.querySelectorAll('.window');
  fetch(url)
  .then(function(response) {
    return response.text();
  })
  .then(function(body) {
    windows.forEach(function(theWindow) {
      theWindow.style.zIndex = 14;
      theWindow.classList.remove('activeWindow');
    });
    windows.forEach(function(theWindow) {
      if(theWindow.getAttribute('data-window') == attribute) {
        setTimeout(function(){
          theWindow.classList.add('open');
        }, 125);

        theWindow.classList.add('activeWindow');

        if(window.matchMedia("(min-width: 960px)").matches) {
          let randomHeight = Math.floor(Math.random() * (20 - 15 + 1)) + 15;
          let randomWidth = Math.floor(Math.random() * (20 - 15 + 1)) + 15;

          theWindow.style.zIndex = 15;
          theWindow.style.position = 'absolute';

          theWindow.style.top = randomHeight + '%';
          theWindow.style.left = randomWidth + '%';
        }

        let content = theWindow.querySelector('.content');
        content.innerHTML = body;
      }
    });
  });
}


// -------------------------- generate tabs -------------------------- //
function generateTab(e) {
  let tabs = document.querySelectorAll('.menuTab');
  let openTabs = [];
  
  tabs.forEach(function(tab){
    openTabs.push(tab.getAttribute('data-tab'));
  });
  
  if(e.target.classList.contains('menuLink') && !openTabs.includes(e.target.getAttribute('data-link'))) {
    let newTab =`<li data-tab="${e.target.getAttribute('data-link')}" class="menuTab">
      <a href="#${e.target.getAttribute('data-link')}">
        <img src="${e.target.firstChild.src}" alt="Main">
        <span class="buttonText">${e.target.innerText}</span>
      </a>
    </li>`;
    tabsList.insertAdjacentHTML('beforeend', newTab);
  }
}

// ----------------- activate window on window click ----------------- //
function activateWindow(e) {
  deactivateAllWindows();
  e.target.closest('.window').classList.add('activeWindow');
  e.target.closest('.window').style.zIndex = 15;
}


// ------------------ activate window on tab click ------------------- //
function activateTab(e) {
  if(e.target.parentElement.classList.contains('menuTab')) {
    let currentTab = e.target.parentElement.getAttribute('data-tab');
    let windows = document.querySelectorAll('.window');
    deactivateAllWindows();

    windows.forEach(function(theWindow){
      theWindow.style.zIndex = 14;
      if(theWindow.getAttribute('data-window') == currentTab) {
        theWindow.classList.add('activeWindow');
        theWindow.style.zIndex = 15;
      }
    });
  }
}


// --------------- activate window on menu list click ---------------- //
function activateWindowWithMenuLink(e) {
  if(e.target.classList.contains('menuLink')) {
    let currentLink = e.target.getAttribute('data-link');
    let windows = document.querySelectorAll('.window');

    deactivateAllWindows();

    windows.forEach(function(theWindow){
      theWindow.style.zIndex = 14;
      if(theWindow.getAttribute('data-window') == currentLink) {
        e.target.href = '#'+e.target.getAttribute('data-link');
        theWindow.classList.add('activeWindow');
        theWindow.style.zIndex = 15;
      }
    });
  }
}


// -------------------------- close window --------------------------- //
function closeWindow(e) {
  let menuLinks = document.querySelectorAll('.menuLink');
  if(e.target.classList.contains('close')) {
    let currentData = e.target.parentElement.getAttribute('data-window');
    menuLinks.forEach(function(theLink){
      if (theLink.getAttribute('data-link') == currentData) {
        theLink.href = '/' + currentData + '.html';
      }
    });
    this.remove();
  }
}


// -------------------------- close tab ------------------------------ //
function closeTab(e) {
  if(e.target.classList.contains('close')) {
    let currentData = e.target.parentElement.getAttribute('data-window');
    
    let tabs = document.querySelectorAll('.menuTab');
    tabs.forEach(function(tab){
      if(tab.getAttribute('data-tab') == currentData) {
        tab.remove();
      }
    });
  }
}