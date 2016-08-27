var Point = function(pX, pY) {
    this.x = pX || 0;
    this.y = pY || 0;
    this.set = function(pX, pY) {
        this.x = pX;
        this.y = pY;
    };
    this.add = function(pP) {
        return new Point(this.x + pP.x, this.y + pP.y);
    };
    this.sub = function(pP) {
        return new Point(this.x - pP.x, this.y - pP.y);
    };
    this.mul = function(pV) {
        return new Point(this.x * pV, this.y * pV);
    };
    this.div = function(pV) {
        return new Point(this.x / pV, this.y / pV);
    };
    this.len = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    this.clone = function() {
        return new Point(this.x, this.y);
    };
};

var nx = 50;
var ny = 50;
var xx = d3.scaleLinear().domain([0, nx - 1]).range([0, 600]);
var yy = d3.scaleLinear().domain([0, ny - 1]).range([0, 600]);
var rrrmin = 3;
var rrrmax = 6;
var nodes = d3.range(0, nx * ny, 1)
    .map(function(d, i) {
        var obj = {
            x: xx(i % nx),
            y: yy(parseInt(i / nx)),
            r: rrrmax
        };
        return obj;
    });


var color = d3.scaleSequential().domain([rrrmin, rrrmax]).interpolator(d3.interpolatePlasma);
var rr = d3.scaleLinear().domain([-1, 1]).range([rrrmin, rrrmax]);

d3.select("#canvas01")
    .style('position', 'relative')
    .style('display', 'block')
    .style('width', '600px')
    .style('height', '600px')
/*.on('mousemove', function() {
        var point = d3.mouse(this);
        point01[0].x=point[0];
        point01[0].y=point[1];
    })
    .on('mouseover', function() {
        point01[0].s=1;
    })
    .on('mouseout', function() {
        point01[0].s=0;
    })*/
var canvas01 = document.getElementById("canvas01");
var renderer = new PIXI.WebGLRenderer(600, 600, {
    view: canvas01
});

var gl = renderer.view.getContext('webgl');
gl.getContextAttributes().antialias;

var stage = new PIXI.Container();
//document.body.appendChild(renderer.view);

var graphics = new PIXI.Graphics();
stage.addChild(graphics); // 要將 Graphics 物件加到 Stage 中

var textures = d3.range(rrrmin, rrrmax + 0.1, 0.1)
    .map(function(d, i) {
        var circle = new PIXI.Graphics();
        //circle.beginFill(0xff0000);
        circle.beginFill(parseInt(color(d).substr(1), 16));
        circle.drawCircle(0, 0, d);
        var texture = circle.generateCanvasTexture(3 * 3, PIXI.SCALE_MODES.DEFAULT);
        return texture;
    });
var rrrr = d3.scaleLinear().domain([rrrmin, rrrmax]).range([0, textures.length - 1]);

var sprites = [];
nodes.forEach(function(d, i) {
    var sprite = new PIXI.Sprite();
    var tempr = parseInt(rrrr(d.r));
    sprite.texture = textures[tempr];
    sprite.x = d.x - d.r;
    sprite.y = d.y - d.r;
    stage.addChild(sprite);
    sprites[i] = sprite;
});

var angle = 0;
var PI180 = Math.PI / 180;
var cos = d3.range(0, 360, 1).map(function(d, i) {
    return Math.cos(i * PI180);
});
var point02 = new Point();
var difference = new Point();
var difference01 = new Point();
var len, temp, r0, s, a;
var point01 = [];
point01[0] = {
    x: 300,
    y: 300,
    s: 1
};
d3.select("#Box01")
    .style('left', point01[0].x - $("#Box01").width() / 2 + 'px')
    .style('top', point01[0].y - $("#Box01").height() / 2 + 'px')
$("#Box01").draggable({
    cursor: "move",
    drag: function(e) {
        var offset = $(this).offset()
        point01[0].x = offset.left + $("#Box01").width() / 2;
        point01[0].y = offset.top + $("#Box01").height() / 2;
    },
});

function render() {
    angle -= 10;
    angle %= 360;
    angle = angle < 0 ? angle + 360 : angle;
    graphics.clear();
    nodes.forEach(function(d, i) {
        nodes[i].a -= 10;
        nodes[i].a %= 360;
        nodes[i].a = nodes[i].a < 0 ? nodes[i].a + 360 : nodes[i].a;
        point02.set(d.x, d.y);
        difference.set(0, 0);
        len = 0;
        point01.forEach(function(d, i) {
            difference01.set(point02.x - point01[i].x, point02.y - point01[i].y);
            len += difference01.len() * point01[i].s;
            difference.set(difference.x + difference01.x * point01[i].s, difference.y + difference01.y * point01[i].s);
        });
        temp = cos[parseInt((len + angle) % 360)];
        r0 = rr(temp);
        if (len != 0) {
            point02.set(r0 * difference.x / len + point02.x, r0 * difference.y / len + point02.y)
        }
        var tempr = parseInt(rrrr(r0));
        sprites[i].texture = textures[tempr];
        sprites[i].x = point02.x - r0;
        sprites[i].y = point02.y - r0;
    });
    renderer.render(stage);
    requestAnimationFrame(render);
}

render();