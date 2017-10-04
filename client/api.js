const fetchAttractions = () =>
  fetch("/api")
    .then(result => result.json())
    .catch(console.error);

module.exports = {
  fetchAttractions
};
