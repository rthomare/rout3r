// SPDX-License-Identifier: GPL-3.0 
pragma solidity ^0.8.23;

// TODO: Stop duplicate commands from being added or updated for a route
// TODO: Move reserved routes into the contract, will need special 'origin' code to handle these routes
// TODO: Consider adding events for creation, update, and deletion of routes
// TODO: Make contract upgradable

/// @title The Route Struct - represents a route in the Router contract
/// @dev The route format is specific as follows:
/// command: the command to be executed (string)
/// name: the name of the route (string)
/// url: the url of the route (string)
/// subRoutes: the sub routes of the route (string[]) in the format of command::url (double colon)
/// isValue: a boolean flag to check if the route is valid
struct Route {
    string command;
    string name;
    string url;
    string[] subRoutes;
    bool isValue;
}

/// @title The RouteResult Struct - represents a route result in the Router contract
/// @dev The route result format is specific as follows:
/// id: the id of the route (uint256)
/// route: the route object (Route)
struct RouteResult {
    uint256 id;
    Route route;
}

bool constant PREV = false;
bool constant NEXT = true;

/// @title The Router Contract - backed by simple circular linked list implementation
/// @dev The Router contract is a simple contract that allows the owner to 
/// create, update and delete routes.
contract Router {
    address owner;
    uint256 idNum;
    uint256 public head;
    mapping (uint256 => mapping (bool => uint256)) cll;
    mapping (uint256 => Route) routes;

    constructor() {
        owner = msg.sender;
        idNum = 0;
        head = 0;
        cll[head][NEXT] = head;
        cll[head][PREV] = head;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /// @notice Adds a node to the linked list at end of the list
    function addRoute(Route memory route) onlyOwner public returns (uint256) {
        uint256 id = idNum;
        cll[id][PREV] = cll[head][PREV];
        cll[cll[head][PREV]][NEXT] = id;
        cll[id][NEXT] = head;
        cll[head][PREV] = id;
        routes[id] = route;
        idNum++;
        return id;
    }

    function updateRoute(uint256 id, Route memory route) onlyOwner public {
        require(isValidRoute(id));
        routes[id] = route;
    }

    /// @notice Removes a node from the linked list
    function deleteRoute(uint256 id) onlyOwner public {
        require(isValidRoute(id));
        uint256 prev = cll[id][PREV];
        uint256 next = cll[id][NEXT];
        cll[prev][NEXT] = next;
        cll[next][PREV] = prev;

        if (id == head) {
            head = next;
        }

        delete cll[id][PREV];
        delete cll[id][NEXT];
        delete routes[id];
    }

    function isValidRoute(uint256 id) internal view returns (bool) {
        return routes[id].isValue;
    }

    /// @notice Returns the value of the node at the given index
    function getRoute(uint256 id) public view returns (Route memory) {
        require(isValidRoute(id));
        return routes[id];
    }

    /// @notice Returns the values of the linked list of paginated size n
    function getRoutes(uint256 cursor, uint256 n) public view returns (RouteResult[] memory, uint256, uint256) {
        RouteResult[] memory results = new RouteResult[](n);
        uint256 length = 0;
        uint256 pointer = cursor == 0 ? head : cursor;
        do {
            results[length] = RouteResult(pointer, routes[pointer]);
            pointer = cll[pointer][NEXT];
            length++;
        } while (pointer != head && length < n);
        uint256 nextCursor = pointer == head ? 0 : pointer;
        return (results, length, nextCursor);
    }
}