// contracts/FactoryContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/ProxyAdmin.sol";

contract FactoryContract is Initializable, OwnableUpgradeable {
    address public implementationAddress;
    ProxyAdmin public proxyAdmin;
    
    event ContractDeployed(address newProxyAddress);

    function initialize(address _implementationAddress) public initializer {
        __Ownable_init();
        implementationAddress = _implementationAddress;
        proxyAdmin = new ProxyAdmin();
    }

    function setImplementation(address _implementationAddress) public onlyOwner {
        implementationAddress = _implementationAddress;
    }

    function createInstance(uint256 _value) public returns (address) {
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            implementationAddress,
            address(proxyAdmin),
            abi.encodeWithSignature("initialize(uint256)", _value)
        );

        emit ContractDeployed(address(proxy));
        return address(proxy);
    }
}
