// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.9;

import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleDistributor is ERC721Holder, ERC1155Holder {
    using SafeERC20 for IERC20;
    address public immutable tokenERC20;
    address public immutable tokenERC721;
    address public immutable tokenERC1155;

    bytes32 public immutable merkleRoot;

    uint256 public dropERC20;

    mapping(address => uint256) private claimedAddress;

    event ClaimedERC20(address indexed _from, uint256 _dropERC20);

    constructor(
        address token_,
        address token721_,
        address token1155_,
        bytes32 merkleRoot_,
        uint256 dropERC20_
    ) {
        tokenERC20 = token_;
        tokenERC721 = token721_;
        tokenERC1155 = token1155_;
        merkleRoot = merkleRoot_;
        dropERC20 = dropERC20_;
    }

    function claim(bytes32[] calldata merkleProof) public virtual {
        require(claimedAddress[msg.sender] == 0, "Claimed ERC20");

        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProof.verify(merkleProof, merkleRoot, node))
            // Mark it claimed and send the token.
            claimedAddress[msg.sender] = 1;

        require(
            IERC20(tokenERC20).transfer(msg.sender, dropERC20),
            "Transfer failed"
        );

        emit ClaimedERC20(msg.sender, dropERC20);
    }

    // function claim721(
    //     address from,
    //     address to,
    //     uint256 tokenId,
    //     bytes32[] calldata merkleProof
    // ) public virtual {
    //     // Verify the merkle proof.
    //     bytes32 node = keccak256(abi.encodePacked(msg.sender));
    //     if (!MerkleProof.verify(merkleProof, merkleRoot, node))
    //         // Mark it claimed and send the token.
    //         // claimedAddress[msg.sender] = 1;
    //         ERC721(tokenERC721).safeTransferFrom(from, to, tokenId, "0x");
    // }
}
