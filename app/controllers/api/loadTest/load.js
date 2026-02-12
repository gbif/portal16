let enabled = false;

function setLoadTestEnabled(value) {
  enabled = value;
}

function isLoadTestEnabled() {
  return enabled;
}
module.exports = {
  setLoadTestEnabled,
  isLoadTestEnabled
};