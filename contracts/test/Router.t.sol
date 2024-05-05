// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {Route, RouteResult, Router} from "../src/Router.sol";

contract RouterTest is Test {
    Router public router;

    function newRoute() pure internal returns (Route memory) {
        string[] memory subRoutes = new string[](0);
        return Route("command", "name", "url", subRoutes, true);
    }
    
    function setUp() public {
        router = new Router();
    }

    function test_CreateAndGetRoute() public {
        uint256 id = router.addRoute(newRoute());
        Route memory createdRoute = router.getRoute(id);
        assertEq(id, 0);
        assertEq(createdRoute.name, "name");
        assertEq(createdRoute.url, "url");
        assertTrue(createdRoute.isValue);
    }

    function test_CreateAndGetRoutes() public {
        string[] memory subRoutes = new string[](0);
        router.addRoute(
            Route("command1", "name1", "url1", subRoutes, true)
        );
        router.addRoute(
            Route("command2", "name2", "url2", subRoutes, true)
        );
        (RouteResult[] memory routes, uint256 length, uint256 cursor) = router.getRoutes(0, 10);
        assertEq(length, 2);
        assertEq(routes[0].route.name, "name1");
        assertEq(routes[1].route.name, "name2");
        assertEq(cursor, 0);
    }

    function test_RoutePagination() public {
        for (uint i = 0; i < 15; i++) {
            router.addRoute(newRoute());
        }
        (RouteResult[] memory routes, uint256 length, uint256 cursor) = router.getRoutes(0, 10);
        assertEq(length, 10);
        assertEq(cursor, 10);
        (routes, length, cursor) = router.getRoutes(cursor, 10);
        assertEq(length, 5);
        assertEq(cursor, 0);
    }

    function test_DeleteRoute() public {
        for (uint i = 0; i < 15; i++) {
            router.addRoute(newRoute());
        }
        (RouteResult[] memory routes, uint256 length, uint256 cursor) = router.getRoutes(0, 10);
        assertEq(length, 10);
        assertEq(cursor, 10);
        (routes, length, cursor) = router.getRoutes(cursor, 10);
        assertEq(length, 5);
        assertEq(cursor, 0);
        // deleting route at id 10
        router.deleteRoute(routes[0].id);
        (routes, length, cursor) = router.getRoutes(0, 10);
        assertEq(length, 10);
        (routes, length, cursor) = router.getRoutes(cursor, 10);
        assertEq(length, 4);
        assertEq(routes[0].id, 11);
    }

    function test_UpdateRoute() public {
        uint256 id = router.addRoute(newRoute());
        Route memory createdRoute = router.getRoute(id);
        assertEq(createdRoute.name, "name");
        assertEq(createdRoute.url, "url");
        assertTrue(createdRoute.isValue);
        string[] memory subRoutes = new string[](0);
        router.updateRoute(id, Route("command", "new name", "new url", subRoutes, true));
        Route memory updatedRoute = router.getRoute(id);
        assertEq(updatedRoute.name, "new name");
        assertEq(updatedRoute.url, "new url");
        assertTrue(updatedRoute.isValue);
    }

    function test_InvalidRoute() public {
        uint256 id = router.addRoute(newRoute());
        Route memory createdRoute = router.getRoute(id);
        assertEq(createdRoute.name, "name");
        assertEq(createdRoute.url, "url");
        assertTrue(createdRoute.isValue);
        router.deleteRoute(id);
        vm.expectRevert();
        router.getRoute(id);
    }
}
