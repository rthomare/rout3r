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
contract Router is
  Initializable,
  UUPSUpgradeable,
  OwnableUpgradeable,
  IRouteReader,
  IRouteMutator
{
  RouterData routerData;
  address implimentation; // Store the implementation address

  function initialize(address owner) public initializer {
    __Ownable_init(owner);
    __UUPSUpgradeable_init();
    // Reserved route
    string[] memory subroutes = new string[](4);
    subroutes[0] = 'setup::%0000/#setup';
    subroutes[1] = 'about::%0000/#about';
    subroutes[2] = 'new::%0000/#routes/new';
    subroutes[3] = 'search::%0000/#routes/edit/%@@@';
    Route memory r3 = Route(
      'r3',
      'rout3r Menu',
      '%0000/',
      'The rout3r menu',
      subroutes,
      true,
      RouteType.RESERVED
    );
    routerData = new RouterData(r3, address(this));
  }

  /// @notice Checks if the route is reserved
  function isReservedRoute(string memory command) internal view returns (bool) {
    return getRoute(command).routeType == RouteType.RESERVED;
  }

  /// @notice Adds a node to the linked list at end of the list
  function addRoute(RouteAddData memory route) public returns (Route memory) {
    require(!routerData.isRoute(route.command), 'Route already exists');
    return routerData.addRoute(route);
  }

  /// @notice Adds multiple nodes to the linked list
  function addRoutes(
    RouteAddData[] memory newRoutes
  ) public onlyOwner returns (Route[] memory) {
    Route[] memory results = new Route[](newRoutes.length);
    for (uint256 i = 0; i < newRoutes.length; i++) {
      results[i] = addRoute(newRoutes[i]);
    }
    return results;
  }

  function updateRoute(
    string memory command,
    RouteUpdateData memory route
  ) public onlyOwner {
    require(routerData.isRoute(command), "Route doesn't exist");
    routerData.updateRoute(command, route);
  }

  /// @notice Removes a node from the linked list
  function deleteRoute(string memory command) public onlyOwner {
    require(routerData.isRoute(command), "Route doesn't exist");
    routerData.deleteRoute(command);
  }

  /// @notice Removes multiple nodes from the linked list
  function deleteRoutes(string[] memory commands) public onlyOwner {
    for (uint256 i = 0; i < commands.length; i++) {
      deleteRoute(commands[i]);
    }
  }

  function getRoute(string memory command) public view returns (Route memory) {
    require(routerData.isRoute(command), "Route doesn't exist");
    return routerData.getRoute(command);
  }

  function getRoutes(
    string memory cursor,
    uint256 n
  ) public view returns (Route[] memory, uint256, string memory) {
    return routerData.getRoutes(cursor, n);
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

  function getImplementationAddress() external view returns (address) {
    bytes32 implementationSlot = bytes32(
      uint256(keccak256('eip1967.proxy.implementation')) - 1
    );
    address _implementation;
    assembly {
      _implementation := sload(implementationSlot)
    }
    return _implementation;
  }
}