function Trackball(center, radius) {
    this.center = center;
    this.radius = radius;
}

Trackball.prototype.rotation = function(x1, y1, x2, y2) {
    var z1 = this.calculateZ(x1, y1);
    var z2 = this.calculateZ(x2, y2);

    var V1 = normalize(vec3(x1, y1, z1));
    var V2 = normalize(vec3(x2, y2, z2));

    var N = cross(V1, V2);
    var theta = 4 * Math.acos(dot(V1, V2));

    if (N[0] == 0 && N[1] == 0 && N[2] == 0) theta = 0;

    // return a rotation matrix
    return rotationMatrix = rotate(theta, N);
}

Trackball.prototype.calculateZ = function(x, y) {
    var r = this.radius;
    var x2 = x*x, y2 = y*y, r2 = r*r;

    if (x2 + y2 <= r2/2)
        return Math.sqrt(r2 - (x2 + y2));
    else
        return (r2/2)/Math.sqrt(x2 + y2);
}