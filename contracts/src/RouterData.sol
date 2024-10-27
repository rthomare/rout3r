// SPDX-License-Identifier: GPL-3.0 
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";

import {Route, RouteType} from "./Route.sol";
import {IRouteReader} from "./IRouteReader.sol";
import {IRouteMutator, RouteAddData, RouteUpdateData} from "./IRouteMutator.sol";

bool constant PREV = false;
bool constant NEXT = true;

/// @title The Router Contract - backed by simple circular linked list implementation
/// @dev The Router contract is a simple contract that allows the owner to 
/// create, update and delete routes.
contract RouterData is Ownable, IRouteReader, IRouteMutator {
    mapping (string => mapping (bool => string)) cll;
    mapping (string => Route) routes;
    string _head;

    constructor(Route memory head, address initialOwner) Ownable (initialOwner) {
        _head = head.command;
        cll[_head][PREV] = _head;
        cll[_head][NEXT] = _head;
        routes[_head] = head;
    }

    /// @notice Checks if two strings are equal
    function areEqual(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    /// @notice Checks if the route is valid
    function isRoute(string memory command) public view returns (bool) {
        return routes[command].isValue;
    }

    /// @notice Adds a node to the linked list at end of the list
    function addRoute(RouteAddData memory route) onlyOwner public returns (Route memory) {
        string memory pointer = route.command;
        /// @dev Check if the route already exists and throw an error if it does
        Route memory newRoute = Route(
            route.command, 
            route.name, 
            route.url, 
            route.description, 
            route.subRoutes, 
            true, 
            RouteType.MANUAL
        );
        cll[pointer][PREV] = cll[_head][PREV];
        cll[cll[_head][PREV]][NEXT] = pointer;
        cll[pointer][NEXT] = _head;
        cll[_head][PREV] = pointer;
        routes[pointer] = newRoute;
        return newRoute;
    }

    /// @notice Updates a node in the linked list
    function updateRoute(string memory command, RouteUpdateData memory route) onlyOwner public {
        routes[command].name = route.name;
        routes[command].url = route.url;
        routes[command].description = route.description;
        routes[command].subRoutes = route.subRoutes;
    }

    /// @notice Removes a node from the linked list
    function deleteRoute(string memory command) onlyOwner public {
        string memory prev = cll[command][PREV];
        string memory next = cll[command][NEXT];
        cll[prev][NEXT] = next;
        cll[next][PREV] = prev;
        delete cll[command][PREV];
        delete cll[command][NEXT];
        delete routes[command];
    }

    /// @notice Get the route from the keyed command
    function getRoute(string memory command) public view returns (Route memory) {
        Route memory route = routes[command];
        require(route.isValue);
        return route;
    }

    /// @notice Returns the values of the linked list of paginated size n
    function getRoutes(string memory cursor, uint256 n) public view returns (Route[] memory, uint256, string memory) {
        Route[] memory results = new Route[](n);
        uint256 length = 0;
        string memory pointer = areEqual(cursor, "") ? _head : cursor;
        do {
            results[length] = getRoute(pointer);
            pointer = cll[pointer][NEXT];
            length++;
        } while (!areEqual(pointer, _head) && length < n);
        string memory nextCursor = areEqual(pointer, _head) ? "" : pointer;
        return (results, length, nextCursor);
    }
}