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

var canvas01 = document.getElementById("canvas01");
var renderer = new PIXI.WebGLRenderer(600, 600, {
    view: canvas01,
    //transparent: true
    antialias: true
});

var stage = new PIXI.Container();
//document.body.appendChild(renderer.view);

var graphics = new PIXI.Graphics();
stage.addChild(graphics);

var textures = d3.range(rrrmin, rrrmax + 0.1, 0.1)
    .map(function(d, i) {
        var circle = new PIXI.Graphics();
        //circle.beginFill(0xff0000);
        circle.beginFill(parseInt(color(d).substr(1), 16));
        circle.drawCircle(0, 0, d);
        circle.endFill();
        var texture = circle.generateCanvasTexture(3 * 3, PIXI.SCALE_MODES.DEFAULT);
        return texture;
    });
var rrrr = d3.scaleLinear().domain([rrrmin, rrrmax]).range([0, textures.length - 1]);

var sprites = [];
nodes.forEach(function(d, i) {
    var sprite = new PIXI.Sprite();
    var tempr = parseInt(rrrr(d.r));
    sprite.texture = textures[tempr];
    sprite.position.set(d.x, d.y);
    sprite.anchor.set(0.5);
    stage.addChild(sprite);
    sprites[i] = sprite;
});

var angle = 0;
var PI180 = Math.PI / 180;
var cos = d3.range(0, 360, 1).map(function(d, i) {
    return Math.cos(i * PI180);
});
var point02 = {
    x: 0,
    y: 0
};
var difference = {
    x: 0,
    y: 0
};
var difference01 = {
    x: 0,
    y: 0
};
var len, temp, r0, s, a;
var point01 = [];
point01[0] = {
    x: 300,
    y: 300,
    s: 1
};
point01[1] = {
    x: 200,
    y: 400,
    s: 1
};
point01[2] = {
    x: 400,
    y: 400,
    s: 1
};
point01.forEach(function(d, i) {
    var circle = new PIXI.Graphics();
    circle.beginFill(0xffffff);
    circle.drawCircle(0, 0, 10);
    circle.endFill();
    circle.beginFill(0x000000);
    circle.drawCircle(0, 0, 8);
    circle.endFill();
    circle.position.set(point01[i].x, point01[i].y);
    circle.pivot.set(0.5);
    circle.interactive = true;
    circle.buttonMode = true;
    circle
        .on('mousedown', onDragStart)
        .on('touchstart', onDragStart)
        .on('mouseup', onDragEnd)
        .on('mouseupoutside', onDragEnd)
        .on('touchend', onDragEnd)
        .on('touchendoutside', onDragEnd)
        .on('mousemove', onDragMove.bind(circle, i))
        .on('touchmove', onDragMove.bind(circle, i));
    stage.addChild(circle);
});

function onDragStart(event) {
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
}

function onDragEnd() {
    this.alpha = 1;
    this.dragging = false;
    this.data = null;
}

function onDragMove(i) {
    if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent);
        this.position.x = newPosition.x;
        this.position.y = newPosition.y;
        point01[i].x = this.position.x;
        point01[i].y = this.position.y;
    }
}

function render() {
    angle -= 10;
    angle %= 360;
    angle = angle < 0 ? angle + 360 : angle;
    graphics.clear();
    nodes.forEach(function(d, i) {
        nodes[i].a -= 10;
        nodes[i].a %= 360;
        nodes[i].a = nodes[i].a < 0 ? nodes[i].a + 360 : nodes[i].a;
        point02.x = d.x;
        point02.y = d.y;
        difference.x = 0;
        difference.y = 0;
        len = 0;
        point01.forEach(function(d, i) {
            difference01.x = point02.x - point01[i].x;
            difference01.y = point02.y - point01[i].y
            len += Math.sqrt(difference01.x * difference01.x + difference01.y * difference01.y) * point01[i].s;
            difference.x = difference.x + difference01.x * point01[i].s;
            difference.y = difference.y + difference01.y * point01[i].s;
        });
        temp = cos[parseInt((len + angle) % 360)];
        r0 = rr(temp);
        if (len != 0) {
            point02.x = r0 * difference.x / len + point02.x;
            point02.y = r0 * difference.y / len + point02.y;
        }
        var tempr = parseInt(rrrr(r0));
        sprites[i].texture = textures[tempr];
        sprites[i].position.set(point02.x, point02.y);
    });
    renderer.render(stage);
    requestAnimationFrame(render);
}

render();