module.exports = {
    truncate: truncate
};

function truncate(text, length) {
    length = length || 10;
    if (typeof text === 'number') {
        text += ' ';
    }
    if (typeof text !== 'string') {
        return '';
    }
    return text.length > length ? text.slice(0, length) + '…' : text;
}
