/**
 * User: akravets
 * Date: 12.01.15
 * Time: 17:03
 */

var fieldSize = 400;
var size = 10;
var step = fieldSize / size;
var movementDelay = 20;
var framesInCell = 20;
var movementStep = step / framesInCell;
var gridColor = "#CC0022";
var playerColor = "#3399FF";
var enemyColor = "red";
var defaultCharacterColor = "pink";
var gridLineWidth = 0.3;
var actionPoints = 5;
var defaultHealthPoints = 30;
var attackCost = 2;
var baseDamage = 10;
var damages = {
    0: 100000000, //specially for suicide
    1: baseDamage,
    2: Math.floor(baseDamage * 0.7),
    3: Math.floor(baseDamage * 0.5),
    4: Math.floor(baseDamage * 0.33),
    5: 0
};
var good_names = ["Kent", "Jack", "Mike", "Tony", "Alex"];//yes, I'm a sexist
var bad_names = ["Ivan", "Seth", "Serg", "Igor", "Loki"];


var Utils = {
    //params are cell coordinates, not plain coordinates
    distanceCell: function (x, y, x2, y2) {
        return Math.abs(x - x2) + Math.abs(y - y2);
    },
    cell2coord: function (n) {
        return step * (n + 0.5);
    },
    coord2cell: function (n) {
        return Math.ceil(n * size / fieldSize) - 1;
    },
    getMouseCoordinates: function (evt, canvas) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    },
    safeInvoke: function (func) {
        if (typeof func !== "undefined") {
            func();
        }
    },
    insideRect: function (mc, x, y, w, h) {
        return mc.x > x && mc.x < x + w && mc.y > y && mc.y < y + h;
    },
    adjacent: function (point) {
        var result = [];
        if (point.cx > 0) {
            result.push({cx: point.cx - 1, cy: point.cy});
        }
        if (point.cx < size - 1) {
            result.push({cx: point.cx + 1, cy: point.cy});
        }
        if (point.cy > 0) {
            result.push({cx: point.cx, cy: point.cy - 1});
        }
        if (point.cy < size - 1) {
            result.push({cx: point.cx, cy: point.cy + 1});
        }
        if (point.cx > 0) {
            if (point.cy > 0) {
                result.push({cx: point.cx - 1, cy: point.cy - 1});
            }
            if (point.cy < size - 1) {
                result.push({cx: point.cx - 1, cy: point.cy + 1});
            }
        }
        if (point.cy < size - 1) {
            if (point.cx < size - 1) {
                result.push({cx: point.cx + 1, cy: point.cy - 1});
            }
            if (point.cx > 0) {
                result.push({cx: point.cx + 1, cy: point.cy + 1});
            }
        }
        return result;
    },
    nearestAdjacent: function (point, relPoint, filterCallback) {
        return this.sortByDistance(this.adjacent(point).filter(filterCallback), relPoint)[0];
    },
    sortByDistance: function (array, relPoint) {
        return array.sort(function (a, b) {
            var difference = Utils.distanceCell(relPoint.cx, relPoint.cy, a.cx, a.cy) - Utils.distanceCell(relPoint.cx, relPoint.cy, b.cx, b.cy);
            if (difference < 0) {
                return -1;
            } else if (difference > 0) {
                return 1;
            } else {
                return 0;
            }
        });
    },
    shuffle: function (array) {
        for (var k, r, a = array.length; a > 0; r = Math.floor(Math.random() * a), k = array[--a], array[a] = array[r], array[r] = k) {
        }
    },
    userLog: (function () {
        var textarea;

        return function (text) {
            if (!textarea) {
                textarea = document.getElementById("console");
                textarea.value = "";
            }
            textarea.value += text + "\n";
            textarea.scrollTop = textarea.scrollHeight;
        };
    })(),
    cellKey: function (x, y) {
        return x + '_' + y;
    },
    color: function (r, g, b, a) {
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    }
};

var OccupiedCellStorage = function () {
    var storage = {};

    function cellKey(x, y) {
        return x + '_' + y;
    }

    return {
        isOccupied: function (x, y) {
            return storage.hasOwnProperty(cellKey(x, y));
        },
        remove: function (x, y) {
            delete storage[cellKey(x, y)];
        },
        put: function (x, y, object) {
            storage[cellKey(x, y)] = object;
        },
        get: function (x, y) {
            return storage[cellKey(x, y)];
        }
    }
};

var Indicator = function (coord, increment, text, color, container) {
    this.x = Utils.cell2coord(coord.cx);
    this.y = Utils.cell2coord(coord.cy) - 10;
    var alpha = 1.0;
    var delay = 2000;
    var fade = false;
    this.draw = function (ctx) {
        ctx.save();
        ctx.font = "14px Arial Bold";
        ctx.fillStyle = Utils.color(color[0], color[1], color[2], alpha.toFixed(2));
        ctx.fillText(text, this.x, this.y);
        ctx.restore();
        this.x += increment[0];
        this.y += increment[1];
        if (fade) {
            alpha -= 0.05;
        }
    };
    var outer = this;

    function destroy() {
        var start = container.indexOf(outer);
        if (start !== -1) {
            container.splice(start, 1);
        }
    }

    function fadeCallback() {
        fade = true;
        setTimeout(function () {
            return destroy();
        }, delay * 0.34);
    }

    setTimeout(function () {
        return fadeCallback();
    }, delay * 0.66);
};

var DrawableSquareObject = function (cx, cy) {
    this.cx = cx;
    this.cy = cy;
    this.x = Utils.cell2coord(cx);
    this.y = Utils.cell2coord(cy);
    this.oldX = this.x;
    this.oldY = this.y;
    this.color = defaultCharacterColor;
    //remove this from here
    this.draw = function (ctx) {
        this.clear(ctx);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 5, this.y - 5, 10, 10);
    };
    this.clear = function (ctx) {
        ctx.clearRect(this.oldX - 9, this.oldY - 9, 18, 18);
        this.oldX = this.x;
        this.oldY = this.y;
    };
};

var Obstacle = function (x, y) {
    DrawableSquareObject.apply(this, [x, y]);
    this.color = "black";
    this.isObstacle = true;
};

var MovingObject = function (cx, cy) {
    DrawableSquareObject.apply(this, [cx, cy]);
    this.move = function (new_x, new_y, on_stop) {
        var x = Utils.cell2coord(new_x);
        var y = Utils.cell2coord(new_y);
        //temporary restrict moving to one axis
        if (!(y === this.y || x === this.x)) {
            Utils.safeInvoke(on_stop);
            return;
        }
        var step_x = (x >= this.x) ? movementStep : -movementStep;
        var step_y = (y >= this.y) ? movementStep : -movementStep;
        var outer = this;
        var callback = function () {
            if (Math.abs(x - outer.x) > movementStep || Math.abs(y - outer.y) > movementStep) {
                if (outer.x !== x) {
                    outer.x += step_x;
                }
                if (outer.y !== y) {
                    outer.y += step_y;
                }
                setTimeout(function () {
                    return callback();
                }, movementDelay);
            } else {
                console.log("stopped", outer.cx, outer.cy);
                outer.cx = new_x;
                outer.cy = new_y;
                outer.x = Utils.cell2coord(new_x);
                outer.y = Utils.cell2coord(new_y);
                Utils.safeInvoke(on_stop);
            }
        };
        setTimeout(function () {
            return callback();
        }, movementDelay);
    };

    this.follow = function (path, on_stop) {
        if (path.length === 0) {
            Utils.safeInvoke(on_stop);
            return;
        }
        var item = path.shift();
        var outer = this;
        this.move(item[0], item[1], function () {
            outer.follow(path, on_stop);
        });
    };
};

var Character = function (cx, cy, name) {
    MovingObject.apply(this, [ cx, cy]);
    this.name = name;
    this.remainingActionPoints = actionPoints;
    this.healthPoints = defaultHealthPoints;
    this.color = playerColor;
    this.attack = function (enemy) {
        console.log(this.name + " is attacking " + (this === enemy ? "himself" : enemy.name));
        //todo: start animation
        var distance = Utils.distanceCell(this.cx, this.cy, enemy.cx, enemy.cy);
        var damage = damages[distance];
        console.log(this.name + " damages " + (this === enemy ? "himself" : enemy.name) + " by " + damage + "HP");
        Utils.userLog(this.name + " damages " + (this === enemy ? "himself" : enemy.name) + " by " + damage + "HP");
        enemy.damage(damage);
        return damage;
    };
    this.damage = function (damage) {
        this.healthPoints -= damage;
    };
    this.isDead = function () {
        return this.healthPoints <= 0;
    };
    this.isEnemy = false;
};

var Enemy = function (cx, cy, name) {
    Character.apply(this, [cx, cy, name]);
    this.color = enemyColor;
    this.isEnemy = true;
};

var Scene = function (party, enemies, obstacles, queue) {
    var canvas = document.getElementById("layer2");
    var ctx = canvas.getContext("2d");
    var scene = this;
    this.intervalId = null;
    this.startRenderingLoop = function () {
        scene.intervalId = setInterval(function () {
            return scene.draw();
        }, 10);
    };
    this.stopRenderingLoop = function () {
        clearInterval(this.intervalId);
        canvas.style.cursor = "default";
    };
    this.showGameResult = function (text, stat) {//stat param is reserved for displaying game statistics
        ctx.fillStyle = "white";
        ctx.translate(0.1 * fieldSize, 0.25 * fieldSize);
        ctx.fillRect(0, 0, 0.8 * fieldSize, 0.5 * fieldSize);
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, 0.8 * fieldSize, 0.5 * fieldSize);
        ctx.fillStyle = party.length === 0 ? "red" : "green";
        ctx.font = "40px Arial";
        ctx.fillText(text, 80, 60);
    };
    this.indicators = [];
    this.tooltip = [];
    this.draw = function () {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        function draw0(item) {
            item.draw(ctx);
        }

        //characters
        party.forEach(draw0);
        enemies.forEach(draw0);
        obstacles.forEach(draw0);
        //current char highlight
        ctx.strokeStyle = "orange";
        ctx.strokeRect(queue[0].x - 7, queue[0].y - 7, 14, 14);
        ctx.strokeStyle = "black";
        this.indicators.forEach(draw0);

        //panel start
        ctx.save();
        ctx.translate(0.5, fieldSize + 5.5);
        ctx.clearRect(0, 0, fieldSize, 30);
        ctx.strokeRect(0, 0, fieldSize, 30);
        ctx.fillStyle = "black";
        ctx.font = "10px Arial";//todo: adjust
        ctx.fillText("Name: " + queue[0].name, 10, 10);
        ctx.fillText("AP: " + queue[0].remainingActionPoints, 10, 25);
        var numQueueCells = Math.min(4, queue.length);
        var shift = 100;
        for (var i = 0; i < numQueueCells; i++) {
            ctx.strokeRect(shift, 5, 30, 20);
            ctx.fillText(queue[i].name, shift + 2, 20);
            shift += 35;
        }
        ctx.strokeRect(250, 5, 140, 20);
        ctx.fillText("End turn", 300, 20);
        ctx.fillStyle = (party.indexOf(queue[0]) !== -1) ? "green" : "red";
        ctx.fillRect(40.5, 16.5, 30, 10);
        ctx.restore();
        //end panel
        //character tooltip
        if (this.tooltip.length !== 0) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            var p = this.tooltip[0];
            //modify coords if out of boundaries
            var x = p.x;
            var y = p.y - 25;
            if (y <= 0) {
                y += 25;
                if (x + 50 < fieldSize) {
                    x += 10;
                }
            }
            if (x + 50 > fieldSize) {
                x -= 50;
            }
            ctx.fillRect(x, y, 50, 25);
            ctx.strokeRect(x, y, 50, 25);
            ctx.fillStyle = "black";
            ctx.fillText(p.name, x + 2, y + 15);
            ctx.fillStyle = "orange";
            ctx.fillText(p.ap, x + 30, y + 10);
            ctx.fillStyle = "red";
            ctx.fillText(p.hp, x + 30, y + 20);
            //end character tooltip
        }
    };

    this.drawBackground = function () {
        var canvas = document.getElementById("layer1");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        for (var i = 0.5; i < fieldSize + 1; i += step) {
            ctx.moveTo(0.5, i);
            ctx.lineTo(fieldSize + 0.5, i);
            ctx.moveTo(i, 0.5);
            ctx.lineTo(i, fieldSize + 0.5);
        }
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = gridLineWidth;
        ctx.stroke();
    };
    this.drawBackground();
    ctx.scale(2, 2);
};


var PathFinder = function (sourceX, sourceY, targetX, targetY, isOccupied) {
    var Node = function (x, y, parent) {
        this.cx = x;
        this.cy = y;
        // this.distance = Utils.distanceCell(cx, cy, target.cy, target.cy);
        this.prev = parent;

        this.adjacent = function () {
            var result = [];
            if (this.cx > 0) {
                result.push(new Node(this.cx - 1, this.cy, this));
            }
            if (this.cx < size - 1) {
                result.push(new Node(this.cx + 1, this.cy, this));
            }
            if (this.cy > 0) {
                result.push(new Node(this.cx, this.cy - 1, this));
            }
            if (this.cy < size - 1) {
                result.push(new Node(this.cx, this.cy + 1, this));
            }
            return result;
        };
    };


    function findPath0() {
        var visited = {};
        var isVisited = function (x) {
            return visited.hasOwnProperty(x.cx + ' ' + x.cy)
        };
        var queue = [new Node(sourceX, sourceY, null)];
        var node = null;
        while (queue.length > 0) {
            node = queue.shift();
            visited[node.cx + ' ' + node.cy] = true;
            var adj = node.adjacent();
            for (var i = 0; i < adj.length; i++) {
                if (!isVisited(adj[i]) && !isOccupied(adj[i].cx, adj[i].cy)) {
                    queue.push(adj[i]);
                }
                visited[adj[i].cx + ' ' + adj[i].cy] = true;
            }

            if (node.cx === targetX && node.cy === targetY) {
                return node;
            }
        }
        return null;
    }

    this.fullLength = null;//undefined until first findPath() call
    this.findPath = function (actionPoints) {
        var node = findPath0();
        if (node === null) return [];
        else {
            var path = [];
            while (node.prev !== null) {
//                console.log(node.cx+" "+node.cy);
                path.unshift([node.cx, node.cy]);
                node = node.prev;
            }
            this.fullLength = path.length;
            return  path.slice(0, actionPoints);
        }
    }

};

var Game = function (numFriends, numEnemies, numObstacles) {
    if (size * size < numEnemies + numFriends + numObstacles) {
        throw "Not enough cells to contain all the people and objects";
    }
    this.party = [];
    this.enemies = [];
    //todo : do I need a separate handle to obstacles list? isn't cell2Char enough?
    this.obstacles = [];
    this.actionQueue = [];
    this.cell2character = new OccupiedCellStorage();
    this.scene = new Scene(this.party, this.enemies, this.obstacles, this.actionQueue);
    this.changeState = function (new_state) {
        this.state = new_state;
        Utils.safeInvoke(this.state.stateChanged);
    };
    this.destroyPerson = function (person) {
        this.cell2character.remove(person.cx, person.cy);
        this.actionQueue.splice(this.actionQueue.indexOf(person), 1);
        if (this.party.indexOf(person) !== -1) {
            this.party.splice(this.party.indexOf(person), 1);
        }
        if (this.enemies.indexOf(person) !== -1) {
            this.enemies.splice(this.enemies.indexOf(person), 1);
        }
    };
    var game = this;
    this.states = {
        player_turn: {
            click: function (mc) {
                var person = game.actionQueue[0];
                var x = Utils.coord2cell(mc.x);
                var y = Utils.coord2cell(mc.y);
                var distance = Utils.distanceCell(person.cx, person.cy, x, y);
                var path;
                if (game.cell2character.isOccupied(x, y)) {
                    var target = game.cell2character.get(x, y);
                    if (target.isObstacle) {
                        console.log("You can't walk through walls, buddy.");
                        Utils.userLog("You can't walk through walls, buddy.");
                        return;
                    }
                    if (person.remainingActionPoints < attackCost) {
                        console.log("Not enough AP to attack: " + person.remainingActionPoints + "/" + attackCost);
                        Utils.userLog("Not enough AP to attack: " + person.remainingActionPoints + "/" + attackCost);
                        return;
                    }
                    //todo : test for ability to attack( no obstacles, enemy in sight)
                    if (distance > 5) {
                        console.log("Too far to attack, distance is " + distance);
                        Utils.userLog("Too far to attack, distance is " + distance);
                        return;
                    }
                    person.remainingActionPoints -= attackCost;
                    var damage = person.attack(target);
                    game.scene.indicators.push(new Indicator(target, [0.02, -0.03], '-' + damage, [255, 0, 0], game.scene.indicators));
                    if (target.isDead()) {
                        console.log(person.name + " kills " + (person === target ? "himself" : target.name));
                        Utils.userLog(person.name + " kills " + (person === target ? "himself" : target.name));
                        game.destroyPerson(target);
                        if (game.enemies.length == 0) {
                            game.changeState(game.states.game_result);
                        }
                        if (person === target) {
                            game.endTurn();
                        }
                    }
                    if (person.remainingActionPoints === 0) {
                        game.endTurn();
                    }
                } else {
                    if (distance <= person.remainingActionPoints) {
                        console.log(person.name + " is moving to (" + x + "," + y + ")");
                        Utils.userLog(person.name + " is moving to (" + x + "," + y + ")");
                        game.changeState(game.states.animating);
                        var pathFinder = (new PathFinder(person.cx, person.cy, Utils.coord2cell(mc.x), Utils.coord2cell(mc.y), game.cell2character.isOccupied));
                        path = pathFinder.findPath(person.remainingActionPoints);
                        var decreaseAP;
                        if (path.length === 0) {
                            decreaseAP = 0;
                        } else {
                            decreaseAP = path.length;
                        }
                        person.remainingActionPoints -= decreaseAP;
                        game.cell2character.remove(person.cx, person.cy);
                        person.follow(path, function () {
                            game.cell2character.put(person.cx, person.cy, person);
                            game.changeState(game.states.player_turn);
                            if (person.remainingActionPoints === 0) {
                                game.endTurn();
                            }
                        });

                    } else {
                        console.log("Not enough AP: " + person.remainingActionPoints + "/" + distance);
                        Utils.userLog("Not enough AP: " + person.remainingActionPoints + "/" + distance);
                    }
                }
            },
            endTurn: function () {
                console.log(game.actionQueue[0].name + "'s turn ended");
                Utils.userLog(game.actionQueue[0].name + "'s turn ended");
                game.actionQueue[0].remainingActionPoints = actionPoints;
                game.actionQueue.push(game.actionQueue.shift());
                var new_state = !game.isEnemyActive() ? game.states.player_turn : game.states.enemy_turn;
                game.changeState(new_state);
            }
        },
        enemy_turn: {
            stateChanged: function () {
                var person = game.actionQueue[0];
                console.log("Enemy " + person.name + " is making his move");
                Utils.userLog("Enemy " + person.name + " is making his move");

                function onStop() {
                    person.remainingActionPoints = actionPoints;
                    game.actionQueue.push(game.actionQueue.shift());
                    game.cell2character.put(person.cx, person.cy, person);
                    var new_state = !game.isEnemyActive() ? game.states.player_turn : game.states.enemy_turn;
                    game.changeState(new_state);
                    console.log(person.name + "'s turn ended");
                    Utils.userLog(person.name + "'s turn ended");
                }

                function attackContinuously() {
                    while (person.remainingActionPoints >= attackCost) {
                        person.remainingActionPoints -= attackCost;
                        var damage = person.attack(nearestChar);
                        game.scene.indicators.push(new Indicator(nearestChar, [0.02, -0.03], '-' + damage, [255, 0, 0], game.scene.indicators));
                        if (nearestChar.isDead()) {
                            console.log(person.name + " kills " + nearestChar.name);
                            Utils.userLog(person.name + " kills " + nearestChar.name);
                            game.destroyPerson(nearestChar);
                            if (game.party.length === 0) {
                                game.changeState(game.states.game_result);
                                return;
                            }
                            break;
                        }
                        //todo: at this point we might have AP left, should we utilize them or just ignore?
                    }
                    Utils.safeInvoke(onStop);
                }

                var sortedChars = Utils.sortByDistance(game.party, person);
                var nearestChar = sortedChars[0];
                if (Utils.distanceCell(person.cx, person.cy, nearestChar.cx, nearestChar.cy) === 1) {
                    attackContinuously();
                    return;
                }
                console.log("nearest character to " + person.name + " is " + nearestChar.name);
                //todo: ensure that this returns anything at all!
                var nearestCell = Utils.nearestAdjacent(nearestChar, person, function (item) {
                    //remove all occupied cells
                    return !game.cell2character.isOccupied(item.cx, item.cy);
                });
                var distance = Utils.distanceCell(person.cx, person.cy, nearestCell.cx, nearestCell.cy);
                var path;
                var decreaseAP;
                if (distance > person.remainingActionPoints) {//no AP to attack
                    //just go in player's direction
                    console.log("Enemy " + person.name + " is moving towards " + nearestChar.name);
                    Utils.userLog("Enemy " + person.name + " is moving towards " + nearestChar.name);
                    path = (new PathFinder(person.cx, person.cy, nearestCell.cx, nearestCell.cy, game.cell2character.isOccupied)).findPath(person.remainingActionPoints);
                    if (path.length === 0) {
                        decreaseAP = 0;
                    } else {
                        decreaseAP = Utils.distanceCell(Utils.coord2cell(person.x), Utils.coord2cell(person.y), path[path.length - 1][0], path[path.length - 1][1]);
                    }
                    person.remainingActionPoints -= decreaseAP;
                    game.cell2character.remove(person.cx, person.cy);
                    person.follow(path, onStop);
                } else {
                    //shoot or get a little closer and shoot
                    path = (new PathFinder(person.cx, person.cy, nearestCell.cx, nearestCell.cy, game.cell2character.isOccupied)).findPath(person.remainingActionPoints - attackCost);
                    //reducing by AP spent during following path
                    if (path.length === 0) {
                        decreaseAP = 0;
                    } else {
                        decreaseAP = Utils.distanceCell(Utils.coord2cell(person.x), Utils.coord2cell(person.y), path[path.length - 1][0], path[path.length - 1][1]);
                    }
                    person.remainingActionPoints -= decreaseAP;
                    game.cell2character.remove(person.cx, person.cy);
                    person.follow(path, function () {
                            //fire while has AP
                            attackContinuously();
                        }
                    );
                }
            }
        },
        game_result: {
            click: function () {
                console.log("game result, click ignored just for now");
            },
            stateChanged: function () {
                console.log("state changed to game_result");
                var text = game.party.length > game.enemies.length ? "You win!" : "You lose!";
                Utils.userLog(text);
                game.scene.stopRenderingLoop();
                canvas.removeEventListener("mousemove", game.moveListener);
                game.scene.showGameResult(text, {});//todo: add here game statistics
            }
        },
        animating: {}
    };

    this.endTurn = function () {
        //can end turn only if player's character is first in actionQueue
        if (!this.isEnemyActive()) {
            Utils.safeInvoke(this.state.endTurn);
        }
    };
    this.isEnemyActive = function () {
        return this.party.indexOf(this.actionQueue[0]) === -1;
    };
    this.click = function (mc) {
        if (Utils.insideRect(mc, 0, 0, fieldSize, fieldSize)) {
            console.log("clicked cell", Utils.coord2cell(mc.x), Utils.coord2cell(mc.y));
            if (typeof game.state.click !== "undefined") {
                game.state.click(mc);
            }
            //todo: put numbers into some constant or resource
        } else if (Utils.insideRect(mc, 250.5, fieldSize + 10.5, 140.5, fieldSize + 25.5)) {
            console.log("clicked end turn button");
            game.endTurn();
        } else {
            console.log("clicked outside field", mc.x, mc.y);
        }
    };

    var canvas = document.getElementById("layer2");
    this.init = function () {
        console.log("Initializing game");
        Utils.userLog("Initializing game");
        //todo: test data
        //todo: 3 persons in field
//        var jack = new Character(ctx, 2, 2, "Good");
//        var bad1 = new Enemy(ctx, 2, 7, "Bad");
//        var bad2 = new Enemy(ctx, 2, 5, "Bad");
//        game.party.push(jack);
//        game.enemies.push(bad1, bad2);
//        game.actionQueue.push(bad1, jack, bad2);
//        game.cell2character.put(jack.cx, jack.cy, jack);
//        game.cell2character.put(bad1.cx, bad1.cy, bad1);
//        game.cell2character.put(bad2.cx, bad2.cy, bad2);
        //todo: two persons in field
//        var jack = new Character(2, 2, "Good");
//        var bad1 = new Enemy(2, 3, "Bad");

//        game.party.push(jack);
//        game.enemies.push(bad1);
//        game.actionQueue.push(bad1, jack);
//        game.cell2character.put(jack.cx, jack.cy, jack);
//        game.cell2character.put(bad1.cx, bad1.cy, bad1);

        //todo: test data
        var x, y;

        function generateFreePoint() {
            do {
                x = Math.floor(Math.random() * size);
                y = Math.floor(Math.random() * size);
            } while (game.cell2character.isOccupied(x, y));
            return {cx: x, cy: y};
        }

        var point;
        for (var i = 0; i < numFriends; i++) {
            point = generateFreePoint();
            var character = new Character(point.cx, point.cy, good_names[i]);
            game.party.push(character);
            game.actionQueue.push(character);
            game.cell2character.put(point.cx, point.cy, character);
        }
        for (var j = 0; j < numEnemies; j++) {
            point = generateFreePoint();
            var enemy = new Enemy(point.cx, point.cy, bad_names[j]);
            game.enemies.push(enemy);
            game.actionQueue.push(enemy);
            game.cell2character.put(point.cx, point.cy, enemy);
        }
        for (var k = 0; k < numObstacles; k++) {
            point = generateFreePoint();
            var obstacle = new Obstacle(point.cx, point.cy);
            game.obstacles.push(obstacle);
            game.cell2character.put(point.cx, point.cy, obstacle);
        }
        Utils.shuffle(game.actionQueue);
        this.initListeners();
        this.scene.startRenderingLoop();
        var person = game.actionQueue[0];
        switch (person.isEnemy) {
            case true:
                game.changeState(game.states.enemy_turn);
                break;
            case false:
                game.changeState(game.states.player_turn);
                break;
            default :
                console.error("Unexpected person in action queue");
                break;
        }
    };
    //have to disable listeners on win, need a handle
    this.moveListener = function (evt) {
        var mc = Utils.getMouseCoordinates(evt, canvas);
        var x = Utils.coord2cell(mc.x);
        var y = Utils.coord2cell(mc.y);
        if (Utils.insideRect(mc, 0, 0, fieldSize, fieldSize)) {
            if (game.cell2character.isOccupied(x, y) && !game.cell2character.get(x, y).isObstacle) {
                game.scene.tooltip = [
                    {
                        x: mc.x,
                        y: mc.y,
                        name: game.cell2character.get(x, y).name,
                        ap: game.cell2character.get(x, y).remainingActionPoints,
                        hp: game.cell2character.get(x, y).healthPoints
                    }
                ];
            } else {
                game.scene.tooltip = [];
            }
            var person = game.actionQueue[0];
            var distance = Utils.distanceCell(x, y, person.cx, person.cy);
            //cell is occupied
            if (game.cell2character.isOccupied(x, y)) {
                //by obstacle
                if (game.cell2character.get(x, y).isObstacle) {
                    canvas.style.cursor = "not-allowed";
                    //by enemy
                } else if (distance <= 5 && person.remainingActionPoints >= attackCost) {
                    canvas.style.cursor = "crosshair";
                } else {
                    canvas.style.cursor = "not-allowed";
                }
                //can't move that far
            } else if (distance > person.remainingActionPoints) {
                canvas.style.cursor = "not-allowed";
            } else {
                canvas.style.cursor = "default";
            }
        } else {
            canvas.style.cursor = "default";
        }
    };

    this.initListeners = function () {
        canvas.addEventListener("click", function (evt) {
            var mc = Utils.getMouseCoordinates(evt, canvas);
            game.click(mc);
        }, false);
        canvas.addEventListener("mousemove", game.moveListener);
        canvas.addEventListener("mouseleave", function () {
            game.scene.tooltip = [];
        });

    };

    this.init();
};

function initialize() {
    new Game(5, 5, 10);
}


window.onload = function () {
    return initialize();
};
