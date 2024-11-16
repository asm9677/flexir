// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20("TestToken","TestToken"), Ownable(msg.sender) {
    function mint(address _to, uint _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}