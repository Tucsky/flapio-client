/**********
CLIENT.js
© xzl
*******/

	function Game() {
		var that = this;

		// Mobile
		that.mobile = false;

		// Timestamp
		that.time = 0;

		// Etats
		that.is = {
			online: false, edited: false, ableToReplay: true, ready: false, tab: false
		};

		// Camera
		that.camera = {
			target: 0, x: 0, y: 0, free: false, track: null
		};

		// PRESETS
		that.presets = {
			hardmode: {
				title: 'Hard mode',
				PHYSICS: {
					XVEL: 5
				}
			},
			antigravity: {
				title: 'Anti-gravity',
				PHYSICS: {
					YVEL: -0.38,
					FLAP: 8
				}
			}
		}

		// Options
		that.o = {
			THEME: 'img/sprites/'+THEME+'.png',
			CANVAS: '#game',
			SPEED: { X: 0, Y: 0 },
			LEVEL: {
				SEED: rdNb(1, 1000000, true),
				SPACE: 150,
				MIN_DIFFICULTY: 200,
				MAX_DIFFICULTY: 128,
				DIFFICULTY_FACTOR: 0.01,

				DYNAMIC_FACTOR: 0.015,
				DYNAMIC_FACTOR_MIN: 0.1,
				DYNAMIC_FACTOR_MAX: 0.8,
				DYNAMIC_STRENGTH_FACTOR: 0.01,
				DYNAMIC_STRENGTH_FACTOR_MIN: 0,
				DYNAMIC_STRENGTH_FACTOR_MAX: 1.5,
				DYNAMIC_MARGIN_MIN: 25,
				DYNAMIC_MARGIN_MAX: 75,

				MARGIN: 2,
				WIDTH: 52
			},
			PHYSICS: {
				XVEL: 2,
				YVEL: 0.38,
				FLAP: -8,
				GRND: 400,
				REST: -0.3,
				FRIC: 0.95,
			},
			USER: {
				UID: null,
				NICKNAME: 'Bird',
				BOOSTFPS: false,
				PLAYERS: true,
				LIVERANK: true,
				BEST: 0,
				SFX: true
			},
			WIDTH: 960,
			HEIGHT: 512
		};

		// Background
		that.background = [
			{speed: 0.05, sprite: [292, 2, 288, 512], y: 0},
			{speed: 0.07, sprite: [2, 282, 84, 84], y: 115, r: true},
			{speed: 0.3, sprite: [2, 216, 288, 64], y: 304},
			{speed: 0.8, sprite: [2, 150, 288, 44], y: 340},
			{speed: 0.9, sprite: [2, 116, 288, 32], y: 368},
		];

		// Foreground
		that.foreground = [
			{speed: 1, sprite: [2, 2, 288, 112], y: 400}
		];

		// Stockage local
		that.player = null;
		that.ghost = null;
		that.birds = [];
		that.scores = [];
		that.level = [];
		that.count = 0;
		that.best = 0;
		that.rewards = [];
		that.round = 0;

		// Skins
		that.skins = {
			default: {
				alive: [[2, 514, 34, 24], [38, 514, 34, 24], [74, 514, 34, 24], [38, 514, 34, 24]], 
				dead: [[110, 514, 34, 24]]
			},
			1: {
				alive: [[2, 540, 34, 24], [38, 540, 34, 24], [74, 540, 34, 24], [38, 540, 34, 24]], 
				dead: [[110, 540, 34, 24]]
			},
			2: {
				alive: [[2, 566, 34, 24], [38, 566, 34, 24], [74, 566, 34, 24], [38, 566, 34, 24]], 
				dead: [[110, 566, 34, 24]]
			},
			3: {
				alive: [[2, 592, 34, 24], [38, 592, 34, 24], [74, 592, 34, 24], [38, 592, 34, 24]], 
				dead: [[110, 592, 34, 24]]
			}
		};

		// Connexion
		that.attempt = { 
			i: 0, interval: null, timeout: null
		};

		// Display
		that.theme = null;
		that.canvas = null;
		that.ctx = null;

		// Cache graphique
		that.cache = null;

		// Cache de données
		that.temp = {};

		// Scroller leaderboard
		that.scroll = {};

		///////////////////////////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////

		/* Initialisation du jeu
		*/

		that.init = function() {

			// Récupération des options cookie
			if ((user = that.cookie.get('FlapIO'))) {
				$.extend(that.o.USER, JSON.parse(user));
			}

			// Création des events DOM
			that.setDOM();

			// Initialisation du <canvas>
			that.canvas = $(that.o.CANVAS).get(0);
			that.canvas.width = $('#screen .container').width();
			that.canvas.height = that.o.HEIGHT;
			that.ctx = that.canvas.getContext("2d");

			// Chargement des sprites
			that.theme = new Image();
			that.theme.src = that.o.THEME;

			// Création du cache
			that.cache = $('<canvas/>', {'Width':that.canvas.width,'Height':that.canvas.height}).get(0);

			$(that.theme).load(function() {

				// Init background
				that.initScenery('background');
				that.initScenery('foreground');

				// Création du joueur (version locale reprogrammable)
				new that.Bird({player: true, nickname: that.o.USER.nickname, best: that.o.USER.BEST}).init();

				// Stats
				that.stats();

				// Connexion
				that.connect(true);

				// Loop de rendu
				that.render();

			});

			that.resize();

			return that;
			
		}

		that.setDOM = function() {

			// Resize
			$(window).resize(that.resize);

			// Jump !
			$(window).keydown(function(e) { 
				if (e.keyCode == 32 || e.keyCode == 38 || e.keyCode == 16 || e.keyCode == 17) that.click(); 
				if (e.keyCode == 37) that.explore('left'); 
				if (e.keyCode == 39) that.explore('right'); 
			});
			$('#screen .container').on('mousedown', function(e) {
				that.click();
			}).on("contextmenu", function (e) {
				return e.preventDefault();
			});

			// Messages
			$('#overlay .message .content').on('mousedown', function(e) {
				e.stopPropagation();
				e.preventDefault();
				that.message();
			});

			// Gameover
			$('#overlay .gameover .dialog').on('mousedown', function(e) {
				e.stopPropagation();
				e.preventDefault();
			});

			// Ghosts
			$('#leaderboard tbody').on('click', 'tr', function(e) {
				if (!$(this).data('id')) return;

				that.send('user_command', {
					fn: 'ghost',
					dt: $(this).data('id')
				})
			});

			// Live tracking
			$('#liveboard').on('mouseenter', 'li', function(e) {
				that.camera.track = $(this).data('id');
			}).on('mouseleave', 'li', function(e) {
				that.camera.track = that.player.id;
			});

			// UI
			$.each($('#overlay .ui > div'), function(i, ui) {
				var param = {
					scrollbars: false,
					updateOnChanges: true,
					updateOnWindowResize: true,
					scrollingX: false
				};
				if ($(this).data('tab') == 'leaderboard')
					param.onScrollDown = function() {
						var current = $('#leaderboard').data();
						clearTimeout(current.delay);
						current.delay = setTimeout(function() {
							if (typeof current.page === 'undefined' || typeof current.max === 'undefined') return that.getLeaderboard();
							else {
								var next = Math.min(Math.max(current.page + 1, 0), current.max);
								if (next > current.page) {
									that.getLeaderboard(null, null, next)
								} else {
									that.message(L.leaderboard.end);
								}
							}
						}, 1000);
					};

				that.scroll[$(this).data('tab')] = new FTScroller(ui, param);
			});
			$('nav#menu li').on('click', function() {
				if (that.mobile) $('.toggle').trigger('click');
				that.tab($(this).data('tab'));
			});
			$('#overlay .ui > div').on('mousedown', function(e) {
				e.stopPropagation();
			}).on("contextmenu", function(e) {
				e.stopPropagation();
			});
			$('#overlay .ui [data-option]').on('change', function(e) {
				if (typeof eval('that.o.'+$(this).data('option')) !== 'undefined') {
					var v = $(this).val();
					if ($(this).attr('type') == 'checkbox') 
						eval('that.o.'+$(this).data('option')+' = '+($(this).prop('checked') ? true : false)+';');
					else
						eval('that.o.'+$(this).data('option')+' = '+(!isNaN(v) ? v : '\''+v+'\'')+';')

					if ($(this).data('refresh')) that.level = [];	
					if ($(this).data('cookie')) that.cookie.set('FlapIO', JSON.stringify(that.o.USER));		
					if ($(this).data('local')) that.is.edited = true;
				}
			});

			// Presets
			var n = 0;
			$.each(that.presets, function(index, value) {
				n++;
				$('#settings_presets').append('<option value="'+index+'">'+value.title+'</option>');
			});
			$('#settings_presets').siblings('label').html('Présélections ('+(n+1)+')');
			$('#overlay .ui #settings_presets').on('change', function(e) {
				that.preset($(this).val());
			});

			// Nickname
			$('#overlay .ui #profil_nickname').on('keyup', function() {
				$('#profil_nickname').siblings('.io-success').removeClass('in');

				if ($(this).val().replace(/[^A-Za-z0-9!_-]/g,'').length < 3) return;

				clearTimeout($(this).data('timeout'));

				var nickname = $(this).val();

				$(this).data('timeout', setTimeout(function() {
					that.send('user_command', {
						fn: 'nickname',
						dt: nickname
					});
				}, 1000));
			});

			// Search by nickname @leaderboard
			$('#overlay .ui #leaderboard_nickname').on('keyup', function() {
				if ($(this).data('value') == $(this).val()) return;

				clearTimeout($(this).data('timeout'));
				$(this).data('timeout', setTimeout(function() {
					that.getLeaderboard();
					$('#overlay .ui #leaderboard_nickname').data('value', $('#overlay .ui #leaderboard_nickname').val());
				}, 1500));
			});

			// Set collection @leaderboard
			$('#leaderboard_target li').on('click', function() {
				var p = $(this).data('collection');
				$('#leaderboard_target .index').html($(this).find('a').html());
				$('#leaderboard').data({
					collection: p,
					page: 0
				});
				that.getLeaderboard();
				if (p == 'd') {
					$('#leaderboard').data('daily', 0);
					$('#leaderboard_daily').fadeIn(200);
				} else {
					$('#leaderboard_daily').fadeOut(200);
				}
			});

			// Set daily ID @leaderboard
			$('#leaderboard_daily button').on('click', function() {
				var d = new Date(),
					i = ($('#leaderboard').data('daily') || 0) + parseInt($(this).data('operation'));
				if (i > 0) return;
				d.setDate(d.getDate() + i);
				$('#leaderboard_daily input').val(d.getFullYear()+'/'+two(d.getMonth()+1)+'/'+two(d.getDate()))
				$('#leaderboard').data('daily', i);
				that.getLeaderboard();
			});

			// Date selector @leaderboard
			$('#leaderboard_daily input').on('keyup', function() {
				if ($(this).data('value') == $(this).val() || isNaN(Date.parse($(this).val()))) return;
				clearTimeout($(this).data('timeout'));

				var one = 24*60*60*1000;
				var today = new Date().setHours(0, 0, 0);
				var target = new Date($(this).val()).setHours(0, 0, 0);
				var diff = Math.round((today - target)/(one))*-1;
				$('#leaderboard').data('daily', diff);
				$('#leaderboard_daily input').data('value', $('#leaderboard_daily input').val());

				$(this).data('timeout', setTimeout(function() {
					that.getLeaderboard();
				}, 1500));
			});

			// Presets default
			that.presets['default'] = $.extend(true, {}, that.o);

			// Sync UI>Options
			that.settings();

			// Leaderboard
			$('#leaderboard th').on('click', function() {
				$('#leaderboard th.active').removeClass('active io-up io-down');
				$(this).data('by', $(this).data('by') == 1 ? -1 : 1);
				$(this).addClass('active '+($(this).data('by') == -1 ? 'io-down' : 'io-up'));
				that.getLeaderboard(null, null, 0);
			});

			// Tooltip
			$('.tips').tooltip({container: 'body'});

			// Toggle menu
			$('.toggle').data('active', false).on('click', function() {
				var s = $('.toggle').data('active', !$('.toggle').data('active')).data('active');
				$('nav#menu ul').css('left', s ? 0 : -200);
				$('nav#menu .tips').each(function() {
					s ? $(this).data('bs.tooltip').disable() : $(this).data('bs.tooltip').enable();
				});

				if (that.mobile && $('nav#menu li.active').data('tab')) that.tab();
			});

			// Close UI
			$(document).on('mousedown', function(e) {
				if (!that.is.tab || e.which != 1) return;

				var container = $('section#screen .clear');
				if (!container.is(e.target) && container.has(e.target).length === 0 && !$(e.target).data('tab') && !$(e.target).is('#menu')) {
					that.tab();
				}
			});

			// Connect2UID
			$('.connect').on('click', function() {
				var uid = $('#profil_uid').val().replace(/[^a-z0-9]/gi,'');
					$('#profil_uid').val(uid);

				if (G.o.USER && G.o.USER.UID == uid) {
					that.message("L'UID saisi doit être different de l'identifiant actuel!");
					return;
				}

				if (uid.length < 8) {
					that.message("L'UID doit contenir au moins 8 caractères!");
					return;
				}
				if (confirm('Est-tu sûr ?')) {
					that.io && that.io.disconnect();
					that.profile({UID: uid});
					that.connect(true);
				}
			});

			// Skins
			$('#skins_theme').on('change', function() {
				that.loadTheme(this);
			});

			// Share
			$("#facebook").on("click",function(){
				window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(location.href),"","status=0,toolbar=0,height=250,width=600");
			});
			$("#twitter").on("click",function(){
				window.open("https://twitter.com/home?status="+encodeURIComponent('I just scored '+that.player.score+' points on FlapIO ! http://flapio.kevinrostagni.me/ #flappybird #lel'),"","status=0,toolbar=0,height=250,width=600")
			});
			$('#google').on("click", function() {
				window.open("https://plus.google.com/share?url="+encodeURIComponent(location.href),"","status=0,toolbar=0,height=500,width=520");
			});

			// Round
			setInterval(function() {
				if (!that.round) return;
				var to = that.round - +new Date();

				var h = ((to / (1000*60*60)) % 24),
					m = ((to / (1000*60)) % 60),
					s = (to / 1000) % 60;

				$('[data-stats-round]').html(to <= 0 ? L.roundend : two(Math.floor(h))+':'+two(Math.floor(m))+':'+two(Math.floor(s)));
				if (!CONSOLE) return;

				$('[data-timeago]').each(function() {
					$(this).html(that.ago($(this).data('timeago')));
				});
			}, 1000);

			// Console
			$('[data-tab=console]').on('click', '[data-admin]', function(e) {
				e.preventDefault();
				that.console($(this).data('admin'), $(this).data());
				return false;
			});

			// Drop
			$(window).on('dragover', function(e) {
				e.preventDefault();
				e.stopPropagation();
			}).on('dragenter', function(e) {
				e.preventDefault();
				e.stopPropagation();
			}).on('drop', function(e) {
				if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
					e.preventDefault();
					e.stopPropagation();
					that.loadTheme(e.originalEvent.dataTransfer);
				}
			});

		}

		that.profile = function(o) {
			$.extend(that.o.USER, o);
			that.settings();
		}

		that.setRewards = function(rewards) {
			var assigned = [];

			for (var i = 0; i < 3; i++) {
				var oldBird = that.getBird(that.rewards[i] && that.rewards[i].id),
					newBird = that.getBird(rewards[i] && rewards[i].id);

				if (oldBird && (!newBird || oldBird.id != newBird.id))
					oldBird.skin = that.skins['default'];

				if (newBird && assigned.indexOf(newBird.id) < 0) {
					newBird.skin = that.skins[(i+1)];
					assigned.push(newBird.id);
				}
			}

			that.rewards = rewards;
		}

		that.loadTheme = function(input) {
			console.log(input,input.files);
			if (input.files && input.files[0]) {
				var reader = new FileReader();

				reader.onload = function (e) {
					that.theme = new Image();
					that.theme.src = e.target.result;

					// Init level
					that.level = [];

					// Init background
					that.initScenery('background');
					that.initScenery('foreground');

					// Scores
					that.drawScore(that.player.score || 0);
				}

				reader.readAsDataURL(input.files[0]);
			}
		}

		that.stats = function() {
			$('[data-stats-best]').html(that.best);
			$('[data-stats-count]').html(that.count);
			$('[data-stats-nickname]').html(that.is.online ? that.player.nickname : 'Hors ligne');
			$('[data-stats-playerbest]').html(that.player.best);
		}

		that.settings = function() {
			$('[data-option]').each(function(i, input) {
				var set = eval('that.o.'+$(input).data('option'));
				if (set === true || set === false)
					$(input).prop('checked', set);
				else
					$(input).val(set);
			});
			that.cookie.set('FlapIO', JSON.stringify(that.o.USER));	
		}

		that.preset = function(id) {
			if (!that.presets[id]) return;
			that.is.edited = id == 'default' ? false : true;
			$.extend(true, that.o, that.presets['default']);
			$.extend(true, that.o, that.presets[id]);
			that.level = [];
			that.settings();
		}

		that.tab = function(tab) {
			var active = $('nav#menu li.active').data('tab');

			if (active) {

				// Stop onComplete timeout
				clearTimeout($('#overlay .ui > div[data-tab="'+active+'"]').data('timeout'));

				// Hide
				$('#overlay .ui > div[data-tab="'+active+'"]').fadeOut(200, function() {
					$('nav#menu li[data-tab="'+active+'"], #overlay .ui > div[data-tab="'+active+'"]').removeClass('active');
					if (tab && active != tab) that.tab(tab); else $('#screen').removeClass('tab');
				}).data('oncomplete', false);

				// State
				that.is.tab = false;

			} else if (tab) {

				// Show
				$('nav#menu li[data-tab="'+tab+'"], #overlay .ui > div[data-tab="'+tab+'"]').addClass('active');					
				$('#overlay .ui > div[data-tab="'+tab+'"]').fadeIn(300, function() {

					// Blur screen
					$('#screen').addClass('tab');

					// onComplete
					switch (tab) {
						case 'leaderboard':
							if (typeof $('#leaderboard').data('page') !== 'undefined') return;
							that.getLeaderboard();
							break;
						case 'console':
							that.console('refresh');
							break;
					}

					// Update dimensions
					that.scroll[tab] && that.scroll[tab].updateDimensions();

				});

				// State
				that.is.tab = true;

			}
		}

		that.explore = function(side) {
			if (!side) return;

			that.camera.free = true;
			that.camera.animation && that.camera.animation.stop();

			var before = that.camera.target,
				after = that.camera.target + (side == 'right' ? 500 : -500);
				
			that.camera.animation = $({n: before}).animate({n: after}, {
				duration: 200,
				step: function() {
					that.camera.target = this.n;
				},
				complete: function() {
					that.camera.target = Math.round(after);
					that.camera.animation = false;
				}
			});
		}

		that.resize = function() {
			that.canvas.width = that.cache.width = $('#screen .container').width();
			that.canvas.height = that.cache.height = that.o.HEIGHT;
			that.camera.x = 0
			that.o.SPEED.x = 0
			that.initScenery('background');
			that.initScenery('foreground');
			if (that.player) that.drawScore(that.player.score || 0);

			that.mobile = $(window).width() < 768 ? true : false;
		}

		that.prepare = function() {
			if (that.is.ready) return false;

			that.sfx('swooshing');

			// Affichage de l'overlay taptap
			$('.taptap').css('visibility','visible').addClass('in');

			// On cache le "popup gameover"
			that.gameover();

			// Réinitialisation du player
			that.camera.free = false;
			that.camera.track = that.player.id;
			that.player.reset();
			that.drawScore(that.player.score);

			// Ready!!
			that.is.ableToReplay = false;
			that.is.ready = true;
		}

		that.startgame = function() {
			if (that.player.is.dead || that.player.is.physic) return false;

			that.camera.free = false;
			that.camera.track = that.player.id;
			that.time = 0;

			$('body').addClass('playing');
			$('.taptap').removeClass('in');

			that.player.is.physic = true;
			that.player.flap();
		}

		that.endgame = function() {
			$('body').removeClass('playing');

			that.gameover(true);

			Bird.emit.gameover(true);
			that.is.ready = false;

			setTimeout(function() { 
				that.is.ableToReplay = true; 
			}, 1000);
		}

		that.click = function(e) {
			if (that.is.tab) return;
			if (that.ghost) return that.setGhost();

			if (that.is.ableToReplay && !that.is.ready) {
				return that.prepare();
			}
			if (that.is.ready && !that.player.is.physic) {
				return that.startgame();		
			}
			if (!that.player.is.dead) {
				return that.player.flap();
			}
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////

		/* Animation Frame ()
		*/

		that.render = function() {
			if (that.stop) return;

			// Incrementation du temps
			that.time++;

	        // Préparation du <canvas>
	        that.ctx.clearRect(that.camera.x, 0, that.canvas.width, that.canvas.height);

			// Camera
			that.translate();

			// Draw background
			that.drawScenery('background');

			// Draw Level
			that.drawLevel();

			// Draw foreground
			that.drawScenery('foreground');

			// Draw Birds
			for (var i = that.birds.length; i >= 0; i--) {
				if (!(Bird = that.birds[i]) || !Bird.is.render || (!Bird.player && !that.o.USER.PLAYERS)) continue;

				// Auto flap bird
				if (!Bird.player && !Bird.is.dead && Bird.flaps.data[Bird.flaps.i] && Bird.flaps.data[Bird.flaps.i] <= Bird.x) {
					if (Bird.flaps.live && !Bird.flaps.data[Bird.flaps.i+1]) {
						Bird.is.physic && console.info('[Replay] Stop live temporarily (waiting for the next jump data)'), console.time('latency'+Bird.id), (Bird.is.physic = false);
					} else {
						!Bird.is.physic && console.info('[Replay] (Re)starting live'), console.timeEnd('latency'+Bird.id), (Bird.is.physic = true);
						if (Bird.flaps.data[Bird.flaps.i] < Bird.x)
							console.error('Bird.x ('+Bird.x+') > Flap['+Bird.flaps.i+'] ('+Bird.flaps.data[Bird.flaps.i]+')');
						Bird.flap(), Bird.flaps.i++;
					}
				}

				// Physic
				if (Bird.is.physic) Bird.physics();

				// Draw
				Bird.drawBird();
			}

			// Draw overlay
			that.cache && that.ctx.drawImage(that.cache, that.camera.x, 0);

			return window.requestAnimationFrame(that.render);
		}

		that.freeze = function(state) {
			var state = typeof state !== 'undefined' ? state : true;

			if (!state && !that.stop) return;
			that.stop = state;
			return state ? false : window.requestAnimationFrame(that.render);
		}

		that.sfx = function(n) {
			if (!that.o.USER.SFX) return;
			new Audio('sfx/'+n+'.ogg').play();
		}

		that.message = function(str, o) {
			clearTimeout($('#overlay .message').data('timeout'));
			var o = o || {};

			if (!str) {
				$('#overlay .message').fadeOut(200);
				return;
			}

			if ($('#overlay .message:visible').length) {
				$('#overlay .message').fadeOut(200, function() {
					that.message(str, o);
				});
				return;
			}

			$('#overlay .message .content').html(that.stripAccents(str));
			$('#overlay .message').attr('class', 'message'+(o.class ? ' '+o.class : '')).css('visibility','visible').hide().fadeIn(300);

			$('#overlay .message').data('timeout', setTimeout(function() {
				that.message();
			}, 4000));
		}

		that.gameover = function(show, best) {
			if (show) {
				$('#overlay .flash').show().fadeOut(200, function() {

					that.sfx('die');

					$('#overlay .gameover .rank .value').html('...');
					$('#overlay .gameover .dialog').animate({top:0},{duration: 1000, easing: 'easeOutBounce'});
					$({s:0}).animate({s:that.player.score},{
						duration: Math.min(100*(that.player.score+1), 1000),
						step: function() { $('#overlay .gameover .score .value').html(parseInt(this.s)); },
						complete: function() { $('#overlay .gameover .score .value').html(that.player.score); }
					});
					$({b:0}).animate({b:that.player.best},{
						duration: Math.min(100*(that.player.best+1), 1000),
						step: function() { $('#overlay .gameover .best .value').html(parseInt(this.b)); },
						complete: function() { $('#overlay .gameover .best .value').html(that.player.best); }
					});
					$('#overlay .gameover .points .new').css('display',(that.player.last.best < that.player.best ? 'block' : 'none'));
					that.player.last.best = that.player.best;
				});
			} else {
				$('#overlay .gameover .dialog').animate({top:-400},{duration: 300, easing: 'easeOutQuint'});
			}
		}

		that.translate = function() {
			if (!that.camera.free) {
				var Bird = that.getBird(that.camera.track) || that.player;
				!Bird.is.dead && (that.camera.target = Bird.x - 100);
			}

			!that.camera.free && (Bird = that.getBird(that.camera.track)) && !Bird.is.dead && (that.camera.target = Bird.x - 100);
			that.o.SPEED.X = that.camera.x - that.camera.target;
			if (that.camera.target == that.camera.x) return;
			that.ctx.translate(that.camera.x+-(that.camera.target), 0);
			that.camera.x = that.camera.target;
		}

		that.drawScore = function(n) {
			if (!(n = n.toString())) return;

			// Define
			var order = "023456789",
				width = 0,
				sprites = [],
				context = that.cache.getContext('2d');

			// Shadow
			context.shadowColor = 'rgba(0, 0, 0, .1)';
			context.shadowOffsetX = 2;
			context.shadowOffsetY = 2;

			// Calcul de la largeur
			for (var l=0; l<n.length; l++) {
				var s = n[l] == 1;
				sprites.push({x: s ? 224 : 224 + (order.indexOf(n[l]) * 26), y: s ? 922 : 960, w: s ? 18 : 26, h: 38});
				width += sprites[sprites.length - 1].w + 4;
			}

			// Calcul de la position
			var x = Math.round((that.canvas.width / 2) - (width / 2)),
				y = 50;

			// Clear cache
			context.clearRect(0, 50, that.canvas.width, 46);

			// Render
			sprites.forEach(function(sprite) {
				context.drawImage(that.theme, sprite.x, sprite.y, sprite.w, sprite.h, x, y, sprite.w, sprite.h);
				x += sprite.w + 4;
			});
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////

		/* Relations client <-> serveur
		*/

		that.connect = function(r) {
			r && (that.attempt.i = 1);

			if (typeof io !== 'undefined') {

				that.message(L.login);

				// Le serveur est en ligne, connexion du client
				that.io = io.connect(SERVER+'?token='+(that.o.USER.UID || null), {'sync disconnect on unload' : true});
				that.listen();

				// Toute les 100ms, check du state pour terminer la connexion
				that.attempt.interval = setInterval(function() {
					if (that.is.online) clearInterval(that.attempt.interval), clearTimeout(that.attempt.timeout);
				}, 100);

				// Si aucun callback après 10s, le serveur a refusé la connexion
				that.attempt.timeout = setTimeout(function() {
					that.message(L.connectionerror);
					clearInterval(that.attempt.interval);
				});

			} else {

				r && that.message(L.connecting);

				// Le serveur est hors ligne, tentative de connxion toutes les 1000*attempts ms
				that.attempt.interval = setTimeout(function() {
					if (that.io) return;

					that.attempt.i++;
					$.getScript(SERVER+'/socket.io/socket.io.js', function() {
						if (that.io) return;

						clearInterval(that.attempt.interval);
						clearTimeout(that.attempt.timeout);
						that.message(L.connected);
						that.connect();
					});

					if (that.attempt.i == 5) that.message(L.connectionerror);

					that.connect();
				}, 1000 * that.attempt.i);

			}
		}

		that.listen = function() {
			that.io.on('init', function(data) {

				// Récéption du packet d'initiation, client connecté
				that.is.online = true;
				that.is.ready = false;

				// Mise a jour du joueur
				that.birds = [];
				new that.Bird($.extend(true, null, data.bird, {player: true})).init();
				that.profile({
					NICKNAME: data.bird.nickname
				});

				// Création des autres joueurs
				for (var i = 0; i < data.players.length; i++) 
					if (data.players[i] && data.players[i].id && that.player.id != data.players[i].id) 
						new that.Bird(data.players[i]).init();

				// Rewards
				that.setRewards(data.rewards);

				// Synchronisation du level
				that.o.LEVEL.SEED = parseInt(data.seed);
				that.presets['default'].LEVEL.SEED = parseInt(data.seed);

				// Regénération du level
				that.drawLevel(true);

				// Message client
				that.message(L.connected);
				setTimeout(function() { io && that.message(data.message); }, 5000);
				data.guest && setTimeout(function() { io && that.message(L.guest); }, 10000);

				// Leaderboard
				$('#leaderboard').data('max', data.pages);
				if ($('nav#menu li.active').data('tab') == 'leaderboard')
					that.getLeaderboard();

				// Stats
				that.count = data.count;
				that.best = data.best;
				that.stats();

				// Round
				that.round = +new Date() + data.round;

				// Console
				if (data.console) {
					$('#console tbody').html('');
					for (var i = 0; i < data.console.length; i++) {
						var ts = data.console[i].splice(0, 1);
						$('#console tbody').prepend('<tr>\
							<td class="min" data-timeago="'+ts+'">'+that.ago(ts)+'</td>\
							<td>'+data.console[i].join(', ')+'</td>\
						</tr>');
					}
				}

			});

			that.io.on('lead', function(data) {
				(Bird = that.getBird(data.id, true)) && !Bird.player && that.birds.splice(Bird.index, 1);
				that.count = data.count;
				that.stats();
			});

			that.io.on('new', function(data) {
				if (data.id && that.player.id != data.id) new that.Bird(data).init();
				that.count = data.count;
				that.stats();

				that.setRewards(data.rewards);
			});

			that.io.on('nickname', function(data) {
				if (!(socket = that.getBird(data.id))) return false;
				socket.nickname = data.nickname;
				socket.drawCache();

				if (!socket.player) return;
				that.profile({NICKNAME: data.nickname});
				that.stats();

				$('#profil_nickname').siblings('.io-success').addClass('in');
			});

			that.io.on('ghost', function(data) {
				if (!data.jumps) return that.message(L.error.noghost);

				that.setGhost(data);
			});

			that.io.on('leaderboard', function(data) {
				that.scores = data.scores || [];
				if ($('#leaderboard').data('max') != Math.floor(data.count/25)) $('#leaderboard tbody').html('');
				$('#leaderboard').data('max', Math.floor(data.count/25));
				$('span.paging').html(data.count+' scores');
				that.doLeaderboard();
				G.message();
			});

			that.io.on('score', function(data) {
				if (!(socket = that.getBird(data.id))) return false;
				that.hideLiveboard(socket.id, data.score);
				socket.flaps.live = false;
				that.best = Math.max(data.score, that.best);
				that.stats();
				that.setRewards(data.rewards);
			});

			that.io.on('rank', function(data) {
				$({a:0}).animate({a:data.rank.alltime},{
					duration: Math.min(100*(data.rank.alltime+1), 1000),
					step: function() { $('#overlay .gameover .rank .value').html(parseInt(this.a)); },
					complete: function() { $('#overlay .gameover .rank .value').html(data.rank.alltime); }
				});
				$({b:0}).animate({b:data.rank.daily},{
					duration: Math.min(100*(data.rank.daily+1), 1000),
					step: function() { $('#overlay .gameover .rankdaily .value').html(parseInt(this.b)); },
					complete: function() { $('#overlay .gameover .rankdaily .value').html(data.rank.daily); }
				});
				that.player.rank = data.rank;
			});

			that.io.on('jump', function(data) {
				if (!that.is.online || that.is.edited || !(socket = that.getBird(data.id))) return false;
				that.updateLiveboard(socket.id, socket.score = data.score);
				if (socket.flaps.data.length > 0 && data.jumps[0] <= socket.flaps.data[socket.flaps.data.length-1] || !socket.flaps.data.length) {
					socket.flaps.live = true;
					socket.flaps.data = data.jumps;
					socket.play();
				} else {
					socket.flaps.data = socket.flaps.data.concat(data.jumps)
				}
			});

			that.io.on('message', function(data) {
				if (typeof data === 'String') 
					return that.message(data);
				that.message(data.text, data.options);
			});

			that.io.on('round', function(data) {
				that.message(L.newround);
				that.is.ready = false;
				that.round = data.round;
				that.o.LEVEL.SEED = data.seed;
				that.level = [];
				that.prepare();
			});

			that.io.on('disconnect', function() {
				io = undefined;
				that.message(L.connectionlost);
				setTimeout(function() { that.connect(true); }, 1000);
			});

			that.io.on('refresh', function(data) {
				$('#rewards tbody').html('');
				for (var i = 0; i < data.rewards.length; i++) {
					var client = that.getBird(data.rewards[i].id);
					var nickname = client ? client.nickname : 'Non connecté'
					$('#rewards tbody').append('<tr>\
						<td>'+(i+1)+'</td>\
						<td>'+nickname+'</td>\
						<td>'+data.rewards[i].score+'</td>\
					</tr>')
				}
				$('#online tbody').html('');
				for (var i = 0; i < data.online.length; i++) {
					if (!data.online[i]) continue;
					var client = that.getBird(data.online[i].id);
					$('#online tbody').append('<tr>\
						<td><code>'+client.id+'</code></td>\
						<td>'+client.nickname+'</td>\
						<td>'+(client ? client.best : 'Unknown')+'</td>\
						<td class="td-btn"><button data-admin="kick" data-id="'+client.id+'" class="btn btn-xs btn-danger">Kick</button></td>\
						<td class="td-btn">\
							<button type="button" class="btn btn-xs btn-flap dropdown-toggle" data-toggle="dropdown">Reward <span class="caret"></span></button>\
							<ul class="dropdown-menu dropdown-menu-right" role="menu">\
								<li data-admin="reward" data-id="'+client.id+'" data-rank="1"><a href="#">Gold</a></li>\
								<li data-admin="reward" data-id="'+client.id+'" data-rank="3"><a href="#">Silver</a></li>\
								<li data-admin="reward" data-id="'+client.id+'" data-rank="3"><a href="#">Bronze</a></li>\
							</ul>\
						</td>\
					</tr>')
				}
				that.message();
			});

			that.io.on('console', function(data) {
				var ts = data.splice(0, 1);
				$('#console tbody').prepend('<tr>\
					<td class="min" data-timeago="'+ts+'">'+that.ago(ts)+'</td>\
					<td>'+data.join(' ')+'</td>\
				</tr>');
			});

			that.io.on('debug', function(data) {
				window.log = data;
				console.log(window.log);
			});
		}

		that.send = function(id, data) {
			if (id && data && that.is.online) {
				that.io.emit(id,data);
				return true;
			} else {
				return false;
			}
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////

		/* Birds Class
		*/

		that.getBird = function(id, index) {
			for (var i = 0; i < that.birds.length; i++) {
				if (that.birds[i].id == id) {
					index && (that.birds[i].index = i);
					return that.birds[i];
				}
			}
			return;
		}

		that.Bird = function(input) {
			var Bird = this, input = input || {};

			if (!input.id && !input.player) return;

			// Affichage
			Bird.x = 100;
			Bird.y = 200;
			Bird.w = 34;
			Bird.h = 24;
			Bird.vx = 0;
			Bird.vy = 0;
			Bird.r = 0;
			Bird.ground = false;
			Bird.skin = input.skin || that.skins.default;
			Bird.frame = {
				i: 0, t: 0, speed: 5
			};

			// Data
			Bird.id = input.id || rdStr(16);
			Bird.player = input.player || false;
			Bird.score = input.score || 0;
			Bird.best = input.best || 0;
			Bird.nickname = input.nickname || null;
			Bird.cache = {canvas: null, w: 100, h: 100};
			Bird.last = {r: 0, vy: 0, target: -1, best: Bird.best};
			Bird.ghost = input.ghost || null;

			// Etat
			Bird.is = {
				render: true,
				physic: false,
				dead: false,
			};

			// Jumps
			Bird.flaps = {
				i: 0,
				live: false,
				data: input.jumps || [],
				ready: []
			}

			Bird.init = function() {
				Bird.drawCache();

				if (Bird.ghost) Bird.play();
				if (!Bird.player) return Bird;

				that.prepare();

				return Bird;
			}

			Bird.physics = function() {
				if (!Bird.is.physic || !Bird.is.render) return;

				Bird.vx = Bird.is.dead ? Bird.vx * (Math.abs(Bird.vx) > 0.3 ? that.o.PHYSICS.FRIC : 0) : Math.max(that.o.PHYSICS.XVEL, Bird.vx);
				Bird.vy += !Bird.ground ? that.o.PHYSICS.YVEL : 0;

				Bird.r = Math.asin(Math.min(Math.max(Bird.vy - (Bird.is.dead ? 0 : 3), -8), 12) / 12) / Math.PI;

				Bird.x += Bird.vx;
				Bird.y += Bird.vy;

				if (Bird.y > (that.o.PHYSICS.GRND - Bird.h/2)) {
					Bird.y = that.o.PHYSICS.GRND - Bird.h/2;
					Bird.vy *= that.o.PHYSICS.REST;
					Bird.vx *= 0.7;
					Bird.kill();
				}

				var target = Math.max(Math.floor((Bird.x + Bird.w / 2) / (that.o.LEVEL.SPACE + that.o.LEVEL.WIDTH)),that.o.LEVEL.MARGIN)-that.o.LEVEL.MARGIN;

				if ((pipe = that.level[target])) {
					if (Bird.x > pipe.x - Bird.w / 2 && Bird.x < pipe.x + that.o.LEVEL.WIDTH + Bird.w / 2) {
						if ((Bird.player || (!Bird.player && !pipe.m)) && (Bird.y < pipe.y + Bird.h / 2 || Bird.y > pipe.y + pipe.d - Bird.h / 2)) {
							if (Bird.y > pipe.y - 10 + Bird.h / 2 && Bird.y < pipe.y + pipe.d + 10 - Bird.h / 2) {
								if (Bird.x > pipe.x - Bird.w / 2 + 10 && Bird.x < pipe.x + that.o.LEVEL.WIDTH + Bird.w / 2 - 10) {
									if (Bird.y - pipe.y < pipe.d/2) {
										Bird.vy *= -0.5,
										Bird.y = pipe.y + Bird.h / 2;
									} else {
										Bird.vy *= - 0.5
										Bird.y = pipe.y + pipe.d - Bird.h / 2;
									}
									Bird.kill();
								}
							} else {
								if (Bird.x - pipe.x < that.o.LEVEL.WIDTH/2) {
									Bird.vx *= -2;
									Bird.x = pipe.x + 1 - Bird.w / 2;
								} else {
									Bird.vx *= 0.5;
									Bird.x = pipe.x + that.o.LEVEL.WIDTH - 1 + Bird.w / 2;
								}
								Bird.kill();
							}
						} else if (target > Bird.last.target && Bird.x > pipe.x + that.o.LEVEL.WIDTH / 2) {
							Bird.win(target);
						}
					}
				}

				if (pipe && !pipe.m) {
					if ((Bird.y + Bird.h / 2 == that.o.PHYSICS.GRND && Bird.r.toFixed(2) == 0.01) || (Bird.last.r.toFixed(4)== Bird.r.toFixed(4) && Bird.last.vy.toFixed(4) == Bird.vy.toFixed(4) && Bird.vy >= -1)) {
						Bird.ground = true, Bird.vy = 0;
					}
				}

				Bird.last.r = Bird.r;
				Bird.last.vy = Bird.vy;

				return this;
			}

			Bird.drawBird = function() {
				// Selection du skin
				var skin = Bird.is.dead ? Bird.skin['dead'] : Bird.skin['alive'];
				if (Bird.frame.t % Bird.frame.speed == 0 || !skin[Bird.frame.i]) Bird.frame.i = (++Bird.frame.i % skin.length), Bird.frame.t = 1; else Bird.frame.t++;
				skin = skin[Bird.frame.i];


				// Rendus
				that.ctx.save();
				that.ctx.translate(Math.round(Bird.x), Math.round(Bird.y));

				if (Bird.cache.canvas && !that.is.edited && (Bird.x > 120 || Bird.player)) that.ctx.drawImage(Bird.cache.canvas, Math.round(- Bird.cache.w / 2), Math.round(- Bird.cache.h / 2));

				that.ctx.rotate(Math.PI * Bird.r);
				that.ctx.drawImage(that.theme, skin[0], skin[1], skin[2], skin[3], Math.round(- Bird.w / 2), Math.round(- Bird.h / 2), Bird.w, Bird.h);
				that.ctx.restore();
			}

			Bird.drawCache = function() {
				Bird.cache.canvas = Bird.cache.canvas || $('<canvas/>', {'Width': Bird.cache.w, 'Height': Bird.cache.h}).get(0);
				Bird.cache.canvas.width = Bird.cache.canvas.width;
				var context = Bird.cache.canvas.getContext('2d');

				if (Bird.nickname) {
					context.font = "13px Calibri";
					context.textAlign = "center"; 
					context.fillStyle = 'white'; 
					context.shadowColor = 'rgba(0, 0, 0, .5)'; 
					context.shadowBlur = 0; 
					context.globalAlpha = 1; 
					context.shadowOffsetX = 0; 
					context.shadowOffsetY = 1; 
					context.fillText(Bird.nickname, 50, 30);
				}
			}

			Bird.kill = function() {
				if (Bird.is.dead) return;

				Bird.is.dead = true;

				if (!Bird.player) return; 

				that.sfx('hit');

				that.hideLiveboard(Bird.id, Bird.score);
				that.stats();
				that.endgame();
			}

			Bird.win = function(target) {
				if ((!Bird.player && that.camera.track != Bird.id) || Bird.is.dead) return;
				Bird.last.target = target;
				Bird.score++;
				that.drawScore(Bird.score);
				if (!Bird.player) return;
				that.sfx('point');
				that.updateLiveboard(Bird.id, Bird.score);
				Bird.best = Math.max(Bird.best, Bird.score);
			}

			Bird.flap = function() {
				Bird.ground = false;
				Bird.vy = that.o.PHYSICS.FLAP;

				if (!Bird.player || Bird.flaps.data[Bird.flaps.data.length - 1] == Bird.x) return;
				that.sfx('wing');
				Bird.flaps.data.push(Bird.x);
				Bird.flaps.ready.push(Bird.x);
				Bird.emit.flap();
			}

			Bird.reset = function() {
				Bird.is.dead = false;
				Bird.is.physic = false;

				Bird.score = 0;
				Bird.last.target = -1;

				Bird.vx = 0;
				Bird.vy = 0;
				Bird.x = 100;
				Bird.y = 200;
				Bird.r = 0;

				Bird.flaps.i = 0;

				if (!Bird.player) return; 

				Bird.flaps = {
					data: [],
					ready: [],
					i: 0
				}
			}

			if (Bird.player) {

				Bird.emit = {
					flap: function() {
						if (Bird.flaps.data.length >= 1 && Bird.flaps.ready.length && !that.is.edited) {
							if (that.send('user_command', {
								fn: 'jump',
								dt: Bird.flaps.ready
							})) {
								Bird.flaps.ready = [];
							}
						}
					},
					gameover: function() {
						if (Bird.is.dead && !that.is.edited) {
							if (that.send('user_command', {
								fn: 'gameover',
								dt: {j: Bird.flaps.ready, s: Bird.x}
							}, true)) {
								Bird.flaps.ready = [];
							}
						}
					},
					log: function() {
						that.send('user_command', {
							fn: 'log',
							dt: true
						});
					}
				}

			} else {

				Bird.play = function() {
					if (Bird.player) return false;

					Bird.reset();

					Bird.is.dead = false;
					Bird.is.physic = true;

					Bird.flap();
				}

			}

			// Register
			if (Bird.player) that.player = Bird, that.camera.track = Bird.id;
			that.birds.push(Bird);

			return Bird;
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////

		/* Level generation
		*/

		that.drawLevel = function(seed) {
			// Reset
			if (seed) {
				typeof seed === 'number' && (that.o.LEVEL.SEED = seed);
				that.level = [];
				return;
			}

			if (!that.o.LEVEL.SEED) return false;

			// Clée pseudo aléatoire
			var seed = parseInt(that.o.LEVEL.SEED);

			// Retourne un ratio pseudo aléatoire en fonction du "seed"
			function random(offset) {
				var x = +Math.sin(offset ? (seed + offset) : seed++).toFixed(8) * 10000;
				return x - Math.floor(x);
			}

			// Récupere la valeur du premier tuyau affiché
			var start = Math.max(Math.floor(that.camera.x / (that.o.LEVEL.SPACE + that.o.LEVEL.WIDTH)), that.o.LEVEL.MARGIN),
				end = Math.floor((that.camera.x + that.canvas.width) / (that.o.LEVEL.SPACE + that.o.LEVEL.WIDTH));
				seed += start;

			// Suppression des tuyaux non présents dans l'axe de generation
			for (var i = start; i <= end; i++) {
				var heightFactor = random(),
					heightFactorOffset = random(10000),
					id = i - that.o.LEVEL.MARGIN;
				if (that.level[id] && !that.level[id].m) {
					that.ctx.drawImage(that.level[id].c, that.level[id].x, 0);
					continue;
				}

				var dynamicFactor = Math.max(Math.min(heightFactorOffset * id * that.o.LEVEL.DYNAMIC_STRENGTH_FACTOR, that.o.LEVEL.DYNAMIC_STRENGTH_FACTOR_MAX), that.o.LEVEL.DYNAMIC_STRENGTH_FACTOR_MIN),
					isDynamicFactor = heightFactorOffset < Math.max(Math.min(id * that.o.LEVEL.DYNAMIC_FACTOR / 2, that.o.LEVEL.DYNAMIC_FACTOR_MAX), that.o.LEVEL.DYNAMIC_FACTOR_MIN),
					d = isDynamicFactor ? Math.max(that.o.LEVEL.MIN_DIFFICULTY - ((that.o.LEVEL.MIN_DIFFICULTY * that.o.LEVEL.DIFFICULTY_FACTOR) * id), that.o.LEVEL.MAX_DIFFICULTY + 25) : Math.max(Math.min(that.o.LEVEL.MIN_DIFFICULTY - ((that.o.LEVEL.MIN_DIFFICULTY * that.o.LEVEL.DIFFICULTY_FACTOR) * id), 300), that.o.LEVEL.MAX_DIFFICULTY),
					x = 0 + (that.o.LEVEL.SPACE + that.o.LEVEL.WIDTH) * i,
					y = Math.round(heightFactor * (that.o.PHYSICS.GRND - d - that.o.LEVEL.WIDTH * 2) + that.o.LEVEL.WIDTH);

				if (isDynamicFactor) {

					// Obstacle dynamique
					that.level[id] = { hF: heightFactor, hFOff: heightFactorOffset, x: x, y: y + (that.o.LEVEL.DYNAMIC_MARGIN_MIN + dynamicFactor * that.o.LEVEL.DYNAMIC_MARGIN_MAX) * Math.sin((that.time + heightFactorOffset * 1000) / Math.max(50, 100 - 100 * dynamicFactor)), d: d, m: true };
					that.ctx.drawImage(that.theme, 2, 678, 52, 320, x, -320 + that.level[id].y, 52, 320);
					that.ctx.drawImage(that.theme, 56, 678, 52, 320, x, that.level[id].y + that.level[id].d, 52, 320);

				} else {            

					// Obstacle statique
					that.level[id] = { hF: heightFactor, hFOff: heightFactorOffset, x: x, y: y, d: d, c: $('<canvas/>', {'Width':52,'Height':400}).get(0)};
					var context = that.level[id].c.getContext('2d');
					context.drawImage(that.theme, 2, 678, 52, 320, 0, -320 + that.level[id].y, 52, 320);
					context.drawImage(that.theme, 56, 678, 52, 320, 0, that.level[id].y + that.level[id].d, 52, 320);

				}
			}
		}

		/* Background generation
		*/

		that.initScenery = function(scenery) {
			for (var i = 0; i < that[scenery].length; i++) {
				var obj = that[scenery][i];
					obj.c = $('<canvas/>', {'Width': that.canvas.width + obj.sprite[2] * 2, 'Height': 512}).get(0);
					obj.t = 0;

				var context = obj.c.getContext('2d');
				if (obj.r) {
					context.drawImage(that.theme, obj.sprite[0], obj.sprite[1], obj.sprite[2], obj.sprite[3], rdNb(0, that.canvas.width - obj.sprite[2], true), (obj.y || 0), obj.sprite[2], obj.sprite[3]);
				} else {
					for (var o = 0; o < Math.ceil(that.canvas.width / obj.sprite[2]) + 2; o++) {
						context.drawImage(that.theme, obj.sprite[0], obj.sprite[1], obj.sprite[2], obj.sprite[3], o * obj.sprite[2], (obj.y || 0), obj.sprite[2], obj.sprite[3]);
					}
				}
			}
		}

		that.drawScenery = function(scenery) {
			if (that.o.USER.BOOSTFPS) return;

			for (var i = 0; i < that[scenery].length; i++) {
				var obj = that[scenery][i];
				obj.t = typeof obj.t !== 'undefined' ? obj.t + (obj.speed * that.o.SPEED.X) : 0;
				that.ctx.drawImage(obj.c, - obj.sprite[2] + that.camera.x + (obj.r ? obj.t % obj.c.width : obj.t % obj.sprite[2]), 0);
			}
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////

		/* Ranks & scoring system
		*/

		that.getScore = function(id, index) {
			for (var i = 0; i < that.scores.length; i++) {
				if (that.scores[i]._id == id) {
					index && (that.scores[i].index = i);
					return that.scores[i];
				}
			}
			return;
		}

		that.getLeaderboard = function(order, by, page, nickname, collection) {
			if (!that.is.online) {
				that.message(L.error.notonline);
				return;
			}
			var page = typeof page !== 'undefined' ? page : $('#leaderboard').data('page') || 0,
				collection = collection || $('#leaderboard').data('collection') || 'a',
				daily = $('#leaderboard').data('daily'),
				nickname = $('#leaderboard_nickname').val(),

				order = order || $('#leaderboard th.active').data('order') || 'score',
				by = by || $('#leaderboard th.active').data('by') || -1;

			if (nickname != $('#leaderboard').data('nickname') || collection != $('#leaderboard').data('collection')) page = 0;

			$('#leaderboard').data({
				page: page,
				nickname: nickname,
				collection: collection,
				daily: daily
			});

			that.message(L.leaderboard.loading);
			that.send('user_command', {
				fn: 'leaderboard',
				dt: {page: page, order: order, by: by, nickname: nickname, collection: collection, daily: daily}
			});
		}

		that.doLeaderboard = function() {

			// Reset
			$('#leaderboard').data('page') == 0 && $('#leaderboard tbody').html('');

			// Sort scores object
			for (var i = 0; i < that.scores.length; i++) {
				var row = that.scores[i];

				$('#leaderboard tbody').append('<tr data-id="'+row._id+'">\
					<td class="nickname">'+row.nickname+'</td>\
					<td class="timestamp">'+(row.timestamp ? 'Il y a '+that.ago(row.timestamp) : 'Unknown (< 1.0)')+'</td>\
					<td class="score">'+row.score+'</td>\
				</tr>');
			}

			// Update scoller dimensions
			that.scroll.leaderboard.updateDimensions();

		}

		that.hideLiveboard = function(id, score) {
			if (that.is.edited || !score || !that.io) return;

			if ($('#liveboard [data-id="'+id+'"]').length)
				$('#liveboard [data-id="'+id+'"] .score').html(score).parent().data('score', score).addClass('dead').data('end', setTimeout(function() { $('#liveboard [data-id="'+id+'"]').fadeOut(200, function() { $(this).remove(); }); }, 2000));
		}

		that.updateLiveboard = function(id, score) {
			if (that.is.edited || !(bird = that.getBird(id)) || !score || !that.io) return;

			var nickname = bird.nickname;

			if ($('#liveboard [data-id="'+id+'"]').length) {
				$('#liveboard [data-id="'+id+'"]').html('<div class="nickname">'+nickname+'</div><div class="score">'+score+'</div>').data('score', score);
			} else {
				$row = $('<li style="display:none;" data-id="'+id+'" data-score="'+score+'"><div class="nickname">'+nickname+'</div><div class="score">'+score+'</div></li>');
				$('#liveboard').append($row);
				$row.fadeIn(200);
			}

			that.sortLeaderboard($('#liveboard'));
		}

		that.sortLeaderboard = function(list) {
			if (!list) return;
			var sort = list.find('li').sort(function(a, b) {
				var an = $(a).data('score'),
					bn = $(b).data('score');

				return an > bn ? -1 : an < bn ? 1 : 0;
			});
			list.append(sort);
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////

		/* Ghosts
		*/

		that.setGhost = function(ghost) {
			if (that.ghost) {
				that.drawLevel(that.temp['SEED']);

				that.birds.splice(that.getBird(that.ghost.id, true).index,1);
				that.ghost = null;
				that.camera.track = that.player.id;
			}

			if (!ghost) return;

			that.temp['SEED'] = that.o.LEVEL.SEED, that.drawLevel(ghost.seed);

			that.ghost = new that.Bird($.extend(true, null, ghost, {id: 'ghost'+ghost._id, jumps: ghost.jumps.split(',').map(Number), ghost: true})).init();
			that.camera.track = that.ghost.id;
			that.time = 0;

			that.tab();
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////

		/* Console
		*/

		that.console = function(command, data) {
			switch (command) {
				case 'refresh':
					$('#rewards tbody, #online tbody').html('');
					that.message(L.leaderboard.loading);
					that.send('admin_command', {
						fn: 'refresh'
					});
					break;
				case 'kick':
					that.send('admin_command', {
						fn: 'kick',
						dt: data
					});
					break;
				case 'reward':
					that.send('admin_command', {
						fn: 'reward',
						dt: data
					});
					break;
				case 'endround':
					that.send('admin_command', {
						fn: 'endround'
					});
					break;
			}
		}

		///////////////////////////////////////////////////////////////////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////

		/* Utils
		*/

		that.cookie = {
			set: function(c,d,e){var e=e||3650;var b=new Date();b.setTime(b.getTime()+(e*24*60*60*1000));var a="; expires="+b.toGMTString();document.cookie=c+"="+escape(d)+a+"; path=/"},
			get: function(b){var c,a,e,d=document.cookie.split(";");for(c=0;c<d.length;c++){a=d[c].substr(0,d[c].indexOf("="));e=d[c].substr(d[c].indexOf("=")+1);a=a.replace(/^\s+|\s+$/g,"");if(a==b){return unescape(e)}}},
		}

		that.stripAccents = function(str) {
			var str = str.split('');
			var out = new Array();
			var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
			var strippd = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
			for (var y = 0; y < str.length; y++) {
				if (accents.indexOf(str[y]) != -1) {
					out[y] = strippd.substr(accents.indexOf(str[y]), 1);
				} else
					out[y] = str[y];
			}
			out = out.join('');
			return out;
		}

		that.ago = function(time) {

			var seconds = Math.floor((new Date() - time) / 1000),
				delta = 0;

			if ((delta = Math.floor(seconds / 31536000)) > 1) return delta+" "+L.date.year+(delta>1 ? "s" : "");
			if ((delta = Math.floor(seconds / 2592000)) > 1) return delta+" "+L.date.month;
			if ((delta = Math.floor(seconds / 86400)) > 1) return delta+" "+L.date.day+(delta>1 ? "s" : "");
			if ((delta = Math.floor(seconds / 3600)) > 1) return delta+" "+L.date.hour+(delta>1 ? "s" : "");
			if ((delta = Math.floor(seconds / 60)) > 1) return delta+" "+L.date.minute+(delta>1 ? "s" : "");
			return Math.floor(seconds) + " "+L.date.second+(Math.floor(seconds)>1 ? "s" : "");

		}

		function two(n){
			return n > 9 ? "" + n: "0" + n;
		}
	}

	var G = new Game().init();




