module.exports = (function () {

    function UserException(message) {
        this.message = message;
        this.name = "UserException";
    }

    function thisFunctionFails() {
        throw new UserException('I threw it on purpose.');
    }

    return {
        tester: thisFunctionFails,
        myvar: 10
    };
})();



