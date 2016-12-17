<?php

class FlapIO {

	public $uid; # UID transmis au serveur node puis encrypté et envoyé au autre joueurs
	public $server; # Server node en fonction de l'espace de travail
	public $theme; # Theme global (jour, nuit)

	public $translation = array(); # Contient un tableau des traductions pour le language définit
	private $settings = array(); # Options cookie du joueur, contient l'UID, les préférences graphiques etc...
	private $sprites = array('day', 'night');

	public function __construct() {

		# Récupérations des options cookie ou création d'un nouvel UID
		if (!isset($_COOKIE['FlapIO']) || !($ck = json_decode(stripslashes($_COOKIE['FlapIO']), true)) || !$ck['UID']) {
			$this->setSettings(array('UID' => uniqid(true)));
		} else {
			$this->setSettings(json_decode(stripslashes($_COOKIE['FlapIO']), true));
		}

		# Traduction
		$this->setLang();

		# Theme
		$this->theme = $this->sprites[array_rand($this->sprites)];

		# Server
		$this->server = 'http://'.(strpos($_SERVER['REQUEST_URI'], 'localhost') == 0 || strpos($_SERVER['REQUEST_URI'], '192.168') == 0 ? $_SERVER['HTTP_HOST'].':3000' : 'flapio.herokuapp.com');

	}

	public function setSettings($update = array()) {
		# On fusionne les options avec le parametre update et on met à jour/créé le cookie FlapIO
		$this->settings = array_merge($this->settings, $update);
		setcookie('FlapIO', json_encode($this->settings), time() + (10 * 365 * 24 * 60 * 60), "/");
	
	}

	public function setLang() {

		# Vérification de l'existence du fichier language pour l'utilisateur
		$this->settings['LANGUAGE'] = isset($this->settings['LANGUAGE']) ? $this->settings['LANGUAGE'] : (isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) ? substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2) : 'fr');
		if (!file_exists('src/lang/lang.'.$this->settings['LANGUAGE'].'.json'))
			$this->setSettings(array('LANGUAGE' => 'en'));

		# On charge le fichier JSON
		$this->translation = json_decode(file_get_contents('src/lang/lang.'.$this->settings['LANGUAGE'].'.json'), true);
	}

	public function l($l) {
		if (!$this->translation || !isset($this->translation[$l])) return;
		return $this->translation[$l];
	}

}