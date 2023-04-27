require("@nomiclabs/hardhat-waffle");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.9",
  },
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/iRzJAaug5iqIo-ghDMD_ZJiUmK8KY2WB",
      chainId: 11155111,
      accounts: {
        mnemonic:
          "rack indicate describe pupil track arena tongue remind clinic gaze lawsuit object",
      },
    },
  },
  paths: {
    artifacts: "./src/assets",
  },
};
