

function main() {
  const { version } = require("../packages/core/package.json");
  return version;
}

console.log(main())
