$(function () {
		
  (function () {

	var theBoard = {
			$theBoard : $('#theBoard'),
			$tile : $('<div class="tile"></div>'),
			width : 9,
			height : 9,
			tileSize : 50,
			posOffset : 0.8,
			theTiles : [],
			maxNumber : 9,
			tileCount : 1,
			numberChars : ['0','1','2','3','4','5','6','7','8','9','0','1','2','3','4','5','6','7','8','9'],
			operatorChars : ['*','+','+','-','-','=','=','='],
			trackStart : 'mousedown touchstart',
			trackEnter : 'mouseenter touchenter',
			trackEnd : 'mouseup touchend',
			trail : [],
			empty : [],
			score : 0,
			
			setBoardSize : function(){
				var w = 463;
				this.$theBoard.css({
					width : w + 'px',
					height : w + 'px'
				});
			},
			
			tile : function(tChar, tId, x, y) {
						this.tChar = tChar;
						this.tId = tId;
						this.x = x;
						this.y = y;
					},
			
			fillBoard : function(){
				var chars = theBoard.numberChars.concat(theBoard.operatorChars),
					thisChar,
					thisTile,
					row,
					x, y;
				for (y = 1; y <= this.height; y+=1) {
					row = [];
					for (x = 1; x <= this.width; x+=1) {
						thisChar = chars[Math.ceil(Math.random()*chars.length)-1];
						thisTile = new theBoard.tile(thisChar, 'tile_'+this.tileCount, x, y);
						this.tileCount+=1;
						row[x] = thisTile;
					}
					this.theTiles[y] = row;
					//console.log(this.theTiles[y]);
				}
			},
			
			enhanceChars : function(){
				var x, y;
				for (y = 1; y <= theBoard.height; y+=1) {
					for (x = 1; x <= theBoard.width; x+=1) {
						switch (theBoard.theTiles[y][x].tChar) {
							case '-' : $('#'+theBoard.theTiles[y][x].tId).html('&ndash;');
							break;
							case '*' : $('#'+theBoard.theTiles[y][x].tId).html('&times;');
							break;
						}
					}
				}
			},
			
			drawNewBoard : function(callback){
				var x, y;
				for (y = 1; y <= this.height; y+=1) {
					for (x = 1; x <= this.width; x+=1) {
						this.$theBoard.append(this.$tile.clone().css({
							left : (x - theBoard.posOffset) * this.tileSize + 'px',
							top : (y - theBoard.posOffset) * this.tileSize + 'px'
						}).text(this.theTiles[y][x].tChar).attr('id',this.theTiles[y][x].tId));
					}
				}
				if (typeof(callback) === 'function') {
					callback();
				}
			},
			
			getTileData : function(id){
				var x, y, thisTile;
				for (y = 1; y <= this.height; y+=1) {
					for (x = 1; x <= this.width; x+=1) {
						thisTile = this.theTiles[y][x];
						if (thisTile.tId === id) {
							return thisTile;
						}
					}
				}
				return false;
			},
			
			addToTrail : function(target){
				var prevTile,
					tile = theBoard.getTileData(target.id),
					newTrailTile = new theBoard.tile(tile.tChar, tile.tId, tile.x, tile.y),
					adjacent = function(t) {
						var dx, dy,
							trailLength = theBoard.trail.length;
						if (trailLength > 0) {
							prevTile = theBoard.trail[trailLength-1];
							dx = Math.abs(newTrailTile.x - prevTile.x);
							dy = Math.abs(newTrailTile.y - prevTile.y);
							return (dx < 2) && (dy < 2) && ((dx > 0) || (dy > 0));
						} else {
							return true;
						}
					},
					isNewTile = function(t){
						var trailLength = theBoard.trail.length,
							i, j, rl, removeFromTrail = [];
						if (trailLength > 1) {
							for (i=0; i<trailLength; i+=1) {
								if (theBoard.trail[i].tId === t.id) {
									removeFromTrail = theBoard.trail.splice(i+1, trailLength-i-1);
									rl = removeFromTrail.length;
									for (j=0; j<rl; j+=1) {
										$('#'+removeFromTrail[j].tId).removeClass('inTrail');
									}
									//console.log(theBoard.trail);
									return false;
								}
							}
						}
						return true;
					};
				if (adjacent(target) && isNewTile(target)) {
					this.trail.push(newTrailTile);
					return true;
				} else {
					return false;
				}
			},
			
			getTrailString : function(){
				var trailLength = this.trail.length,
					i, tileString = '';
				for (i = 0; i < trailLength; i+=1) {
					tileString += this.trail[i].tChar;
				}
				return tileString;
			},
						
			handleTrail : function(){
				var down = false, i=0, lowestInTrail,
					correctString = function(str){
						var parts = str.split('='),
							hasNumbers = function(str){
								var i;
								for (i=0; i<theBoard.numberChars.length; i+=1) {
									if (str.indexOf(theBoard.numberChars[i]) >= 0) {
										return true;
									}
								}
								return false;
							};
						if (hasNumbers(parts[0]) && hasNumbers(parts[1])) {
							return ((parts.length === 2) && (eval(parts[0]) === eval(parts[1])));
						} else return false;
					},
					removeTiles = function(){
						var i;
						theBoard.empty = theBoard.trail.slice();
						for (i=0; i<theBoard.trail.length; i+=1) {
							$('#'+theBoard.trail[i].tId).fadeOut();
						}
					},
					blinkTiles = function(){
						var i, oldTrail=theBoard.trail.slice(),
							blinkRed = function(){
								var i;
								for (i=0; i<oldTrail.length; i+=1) {
									$('#'+oldTrail[i].tId).removeClass('error');
								}
							};
						for (i=0; i<theBoard.trail.length; i+=1) {
							$('#'+theBoard.trail[i].tId).addClass('error');
						}
						setTimeout(blinkRed,1000);
					},
					findLowest = function(){
						var i, thisY, lowest = 1;
						for (i=0; i<theBoard.trail.length; i+=1) {
							thisY = theBoard.trail[i].y;
							lowest = (thisY > lowest) ? thisY : lowest;
						}
						return lowest;
					},
					putTrailAtTop = function(){
						var i, tileId, yPos, tx, ty;
						lowestInTrail = findLowest();
						for (i=0; i<theBoard.trail.length; i+=1) {
							yPos = theBoard.theTiles[theBoard.trail[i].y][theBoard.trail[i].x].y - lowestInTrail;
							tx = theBoard.trail[i].x;
							ty = theBoard.trail[i].y;
							theBoard.theTiles[ty][tx].y = yPos;
							tileId = theBoard.trail[i].tId;
							yPos = (theBoard.trail[i].y - theBoard.posOffset) * theBoard.tileSize;
							$('#'+tileId).css({top : yPos + 'px'});
						}					
					},
					dropTiles = function(){
						var i,j,thisX,thisY,thisId;
						for (i=0; i<theBoard.trail.length; i+=1) {
							thisX = theBoard.trail[i].x;
							thisY = theBoard.trail[i].y;
							for (j=1; j<thisY; j+=1) {
								thisId = theBoard.theTiles[j][thisX].tId;
								theBoard.theTiles[j][thisX].y+=1;
							}
							for (j=1; j<thisY; j+=1) {
								thisId = theBoard.theTiles[j][thisX].tId;
								$('#'+thisId).animate({top:"+="+theBoard.tileSize},600,'easeOutBounce');
							}
						}
					},
					addScore = function(){
						var multiplier = Math.pow(2, (theBoard.trail.length - 3));
							theBoard.score += theBoard.trail.length * multiplier;
							$('#theScore').text(theBoard.score);
					},
					refillBoard = function(){
					};
				
				this.$theBoard.off('touchmove', '.tile').on('touchmove', '.tile', function(e){
					var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
					i+=1;
					e.preventDefault();
					console.log(i);
					if (down && (i > 10)) {
						console.log(touch);
						i = 0;
						if (theBoard.addToTrail(document.elementFromPoint(touch.pageX,touch.pageY))) {
							$(touch.target).addClass('inTrail');
						}
					}
				});
				
				this.$theBoard.off(this.trackStart, '.tile').on(this.trackStart, '.tile', function(e){
					$(e.target).addClass('inTrail');
					theBoard.addToTrail(e.target);
					down = true;
				});
				
				this.$theBoard.off('mouseenter', '.tile').on(this.trackEnter, '.tile', function(e){
					if (down) {
						if (theBoard.addToTrail(e.target)) {
							$(e.target).addClass('inTrail');
						}
					}
				});
				
				this.$theBoard.off(this.trackEnd).on(this.trackEnd, function(e){
					var trailString = theBoard.getTrailString();
					console.log(trailString);
					if (correctString(trailString)) {
						removeTiles();
						putTrailAtTop();
						dropTiles();
						addScore();
						refillBoard();
					} else {
						blinkTiles();
					}
					theBoard.trail = [];
					$('.tile').removeClass('inTrail');
					down = false;
				});
				
				$(document).off(this.trackEnd).on(this.trackEnd, function(){
					down = false;
				});
				
				$(document).off('click').on(this.trackEnd, function(e){
					e.stopPropagation();
					e.preventDefault();
					return false;
				});

			},
			initBoard : function(){
				this.setBoardSize();
				this.fillBoard();
				setTimeout(this.enhanceChars,0); //werkt nog niet
				this.drawNewBoard();
			}
			
		};
		
		theBoard.initBoard();
		theBoard.handleTrail();
				
	}());
		
});

/*
- Trail van 3 is kortst; 1 pt per blokje
- Hoe sneller je zetten hoe hoger je score
*/