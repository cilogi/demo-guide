/*
 Copyright (c) 2011 Tim Niblett

 File:	 ciligiannotatedimage.js  (28/03/11).
 Author: Tim Niblett
 */

(function($) {
    var cilogiID = 0;

    // The only pollution to the global namespace.
    $.fn.cilogiannim =  function(options) {
        var opt = $.extend({
                minZoomLevel: -10,
                nZoomLevels: 5,
                heightLoss : 60, 
                timeThreshold: 1000,
                distanceThreshold: 10,
                logging: true,
                points: [],
                selected: null
             }, options||{});

        function hasGestures() {
            return typeof(document.ongesturestart) != "undefined";
        };

        function log(a){
            if(opt.logging && (typeof console !== 'undefined')) {
                console.log(Array.prototype.slice.call(arguments, 0));
            }
        }

        return this.each(function() {
            var scale, initialScale, minimumScale,
                width, height, // current width and height of the image
                top = 0, left = 0,
                dragState,
                img = $(this),
                myID = "" + cilogiID++,
                currentZoomLevel = 0,
                canvasID,
                pointState = drawState(opt.points);

            function initSettings() {
                var iw, ih, fit;

                opt.imageWidth = img.attr("width");
                opt.imageHeight = img.attr("height");
                if (!(opt.imageWidth && opt.imageHeight)) {
                    throw { name : "dimensions", message: "You have to set the width and height attributes"};
                }
                opt.viewWidth = opt.viewWidth || opt.imageWidth;
                opt.viewHeight = opt.viewHeight || opt.imageHeight;

                // try to fit so that the entire image fits in the window.
                fit = Math.min(opt.imageWidth/opt.viewWidth, opt.imageHeight/opt.viewHeight);
                initialScale = Math.min(1.0/fit, 1);
                minimumScale = Math.min(opt.viewWidth/opt.imageWidth, opt.viewHeight/opt.imageHeight, 1);

                iw = initialScale * opt.imageWidth;
                ih = initialScale * opt.imageHeight;

                left = (iw < opt.viewWidth) ? (opt.viewWidth - iw)/2.0 : 0;
                top = (ih < opt.viewHeight) ? (opt.viewHeight - ih)/2.0 : 0;

                //scale = Math.min(opt.viewWidth/opt.imageWidth, opt.viewHeight/opt.imageHeight);
                scale = 1.0/fit;
                applyScale(scale);
            }

            function setSelected(id) {
                opt.selected = id;
                updateView();
            }

            function minScale() {
                return Math.max(minimumScale * 0.25, minimumScale * (1 + 0.1 * opt.minZoomLevel));
            }

            function zoomLevelToScale(zoomLevel) {
                if (zoomLevel >= 0) {
                    var clip = Math.min(Math.max(zoomLevel,  0), opt.nZoomLevels);
                    var percent = clip/opt.nZoomLevels;
                    return (1-percent) * initialScale + percent;
                } else {
                    return Math.max(initialScale * 0.25, initialScale * (1 + 0.1 * zoomLevel)); }
            }

            function applyScale(newScale) {
                var oldScale = scale;
                var oldCenter = currentImageCenter();

                scale = newScale;
                width = opt.imageWidth * scale;
                height = opt.imageHeight * scale;

                var newCenter = newImageCenter(newScale, oldScale, oldCenter);

                top = newCenter[1] - height/2;
                left = newCenter[0] - width/2;
            }

            function viewCenter() {
                return [opt.viewWidth/2, opt.viewHeight/2];
            }

            function currentImageCenter() {
                var iw = scale * opt.imageWidth;
                var ih = scale * opt.imageHeight;
                return [left + iw/2, top + ih/2];
            }

            function newImageCenter(newScale, currentScale, currentCenter) {
                var currentScaleDiff = currentScale - initialScale;
                var newScaleDiff = newScale - initialScale;
                var initialCenter = viewCenter();
                var currentCenterDiff = [currentCenter[0] - initialCenter[0], currentCenter[1] - initialCenter[1]];
                var s = (currentScaleDiff == 0) ? 0 : newScaleDiff/currentScaleDiff;
                return [initialCenter[0] + s * currentCenterDiff[0], initialCenter[1] + s * currentCenterDiff[1]];
            }

            function dragLimits() {
                var bot = top + scale * opt.imageHeight,
                    rt = left + scale * opt.imageWidth,
                    base = [opt.viewWidth - rt, -left, opt.viewHeight - bot, -top];
                if (left > 0  && rt < opt.viewWidth) {
                    base[0] = base[1] = 0;
                }
                if (top > 0 && bot < opt.viewHeight) {
                    base[2] = base[3] = 0;
                }
                return base;
            }

            function computeScaleAdjust(suggest, want) {
                var ratio = (suggest > want) ? suggest/want : want/suggest;
                var lg = Math.log(ratio);
                return  (suggest > want) ?  want * (1+0.2*lg)  : want /(1 + 0.2*lg);
            }

            function initDragState(pos, theScale) {
                var p = {
                    "startX" : pos[0], "startY": pos[1], "startTop": top, "startLeft": left,
                    "wantTop": top, "wantLeft": left, "wantScale": 1, "initialScale": theScale,
                    "limits": dragLimits(), "startTime": new Date().getTime(), "move": doMove, "scale": doScale,
                    "prevX" : pos[0], "prevY": pos[1]
                };

                function sgn(value) {
                    return (value < 0) ? -1 : 1;
                }

                function doMove(pos, callback) {
                    var fudge = 62,
                        diffX = pos[0] - p.startX,
                        diffY = pos[1] - p.startY,
                        xd = Math.min(Math.max(diffX, p.limits[0]), p.limits[1]),
                        yd = Math.min(Math.max(diffY, p.limits[2]-fudge), p.limits[3]+fudge),
                        gapX = diffX - xd,
                        gapY = diffY - yd,
                        appliedX = sgn(gapX) * Math.sqrt(Math.abs(gapX)),
                        appliedY = sgn(gapY) * Math.sqrt(Math.abs(gapY));

                    p.prevX = pos[0];
                    p.prevY = pos[1];

                    p.wantTop = p.startTop + yd;
                    p.wantLeft = p.startLeft + xd;

                    if (appliedX +yd != 0 || appliedY + yd != 0) {
                        top = p.startTop + appliedY + yd;
                        left = p.startLeft + appliedX + xd;
                        callback();
                    }
                }

                function doScale(eventScale, callback) {
                    var suggestedScale = eventScale * p.initialScale;
                    p.wantScale = Math.min(1, Math.max(minScale(), suggestedScale));
                    var toApply = computeScaleAdjust(suggestedScale, p.wantScale);
                    //log("init " + p.initialScale + " sugg " + suggestedScale + " eventscale " + eventScale + " scale " + scale + " want " + p.wantScale + " apply " + toApply);
                    applyScale(toApply);
                    callback();
                }

                return p;
            }

            // Create a unique ID within the image covered by function.
            function unique(id) {
                return id +  myID;
            }

            // We start with a div which should contain an image.
            function buildDOM() {
                var outerdiv = '<div class="cilogi-zoom" />';
                img.wrap(outerdiv);
                canvasID = unique("canvas");
                var toAdd = '<canvas class="anim-canvas" id="'+canvasID+'"></canvas>';
                img.parent().append(toAdd);
                img.hide();
                if (!hasGestures) {
                    // add buttons for zooming whn we don't have pinch zoom
                    var plus = '<a id="'+unique("plus-scale")+'" href="#" data-role="button" data-icon="plus" ' +
                                  'class="zoom-plus" data-iconpos="notext">Larger</a>';
                    var minus = '<a id="'+unique("minus-scale")+'" href="#" data-role="button" data-icon="minus" ' +
                                  'class="zoom-minus" data-iconpos="notext">Smaller</a>';
                    $("#"+canvasID).parent().append(plus).append(minus).trigger("create");
                }
            }

            function updateView() {
                var canvas = $("#"+canvasID);
                var can = canvas.get(0);
                var im = img.get(0);
                canvas.attr("width", opt.viewWidth);
                canvas.attr("height", opt.viewHeight);

                var ctx = can.getContext("2d");
                ctx.clearRect(0, 0, opt.viewWidth, opt.viewHeight);
                //log("top " + top + " left " + left + " scale " + scale + " w " + opt.imageWidth + " h " + opt.imageHeight);
                ctx.save();
                ctx.translate(left, top);
                ctx.scale(scale, scale);
                ctx.drawImage(im, 0, 0, opt.imageWidth, opt.imageHeight);
                ctx.restore();
                pointState.draw(ctx);
            }

            function bindTouchEvents() {
                var canvas = $("#" + canvasID);
                var handlers = {
                    "touchstart": touchstart, "touchmove" : touchmove, "touchend" : touchend,
                    "gesturestart": gesturestart, "gesturechange": gesturechange, "gestureend": gestureend,
                    "mousedown": touchstart, "mousemove": touchmove,
                    "mouseup": touchend, "mouseleave": touchend, "mouseout": touchend
                };
                function add(names) {
                    var i, len;
                    for (i = 0, len = names.length; i < len; i++) {
                        canvas.bind(names[i], handlers[names[i]]);
                    }
                }
                function remove(names) {
                    var i, len;
                    for ( i = 0, len = names.length; i < len; i++) {
                        canvas.unbind(names[i], handlers[names[i]]);
                    }
                }
                function isTouch(event) {
                    var type = event.type;
                    return type == "touchstart" || type == "touchmove" || type == "touchend";
                }
                
                function isNavbarToggleOK(pos) {
                    if (dragState) {
                        var time = new Date().getTime() - dragState.startTime;
                        var diffX = pos[0] - dragState.startX;
                        var diffY = pos[1] - dragState.startY;
                        var distance = Math.sqrt(diffX * diffX + diffY * diffY);
                        return time < opt.timeThreshold && distance < opt.distanceThreshold;
                    } else {
                        return false;
                    }
                }

                function pos(event) {
                    var offset = $(event.target).offset(),
                        top = offset.top,
                        left = offset.left,
                        originalEvent;
                    if (isTouch(event)) {
                        originalEvent = event.originalEvent;
                        return [originalEvent.touches[0].pageX-left, originalEvent.touches[0].pageY-top];
                    } else {
                        //log("pos " + (event.pageX-left) + "," + (event.pageY-top));
                        return [event.pageX-left, event.pageY-top];
                    }
                }

                function touchstart(ev) {
                    dragState = initDragState(pos(ev), scale);
                    add(["touchmove", "touchend"]);
                    ev.preventDefault();
                }

                function touchmove(ev) {
                    if (dragState) {
                        dragState.move(pos(ev), updateView);
                        ev.preventDefault();
                    }
                }

                function touchend(e) {
                    if (dragState) {
                        var toggle = isNavbarToggleOK([dragState.prevX, dragState.prevY]);
                        top = dragState.wantTop;
                        left = dragState.wantLeft;
                        updateView();
                        if (toggle) {
                            toggle = tap(dragState.startX,  dragState.startY);
                        }
                        dragState = null;
                        remove(["touchmove", "touchend"]);
                        return toggle;
                    }
                }

                function gesturestart(e) {
                    dragState = initDragState([0, 0], scale);
                    remove(["touchstart", "touchmove", "touchend"]);
                    add(["gesturechange", "gestureend"]);
                    return false;
                }

                function gesturechange(ev) {
                    dragState.scale(ev.originalEvent.scale, updateView);
                    return false;
                }

                function gestureend(e) {
                    applyScale(dragState.wantScale);
                    updateView();
                    dragState = null;
                    remove(["gesturechange", "gestureend"]);
                    add(["touchstart"]);
                    return false;
                }

                function tap(xTap, yTap) {
                    var RADIUS = 24,
                        canvas = $("#"+canvasID),
                        can = canvas.get(0),
                        xRaw = xTap,// - can.offsetLeft,
                        yRaw = yTap,// - can.offsetTop,
                        x = (xRaw - left)/scale,
                        y = (yRaw - top)/scale,
                        minDist = Infinity,
                        tgt = undefined,
                        id, pr, dist, msg, i, len;

                    for (i= 0, len = opt.points.length; i < len; i++) {
                        pt = opt.points[i];
                        dist = Math.sqrt((pt.x - x) * (pt.x - x) + (pt.y - y) * (pt.y - y));
                        //log("dist " + pt.id  + " = " + dist);
                        if (dist < minDist) {
                            minDist = dist;
                            tgt = pt;
                        }
                    }
                    if (tgt && minDist < RADIUS) {
                        pt = tgt;
                        if (pt.path && pt.path.substr(-1) !== "#") {
                            $.mobile.changePage(pt.path);
                        } else {
                            msg = pt.describe;
                            jqmSimpleMessage(msg);
                        }
                        return false;
                    } else {
                        return (minDist < RADIUS) ? false : true;
                    }
                }

                add(["touchstart", "gesturestart"]);
                add(["mousedown", "mousemove", "mouseup", "mouseleave", "mouseout"]);
            }

            function bindZoom() {
                $('#'+unique('plus-scale')).bind('click', function(e) {
                    e.preventDefault();
                    update(currentZoomLevel+1);

                });
                $('#'+unique('minus-scale')).bind('click', function(e) {
                    e.preventDefault();
                    update(currentZoomLevel - 1);
                });
                function update(newSlide) {
                    if (newSlide >= opt.minZoomLevel && newSlide <= opt.nZoomLevels) {
                        currentZoomLevel = newSlide;
                        var newScale = zoomLevelToScale(newSlide);
                        applyScale(newScale);
                        updateView();
                    }
                }
            }

            function jqmSimpleMessage(message) {
                $("<div class='ui-loader ui-overlay-shadow ui-body-b ui-corner-all'><h1>" + message + "</h1></div>")
                    .css({
                        display: "block",
                        opacity: 0.96,
                        top: window.pageYOffset+100
                    })
                    .appendTo("body").delay(800)
                    .fadeOut(2000, function(){
                        $(this).remove();
                    });
            }

            function transform(pt) {
                return [scale * pt.x + left, scale*pt.y + top];
            }


            function drawState(points) {
                var icons = {};

                function fillStyle(pt) {
                    var alpha = (opt.selected == null || opt.selected == pt.id) ? 1 : 0.25;
                    return pt.path ? "rgba(0,0,200,"+alpha+")" : "rgba(200,0,0,"+alpha+")"
                }

                function draw(ctx) {
                    var sz = fontsize(),
                        radius = sz * 0.75,  // capsule is 1.5 times text height
                        id, pt, xy, width, i, len;

                    ctx.font = "bold "+sz+"pt Arial";
                    ctx.textBaseline = "middle";

                    for (i = 0, len = points.length; i < len; i++) {
                        pt = points[i];
                        xy = transform(pt);
                        id = pt.id;
                        if (pt.icon) {
                            drawIcon(ctx, xy, id, pt.icon);
                        } else if (!pt.id) {
                            ctx.fillStyle = fillStyle(pt);
                            ctx.beginPath();
                            ctx.arc(xy[0], xy[1], radius, 0, 2 * Math.PI, true);
                            ctx.closePath();
                            ctx.fill();
                        } else {
                            width = ctx.measureText(id).width;
                            ctx.fillStyle = fillStyle(pt);
                            ctx.beginPath();
                            //ctx.arc(xy[0], xy[1], radius, 0, 2 * Math.PI, true);
                            ctx.arc(xy[0]+width/2-sz/3, xy[1], radius, -Math.PI/2, Math.PI/2);
                            ctx.arc(xy[0]-width/2+sz/3, xy[1], radius, Math.PI/2, 1.5 * Math.PI);
                            ctx.closePath();
                            ctx.fill();

                            ctx.fillStyle="white";
                            ctx.strokeStyle="white";
                            ctx.fillText(id, xy[0] - width/2, xy[1]);
                        }

                    }
                }
                function drawIcon(ctx, xy, id, url) {
                    var SZ = Math.round(Math.max(12, Math.round(30 * scale)));
                    //log("draw xy " + xy[0] + "," + xy[1] + " sz " + SZ/2 + " scale " + scale);
                    var iconImage = undefined;
                    var loading = true;
                    if (icons[id]) {
                        iconImage = icons[id];
                        loading = false;
                        ctx.drawImage(iconImage, xy[0]-SZ/2, xy[1]-SZ/2, SZ, SZ);
                    } else {
                        iconImage = new Image();
                        iconImage.src = url;
                        icons[id] = iconImage;
                        iconImage.onload = function() {
                            ctx.drawImage(iconImage, xy[0]-SZ/2, xy[1]-SZ/2, SZ, SZ);
                        }
                    }
                    //log("x " + xy[0]  + " y " + xy[1] + " SZ " + SZ + " scale " + scale)
                }

                function fontsize() {
                    var sz = Math.max(10, Math.round(16 * scale));
                    return sz;
                }
                return {
                    draw: draw
                };
            }

            function resize(viewWidth, viewHeight) {
                opt.viewWidth = viewWidth;
                opt.viewHeight = viewHeight;
                initSettings();
                updateView();
            }

            function resetOrientation(orientation) {
                var sh = $(window).height();//screen.height;
                var sw = $(window).width();//screen.width;
                var min = Math.min(sw, sh);
                var max = Math.max(sw, sh);
                var width, height;
                if (orientation == 0 || orientation == 180) {
                    width = min;
                    height = max - heightLoss;
                } else {
                    width = max;
                    height = min - heightLoss;
                }
                if (window.console) {
                    log("orient " + orientation + " width " + width + " height " + height);
                }
                return {viewWidth:sw, viewHeight:sh};
            }

            function findPoint(id) {
                var point, i, len;
                for (i = 0, len = opt.points.length; i < len; i++) {
                    point = opt.points[i];
                    if (point.id == id) {
                        return point;
                    }
                }
                return null;
            }

            function center(id) {
                if (id != null) {
                    var loc = transform(findPoint(id)),
                        center = viewCenter(),
                        drawState = initDragState(loc, scale);
                    drawState.move(center, updateView);
                }  else {
                    updateView();
                }
            }

            // Setup

            initSettings();
            buildDOM();
            center(opt.selected, updateView);

            bindTouchEvents();
            //bindMouseEvents();
            bindZoom();

            $(this).bind("select", function(e, data) {
                if (data.id) {
                    setSelected(id);
                }
            });

            $(img).bind("orientationchange", function(e) {
                var wh,
                    orientation = window.orientation || 0;
                if (opt.orientation) {
                    wh = opt.orientation(orientation);
                } else {
                    wh = resetOrientation(orientation);
                }
                resize(wh.viewWidth, wh.viewHeight);
            });

        });
    };

})(jQuery);
