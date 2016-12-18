<?php
	function __autoload($c) {
		include 'src/'.$c . '.php';
	}
	
	$FlapIO = new FlapIO();
?>
<!DOCTYPE html>
<html lang="fr">
	<head>
		<meta charset="UTF-8" />
		<title>FlapIO</title>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="description" content="Just for fun. Play it here!">
		<meta name="author" content="Kevin Rostagni">
		<meta name="title" content="Kevin Rostagni">
		<meta name="robots" content="index">
		<meta name="keywords" content="flappy bird, multiplayer, flapio">
		<meta name="Indentifier-URL" content="http://flapio.kevinrostagni.me">
		<meta name="theme-color" content="#006B74">
		<meta name="msapplication-navbutton-color" content="#006B74">
		<meta name="apple-mobile-web-app-status-bar-style" content="#006B74">

		<meta name="DC.title" content="Kevin Rostagni">
		<meta name="DC.creator" content="Kevin Rostagni">
		<meta name="DC.subject" content="flappy bird, multiplayer, flapio">
		<meta name="DC.description" content="Just for fun. Play it here!">
		<meta name="DC.publisher" content="Kevin Rostagni">
		<meta name="DC.format" content="website">
		<meta name="DC.identifier" content="http://flapio.kevinrostagni.me">
		<meta name="DC.language" content="fr">
		<meta name="DC.coverage" content="World">
		<meta name="DC.rights" content="© Kevin Rostagni - 2016">

		<meta property="og:site_name" content="Kevin Rostagni">
		<meta property="og:title" content="FlapIO">
		<meta property="og:type" content="website">
		<meta property="og:locale" content="fr_FR">
		<meta property="og:url" content="https://kevinrostagni.me">
		<meta property="og:image" content="http://flapio.kevinrostagni.me/img/social.png">
		<meta property="og:description" content="Just for fun. Play it here!">
		<link rel="icon" type="image/png" href="favicon.png" />
		<link rel="stylesheet" href="fonts/passion/styles.css">
		<link rel="stylesheet" href="css/bootstrap.min.css">
		<link rel="stylesheet" href="css/style.css">
		<link rel="stylesheet" href="css/responsive.css">
		<script>
			var THEME = '<?php echo $FlapIO->theme; ?>';
			var SERVER = '<?php echo $FlapIO->server; ?>';
			var L = <?php echo json_encode($FlapIO->translation); ?>;
			var CONSOLE = <?php echo isset($_GET['console']) ? 'true' : 'false'; ?>;
		</script>
	</head>
	<body class="<?php echo $FlapIO->theme; ?>">
		<div class="wrapper">
			<header id="header">
				<div class="container">
					<div class="row">
						<div class="col-md-4 col-sm-5 hidden-xs hidden-sm">
							<div id="logo">FlapIO <sup><span class="label label-success version">The Flappy Bird Multiplayer</span></sup></div>
						</div>
						<div class="col-md-8 col-sm-7 col-xs-12">
							<ul><li class="toggle io-toggle tips"></li></ul>
							<nav id="menu">
								<ul>
									<li data-tab="leaderboard" class="io-graph tips" data-placement="top" title="<?php echo $FlapIO->translation['tooltip']['leaderboard']; ?>"></li>
									<li data-tab="settings" class="io-wrench tips" data-placement="top" title="<?php echo $FlapIO->translation['tooltip']['editor']; ?>"></li>
									<li data-tab="profil" class="io-profil tips" data-placement="top" title="<?php echo $FlapIO->translation['tooltip']['profile']; ?>"></li>
									<?php if (isset($_GET['console'])) { ?>
										<li data-tab="console" class="io-command tips" data-placement="top" title="Console admin"></li>
									<?php } ?>
								</ul>
							</nav>
						</div>
					</div>
				</div>
			</header>
			<section id="stats">
				<div class="container">
					<div class="clear">
						<ul class="nickname">
							<li class="tips btn-flap" title="<?php echo $FlapIO->translation['tooltip']['nickname']; ?>"><span data-stats-nickname>Hors ligne</span></li
							><li class="tips btn-flap" title="<?php echo $FlapIO->translation['tooltip']['online']; ?>"><span class="io-globe" data-stats-count>0</span></li
							><li class="tips btn-flap" title="<?php echo $FlapIO->translation['tooltip']['serverbest']; ?>"><span class="io-double-up" data-stats-best>0</span></li
							><li class="tips btn-flap" title="<?php echo $FlapIO->translation['tooltip']['playerbest']; ?>"><span class="io-up" data-stats-playerbest>0</span></li
							><li class="tips btn-flap" title="<?php echo $FlapIO->translation['tooltip']['round']; ?>"><span class="io-clock" data-stats-round>...</span></li>
						</ul>
					</div>
				</div>
			</section>
			<section id="screen">
				<div class="container">
					<div class="clear">
						<div id="overlay">
							<div class="taptap float fade in">
								<div class="middle">
									<div class="wrapper"></div>
								</div>
							</div>
							<div class="live">
								<div class="wrapper">
									<ul id="liveboard">
									</ul>
								</div>
							</div>
							<div class="flash"></div>
							<div class="gameover fade in">
								<div class="middle">
									<div class="wrapper">
										<div class="dialog">
											<div class="content">
												<div class="title">Game over...</div>
												<div class="classic">
													<div class="rank">
														<div class="text">rank</div>
														<div class="value">...</div>
													</div>
													<div class="rankdaily">
														<div class="text">today</div>
														<div class="value">...</div>
													</div>
													<div class="points">
														<div class="score">
															<div class="text">Score</div>
															<div class="value">0</div>
														</div>
														<div class="best">
															<div class="text"><span class="new">new</span>Best</div>
															<div class="value">0</div>
														</div>
													</div>
												</div>
												<div class="share">
													<div class="text"></div>
													<div class="social">
														<span id="facebook" class="tips" title="<?php echo $FlapIO->translation['shareon']; ?> Facebook"></span>
														<span id="twitter" class="tips" title="<?php echo $FlapIO->translation['shareon']; ?> Twitter"></span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="message" style="z-index:1;height:0px;">
								<div class="wrapper">
									<div class="dialog">
										<div class="content"></div>
									</div>
								</div>
							</div>
							<div class="ui">
								<div data-tab="settings">
									<div class="inner">
										<div class="title"><?php echo $FlapIO->translation['editor']['title']; ?></div>
										<form role="presets">
											<input style="display:none" type="text" name="_"/>
											<input style="display:none" type="password" name="_"/>

											<div class="form-group">
												<label for="settings_presets"><?php echo $FlapIO->translation['editor']['presets']; ?> (1)</label>
												<select class="form-control" id="settings_presets">
													<option value="default" selected><?php echo $FlapIO->translation['editor']['default']; ?> (online)</option>
												</select>
											</div>
										</form>
										<div class="row">
											<div class="col-md-4 col-sm-4 col-xs-12">
												<div class="title"><?php echo $FlapIO->translation['editor']['physic']; ?></div>
												<form role="physics">
													<input style="display:none" type="text" name="_"/>
													<input style="display:none" type="password" name="_"/>

													<div class="row">
														<div class="form-group col-md-6 col-sm-6 col-xs-12">
															<label for="settings_speedvx"><?php echo $FlapIO->translation['editor']['vx']; ?></label>
															<input type="text" class="form-control" id="settings_speedvx" data-option="PHYSICS.XVEL" data-local="true">
														</div>
														<div class="form-group col-md-6 col-sm-6 col-xs-12">
															<label for="settings_gravityvy"><?php echo $FlapIO->translation['editor']['g']; ?></label>
															<input type="text" class="form-control" id="settings_gravityvy" data-option="PHYSICS.YVEL" data-local="true">
														</div>
													</div>
													<div class="row">
														<div class="form-group col-md-6 col-sm-6 col-xs-12">
															<label for="settings_friction">Friction</label>
															<input type="text" class="form-control" id="settings_friction" data-option="PHYSICS.FRIC" data-local="true">
														</div>
														<div class="form-group col-md-6 col-sm-6 col-xs-12">
															<label for="settings_restitution">Restitution</label>
															<input type="text" class="form-control" id="settings_restitution" data-option="PHYSICS.REST" data-local="true">
														</div>
													</div>
													<div class="form-group">
														<label for="settings_flapvy"><?php echo $FlapIO->translation['editor']['jump']; ?></label>
														<input type="text" class="form-control" id="settings_flapvy" data-option="PHYSICS.FLAP" data-local="true">
													</div>
												</form>
											</div>
											<div class="col-md-8 col-sm-8 col-xs-12">
												<div class="title"><?php echo $FlapIO->translation['level']['title']; ?></div>
												<form role="level">
													<input style="display:none" type="text" name="_"/>
													<input style="display:none" type="password" name="_"/>
													
													<div class="row">
														<div class="form-group col-md-6 col-sm-6 col-xs-6">
															<label for="settings_seed"><?php echo $FlapIO->translation['level']['id']; ?></label>
															<input type="text" class="form-control" id="settings_seed" data-option="LEVEL.SEED" data-refresh="true" data-local="true">
														</div>
														<div class="form-group col-md-6 col-sm-6 col-xs-6">
															<label for="settings_margin"><?php echo $FlapIO->translation['level']['gap']; ?></label>
															<input type="text" class="form-control" id="settings_margin" data-option="LEVEL.SPACE" data-refresh="true" data-local="true">
														</div>
													</div>
													<div class="row">
														<div class="form-group col-md-6 col-sm-6 col-xs-6">
															<label for="settings_dynfactormin"><?php echo $FlapIO->translation['level']['factorgap']; ?></label>
															<div class="row">
																<div class="col-xs-8 col-sm-6 col-xs-6">
																	<input type="text" class="form-control" id="settings_dynfactormin" placeHolder="Min" data-option="LEVEL.DYNAMIC_FACTOR_MIN" data-refresh="true" data-local="true">
																</div>
																<div class="col-xs-4 col-sm-6 col-xs-6">
																	<input type="text" class="form-control" id="settings_dynfactormax" placeHolder="Max" data-option="LEVEL.DYNAMIC_FACTOR_MAX" data-refresh="true" data-local="true">
																</div>		
															</div>	
														</div>
														<div class="col-md-6 col-sm-6 col-xs-6">
															<label for="settings_stengthmin"><?php echo $FlapIO->translation['level']['factorspeed']; ?></label>
															<div class="row">
																<div class="col-xs-8 col-sm-6 col-xs-6">
																	<input type="text" class="form-control" id="settings_stengthmin" placeHolder="Min" data-option="LEVEL.DYNAMIC_STRENGTH_FACTOR_MIN" data-refresh="true" data-local="true">
																</div>
																<div class="col-xs-4 col-sm-6 col-xs-6">
																	<input type="text" class="form-control" id="settings_stengthmax" placeHolder="Max" data-option="LEVEL.DYNAMIC_STRENGTH_FACTOR_MAX" data-refresh="true" data-local="true">
																</div>		
															</div>										
														</div>
													</div>
													<div class="row">
														<div class="form-group col-md-6 col-sm-6 col-xs-6">
															<label for="settings_mindiff"><?php echo $FlapIO->translation['level']['difficultymin']; ?></label>
															<input type="text" class="form-control" id="settings_mindiff" data-option="LEVEL.MIN_DIFFICULTY" data-refresh="true" data-local="true">
														</div>
														<div class="form-group col-md-6 col-sm-6 col-xs-6">
															<label for="settings_maxdiff"><?php echo $FlapIO->translation['level']['difficultymax']; ?></label>
															<input type="text" class="form-control" id="settings_maxdiff" data-option="LEVEL.MAX_DIFFICULTY" data-refresh="true" data-local="true">
														</div>
													</div>
												</form>
											</div>
										</div>
									</div>
								</div>
								<div data-tab="profil">
									<div class="inner">
										<div class="row">
											<div class="col-md-5 col-sm-5 col-xs-12">
												<div class="title"><?php echo $FlapIO->translation['profile']['title']; ?></div>
												<form role="profile">
													<input style="display:none" type="text" name="_"/>
													<input style="display:none" type="password" name="_"/>
													<div class="form-group">
														<label for="profil_uid"><?php echo $FlapIO->translation['profile']['uid']; ?></label>
														<div class="input-group">
															<input type="text" class="form-control" id="profil_uid" data-option="USER.UID">
															<span class="input-group-btn">
																<button class="connect btn btn-danger" type="button"><?php echo $FlapIO->translation['profile']['reconnect']; ?></button>
															</span>
														</div>
														<span class="help-block"><?php echo $FlapIO->translation['profile']['reconnecthelp']; ?></span>
													</div>
													<div class="form-group has-feedback">
														<label for="profil_nickname"><?php echo $FlapIO->translation['profile']['nickname']; ?></label>
														<input type="text" class="form-control" id="profil_nickname" data-option="USER.NICKNAME" data-cookie="true">
														<span class="io-success fade form-control-feedback"></span>
													</div>
												</form>
												<div class="title">Préférences</div>
												<form role="settings">
													<input style="display:none" type="text" name="_"/>
													<input style="display:none" type="password" name="_"/>

													<div class="form-group">
														<label for="profil_boostfps"><?php echo $FlapIO->translation['profile']['boostfps']; ?></label>
														<div class="checkbox">
															<label for="profil_boostfps">
																<input id="profil_boostfps" type="checkbox" data-option="USER.BOOSTFPS" data-cookie="true" value="false">
																<label for="profil_boostfps"><i></i></label>
															</label>
														</div>
													</div>
													<div class="form-group">
														<label for="profil_renderplayers"><?php echo $FlapIO->translation['profile']['displayall']; ?></label>
														<div class="checkbox">
															<label for="profil_renderplayers">
																<input id="profil_renderplayers" type="checkbox" data-option="USER.PLAYERS" data-cookie="true" value="true" checked>
																<label for="profil_renderplayers"><i></i></label>
															</label>
														</div>
													</div>
													<div class="form-group">
														<label for="profil_sfx"><?php echo $FlapIO->translation['profile']['sfx']; ?></label>
														<div class="checkbox">
															<label for="profil_sfx">
																<input id="profil_sfx" type="checkbox" data-option="USER.SFX" data-cookie="true" value="true" checked>
																<label for="profil_sfx"><i></i></label>
															</label>
														</div>
													</div>
												</form>
											</div>
											<div class="col-md-7 col-sm-7 col-xs-12">
												<div class="title"><?php echo $FlapIO->translation['profile']['theme']; ?></div>
												<form role="skins">
													<div class="form-group">
														<label for="skins_theme"><?php echo $FlapIO->translation['profile']['themeimport']; ?></label>
														<input type="file" class="form-control" id="skins_theme">
														<span class="help-block"><?php echo $FlapIO->translation['profile']['themedownload']; ?>: <a target="_blank" href="img/sprites/day.png" class="label label-success"><?php echo $FlapIO->translation['profile']['themedownloadday']; ?></a> <a target="_blank" href="img/sprites/night.png" class="label label-primary"><?php echo $FlapIO->translation['profile']['themedownloadnight']; ?></a></span>
													</div>
												</form>
											</div>
										</div>
									</div>
								</div>
								<div data-tab="leaderboard">
									<div class="inner">
										<div class="row">
											<div class="col-md-4 col-sm-4 col-xs-12">
												<div class="title"><?php echo $FlapIO->translation['leaderboard']['title']; ?><sup class="hidden-xs hidden-sm"><span class="label label-success paging">Beta</span></sup></div>
											</div>
											<div class="col-md-8 col-sm-8 col-xs-12" style="text-align:right;">
												<form role="leaderboard" class="form-inline">
													<div class="row">
														<div class="form-group col-sm-6 col-xs-12">
															<div class="input-group" id="leaderboard_daily" style="display: none;">
																<span class="input-group-btn">
																	<button class="btn btn-flap tips io-left" type="button" data-operation="-1" title="<?php echo $FlapIO->translation['leaderboard']['previous']; ?>"></button>
																</span>
																<input type="text" class="form-control" value="<?php echo date('Y/m/d'); ?>">
																<span class="input-group-btn">
																	<button class="btn btn-flap tips io-right" type="button" data-operation="1" title="<?php echo $FlapIO->translation['leaderboard']['next']; ?>"></button>
																</span>
															</div>
														</div>
														<div class="form-group col-sm-6 col-xs-12">
															<div class="input-group" id="leaderboard_target">
																<input type="text" class="form-control" id="leaderboard_nickname" placeHolder="Nom de joueur...">
																<div id="leaderboard_period" class="input-group-btn">
																	<button type="button" class="btn btn-flap dropdown-toggle" data-toggle="dropdown">Mode: <span class="index"><?php echo $FlapIO->translation['leaderboard']['alltime']; ?></span> <span class="caret"></span></button>
																	<ul class="dropdown-menu dropdown-menu-right" role="menu">
																	<li data-collection="d"><a href="#"><?php echo $FlapIO->translation['leaderboard']['daily']; ?></a></li>
																	<li data-collection="a"><a href="#"><?php echo $FlapIO->translation['leaderboard']['alltime']; ?></a></li>
																	</ul>
																</div>
															</div>
														</div>
													</div>
												</form>
											</div>
										</div>
										<table id="leaderboard" class="table table-striped table-hover table-flap">
											<thead>
												<tr>
													<th data-order="nickname"><?php echo $FlapIO->translation['leaderboard']['nickname']; ?></th>
													<th data-order="timestamp">Date</th>
													<th data-order="score">Score</th>
												</tr>
											</thead>
											<tbody>
											</tbody>
										</table>							
									</div>
								</div>
								<?php if (isset($_GET['console'])) { ?>
								<div data-tab="console">
									<div class="inner">
										<div class="row">
											<div class="col-md-4 col-sm-4 col-xs-12">
												<div class="title">Console<sup class="hidden-xs hidden-sm"><a href="#" data-admin="refresh" class="label label-success">Refresh</a> <a href="#" data-admin="endround" class="label label-success">New round</a></sup></div>
												<form role="rewards">
													<div class="form-group">
														<label>Rewards</label>
														<table id="rewards" class="table table-striped table-hover table-flap">
															<thead>
																<tr>
																	<th class="min">Rank</th>
																	<th>Nickname</th>
																	<th>Score</th>
																</tr>
															</thead>
															<tbody>
															</tbody>
														</table>	
													</div>
												</form>
											</div>
											<div class="col-md-8 col-sm-8 col-xs-12" style="text-align:right;">
												<div class="title">Online</div>
												<form role="online">
													<div class="form-group">
														<label>Online</label>
														<table id="online" class="table table-striped table-hover table-flap">
															<thead>
																<tr>
																	<th class="min">ID</th>
																	<th>Nickname</th>
																	<th class="min">Best</th>
																	<th class="min"></th>
																	<th class="min"></th>
																</tr>
															</thead>
															<tbody>
															</tbody>
														</table>	
													</div>
												</form>
											</div>
										</div>
										<table id="console" class="table table-striped table-hover table-flap">
											<thead>
												<tr>
													<th class="min">Server date</th>
													<th>Message</th>
												</tr>
											</thead>
											<tbody>
											</tbody>
										</table>							
									</div>
								</div>
								<?php } ?>
							</div>
						</div>
						<div id="render">
							<canvas id="game"></canvas>
						</div>
					</div>
				</div>
			</section>

			<footer id="footer">
				<div class="container">FlapIO <code>V1.1</code> Created by <a target="_blank" href="https://kevinrostagni.me">tucsky</a>. Based on Flappy Bird by Dong Nguyen.</div>
			</footer>
		</div>

		<!-- REQUIRED -->
		<script src="js/modernizr.js"></script>
		<script src="js/utils.js"></script>
	    <script src="js/jquery.js"></script>
	    <script src="js/jqueryui.js"></script>
	    <script src="js/bootstrap.min.js"></script>
	    <script src="js/scroller.js"></script>

	    <!-- CLIENT -->
	    <script src="js/flapio.js"></script>

	    <!-- SERVER -->
		<script src="<?php echo $FlapIO->server; ?>/socket.io/socket.io.js"></script>
	</body>
</html>