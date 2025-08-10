// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {RouterData} from "./RouterData.sol";
import {Route, RouteType} from "./Route.sol";
import {IRouteReader} from "./IRouteReader.sol";
import {IRouteMutator, RouteAddData, RouteUpdateData} from "./IRouteMutator.sol";
import {console} from "forge-std/console.sol";

bool constant PREV = false;
bool constant NEXT = true;

/// @title The Router Contract - backed by simple circular linked list implementation
/// @dev The Router contract is a simple contract that allows the owner to
/// create, update and delete routes.
/// Version 1.0
contract Router is Initializable, UUPSUpgradeable, OwnableUpgradeable, IRouteReader, IRouteMutator {
    mapping(address => RouterData) routerMapping; // Store the router data for each address
    address implimentation; // Store the implementation address

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
    }

    /// @notice Sets up the router for the user
    /// @param user The address of the user
    function setupAddress(address user) private initializer {
        require(user != address(0), "Owner address cannot be zero");
        require(routerMapping[user] == RouterData(address(0)), "Router already exists");
        // Reserved route
        string[] memory subroutes = new string[](4);
        subroutes[0] = "setup::%0000/#setup";
        subroutes[1] = "about::%0000/#about";
        subroutes[2] = "new::%0000/#routes/new";
        subroutes[3] = "search::%0000/#routes/edit/%@@@";
        Route memory r3 = Route("r3", "rout3r Menu", "%0000/", "The rout3r menu", subroutes, true, RouteType.RESERVED);
        routerMapping[user] = new RouterData(r3, address(this));
    }

    /// @notice Adds a node to the linked list at end of the list
    function addRoute(RouteAddData memory route) public returns (Route memory) {
        if (address(routerMapping[msg.sender]) == address(0)) {
            setupAddress(msg.sender);
        }
        RouterData routerData = routerMapping[msg.sender];
        require(!routerData.isRoute(route.command), "Route already exists");
        return routerData.addRoute(route);
    }

    /// @notice Adds multiple nodes to the linked list
    function addRoutes(RouteAddData[] memory newRoutes) public returns (Route[] memory) {
        Route[] memory results = new Route[](newRoutes.length);
        for (uint256 i = 0; i < newRoutes.length; i++) {
            results[i] = addRoute(newRoutes[i]);
        }
        return results;
    }

    function updateRoute(string memory command, RouteUpdateData memory route) public {
        RouterData routerData = routerMapping[msg.sender];
        require(routerData.isRoute(command), "Route doesn't exist");
        routerData.updateRoute(command, route);
    }

    /// @notice Removes a node from the linked list
    function deleteRoute(string memory command) public {
        RouterData routerData = routerMapping[msg.sender];
        require(routerData.isRoute(command), "Route doesn't exist");
        routerData.deleteRoute(command);
    }

    /// @notice Removes multiple nodes from the linked list
    function deleteRoutes(string[] memory commands) public {
        for (uint256 i = 0; i < commands.length; i++) {
            deleteRoute(commands[i]);
        }
    }

    function getRoute(string memory command) public view returns (Route memory) {
        RouterData routerData = routerMapping[msg.sender];
        require(routerData.isRoute(command), "Route doesn't exist");
        return routerData.getRoute(command);
    }

    function getRoutes(string memory cursor, uint256 n) public view returns (Route[] memory, uint256, string memory) {
        RouterData routerData = routerMapping[msg.sender];
        return routerData.getRoutes(cursor, n);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
