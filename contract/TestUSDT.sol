// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestUSDT is ERC20("Test USDT", "Test USDT"), Ownable(msg.sender){

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address _to, uint _amount) public onlyOwner {
        _mint(_to, _amount);
    }
}