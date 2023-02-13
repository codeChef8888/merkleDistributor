const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("MerkleDistributor", () => {
  beforeEach(async () => {
    [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8] =
      await ethers.getSigners();

    walletAddresses = [
      signer1,
      signer2,
      signer3,
      signer4,
      signer5,
      signer6,
      signer7,
      signer8,
    ].map((s) => s.address);

    leaves = walletAddresses.map((x) => KECCAK256(x));

    tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });

    FuseToken20 = await ethers.getContractFactory("FuseToken", signer1);
    token20 = await FuseToken20.deploy();

    FuseToken721 = await ethers.getContractFactory("FuseToken721", signer1);
    token721 = await FuseToken721.deploy();

    FuseToken1155 = await ethers.getContractFactory("FuseToken1155", signer1);
    token1155 = await FuseToken1155.deploy();

    MerkleDistributor = await ethers.getContractFactory(
      "MerkleDistributor",
      signer1
    );

    distributor = await MerkleDistributor.deploy(
      token20.address,
      token721.address,
      token1155.address,
      tree.getHexRoot(),
      500
    );

    await token20.connect(signer1).mint(distributor.address, "4000");
    await token721.connect(signer1).safeMint(distributor.address);
    await token1155
      .connect(signer1)
      .mint(distributor.address, "1", "4000", "0x");

    //   await token721.connect(distributor).setApprovalForAll(signer1.address, true);
  });

  describe("8 account tree", () => {
    it("successful and unsuccessful claim20", async () => {
      expect(await token20.balanceOf(signer1.address)).to.be.equal(0);

      const proof = tree.getHexProof(KECCAK256(signer1.address));

      await distributor.connect(signer1).claim(proof);

      expect(await token20.balanceOf(signer1.address)).to.be.equal(500);

      expect(distributor.connect(signer1).claim(proof)).to.be.revertedWith(
        "MerkleDistributor: Drop already claimed."
      );

      expect(await token20.balanceOf(signer1.address)).to.be.equal(500);
    });

    it("successful and unsuccessful claim721", async () => {
      expect(await token721.balanceOf(signer1.address)).to.be.equal(0);

      const proof = tree.getHexProof(KECCAK256(signer1.address));

      await distributor
        .connect(signer1)
        .claim721(distributor.address, signer1.address, "1", proof);

      expect(await token721.balanceOf(distributor.address)).to.be.equal(1);

      //   expect(distributor.connect(signer1).claim(proof)).to.be.revertedWith(
      //     "MerkleDistributor: Drop already claimed."
      //   );

      //   expect(await token20.balanceOf(signer1.address)).to.be.equal(500);
    });

    it("unsuccessful claim", async () => {
      const generatedAddress = "0x4dE8dabfdc4D5A508F6FeA28C6f1B288bbdDc26e";
      const proof2 = tree.getHexProof(KECCAK256(generatedAddress));

      expect(distributor.connect(signer1).claim(proof2)).to.be.revertedWith(
        "MerkleDistributor: Invalid proof."
      );
    });

    it("emits a successful event", async () => {
      const proof = tree.getHexProof(KECCAK256(signer1.address));

      await expect(distributor.connect(signer1).claim(proof))
        .to.emit(distributor, "ClaimedERC20")
        .withArgs(signer1.address, 500);
    });
  });
});
