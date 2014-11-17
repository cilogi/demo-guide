(function(cilogiBase) {
    cilogiBase.CRS = L.Class.extend({
        options: {
            tileSize : 256
        },
        initialize: function (options) {
            if (options) {
                L.Util.setOptions(this, options);
            }
        },
        latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
            var projectedPoint = this.projection.project(latlng),
                scale = this.scale(zoom);

            return this.transformation._transform(projectedPoint, scale);
        },

        pointToLatLng: function (point, zoom, unbounded) { // (Point, Number[, Boolean]) -> LatLng
            var scale = this.scale(zoom),
                untransformedPoint = this.transformation.untransform(point, scale);

            return this.projection.unproject(untransformedPoint, unbounded);
            //TODO get rid of 'unbounded' everywhere
        },

        project: function (latlng) {
            return this.projection.project(latlng);
        },

        scale: function (zoom) {
            return this.options.tileSize * Math.pow(2, zoom);
        }
    });

    cilogiBase.CRS.Simple = cilogiBase.CRS.extend({
        projection: L.Projection.LonLat,
        transformation: new L.Transformation(1, 0, 1, 0)
    });


    cilogiBase.CRS.CilogiSimple = cilogiBase.CRS.extend({
        projection: L.Projection.LonLat,
        transformation: new L.Transformation(1, 0, 1, 0),

        latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
            var projectedPoint = this.projection.project(latlng),
                scale = this.scale(zoom);

            var pt = this.transformation._transform(projectedPoint, scale);
            //console.log("LatLngToPoint: " + latlng + " -> " + pt);
            return new L.Point(pt.x, pt.y);
        },

        pointToLatLng: function (point, zoom, unbounded) { // (Point, Number[, Boolean]) -> LatLng
            var scale = this.scale(zoom),
                pt = new L.Point(point.x, point.y),
                untransformedPoint = this.transformation.untransform(pt, scale);

            var out =  this.projection.unproject(untransformedPoint, unbounded);
            //console.log("pointToLatLng: " + point + " -> " + out);
            return out;
        }
    });


    cilogiBase.CRS.EPSG3395 = cilogiBase.CRS.extend({
        code: 'EPSG:3395',

        projection: L.Projection.Mercator,

        transformation: (function () {
            var m = L.Projection.Mercator,
                r = m.R_MAJOR,
                r2 = m.R_MINOR;

            return new L.Transformation(0.5 / (Math.PI * r), 0.5, -0.5 / (Math.PI * r2), 0.5);
        }())
    });

    cilogiBase.CRS.EPSG3857 = cilogiBase.CRS.extend({
        code: 'EPSG:3857',

        projection: L.Projection.SphericalMercator,
        transformation: new L.Transformation(0.5 / Math.PI, 0.5, -0.5 / Math.PI, 0.5),

        project: function (latlng) { // (LatLng) -> Point
            var projectedPoint = this.projection.project(latlng),
                earthRadius = 6378137;
            return projectedPoint.multiplyBy(earthRadius);
        }
    });


    cilogiBase.CRS.EPSG4326 = cilogiBase.CRS.extend({
        code: 'EPSG:4326',

        projection: L.Projection.LonLat,
        transformation: new L.Transformation(1 / 360, 0.5, -1 / 360, 0.5)
    });

})(cilogi.L);



