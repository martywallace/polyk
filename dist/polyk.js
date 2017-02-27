(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/**
 * Checks, if polygon is simple. Polygon is simple, when its edges don't cross each other.
 *
 * @param {number[]} polygon [x1, y1, x2, y2...]
 * @returns {boolean} true if Polygon is simple
 */
function IsSimple (polygon) {
  var p = polygon;
  var n = p.length >> 1;
  if (n < 4) return true
  var a1 = Point();
  var a2 = Point();
  var b1 = Point();
  var b2 = Point();
  var c = Point();

  for (var i = 0; i < n; i++) {
    a1.x = p[2 * i];
    a1.y = p[2 * i + 1];
    if (i == n - 1) {
      a2.x = p[0];
      a2.y = p[1];
    } else {
      a2.x = p[2 * i + 2];
      a2.y = p[2 * i + 3];
    }

    for (var j = 0; j < n; j++) {
      if (Math.abs(i - j) < 2) continue
      if (j == n - 1 && i == 0) continue
      if (i == n - 1 && j == 0) continue

      b1.x = p[2 * j];
      b1.y = p[2 * j + 1];
      if (j == n - 1) {
        b2.x = p[0];
        b2.y = p[1];
      } else {
        b2.x = p[2 * j + 2];
        b2.y = p[2 * j + 3];
      }

      if (GetLineIntersection(a1, a2, b1, b2, c) != null) return false
    }
  }
  return true
}
module.exports.IsSimple = IsSimple;

/**
 * Checks, if polygon is convex. Polygon is convex, when each inner angle is <= 180°.
 *
 * @param {number[]} polygon [x1, y1, x2, y2...]
 * @returns {boolean}
 */
function IsConvex (polygon) {
  var p = polygon;
  if (p.length < 6) return true
  var l = p.length - 4;
  for (var i = 0; i < l; i += 2) {
    if (!convex(p[i], p[i + 1], p[i + 2], p[i + 3], p[i + 4], p[i + 5])) return false
  }
  if (!convex(p[l], p[l + 1], p[l + 2], p[l + 3], p[0], p[1])) return false
  if (!convex(p[l + 2], p[l + 3], p[0], p[1], p[2], p[3])) return false
  return true
}
module.exports.IsConvex = IsConvex;

/**
 * Returns the area of polygon.
 *
 * @param {number[]} polygon [x1, y1, x2, y2...]
 * @returns {number}
 */
function GetArea (polygon) {
  var p = polygon;
  if (p.length < 6) return 0
  var l = p.length - 2;
  var sum = 0;
  for (var i = 0; i < l; i += 2) {
    sum += (p[i + 2] - p[i]) * (p[i + 1] + p[i + 3]);
  }
  sum += (p[0] - p[l]) * (p[l + 1] + p[1]);
  return -sum * 0.5
}
module.exports.GetArea = GetArea;

/**
 * Returns the Axis-aligned Bounding Box of polygon
 *
 * @param {number[]} polygon [x1, y1, x2, y2...]
 * @returns {AABB}
 * @example
 * //={x:0, y:0, width:0, height:0}
 */
function GetAABB (polygon) {
  var p = polygon;
  var minx = Infinity;
  var miny = Infinity;
  var maxx = -minx;
  var maxy = -miny;
  for (var i = 0; i < p.length; i += 2) {
    minx = Math.min(minx, p[i]);
    maxx = Math.max(maxx, p[i]);
    miny = Math.min(miny, p[i + 1]);
    maxy = Math.max(maxy, p[i + 1]);
  }
  return {x: minx, y: miny, width: maxx - minx, height: maxy - miny}
}
module.exports.GetAABB = GetAABB;

/**
 * Computes the triangulation. Output array is array of triangles (triangle = 3 indices of polygon vertices).
 *
 * Works with simple polygons only.
 *
 * @param {number[]} polygon [x1, y1, x2, y2...]
 * @returns {number[]} array of triangles (triangle = 3 indices of polygon vertices)
 * @example
 * var ids = PolyK.Triangulate([0, 0, 1, 0, 1, 1, 0, 1]);
 * //=[0, 1, 2, 0, 2, 3]
 */
function Triangulate (polygon) {
  var p = polygon;
  var n = p.length >> 1;
  if (n < 3) return []
  var tgs = [];
  var avl = [];
  for (var i = 0; i < n; i++) { avl.push(i); }

  var i = 0;
  var al = n;
  while (al > 3) {
    var i0 = avl[(i + 0) % al];
    var i1 = avl[(i + 1) % al];
    var i2 = avl[(i + 2) % al];

    var ax = p[2 * i0];
    var ay = p[2 * i0 + 1];
    var bx = p[2 * i1];
    var by = p[2 * i1 + 1];
    var cx = p[2 * i2];
    var cy = p[2 * i2 + 1];

    var earFound = false;
    if (convex(ax, ay, bx, by, cx, cy)) {
      earFound = true;
      for (var j = 0; j < al; j++) {
        var vi = avl[j];
        if (vi == i0 || vi == i1 || vi == i2) continue
        if (PointInTriangle(p[2 * vi], p[2 * vi + 1], ax, ay, bx, by, cx, cy)) {
          earFound = false;
          break
        }
      }
    }
    if (earFound) {
      tgs.push(i0, i1, i2);
      avl.splice((i + 1) % al, 1);
      al--;
      i = 0;
    } else if (i++ > 3 * al) break    // no convex angles :(
  }
  tgs.push(avl[0], avl[1], avl[2]);
  return tgs
}
module.exports.Triangulate = Triangulate;

/**
 * Slices the polygon with line segment A-B, defined by [ax,ay] and [bx,by]. A, B must not lay inside a polygon. Returns an array of polygons.
 *
 * Works with simple polygons only.
 *
 * @param {number[]} polygon [x1, y1, x2, y2...]
 * @param {number} startX Start Coordinate [x]
 * @param {number} startY Start Coordinate [y]
 * @param {number} endX End Coordinate [x]
 * @param {number} endY End Coordinate [y]
 * @returns {number[][]} Array of Polygon
 */
function Slice (polygon, startX, startY, endX, endY) {
  var p = polygon;
  var ax = startX;
  var ay = startY;
  var bx = endX;
  var by = endY;
  if (ContainsPoint(p, ax, ay) || ContainsPoint(p, bx, by)) {
    return [p.slice(0)]
  }

  var a = Point(ax, ay);
  var b = Point(bx, by);
  var iscs = [];  // intersections
  var ps = [];  // points
  for (var i = 0; i < p.length; i += 2) {
    ps.push(Point(p[i], p[i + 1]));
  }
  for (var i = 0; i < ps.length; i++) {
    var isc = Point(0, 0);
    isc = GetLineIntersection(a, b, ps[i], ps[(i + 1) % ps.length], isc);
    var fisc = iscs[0];
    var lisc = iscs[iscs.length - 1];
    // && (isc.x!=ps[i].x || isc.y!=ps[i].y) )
    if (isc && (fisc == null || distance(isc, fisc) > 1e-10) && (lisc == null || distance(isc, lisc) > 1e-10)) {
      isc.flag = true;
      iscs.push(isc);
      ps.splice(i + 1, 0, isc);
      i++;
    }
  }

  if (iscs.length < 2) return [p.slice(0)]
  var comp = function (u, v) { return distance(a, u) - distance(a, v) };
  iscs.sort(comp);

  var pgs = [];
  var dir = 0;
  while (iscs.length > 0) {
    // var n = ps.length // is assigned a value but never used. (no-unused-vars)
    var i0 = iscs[0];
    var i1 = iscs[1];
    // if(i0.x==i1.x && i0.y==i1.y) { iscs.splice(0,2); continue;}
    var index0 = ps.indexOf(i0);
    var index1 = ps.indexOf(i1);
    var solved = false;

    if (firstWithFlag(ps, index0) === index1) {
      solved = true;
    } else {
      i0 = iscs[1];
      i1 = iscs[0];
      index0 = ps.indexOf(i0);
      index1 = ps.indexOf(i1);
      if (firstWithFlag(ps, index0) === index1) solved = true;
    }
    if (solved) {
      dir--;
      var pgn = getPoints(ps, index0, index1);
      pgs.push(pgn);
      ps = getPoints(ps, index1, index0);
      i0.flag = i1.flag = false;
      iscs.splice(0, 2);
      if (iscs.length == 0) pgs.push(ps);
    } else {
      dir++;
      iscs.reverse();
    }
    if (dir > 1) break
  }
  var result = [];
  for (var i = 0; i < pgs.length; i++) {
    var pg = pgs[i];
    var npg = [];
    for (var j = 0; j < pg.length; j++) { npg.push(pg[j].x, pg[j].y); }
    result.push(npg);
  }
  return result
}
module.exports.Slice = Slice;

/**
 * Checks, if polygon contains [x, y].
 *
 * Works with simple polygons only.
 *
 * @param {number[]} polygon [x1, y1, x2, y2...]
 * @param {number} pointX Coordinate [x]
 * @param {number} pointY Coordinate [y]
 * @returns {boolean} depth
 */
function ContainsPoint (polygon, pointX, pointY) {
  var p = polygon;
  var px = pointX;
  var py = pointY;
  var n = p.length >> 1;
  var ax;
  var ay = p[2 * n - 3] - py;
  var bx = p[2 * n - 2] - px;
  var by = p[2 * n - 1] - py;

  // var lup = by > ay;
  for (var i = 0; i < n; i++) {
    ax = bx;
    ay = by;
    bx = p[2 * i] - px;
    by = p[2 * i + 1] - py;
    if (ay === by) continue
    var lup = by > ay;
  }

  var depth = 0;
  for (var i = 0; i < n; i++) {
    ax = bx;
    ay = by;
    bx = p[2 * i] - px;
    by = p[2 * i + 1] - py;
    if (ay < 0 && by < 0) continue  // both "up" or both "down"
    if (ay > 0 && by > 0) continue  // both "up" or both "down"
    if (ax < 0 && bx < 0) continue   // both points on the left

    if (ay === by && Math.min(ax, bx) <= 0) return true
    if (ay === by) continue

    var lx = ax + (bx - ax) * (-ay) / (by - ay);
    if (lx === 0) return true      // point on edge
    if (lx > 0) depth++;
    if (ay === 0 && lup && by > ay) depth--;  // hit vertex, both up
    if (ay === 0 && !lup && by < ay) depth--; // hit vertex, both down
    lup = by > ay;
  }
  return (depth & 1) === 1
}
module.exports.ContainsPoint = ContainsPoint;

/**
 * Finds the closest point of polygon, which lays on ray defined by [x,y] (origin) and [dx,dy] (direction).
 *
 * "dist" is the distance of the polygon point, "edge" is the number of the edge, on which intersection occurs, "norm" is the normal in that place, "refl" is reflected direction.
 *
 * Works with simple polygons only.
 *
 * @param {number[]} polygon [x1, y1, x2, y2...]
 * @param {number} originX Origin [x]
 * @param {number} originY Origin [y]
 * @param {number} directionX Direction [x]
 * @param {number} directionY Direction [y]
 * @returns {Raycast}
 * @example
 * //={dist:0, edge:0, norm:{x:0, y:0}, refl:{x:0, y:0}}
 */
function Raycast (polygon, originX, originY, directionX, directionY, isc) {
  var p = polygon;
  var x = originX;
  var y = originY;
  var dx = directionX;
  var dy = directionY;
  var l = p.length - 2;
  var empty = emptyPoints();
  var a1 = empty[0];
  var a2 = empty[1];
  var b1 = empty[2];
  var b2 = empty[3];
  var c = empty[4];
  a1.x = x;
  a1.y = y;
  a2.x = x + dx;
  a2.y = y + dy;

  if (isc === null || isc === undefined) {
    isc = {dist: 0, edge: 0, norm: {x: 0, y: 0}, refl: {x: 0, y: 0}};
  }
  isc.dist = Infinity;

  var nisc;
  for (var i = 0; i < l; i += 2) {
    b1.x = p[i];
    b1.y = p[i + 1];
    b2.x = p[i + 2];
    b2.y = p[i + 3];
    nisc = RayLineIntersection(a1, a2, b1, b2, c);
    if (nisc) {
      isc = updateISC(dx, dy, a1, b1, b2, c, i / 2, isc);
    }
  }
  b1.x = b2.x;
  b1.y = b2.y;
  b2.x = p[0];
  b2.y = p[1];
  nisc = RayLineIntersection(a1, a2, b1, b2, c);
  if (nisc) {
    isc = updateISC(dx, dy, a1, b1, b2, c, (p.length / 2) - 1, isc);
  }

  return (isc.dist !== Infinity) ? isc : null
}
module.exports.Raycast = Raycast;

/**
 * Finds the point on polygon edges, which is closest to [x,y]. Returns an object in this format
 *
 * "dist" is the distance of the polygon point, "edge" is the number of the closest edge, "point" is the closest point on that edge, "norm" is the normal from "point" to [x,y].
 *
 * @param {number[]} polygon [x1, y1, x2, y2...]
 * @param {number} x Coordinate [x]
 * @param {number} y Coordinate [y]
 * @returns {ClosestEdge}
 * @example
 * //={dist:0, edge:0, point:{x:0, y:0}, norm:{x:0, y:0}}
 */
function ClosestEdge (polygon, x, y, isc) {
  var p = polygon;
  var l = p.length - 2;
  var empty = emptyPoints();
  var a1 = empty[0];
  var b1 = empty[2];
  var b2 = empty[3];
  // var c = tp[4] // is assigned a value but never used.
  a1.x = x;
  a1.y = y;

  if (isc == null) {
    isc = {dist: 0, edge: 0, point: {x: 0, y: 0}, norm: {x: 0, y: 0}};
  }
  isc.dist = Infinity;

  for (var i = 0; i < l; i += 2) {
    b1.x = p[i];
    b1.y = p[i + 1];
    b2.x = p[i + 2];
    b2.y = p[i + 3];
    isc = pointLineDist(a1, b1, b2, i >> 1, isc);
  }
  b1.x = b2.x;
  b1.y = b2.y;
  b2.x = p[0];
  b2.y = p[1];
  isc = pointLineDist(a1, b1, b2, l >> 1, isc);

  var idst = 1 / isc.dist;
  isc.norm.x = (x - isc.point.x) * idst;
  isc.norm.y = (y - isc.point.y) * idst;
  return isc
}
module.exports.ClosestEdge = ClosestEdge;

/**
 * Reverse
 *
 * @param {number[]} polygon [x1, y1, x2, y2...]
 */
function Reverse (polygon) {
  var p = polygon;
  var np = [];
  for (var j = p.length - 2; j >= 0; j -= 2) { np.push(p[j], p[j + 1]); }
  return np
}
module.exports.Reverse = Reverse;

/**
 * Point Line Distance
 *
 * @private
 * @param {Point} p
 * @param {Point} a
 * @param {Point} b
 * @param {??} edge
 * @param {??} isc
 * @returns {??} ISC
 */
function pointLineDist (p, a, b, edge, isc) {
  var x = p.x;
  var y = p.y;
  var x1 = a.x;
  var y1 = a.y;
  var x2 = b.x;
  var y2 = b.y;

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var lenSq = C * C + D * D;
  var param = dot / lenSq;

  var xx;
  var yy;

  if (param < 0 || (x1 == x2 && y1 == y2)) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  var dst = Math.sqrt(dx * dx + dy * dy);
  if (dst < isc.dist) {
    isc.dist = dst;
    isc.edge = edge;
    isc.point.x = xx;
    isc.point.y = yy;
  }
  return isc
}

/**
 * Update ISC
 *
 * @private
 * @param {number} dx
 * @param {number} dy
 * @param {Point} a1
 * @param {Point} b1
 * @param {Point} b2
 * @param {Point} c
 * @param {??} edge
 * @param {??} isc
 * @returns {??}
 */
function updateISC (dx, dy, a1, b1, b2, c, edge, isc) {
  var nrl = distance(a1, c);
  if (nrl < isc.dist) {
    var ibl = 1 / distance(b1, b2);
    var nx = -(b2.y - b1.y) * ibl;
    var ny = (b2.x - b1.x) * ibl;
    var ddot = 2 * (dx * nx + dy * ny);
    isc.dist = nrl;
    isc.norm.x = nx;
    isc.norm.y = ny;
    isc.refl.x = -ddot * nx + dx;
    isc.refl.y = -ddot * ny + dy;
    isc.edge = edge;
  }
  return isc
}

/**
 * Get Points
 *
 * @private
 * @param {number[]} points
 * @param {number} index0
 * @param {number} index1
 * @returns {number[]} points
 */
function getPoints (points, index0, index1) {
  var n = points.length;
  var result = [];
  if (index1 < index0) index1 += n;
  for (var i = index0; i <= index1; i++) { result.push(points[i % n]); }
  return result
}

/**
 * First With Flag
 *
 * @private
 * @param {Point[]} points
 * @param {number} index
 * @returns {number}
 */
function firstWithFlag (points, index) {
  var n = points.length;
  while (true) {
    index = (index + 1) % n;
    if (points[index].flag) {
      return index
    }
  }
}

/**
 * Point in Triangle
 *
 * @private
 * @param {number} px
 * @param {number} py
 * @param {number} ax
 * @param {number} ay
 * @param {number} bx
 * @param {number} by
 * @param {number} cx
 * @param {number} cy
 * @returns {boolean}
 */
function PointInTriangle (px, py, ax, ay, bx, by, cx, cy) {
  var v0x = cx - ax;
  var v0y = cy - ay;
  var v1x = bx - ax;
  var v1y = by - ay;
  var v2x = px - ax;
  var v2y = py - ay;

  var dot00 = v0x * v0x + v0y * v0y;
  var dot01 = v0x * v1x + v0y * v1y;
  var dot02 = v0x * v2x + v0y * v2y;
  var dot11 = v1x * v1x + v1y * v1y;
  var dot12 = v1x * v2x + v1y * v2y;

  var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

  // Check if point is in triangle
  return (u >= 0) && (v >= 0) && (u + v < 1)
}

/**
 * RayLine Intersection
 *
 * @private
 * @param {Point} a1
 * @param {Point} a2
 * @param {Point} b1
 * @param {Point} b2
 * @param {Point} c
 */
function RayLineIntersection (a1, a2, b1, b2, c) {
  var dax = (a1.x - a2.x);
  var dbx = (b1.x - b2.x);
  var day = (a1.y - a2.y);
  var dby = (b1.y - b2.y);

  var Den = dax * dby - day * dbx;
  if (Den == 0) return null  // parallel

  var A = (a1.x * a2.y - a1.y * a2.x);
  var B = (b1.x * b2.y - b1.y * b2.x);

  var I = c;
  var iDen = 1 / Den;
  I.x = (A * dbx - dax * B) * iDen;
  I.y = (A * dby - day * B) * iDen;

  if (!InRectangle(I, b1, b2)) return null
  if ((day > 0 && I.y > a1.y) || (day < 0 && I.y < a1.y)) return null
  if ((dax > 0 && I.x > a1.x) || (dax < 0 && I.x < a1.x)) return null
  return I
}

/**
 * Get Line Intersection
 *
 * @private
 * @param {Point} a1
 * @param {Point} a2
 * @param {Point} b1
 * @param {Point} b2
 * @param {Point} c
 * @returns {Point}
 */
function GetLineIntersection (a1, a2, b1, b2, c) {
  var dax = (a1.x - a2.x);
  var dbx = (b1.x - b2.x);
  var day = (a1.y - a2.y);
  var dby = (b1.y - b2.y);

  var Den = dax * dby - day * dbx;

  if (Den === 0) { return null } // parallel

  var A = (a1.x * a2.y - a1.y * a2.x);
  var B = (b1.x * b2.y - b1.y * b2.x);

  var I = c;
  I.x = (A * dbx - dax * B) / Den;
  I.y = (A * dby - day * B) / Den;

  if (InRectangle(I, a1, a2) && InRectangle(I, b1, b2)) {
    return I
  }
  return null
}

/**
 * In Rectangle
 *
 * @private
 * @param {Point} a
 * @param {Point} b
 * @param {Point} c
 * @return {boolean}
 */
function InRectangle (a, b, c) {
  var minx = Math.min(b.x, c.x);
  var maxx = Math.max(b.x, c.x);
  var miny = Math.min(b.y, c.y);
  var maxy = Math.max(b.y, c.y);

  if (minx === maxx) { return (miny <= a.y && a.y <= maxy) }
  if (miny === maxy) { return (minx <= a.x && a.x <= maxx) }

  // return (minx <= a.x && a.x <= maxx && miny <= a.y && a.y <= maxy)
  return (minx <= a.x + 1e-10 && a.x - 1e-10 <= maxx && miny <= a.y + 1e-10 && a.y - 1e-10 <= maxy)
}

/**
 * Convex
 *
 * @private
 * @param {Point} ax
 * @param {Point} ay
 * @param {Point} bx
 * @param {Point} by
 * @param {Point} cx
 * @param {Point} cy
 * @returns {boolean}
 */
function convex (ax, ay, bx, by, cx, cy) {
  return (ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0
}

/**
 * Point
 *
 * @private
 * @param {number} x
 * @param {number} y
 * @returns {Point}
 */
function Point (x, y) {
  return {
    x: x,
    y: y,
    flag: false,
    toString: function () { return 'Point [' + x + ', ' + y + ']' }
  }
}

/**
 * Distance
 *
 * @private
 * @param {Point} a
 * @param {Point} b
 * @returns {number}
 */
function distance (a, b) {
  var dx = b.x - a.x;
  var dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Creates an array of empty Points
 *
 * @private
 * @param {number} [num=10] Number of points
 * @returns {Point[]}
 */
function emptyPoints (num) {
  num = num || 10;
  var container = [];
  for (var i = 0; i < num; i++) { container.push(Point(0, 0)); }
  return container
}

})));
//# sourceMappingURL=polyk.js.map
