export const networkInfo = async (web3) => {
  return new Promise((resolve, reject) => {
    web3.version.getNetwork((err, netId) => {
      let networkName;
      switch (netId) {
        case "1":
          networkName = "Main";
          break;
        case "2":
          networkName = "Morden";
          break;
        case "3":
          networkName = "Ropsten";
          break;
        case "4":
          networkName = "Rinkeby";
          break;
        case "42":
          networkName = "Kovan";
          break;
        default:
          networkName = "Unknown";
      }
      resolve({ id: netId, name: networkName});
    });
  });
};


export const nextChar = c => {
    var i = (parseInt(c, 36) + 1 ) % 36;
    return (!i * 10 + i).toString(36);
}

const chars = [];

export const getChar = name => {
  let char = name.slice(0, 1) === '_' ? name.slice(1, 2) : name.slice(0, 1);
  while (chars.indexOf(char) > -1) {
    char = nextChar(char);
  }
  chars.push(char);
  return char;
}

export const getName = name => (
  name.slice(0, 1) === '_'
    ? name.slice(1, name.length)
    : name.slice(0, name.length)
)
