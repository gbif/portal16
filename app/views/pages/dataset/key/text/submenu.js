module.exports = (function() {
    if (document.compatMode == 'CSS1Compat') {
        var navbarHeight = 60; //TODO should build stylus variables to js 
        var submenu = document.getElementById('submenu');
        var submenuHeight = submenu.scrollHeight;
        window.addEventListener('scroll', positionSubmenu);
        window.addEventListener('resize', positionSubmenu);

        function positionSubmenu() {
            var submenuWrapper = document.getElementById('submenuWrapper');
            var submenu = document.getElementById('submenu');
            var subMenuWrapperPosition = submenuWrapper.getBoundingClientRect();
            var submenuPosition = submenu.getBoundingClientRect();

            if (subMenuWrapperPosition.bottom - submenuHeight < navbarHeight) {
                submenu.classList.add('submenu--bottom');
                submenu.classList.remove('submenu--fixed');
            } else if (subMenuWrapperPosition.top > navbarHeight) {
                submenu.classList.remove('submenu--fixed');
                submenu.classList.remove('submenu--bottom');
            } else if (subMenuWrapperPosition.top < navbarHeight) {
                submenu.classList.add('submenu--fixed');
            }
            console.log('round finished');
        }
    }
})();