$(function () {
		
  (function () {

	var theBoard = {
			$theBoard : $('#theBoard'),
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
				var aTile, theChar;
				switch (tChar) {
					case '-' : theChar = ('&ndash;');
					break;
					case '*' : theChar = ('&times;');
					break;
					default : theChar = tChar;
				}
				aTile = $('<div id="tile_'+tId+'" class="tile offBoard" data-x="'+x+'" data-y="'+y+'" data-char="'+tChar+'" style="display:none">'+theChar+'</div>');
				aTile.css({
					left : (x - theBoard.posOffset) * this.tileSize + 'px',
					top : -theBoard.posOffset * this.tileSize + 'px'
				});
				return aTile;
			},
			
			fillBoard : function(){
				var chars = theBoard.numberChars.concat(theBoard.operatorChars),
					thisChar,
					thisTile,
					x, y;
				theBoard.$theBoard.empty();
				for (y = 1; y <= this.height; y+=1) {
					for (x = 1; x <= this.width; x+=1) {
						thisChar = chars[Math.ceil(Math.random()*chars.length)-1];
						thisTile = theBoard.tile(thisChar, this.tileCount, x, y);
						theBoard.$theBoard.append(thisTile);
						this.tileCount+=1;
					}
				}
				if ($.cookie('score')) {
					$('#theScore').html('High:'+$.cookie('score')+' score:<span id="yourScore">0</span>');
				}
			},
						
			dropTiles : function(){
				var $tiles = $('.offBoard'),
					dropTime;
				$tiles.each(function(){
					var $this = $(this).show(0);
					dropTime = 300 + Math.random() * 300;
					$this.animate({top:"+="+($this.data('y') * theBoard.tileSize)},dropTime,'easeOutBounce').removeClass('offBoard');
				});	
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
				var $prevTile,
					$tile = $('#'+target.id),
					adjacent = function($t) {
						var dx, dy,
							trailLength = theBoard.trail.length;
						if (trailLength > 0) {
							$prevTile = theBoard.trail[trailLength-1];
							dx = Math.abs($t.data('x') - $prevTile.data('x'));
							dy = Math.abs($t.data('y') - $prevTile.data('y'));
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
								if (theBoard.trail[i][0].id === t.id) {
									removeFromTrail = theBoard.trail.splice(i+1, trailLength-i-1);
									rl = removeFromTrail.length;
									for (j=0; j<rl; j+=1) {
										$('#'+removeFromTrail[j][0].id).removeClass('inTrail');
									}
									//console.log(theBoard.trail);
									return false;
								}
							}
						}
						return true;
					};
				if (/*adjacent($tile) && isNewTile($tile) ||*/ true) {
					$tile.addClass('inTrail');
					this.trail.push($tile.clone());
					console.log(this.trail);
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
						if (str.length > 2){
							if (hasNumbers(parts[0]) && hasNumbers(parts[1])) {
								return ((parts.length === 2) && (eval(parts[0]) === eval(parts[1])));
							}
						}
						return false;
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
									$('#'+oldTrail[i].tId).removeClass('error inTrail');
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
						var high, multiplier = Math.pow(2, (theBoard.trail.length - 3));
							theBoard.score += theBoard.trail.length * multiplier;
							$('#yourScore').text(theBoard.score);
							high = $.cookie('score');
							if (!high || (theBoard.score > high)) {
								$.cookie('score',theBoard.score);
							}
					},
					refillBoard = function(){
						var $revive;
						for (y = 1; y <= this.height; y+=1) {
							for (x = 1; x <= this.width; x+=1) {
								if ($theBoard.theTiles[y][x].inTrail) {
									$('#'+$theBoard.theTiles[y][x].tId).css({
										top: ($theBoard.theTiles[y][x].y - theBoard.posOffset) * this.tileSize + 'px'
									});
								}
							}
						}

						console.log($revive);
						$('.tile').removeClass('inTrail');

					};
				
				theBoard.$theBoard.off(this.trackStart, '.tile').on(this.trackStart, '.tile', function(e){
					down = true;
					theBoard.addToTrail(e.target);
				});
				
				//this.$theBoard.off('touchmove', '.tile').on('touchmove', '.tile', function(e){
				//	var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				//	i+=1;
				//	e.preventDefault();
				//	console.log(i);
				//	if (down && (i > 10)) {
				//		console.log(touch);
				//		i = 0;
				//		if (theBoard.addToTrail(document.elementFromPoint(touch.pageX,touch.pageY))) {
				//			$(touch.target).addClass('inTrail');
				//		}
				//	}
				//});
				
				theBoard.$theBoard.off('mouseenter', '.tile').on('mouseenter', '.tile', function(e){
					console.log(e.target);
					if (down) {
						theBoard.addToTrail(e.target);
					}
				});
				
				//theBoard.$theBoard.off(this.trackEnd).on(this.trackEnd, function(e){
				//	var trailString = theBoard.getTrailString();
				//	down = false;
				//	console.log(trailString);
				//	if (correctString(trailString)) {
				//		removeTiles();
				//		putTrailAtTop();
				//		dropTiles();
				//		addScore();
				//		setTimeout(refillBoard,2000);
				//	} else {
				//		blinkTiles();
				//	}
				//	theBoard.trail = [];
				//});
				
				//$(document).off('click').on('click', '.tile', function(e){
				//	e.stopPropagation();
				//	e.preventDefault();
				//	return false;
				//});
				

			},
			initBoard : function(){
				this.setBoardSize();
				this.fillBoard();
				this.dropTiles();
				$('#restart').on('click', function(){
					theBoard.fillBoard();
					theBoard.dropTiles();
				});
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