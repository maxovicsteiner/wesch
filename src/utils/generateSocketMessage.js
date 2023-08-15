/**
 *
 * @param {string} name
 * @param {any} body
 * @returns string
 */
function generateSocketMessage(name, body) {
  return JSON.stringify({
    name,
    body,
  });
}

module.exports = { generateSocketMessage };
