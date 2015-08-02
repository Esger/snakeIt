$(function () {

	(function () {

	var theBoard = {
			$theBoard : $('#theBoard'),
			$theBackup : $(),
			width : 9,
			height : 9,
			tileSize : 50,
			posOffset : 0.8,
			maxNumber : 9,
			tileCount : 1,
			// Geen 0 want dan kun je 0*56789036543458987=0 doen -> vette score
			numberChars : ['1','2','3','4','5','6','7','8','9','1','2','3','4','5','6','7','8','9'],
			level1Chars : ['+','+','=','='],
			level2Chars : ['-','-','='],
			level3Chars : ['*','*'],
			level4Chars : ['/','/','='],
			allChars : function(){
				switch (this.level) {
					case 1 :
						return this.numberChars.concat(this.level1Chars);
					case 2 :
						return this.numberChars.concat(this.level1Chars,this.level2Chars);
					case 3 :
						return this.numberChars.concat(this.level1Chars,this.level2Chars,this.level3Chars);
					case 4 :
						return this.numberChars.concat(this.level1Chars,this.level2Chars,this.level3Chars,this.level4Chars);
					default :
						return this.numberChars.concat(this.level1Chars,this.level2Chars,this.level3Chars,this.level4Chars);
				}
			},
			snakeHead : {
				x : 5,
				y : 5
			},
			correctPartLength : 0,
			level : 1,
			isTouchDevice : 'ontouchstart' in document.documentElement,
			trail : [],
			empty : [],
			score : 0,
			gameOver : false,

			setBoardSize : function(){
				var w = 463;
				this.$theBoard.css({
					width : w + 'px',
					height : w + 'px'
				});
			},
			
			randomChar : function() {
				var all = this.allChars();
				return all[Math.ceil(Math.random()*all.length)-1];
			},
			
			convertChar : function(tChar){
				var theChar;
				switch (tChar) {
					case '-' : theChar = ('<b>&ndash;</b>');
					break;
					case '*' : theChar = ('&times;');
					break;
					case '/' : theChar = ('<b>:</b>');
					break;
					default : theChar = tChar;
				}
				return theChar;
			},
			
			//For debugging
			updateTitle : function(atile) {
				atile.find('.coords, br').remove();
				atile.prepend('<span class="coords">'+atile.attr('data-x')+', '+atile.attr('data-y')+'</span><br>');
				return atile;
			},

			newTile : function(tId, x, y) {
				var aTile,
					aChar = this.randomChar(),
					theChar = this.convertChar(aChar);
				aTile = $('<a id="tile_'+tId+'" class="tile offBoard" data-x="'+x+'" data-y="'+y+'" data-char="'+aChar+'" style="display:none">'+theChar+'</a>');
				aTile.css({
					left : (x - this.posOffset) * this.tileSize + 'px',
					top : - this.posOffset * this.tileSize + 'px'
				});
				if (this.numberChars.indexOf(aChar) > -1) {
					aTile.addClass('number');
				}
				//aTile = this.updateTitle(aTile);
				return aTile;
			},

			fillBoard : function(){
				var thisTile,
					x, y;
				this.$theBoard.empty();
				for (y = 1; y <= this.height; y+=1) {
					for (x = 1; x <= this.width; x+=1) {
						thisTile = this.newTile(this.tileCount, x, y);
						this.$theBoard.append(thisTile);
						this.tileCount+=1;
					}
				}
				this.$theBackup = this.$theBoard.clone(false,true);
				this.$theBackup.attr('id','theBackup');
				this.score = 0;
				this.level = 1;
				if ($.cookie('score')) {
					$('#theScore').html('High:'+$.cookie('score')+' score:<span id="yourScore">0</span>');
				} else {
					$('#theScore').html('High:0 score:<span id="yourScore">0</span>');
				}
			},

			initButtons : function(){
				$('#restart').on('click', function(){
					theBoard.gameOver = false;
					theBoard.tileCount = 1;
					theBoard.fillBoard();
					theBoard.dropTiles('offBoard');
					theBoard.trail=[];
					theBoard.initSnakeHead();
				});
				$('#reload').on('click', function(){
					theBoard.$theBoard.empty().append(theBoard.$theBackup.clone(false,true).children());
					theBoard.dropTiles('offBoard');
					theBoard.score = 0;
				});
			},

			dropTiles : function(className){
				var $tiles = $('.'+className),
					dropTime, newY;
				$tiles.each(function(){
					var $this = $(this).show(0);
					dropTime = 300 + Math.random() * 300;
					newY = (parseInt($this.attr('data-y'),10) - theBoard.posOffset) * theBoard.tileSize;
					$this.animate({top:newY},dropTime,'easeOutBounce').removeClass(className).addClass('tile');
				});
			},
			
			initSnakeHead : function(){
				theBoard.snakeHead.x = Math.ceil(this.width / 2);
				theBoard.snakeHead.y = Math.ceil(this.height / 2);
				$('.tile[data-x='+theBoard.snakeHead.x+'][data-y='+theBoard.snakeHead.y+']').addClass('head inTrail');
				theBoard.addToTrail(theBoard.getKeyTile(''));
			},

			getXfromAttr : function($tile){
				return parseInt($tile.attr('data-x'),10);
			},

			getYfromAttr : function($tile){
				return parseInt($tile.attr('data-y'),10);
			},

			sortByDataY : function(y1,y2){
				var Ya = parseInt($(y1).attr('data-y'),10),
					Yb = parseInt($(y2).attr('data-y'),10);
				return ((Ya < Yb) ? -1 : ((Ya > Yb) ? 1 : 0));
			},

			setSnakeHead : function(){
				var $newHead, newHeadId;
				if (this.trail.length > 0) {
					$newHead = this.trail[this.trail.length-1];
					newHeadId = $newHead.attr('id');
					$('.head').removeClass('head');
					$('#'+newHeadId).addClass('head');
					this.snakeHead.x = this.getXfromAttr($newHead);
					this.snakeHead.y = this.getYfromAttr($newHead);
					$('.tile[data-x='+this.snakeHead.x+'][data-y='+this.snakeHead.y+']').addClass('head');
				} else {
					this.initSnakeHead();
				}
			},

			//repositionSnake : function(){
			//	$('.inTrail').removeClass('inTrail head');
			//	if (this.trail.length > 0) {
			//		$.each(this.trail, function(){
			//			$('.tile[data-x='+theBoard.getXfromAttr(this)+'][data-y='+theBoard.getYfromAttr(this)+']').addClass('inTrail');
			//		});
			//		this.snakeHead.x = this.getXfromAttr(this.trail[this.trail.length-1]);
			//		this.snakeHead.y = this.getYfromAttr(this.trail[this.trail.length-1]);
			//		$('.tile[data-x='+this.snakeHead.x+'][data-y='+this.snakeHead.y+']').addClass('head inTrail');
			//	} else {
			//		this.initSnakeHead();
			//	}
			//},
			//
			shortenSnakeTail : function() {
				var tailId = '#'+this.trail[0][0].id;
				if (this.trail.length > 1) {
					$(tailId).removeClass('inTrail');
					this.trail.shift();
					console.log('one down');
				}
			},

			addToTrail : function(target){
				var //$prevTile,
					$tile = $('#'+target.id),
					adjacent = function($t) {
						var dx, dy,
							trailLength = theBoard.trail.length;
						if (trailLength > 0) {
							$prevTile = theBoard.trail[trailLength-1];
							dx = Math.abs(parseInt($t.attr('data-x'),10) - parseInt($prevTile.attr('data-x'),10));
							dy = Math.abs(parseInt($t.attr('data-y'),10) - parseInt($prevTile.attr('data-y'),10));
							return (dx < 2) && (dy < 2) && ((dx > 0) || (dy > 0));
						} else {
							return true;
						}
					},
					isNewTile = function(t){
						var trailLength = theBoard.trail.length,
							i; //, j, rl, removeFromTrail = [];
						if (trailLength > 0) {
							for (i=0; i<trailLength; i+=1) {
								if (theBoard.trail[i][0].id === t.id) {
									//removeFromTrail = theBoard.trail.splice(i+1, trailLength-i-1);
									//rl = removeFromTrail.length;
									//for (j=0; j<rl; j+=1) {
									//	$('#'+removeFromTrail[j][0].id).removeClass('inTrail');
									//}
									//console.log(theBoard.trail);
									return false;
								}
							}
						}
						return true;
					};
				if (adjacent($tile) && isNewTile(target)) {
					$tile.addClass('inTrail');
					this.trail.push($tile.clone());
					//console.log(this.trail);
					return true;
				} else {
					return false;
				}
			},
			
			getTrailString : function(){
				var trailLength = this.trail.length,
					i, tileString = '';
				//console.log(this.trail);
				for (i = 0; i < trailLength; i+=1) {
					tileString += $(this.trail[i]).attr('data-char');
				}
				return tileString;
			},

			correctString : function(str){
				var	patt = /^[\-\+]?(\d+[\-\+\*\/])*\d+$/,
					parts = str.split('=');
				if (parts.length > 1) {
					while ((parts[parts.length-1].length > 0) && parts[parts.length-2].length > 0) {
						if ((patt.test(parts[parts.length-1])) && (patt.test(parts[parts.length-2]))) {
							if (eval(parts[parts.length-1]) === eval(parts[parts.length-2])) return parts[parts.length-1].length + parts[parts.length-2].length + 1;
						}
						parts[parts.length-2] = parts[parts.length-2].substring(1, parts[parts.length-2].length);
					}
				}
				return 0;
			},

			cutTrail : function() {
				var i, elId;
				for (i=0; i<this.correctPartLength; i+=1) {
					elId = this.trail.pop().attr('id');
					$('#'+elId).addClass('correct');
				}
			},

			removeTiles : function(){
				$('.correct').fadeOut();
			},

			//blinkTiles : function(){
			//	var noTrail = function(){
			//			$('.error').removeClass('error inTrail');
			//		};
			//	$('.inTrail').addClass('error');
			//	setTimeout(noTrail,1000);
			//},

			refillTrailAtTop : function(){
				var $correctTiles = $('.correct');
				$correctTiles.each(function(){
					var $this = $(this);
					$this.addClass('offBoard').removeClass('correct inTrail head');
					$this.css({
						top : -theBoard.tileSize
					});
					$this.attr('data-char',theBoard.randomChar());
					$this.html(theBoard.convertChar($this.attr('data-char')));
					if (theBoard.numberChars.indexOf($this.attr('data-char')) > -1) {
						$this.addClass('number');
					} else {
						$this.removeClass('number');
					}
					//$this = theBoard.updateTitle($this);
				});
			},
			
			sinkTiles : function(){
				var $empty = $('.offBoard'),
					sinkAllAbove = function(emptyX,emptyY) {
						$('[data-x='+emptyX+']:not(.offBoard)').each(function(){
							var $this = $(this),
								thisY = parseInt($this.attr('data-y'),10);
							if (thisY < emptyY) {
								$this.attr('data-y', thisY + 1);
								$this.addClass('toSink');
								//$this = theBoard.updateTitle($this);
								//console.log(this);
							}
						});
					};
				$empty.sort(this.sortByDataY); // fixes nasty bug -> need to start at lowest empty Y
				$empty.each(function(){
					var $this = $(this);
					sinkAllAbove(parseInt($this.attr('data-x'),10),parseInt($this.attr('data-y'),10));
				});
				theBoard.dropTiles('toSink');				
			},

			sinkTrail : function(){
				$.each(this.trail,function(){
					var $this = $(this),
						thisId = $this.attr('id'),
						$thisTile = $('#'+thisId);
					$this.attr('data-y', $thisTile.attr('data-y'));
				});
				console.log(theBoard.trail);
			},
			
			dropTrailFromTop : function(){
				var colums = '', $tiles, empty = [], i, x,
					$toDrop = $('.offboard'),
					setYdata = function(empty){
						var y = 1;
						$('.offBoard[data-x='+empty[0]+']').each(function(){
							var $this = $(this);
							$this.attr('data-y',y);
							y+=1;
							//$this = theBoard.updateTitle($this);
						});
					};
				// Get columns from last trail
				for (i=0; i<$toDrop.length; i+=1) {
					x = parseInt($toDrop.eq(i).attr('data-x'),10);
					if (colums.indexOf(x) === -1) colums+=x+'|';
				}
				// Get tiles left in columns from trail
				colums = colums.substring(0,colums.length-1).split('|');
				for (i=0; i<colums.length; i+=1) {
					$tiles = $('[data-x='+colums[i]+']:not(.offBoard)');
					empty[i] = [colums[i],(theBoard.height - $tiles.length)];
				}
				//console.log(empty);
				// Set length of empty colparts to offBoard tiles
				for (i in empty) {
					setYdata(empty[i]);
				}
				//console.log($('.offBoard').attr('data-y'));
				this.dropTiles('offBoard');
			},
			
			levelUp : function(){
				if (this.score > 400) {
					this.level = 4;
				} else if (this.score > 200) {
					this.level = 3;
				} else if (this.score > 100) {
					this.level = 2;
				}
			},
			
			getScore : function(){
				var score = this.correctPartLength,
					multiplier = Math.pow(2, (this.correctPartLength - 3));
				score = score * multiplier;
				this.correctPartLength = 0;
				return (score > 2) ? score : 0;
			},

			addScore : function(){
				var high;
				this.score += this.getScore();
				this.levelUp();
				$('#yourScore').text(this.score);
				high = $.cookie('score');
				if (!high || (this.score > high)) {
					$.cookie('score', this.score);
				}
			},

			checkTrail : function(){
				var trailString = theBoard.getTrailString();
				this.correctPartLength = this.correctString(trailString);
				//console.log(trailString);
				if (this.correctPartLength > 0) {
					this.cutTrail();
					this.removeTiles();
					this.refillTrailAtTop();
					this.sinkTiles();
					this.sinkTrail();
					this.dropTrailFromTop();
					this.setSnakeHead();
					this.addScore();
					this.shortenSnakeTail();
					//this.repositionSnake();
				} /*else {
					this.blinkTiles();
				}
				this.trail = [];
				$('.trail').text(this.getScore());*/
			},
			
			checkMoves : function(){
				return ($('.tile[data-char="="]').not('.inTrail').length > 0);
			},

			moveHead : function(x,y) {
				var $theHead;
				this.snakeHead.x+=x;
				this.snakeHead.y+=y;
				if ((this.snakeHead.x > 0) &&
					(this.snakeHead.x <= this.width) &&
					(this.snakeHead.y > 0) &&
					(this.snakeHead.y <= this.height)) {
					$theHead = $('.tile[data-x='+this.snakeHead.x+'][data-y='+this.snakeHead.y+']');
					$('.head').removeClass('head');
					$theHead.addClass('head');
					return $theHead.get(0);
				} else return false;
			},

			endOfGame : function() {
				$('.tile').each(function(){
					$(this).attr('data-y',theBoard.height+2);
				});
				this.dropTiles('tile');
				this.gameOver = true;
				this.$theBoard.append($('<h2 id="gameOver">Game Over</h2>'));
				$('#gameOver').animate({
					fontSize: '30px'
				}, 700, 'easeOutElastic');
			},
			
			getKeyTile : function(event){
				if (event.keyCode) {
					switch (event.keyCode) {
						case 49 : return theBoard.moveHead(-1,1);  //1
						case 50 : return theBoard.moveHead(0,1);   //2
						case 51 : return theBoard.moveHead(1,1);   //3
						case 52 : return theBoard.moveHead(-1,0);  //4
						case 54 : return theBoard.moveHead(1,0);   //6
						case 55 : return theBoard.moveHead(-1,-1); //7
						case 56 : return theBoard.moveHead(0,-1);  //8
						case 57 : return theBoard.moveHead(1,-1);  //9
					}
				}
				return theBoard.moveHead(0,0);
			},

			handleTrail : function(){
				var handleClickTouch = function(el) {
						var $tile;
						if (!theBoard.gameOver) {
							$tile = $(el);
							if (!$tile.hasClass('inTrail')) {
								if (theBoard.addToTrail($tile.get(0))) {
									theBoard.setSnakeHead();
									theBoard.checkTrail();
								} else theBoard.endOfGame();
							} else theBoard.endOfGame();
						}
					},
					handleKeyPress = function(e) {
						var $tile;
						if (!theBoard.gameOver) {
							$tile = theBoard.getKeyTile(e);
							if ($tile) {
								if (theBoard.addToTrail($tile)) {
									theBoard.checkTrail();
								} else theBoard.endOfGame();
								if (!theBoard.checkMoves()) {
									theBoard.endOfGame();
								}
							} else theBoard.endOfGame();
						}
					};
				if (this.isTouchDevice) {
					$(document).on('touchstart', '.tile', function(e){
						e.preventDefault();
						handleClickTouch(this);
					});
				} else {
					$(document).on('keypress', function(e){
						handleKeyPress(e);
					});
					$(document).on('click', '.tile', function(e){
						handleClickTouch(this);
					});
				}
			},
			
			initBoard : function(){
				this.setBoardSize();
				this.fillBoard();
				this.dropTiles('offBoard');
				this.initButtons();
				this.initSnakeHead();
				this.handleTrail();
				//this.checkBoard(); // for possible strings 
			}

		};

		theBoard.initBoard();

	}());

});

/*
- Kleiner bord op kleinere schermen
- Bord naar scherm schalen
- Enter restart
- Hoe hoger de vergelijkingswaarden, hoe hoger de score
- Blink tiles weer gebruiken
- Hoe sneller je zetten hoe hoger je score
*/
