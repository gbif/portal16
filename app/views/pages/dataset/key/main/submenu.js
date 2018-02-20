'use strict';

function updateMenu() {
    if (document.compatMode == 'CSS1Compat') {
        var tabsFixedContainer = document.getElementById('tabsFixedContainer');
        var navbarHeight = 0; // TODO should build stylus variables to js
        if (tabsFixedContainer) {
            navbarHeight = 95;
        }
        var submenuWrapper = document.getElementById('submenuWrapper');
        var submenu = document.getElementById('submenu');

        if (submenuWrapper && submenu) {
            var submenuHeight = submenu.scrollHeight;
            window.addEventListener('scroll', positionSubmenu);
            window.addEventListener('resize', positionSubmenu);
        }
    }

    function positionSubmenu() { // eslint-disable-line no-inner-declarations
        var submenuWrapper = document.getElementById('submenuWrapper');
        var submenu = document.getElementById('submenu');
        if (submenuWrapper) {
            var subMenuWrapperPosition = submenuWrapper.getBoundingClientRect();
            if (subMenuWrapperPosition.bottom - submenuHeight < navbarHeight) {
                submenu.classList.add('submenu--bottom');
                submenu.classList.remove('submenu--fixed');
            } else if (subMenuWrapperPosition.top > navbarHeight) {
                submenu.classList.remove('submenu--fixed');
                submenu.classList.remove('submenu--bottom');
            } else if (subMenuWrapperPosition.top < navbarHeight) {
                submenu.classList.add('submenu--fixed');
                submenu.classList.remove('submenu--bottom');
            }
        }
        // var submenuPosition = submenu.getBoundingClientRect();
    }
}

function updateTabs() {
    if (document.compatMode == 'CSS1Compat') {
        var navbarHeight = 50; // TODO should build stylus variables to js navbar + tabbar height
        var tabsFixedContainer = document.getElementById('tabsFixedContainer');
        var tabsScrollable = document.getElementById('tabsScrollable');


        if (tabsFixedContainer && tabsScrollable) {
            window.addEventListener('scroll', positionTabsBar);
            window.addEventListener('resize', positionTabsBar);
        }
    }

    function positionTabsBar() { // eslint-disable-line no-inner-declarations
        tabsFixedContainer = document.getElementById('tabsFixedContainer');
        tabsScrollable = document.getElementById('tabsScrollable');
        if (tabsScrollable && tabsFixedContainer) {
            var tabsScrollablePosition = tabsScrollable.getBoundingClientRect();
            if (tabsScrollablePosition && tabsScrollablePosition.top < navbarHeight) {
                tabsFixedContainer.classList.add('is-visible');
            } else {
                tabsFixedContainer.classList.remove('is-visible');
            }
        }
    }
}

module.exports = {
    updateMenu: updateMenu,
    updateTabs: updateTabs
};

