/************
RESET.js
© xzl
*********/

// Extensions

	String.prototype.capitalize = function() {
		return this.charAt(0).toUpperCase() + this.toLowerCase().slice(1);
	}  

	String.prototype.startWith = function(str) {
		return this.indexOf(str) == 0;
	};

	String.prototype.repeat = function(num) {
		return new Array(num + 1).join(this);
	}

// Extensions globales
	
	function rdStr(l,c) {
		/* 	
		 * Gere une chaine de caractères aléatoires
		 *
		 * @param		Int		l		Taille de la chaine
		 * @param		String	c		Caractères admis (optionnel)
		*/
		if (!c) { c = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; }
		var r = '';
		for (var i = l; i > 0; --i) r += c[Math.round(Math.random() * (c.length - 1))];
		return r;
	}

	function rdNb(min, max, i) {
		var nb = (Math.random() * (min - max) + max);
		return i ? parseInt(nb) : parseFloat(nb);
	}