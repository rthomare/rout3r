// deploy_router.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Router} from "../src/Router.sol";

contract RouterDeployer {
    event RouterDeployed(address routerAddress, bytes32 salt);

    function deployRouter(bytes32 salt) public returns (address) {
        bytes memory bytecode = type(Router).creationCode;

        address routerAddress;
        assembly {
            routerAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
            if iszero(extcodesize(routerAddress)) { revert(0, 0) }
        }

        emit RouterDeployed(routerAddress, salt);
        return routerAddress;
    }

    function computeRouterAddress(bytes32 salt) public view returns (address) {
        bytes memory bytecode = type(Router).creationCode;

        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode)));
        return address(uint160(uint256(hash)));
    }
}

contract RouterDeployment is Script {
    function log(string memory message) internal view {
        console.log(message);
    }

    function log(string memory message, string memory message2) internal view {
        string memory _message = string(abi.encodePacked(message, " ", message2));
        log(_message);
    }

    function log(string memory message, string memory message2, string memory message3) internal view {
        string memory _message = string(abi.encodePacked(message, " ", message2, " ", message3));
        log(_message);
    }

    function concat(string memory a, string memory b) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }

    function concat(string memory a, string memory b, string memory c) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b, c));
    }

    function deploy() internal returns (string memory routerAddress) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory salt = vm.envString("SALT");
        bytes32 saltBytes32 = keccak256(abi.encodePacked(salt));
        vm.startBroadcast(deployerPrivateKey);

        // Initialize the deployer contract
        RouterDeployer deployer = new RouterDeployer();

        // Deploy the router with the specified salt
        routerAddress = vm.toString(deployer.deployRouter(saltBytes32));
        string memory derivedAddress = vm.toString(vm.addr(deployerPrivateKey));
        log("Router deployed at address, from deployer:", routerAddress, derivedAddress);
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
        cmds[5] = "src/Router.sol:Router";
        vm.ffi(cmds);

        string memory contractBlockExplorerUrl = concat(vm.envString("BLOCK_EXPLORER_URL"), "address/", contractAddress);
        log("Verification request sent to Etherscan for:", contractBlockExplorerUrl);
    }

    function run() external {
        string memory routerAddress = deploy();
        verifyContract(routerAddress);
    }
}
