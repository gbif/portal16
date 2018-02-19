module.exports = (function() {
    if (document.compatMode == 'CSS1Compat') {
        var navbarHeight = 60;
        var contactsNavWrapper = document.getElementById('contacts-nav-wrapper');
        var contactsNav = document.getElementById('contacts-nav');

        if (contactsNavWrapper && contactsNav) {
            window.addEventListener('scroll', positionContactsNav);
            window.addEventListener('resize', positionContactsNav);
        }
    }

    function positionContactsNav() {
        var contactsNavWrapper = document.getElementById('contacts-nav-wrapper');
        var contactsNav = document.getElementById('contacts-nav');
        var contactsNavWrapperPosition = contactsNavWrapper.getBoundingClientRect();

        if (contactsNavWrapperPosition.top < navbarHeight) {
            contactsNav.classList.add('contacts-nav--fixed');
            contactsNav.classList.remove('contacts-nav--bottom');
        } else if (contactsNavWrapperPosition.bottom - contactsNav.scrollHeight < navbarHeight) {
            contactsNav.classList.add('contacts-nav--bottom');
            contactsNav.classList.remove('contacts-nav--fixed');
        } else if (contactsNavWrapperPosition.top > navbarHeight) {
            contactsNav.classList.remove('contacts-nav--fixed');
            contactsNav.classList.remove('contacts-nav--bottom');
        }
    }
})();
