const ERC721ABI = require("../src/assets/contracts/FuseToken721.sol/FuseToken721.json");
const fs = require("fs");
const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

describe("MerkleDistributor", () => {
  beforeEach(async () => {
    [signer1, signer2] = await ethers.getSigners();

    walletAddresses = [signer1, signer2].map((s) => s.address);

    leaves = walletAddresses.map((x) => KECCAK256(x));

    tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });

    FuseToken721 = await ethers.getContractFactory("FuseToken721", signer1);
    token721 = await FuseToken721.deploy();

    // FuseToken721Addr = "0x561AB4c74F59518F3755CC3C428854B96568410F";
    // FuseToken721ABI = ERC721ABI.abi;
    // FuseToken721 = new ethers.Contract(
    //   FuseToken721Addr,
    //   FuseToken721ABI,
    //   ethers.provider.getSigner()
    // );

    // sender = signer1;
    // privateKey = sender.privateKey;
    // wallet = new ethers.Wallet(privateKey, ethers.provider);
    // options = { from: wallet.address };

    MerkleDistributor721 = await ethers.getContractFactory(
      "MerkleDistributor721",
      signer1
    );

    distributor = await MerkleDistributor721.deploy(
      token721.address,
      "0x00d4b49d2e1e3580a79648a9eff98c37da4fc661a36dc865cc5a0a3e2acd618a",
      "0x78b189582fc085e0cde63232032932709515422b",
      2
    );
    await distributor.requestRandomWords();
    lotteryId = await distributor.lotteryId();
    // await token20.connect(signer1).mint(distributor.address, "4000");
    // await token721.connect(signer1).safeMint(distributor.address);
    // await token1155
    //   .connect(signer1)
    //   .mint(distributor.address, "1", "4000", "0x");

    // await token721
    //   .connect(distributor)
    //   .setApprovalForAll(signer1.address, true);
  });

  describe("8 account tree", () => {
    it("should create a MerkleTree with the correct keys", async () => {
      const proof1 = tree.getHexProof(KECCAK256(signer1.address));
      const proof2 = tree.getHexProof(KECCAK256(signer2.address));
      console.log("Address", [
        lotteryId,
        signer1.address,
        signer2.address,
        proof1,
        proof2,
        lotteryId.toString(),
        tree.getHexRoot(),
        tree.getLeafCount(),
      ]);
    });
    // it("successful and unsuccessful claim20", async () => {
    //   expect(await token20.balanceOf(signer1.address)).to.be.equal(0);
    //   const proof = tree.getHexProof(KECCAK256(signer1.address));
    //   ////////////some tests///////////////////////////////////////////
    //   // const indexOfAddress = tree.getLeafIndex(KECCAK256(signer2.address));
    //   const leafCount = tree.getLeafCount();
    //   const indexAddress = tree.getLeaf(0);
    //   console.log(
    //     [
    //       leafCount,
    //       KECCAK256(signer1.address).toString(),
    //       indexAddress.toString(),
    //     ],
    //     "yo ho required index of address"
    //   );
    //   ////////////////////////////////////////////////////////////////
    //   await distributor.connect(signer1).claim(proof);
    //   expect(await token20.balanceOf(signer1.address)).to.be.equal(500);
    //   expect(distributor.connect(signer1).claim(proof)).to.be.revertedWith(
    //     "MerkleDistributor: Drop already claimed."
    //   );
    //   expect(await token20.balanceOf(signer1.address)).to.be.equal(500);
    // });
    // it("successful and unsuccessful claim721", async () => {
    //   expect(await token721.balanceOf(signer1.address)).to.be.equal(0);
    //   const proof = tree.getHexProof(KECCAK256(signer1.address));
    //   await distributor
    //     .connect(signer1)
    //     .claim721(distributor.address, signer1.address, "1", proof);
    //   expect(await token721.balanceOf(distributor.address)).to.be.equal(1);
    //   //   expect(distributor.connect(signer1).claim(proof)).to.be.revertedWith(
    //   //     "MerkleDistributor: Drop already claimed."
    //   //   );
    //   //   expect(await token20.balanceOf(signer1.address)).to.be.equal(500);
    // });
    // it("unsuccessful claim", async () => {
    //   const generatedAddress = "0x4dE8dabfdc4D5A508F6FeA28C6f1B288bbdDc26e";
    //   const proof2 = tree.getHexProof(KECCAK256(generatedAddress));
    //   expect(distributor.connect(signer1).claim(proof2)).to.be.revertedWith(
    //     "MerkleDistributor: Invalid proof."
    //   );
    // });
    // it("emits a successful event", async () => {
    //   const proof = tree.getHexProof(KECCAK256(signer1.address));
    //   await expect(distributor.connect(signer1).claim(proof))
    //     .to.emit(distributor, "ClaimedERC20")
    //     .withArgs(signer1.address, 500);
    // });
  });
});
