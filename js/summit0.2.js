$(function () {

	(function () {

	var theBoard = {
			$theBoard : $('#theBoard'),
			$theTiles : function() {
				return $('.tile');
			},
			width : 9,
			height : 9,
			tileSize : 50,
			posOffset : 0.8,
			maxNumber : 9,
			tileCount : 1,
			// Geen 0 want dan kun je 0*56789036543458987=0 doen -> vette score
			numberChars : ['1','2','3','4','5','6','7','8','9','1','2','3','4','5','6','7','8','9'],
			operatorChars : ['*','+','+','-','-','=','=','='],
			allChars : function(){
				return theBoard.numberChars.concat(theBoard.operatorChars);
			},
			//trackStart : 'mousedown touchstart',
			//trackEnter : 'mouseenter touchenter',
			//trackEnd : 'mouseup touchend',
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
			
			randomChar : function() {
				var all = this.allChars();
				return all[Math.ceil(Math.random()*all.length)-1];
			},
			
			convertChar : function(tChar){
				switch (tChar) {
					case '-' : theChar = ('&ndash;');
					break;
					case '*' : theChar = ('&times;');
					break;
					default : theChar = tChar;
				}
				return theChar;
			},

			newTile : function(tChar, tId, x, y) {
				var aTile, theChar = this.convertChar(tChar);
				aTile = $('<a id="tile_'+tId+'" class="tile offBoard" data-x="'+x+'" data-y="'+y+'" data-char="'+tChar+'" style="display:none">'+theChar+'</a>');
				aTile.css({
					left : (x - this.posOffset) * this.tileSize + 'px',
					top : - this.posOffset * this.tileSize + 'px'
				});
				return aTile;
			},

			fillBoard : function(){
				var thisChar,
					thisTile,
					x, y;
				theBoard.$theBoard.empty();
				for (y = 1; y <= this.height; y+=1) {
					for (x = 1; x <= this.width; x+=1) {
						thisChar = this.randomChar();
						thisTile = theBoard.newTile(thisChar, this.tileCount, x, y);
						theBoard.$theBoard.append(thisTile);
						this.tileCount+=1;
					}
				}
				this.score = 0;
				if ($.cookie('score')) {
					$('#theScore').html('High:'+$.cookie('score')+' score:<span id="yourScore">0</span>');
				} else {
					$('#theScore').html('High:0 score:<span id="yourScore">0</span>');
				}
			},

			initButtons : function(){
				$('#restart').on('click', function(){
					theBoard.fillBoard();
					theBoard.dropTiles('offBoard');
				});
			},

			dropTiles : function(className){
				var $tiles = $('.'+className),
					dropTime, newY;
				$tiles.each(function(){
					var $this = $(this).show(0);
					dropTime = 300 + Math.random() * 300;
					newY = ($this.attr('data-y') - theBoard.posOffset) * theBoard.tileSize;
					$this.animate({top:newY},dropTime,'easeOutBounce').removeClass(className);
				});
			},

			addToTrail : function(target){
				var $prevTile,
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
				var	patt = /([\-+]?\d+([\-\+\*]\d)*){1}([=]([\-+]?\d+([\-\+\*]\d)*)){1}$/g,
					parts = str.split('=');
				if (patt.test(str) && (parts.length === 2)) {
					return (eval(parts[0]) === eval(parts[1]));
				}
				return false;
			},

			removeTiles : function(){
				$('.inTrail').fadeOut();
			},

			blinkTiles : function(){
				var noTrail = function(){
						$('.error').removeClass('error inTrail');
					};
				$('.inTrail').addClass('error');
				setTimeout(noTrail,1000);
			},

			refillTrailAtTop : function(){
				var $inTrail = $('.inTrail');
				$inTrail.each(function(){
					var $this = $(this);
					$this.addClass('offBoard').removeClass('inTrail');
					$this.css({
						top : -theBoard.tileSize
					});
					$this.attr('data-char',theBoard.randomChar());
					$this.html(theBoard.convertChar($this.attr('data-char')));
				});
			},
			
			sinkTiles : function(){
				var $empty = $('.offBoard'),
					sinkAllAbove = function(emptyX,emptyY) {
						$('[data-x='+emptyX+']:not(.offBoard)').each(function(){
							var $this = $(this), thisY;
							if (parseInt($this.attr('data-y'),10) < emptyY) {
								thisY = parseInt($this.attr('data-y'), 10);
								$this.attr('data-y', thisY + 1);
								$this.addClass('toSink');
								//console.log(this);
							}
						});
					};
				$empty.each(function(){
					sinkAllAbove($(this).attr('data-x'),$(this).attr('data-y'));
				});
				theBoard.dropTiles('toSink');				
			},
			
			dropTrailFromTop : function(){
				var colums = '', $tiles, empty = [], i, x,
					$toDrop = $('.offboard'),
					setYdata = function(empty){
						var y = 1;
						$('.offBoard[data-x='+empty[0]+']').each(function(){
							$(this).attr('data-y',y);
							y+=1;
						});
					};
				// Get columns from last trail
				for (i=0; i<$toDrop.length; i+=1) {
					x = $toDrop.eq(i).attr('data-x');
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

			addScore : function(){
				var high, multiplier = Math.pow(2, (this.trail.length - 3));
					this.score += this.trail.length * multiplier;
					$('#yourScore').text(this.score);
					high = $.cookie('score');
					if (!high || (this.score > high)) {
						$.cookie('score', this.score);
					}
			},

			checkTrail : function(){
				var trailString = theBoard.getTrailString();
				//console.log(trailString);
				if (this.correctString(trailString)) {
					this.removeTiles();
					this.refillTrailAtTop();
					this.sinkTiles();
					this.dropTrailFromTop();
					this.addScore();
				} else {
					this.blinkTiles();
				}
				this.trail = [];
			},

			handleTrail : function(){
				theBoard.$theBoard.on('mousedown', '.tile', function(e){
					theBoard.addToTrail(e.target);
					theBoard.$theBoard.on('mouseenter', '.tile', function(e){
						theBoard.addToTrail(e.target);
					});
				});
				theBoard.$theBoard.on('mouseup', '.tile', function(){
					theBoard.$theBoard.off('mouseenter', '.tile');
					theBoard.checkTrail();
				});
			},
			
			initBoard : function(){
				this.setBoardSize();
				this.fillBoard();
				this.dropTiles('offBoard');
				this.initButtons();
				this.handleTrail();
			}

		};

		theBoard.initBoard();

	}());

});

/*
- 
- Hoe sneller je zetten hoe hoger je score
*/