// SPDX-License-Identifier: GPL-3.0
pragma solidity >= 0.8.2 < 0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20("TestToken","TestToken"), Ownable(msg.sender) {
    function mint(address _to, uint _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}