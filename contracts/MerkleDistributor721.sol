// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.9;

import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {VRFv2Consumer} from "./VRFv2Consumer.sol";

interface IVRFv2Consumer {
    function requestRandomWords() external returns (uint256 _requestId);

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords);
}

contract MerkleDistributor721 is ERC721Holder {
    using SafeERC20 for IERC20;

    IVRFv2Consumer private vrfConsumer;
    uint256 public lotteryId;
    uint256 public playersCount;

    address public immutable tokenERC721;

    bytes32 public immutable merkleRoot;

    mapping(address => uint256) private claimedAddress;

    event ClaimedERC721(address indexed _from);
    event RequestID(uint256 request);

    // struct RequestStatus {
    //     bool fulfilled;
    //     uint256[] randomWords;
    // }
    constructor(
        address token721_,
        bytes32 merkleRoot_,
        address vrfConsumerAddress,
        uint256 noOfPlayers
    ) {
        tokenERC721 = token721_;
        merkleRoot = merkleRoot_;
        vrfConsumer = IVRFv2Consumer(vrfConsumerAddress);
        playersCount = noOfPlayers;
    }

    // function claim(bytes32[] calldata merkleProof) public virtual {
    //     require(claimedAddress[msg.sender] == 0, "Claimed ERC20");

    //     // Verify the merkle proof.
    //     bytes32 node = keccak256(abi.encodePacked(msg.sender));
    //     if (!MerkleProof.verify(merkleProof, merkleRoot, node))
    //         // Mark it claimed and send the token.
    //         claimedAddress[msg.sender] = 1;

    //     require(
    //         IERC20(tokenERC20).transfer(msg.sender, dropERC20),
    //         "Transfer failed"
    //     );

    //     emit ClaimedERC20(msg.sender, dropERC20);
    // }
    function requestRandomWords() external {
        lotteryId = vrfConsumer.requestRandomWords();
    }

    function getRandomWinnerIndex() external view returns (uint256) {
        (bool _fulfilled, uint256[] memory _randomWords) = vrfConsumer
            .getRequestStatus(lotteryId);
        require(_fulfilled, "Lottery Process is On.. Wait for a while");

        //      RequestStatus memory requestStatus = RequestStatus({
        //     fulfilled: _fulfilled,
        //     randomWords: _randomWords
        // });

        uint256 randomWord = _randomWords[0];
        uint256 index = (randomWord % playersCount);
        return index;
    }

    function claim721(
        address from,
        address to,
        uint256 tokenId,
        bytes32[] calldata merkleProof
    ) public virtual {
        // Verify the merkle proof.
        bytes32 node = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProof.verify(merkleProof, merkleRoot, node))
            // Mark it claimed and send the token.
            claimedAddress[msg.sender] = 1;

        ERC721(tokenERC721).safeTransferFrom(from, to, tokenId, "0x");
    }
}
