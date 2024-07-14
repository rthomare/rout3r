// SPDX-License-Identifier: GPL-3.0 
pragma solidity ^0.8.23;

import {Route, RouteType} from "./Route.sol";
import {IRouteReader} from "./IRouteReader.sol";
import {IRouteMutator, RouteAddData, RouteUpdateData} from "./IRouteMutator.sol";

bool constant PREV = false;
bool constant NEXT = true;
string constant HEAD = "r3";

/// @title The Router Contract - backed by simple circular linked list implementation
/// @dev The Router contract is a simple contract that allows the owner to 
/// create, update and delete routes.
contract Router_V1 is IRouteReader, IRouteMutator {
    address owner;
    mapping (string => mapping (bool => string)) cll;
    mapping (string => Route) routes;

    constructor() {
        owner = msg.sender;
        cll[HEAD][NEXT] = HEAD;
        cll[HEAD][PREV] = HEAD;
    }

    /// @notice Modifier to check if the caller is the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function reservedHead() internal pure returns (Route memory) {
        // Reserved route
        string[] memory subroutes = new string[](4);
        subroutes[0] = "setup::%0000/#setup";
        subroutes[1] = "about::%0000/#about";
        subroutes[2] = "new::%0000/#routes/new";
        subroutes[3] = "search::%0000/#routes/edit/%@@@";
        Route memory r3 = Route(
            HEAD, 
            "rout3r Menu", 
            "%0000/", 
            "The rout3r menu",
            subroutes,
            true, 
            RouteType.RESERVED
        );
        return r3;
    }

    /// @notice Checks if two strings are equal
    function areEqual(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    /// @notice Checks if the route is valid
    function isValidRoute(string memory command) internal view returns (bool) {
        return areEqual(command, HEAD) || routes[command].isValue;
    }

    /// @notice Checks if the route is reserved
    function isReservedRoute(string memory command) internal view returns (bool) {
        return getRoute(command).routeType == RouteType.RESERVED;
    }

    /// @notice Adds a node to the linked list at end of the list
    function addRoute(RouteAddData memory route) onlyOwner public returns (Route memory) {
        /// @dev Check if the route already exists and throw an error if it does
        require(!isValidRoute(route.command), "Route with command already exists");
        Route memory newRoute = Route(
            route.command, 
            route.name, 
            route.url, 
            route.description, 
            route.subRoutes, 
            true, 
            RouteType.MANUAL
        );
        string memory pointer = route.command;
        cll[pointer][PREV] = cll[HEAD][PREV];
        cll[cll[HEAD][PREV]][NEXT] = pointer;
        cll[pointer][NEXT] = HEAD;
        cll[HEAD][PREV] = pointer;
        routes[pointer] = newRoute;
        return newRoute;
    }

    /// @notice Adds multiple nodes to the linked list
    function addRoutes(RouteAddData[] memory newRoutes) onlyOwner public returns (Route[] memory) {
        Route[] memory results = new Route[](newRoutes.length);
        for (uint256 i = 0; i < newRoutes.length; i++) {
            results[i] = addRoute(newRoutes[i]);
        }
        return results;
    }

    function updateRoute(string memory command, RouteUpdateData memory route) onlyOwner public {
        require(isValidRoute(command), "Route with command does not exist");
        routes[command].name = route.name;
        routes[command].url = route.url;
        routes[command].description = route.description;
        routes[command].subRoutes = route.subRoutes;
    }

    /// @notice Removes a node from the linked list
    function deleteRoute(string memory command) onlyOwner public {
        require(isValidRoute(command), "Route with command does not exist");
        require(!isReservedRoute(command), "Cannot delete a reserved route");
        string memory prev = cll[command][PREV];
        string memory next = cll[command][NEXT];
        cll[prev][NEXT] = next;
        cll[next][PREV] = prev;
        delete cll[command][PREV];
        delete cll[command][NEXT];
        delete routes[command];
    }

    /// @notice Removes multiple nodes from the linked list
    function deleteRoutes(string[] memory commands) onlyOwner public {
        for (uint256 i = 0; i < commands.length; i++) {
            deleteRoute(commands[i]);
        }
    }

    function getRoute(string memory command) public view returns (Route memory) {
        Route memory route = areEqual(command, HEAD) ? reservedHead() : routes[command];
        require(route.isValue);
        return route;
    }

    function getRoutes(string memory cursor, uint256 n) public view returns (Route[] memory, uint256, string memory) {
        Route[] memory results = new Route[](n);
        uint256 length = 0;
        string memory pointer = areEqual(cursor, "") ? HEAD : cursor;
        do {
            results[length] = getRoute(pointer);
            pointer = cll[pointer][NEXT];
            length++;
        } while (!areEqual(pointer, HEAD) && length < n);
        string memory nextCursor = areEqual(pointer, HEAD) ? "" : pointer;
        return (results, length, nextCursor);
    }
}