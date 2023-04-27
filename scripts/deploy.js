async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const FuseToken721 = await ethers.getContractFactory(
    "FuseToken721",
    deployer
  );
  const token721 = await FuseToken721.deploy();

  //   const VRFv2Consumer = await ethers.getContractFactory(
  //     "VRFv2Consumer",
  //     deployer
  //   );
  //   const vrf = VRFv2Consumer.deploy(449);

  const MerkleDistributor721 = await ethers.getContractFactory(
    "MerkleDistributor721",
    deployer
  );
  const distributor721 = await MerkleDistributor721.deploy(
    token721.address,
    "0x00d4b49d2e1e3580a79648a9eff98c37da4fc661a36dc865cc5a0a3e2acd618a",
    "0x78B189582fc085e0cDE63232032932709515422b",
    2
  );

  console.log("NFT721 address:", [token721.address, distributor721.address]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
