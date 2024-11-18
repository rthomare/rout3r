// deploy_factory.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {RouterFactory} from "../src/RouterFactory.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

contract FactoryDeployer {
    event FactoryDeployed(address factoryAddress, string salt);

    function deployFactory(string memory salt) public returns (address) {
        bytes memory bytecode = type(RouterFactory).creationCode;
        address factoryAddress;
        bytes32 saltbytes;
        assembly {
            saltbytes := mload(add(salt, 32))
            factoryAddress := create2(0, add(bytecode, 0x20), mload(bytecode), saltbytes)
            if iszero(extcodesize(factoryAddress)) {
                revert(0, 0)
            }
        }

        emit FactoryDeployed(factoryAddress, salt);
        return factoryAddress;
    }
}

contract DeployFactory is Script {
    function log(string memory message) internal view {
        console.log(message);
    }

    function log(string memory message, string memory message2) internal view {
        string memory _message = string(abi.encodePacked(message, " ", message2)); 
        log(_message);
    }

    function log(string memory message, string memory message2, string memory message3) internal view{
        string memory _message = string(abi.encodePacked(message, " ", message2, " ", message3));
        log(_message);
    }

    function concat(string memory a, string memory b) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }

    function concat(string memory a, string memory b, string memory c) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b, c));
    }

    function deploy() internal returns (string memory factoryAddress) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory salt = vm.envString("SALT");
        vm.startBroadcast(deployerPrivateKey);

        // Initialize the deployer contract
        FactoryDeployer deployer = new FactoryDeployer();

        // Deploy the factory with the specified salt
        factoryAddress = vm.toString(deployer.deployFactory(salt));
        string memory derivedAddress = vm.toString(vm.addr(deployerPrivateKey));
        log("Factory deployed at address, from deployer:", factoryAddress, derivedAddress);
        vm.stopBroadcast();
    }

    function verifyContract(string memory contractAddress) internal {
        // Running the verify command in a system call
        string[] memory cmds = new string[](6);
        cmds[0] = "forge";
        cmds[1] = "verify-contract";
        cmds[2] = "--compiler-version";
        cmds[3] = "0.8.23";
        cmds[4] = contractAddress;
        cmds[5] = "src/RouterFactory.sol:RouterFactory"; 
        vm.ffi(cmds);

        string memory contractBlockExplorerUrl = concat(vm.envString("BLOCK_EXPLORER_URL"), "address/", contractAddress);
        log("Verification request sent to Etherscan for:", contractBlockExplorerUrl);
    }

    function run() external {
        string memory factoryAddress = deploy();
        verifyContract(factoryAddress);
    }
}