/**
 * Copyright (C) Work Bandits
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
define(function() {

	if (!this.JSON) {
		this.JSON = {}
	}

	(function() {
		function f(n) {
			return n < 10 ? "0" + n : n
		}
		if (typeof Date.prototype.toJSON !== "function") {
			Date.prototype.toJSON = function(key) {
				return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null
			};
			String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function(key) {
				return this.valueOf()
			}
		}
		var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			gap, indent, meta = {
				"\b": "\\b",
				"\t": "\\t",
				"\n": "\\n",
				"\f": "\\f",
				"\r": "\\r",
				'"': '\\"',
				"\\": "\\\\"
			}, rep;

		function quote(string) {
			escapable.lastIndex = 0;
			return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
				var c = meta[a];
				return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
			}) + '"' : '"' + string + '"'
		}

		function str(key, holder) {
			var i, k, v, length, mind = gap,
				partial, value = holder[key];
			if (value && typeof value === "object" && typeof value.toJSON === "function") {
				value = value.toJSON(key)
			}
			if (typeof rep === "function") {
				value = rep.call(holder, key, value)
			}
			switch (typeof value) {
				case "string":
					return quote(value);
				case "number":
					return isFinite(value) ? String(value) : "null";
				case "boolean":
				case "null":
					return String(value);
				case "object":
					if (!value) {
						return "null"
					}
					gap += indent;
					partial = [];
					if (Object.prototype.toString.apply(value) === "[object Array]") {
						length = value.length;
						for (i = 0; i < length; i += 1) {
							partial[i] = str(i, value) || "null"
						}
						v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
						gap = mind;
						return v
					}
					if (rep && typeof rep === "object") {
						length = rep.length;
						for (i = 0; i < length; i += 1) {
							k = rep[i];
							if (typeof k === "string") {
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ": " : ":") + v)
								}
							}
						}
					} else {
						for (k in value) {
							if (Object.hasOwnProperty.call(value, k)) {
								v = str(k, value);
								if (v) {
									partial.push(quote(k) + (gap ? ": " : ":") + v)
								}
							}
						}
					}
					v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
					gap = mind;
					return v
			}
		}
		if (typeof JSON.stringify !== "function") {
			JSON.stringify = function(value, replacer, space) {
				var i;
				gap = "";
				indent = "";
				if (typeof space === "number") {
					for (i = 0; i < space; i += 1) {
						indent += " "
					}
				} else {
					if (typeof space === "string") {
						indent = space
					}
				}
				rep = replacer;
				if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
					throw new Error("JSON.stringify")
				}
				return str("", {
					"": value
				})
			}
		}
		if (typeof JSON.parse !== "function") {
			JSON.parse = function(text, reviver) {
				var j;

				function walk(holder, key) {
					var k, v, value = holder[key];
					if (value && typeof value === "object") {
						for (k in value) {
							if (Object.hasOwnProperty.call(value, k)) {
								v = walk(value, k);
								if (v !== undefined) {
									value[k] = v
								} else {
									delete value[k]
								}
							}
						}
					}
					return reviver.call(holder, key, value)
				}
				cx.lastIndex = 0;
				if (cx.test(text)) {
					text = text.replace(cx, function(a) {
						return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
					})
				}
				if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
					j = eval("(" + text + ")");
					return typeof reviver === "function" ? walk({
						"": j
					}, "") : j
				}
				throw new SyntaxError("JSON.parse")
			}
		}
	}());

	if (!window.DI) {
		DI = {
			_apiKey: null,
			_session: null,
			_userStatus: "unknown",
			_domain: {
				cdn: "https://www.dingg.it",
				endpoint: "https://www.dingg.it/api/",
				authorizeUrl: "https://www.dingg.it/api/oauth/authorize"
			},
			_logging: true,
			copy: function(e, d, b, a) {
				for (var c in d) {
					if (b || typeof e[c] === "undefined") {
						e[c] = a ? a(d[c]) : d[c]
					}
				}
				return e
			},
			create: function(d, g) {
				var f = window.DI,
					a = d ? d.split(".") : [],
					j = a.length;
				for (var e = 0; e < j; e++) {
					var b = a[e];
					var h = f[b];
					if (!h) {
						h = (g && e + 1 == j) ? g : {};
						f[b] = h
					}
					f = h
				}
				return f
			},
			provide: function(c, b, a) {
				return DI.copy(typeof c == "string" ? DI.create(c) : c, b, a)
			},
			guid: function() {
				return "f" + (Math.random() * (1 << 30)).toString(16).replace(".", "")
			},
			log: function(a) {
				if (DI._logging) {
					if (window.Debug && window.Debug.writeln) {
						window.Debug.writeln(a)
					} else {
						if (window.console) {
							window.console.log(a)
						}
					}
				}
				if (DI.Event) {
					DI.Event.fire("di.log", a)
				}
			},
			error: function(a) {
				if (window.console) {
					window.console.error(a)
				}
				if (DI.Event) {
					DI.Event.fire("di.error", a)
				}
			},
			$: function(a) {
				return document.getElementById(a)
			}
		}
	}
	DI.provide("JSON", {
		stringify: function(a) {
			if (window.Prototype && Object.toJSON) {
				return Object.toJSON(a)
			} else {
				return JSON.stringify(a)
			}
		},
		parse: function(a) {
			return JSON.parse(a)
		},
		flatten: function(c) {
			var d = {};
			for (var a in c) {
				if (c.hasOwnProperty(a)) {
					var b = c[a];
					if (null === b || undefined === b) {
						continue
					} else {
						if (typeof b == "string") {
							d[a] = b
						} else {
							d[a] = DI.JSON.stringify(b)
						}
					}
				}
			}
			return d
		}
	});
	DI.provide("Array", {
		indexOf: function(a, d) {
			if (a.indexOf) {
				return a.indexOf(d)
			}
			var c = a.length;
			if (c) {
				for (var b = 0; b < c; b++) {
					if (a[b] === d) {
						return b
					}
				}
			}
			return -1
		},
		merge: function(c, b) {
			for (var a = 0; a < b.length; a++) {
				if (DM.Array.indexOf(c, b[a]) < 0) {
					c.push(b[a])
				}
			}
			return c
		},
		filter: function(c, e) {
			var a = [];
			for (var d = 0; d < c.length; d++) {
				if (e(c[d])) {
					a.push(c[d])
				}
			}
			return a
		},
		keys: function(d, c) {
			var a = [];
			for (var b in d) {
				if (c || d.hasOwnProperty(b)) {
					a.push(b)
				}
			}
			return a
		},
		map: function(a, c) {
			var b = [];
			for (var d = 0; d < a.length; d++) {
				b.push(c(a[d]))
			}
			return b
		},
		forEach: function(f, d, e) {
			if (!f) {
				return
			}
			if (Object.prototype.toString.apply(f) === "[object Array]" || (!(f instanceof Function) && typeof f.length == "number")) {
				if (f.forEach) {
					f.forEach(d)
				} else {
					for (var c = 0, a = f.length; c < a; c++) {
						d(f[c], c, f)
					}
				}
			} else {
				for (var b in f) {
					if (e || f.hasOwnProperty(b)) {
						d(f[b], b, f)
					}
				}
			}
		}
	});
	DI.provide("Cookie", {
		_domain: null,
		_enabled: false,
		setEnabled: function(a) {
			DI.Cookie._enabled = a
		},
		getEnabled: function() {
			return DI.Cookie._enabled
		},
		load: function() {
			var a = document.cookie.match("\\bdis_" + DI._apiKey + '="([^;]*)\\b'),
				b;
			if (a) {
				b = DI.QS.decode(a[1]);
				b.expires = parseInt(b.expires, 10);
				DI.Cookie._domain = b.base_domain
			}
			return b
		},
		setRaw: function(c, a, b) {
			document.cookie = "dis_" + DI._apiKey + '="' + c + '"' + (c && a == 0 ? "" : "; expires=" + new Date(a * 1000).toGMTString()) + "; path=/" + (b ? "; domain=." + b : "");
			DI.Cookie._domain = b
		},
		set: function(a) {
			if (a) {
				DI.Cookie.setRaw(DI.QS.encode(a), a.expires, a.base_domain)
			} else {
				DI.Cookie.clear()
			}
		},
		clear: function() {
			DI.Cookie.setRaw("", 0, DI.Cookie._domain)
		}
	});
	DI.provide("EventProvider", {
		subscribers: function() {
			if (!this._subscribersMap) {
				this._subscribersMap = {}
			}
			return this._subscribersMap
		},
		subscribe: function(b, a) {
			var c = this.subscribers();
			if (!c[b]) {
				c[b] = [a]
			} else {
				c[b].push(a)
			}
		},
		unsubscribe: function(b, a) {
			var c = this.subscribers()[b];
			DI.Array.forEach(c, function(e, d) {
				if (e == a) {
					c[d] = null
				}
			})
		},
		monitor: function(b, d) {
			if (!d()) {
				var a = this,
					c = function() {
						if (d.apply(d, arguments)) {
							a.unsubscribe(b, c)
						}
					};
				this.subscribe(b, c)
			}
		},
		clear: function(a) {
			delete this.subscribers()[a]
		},
		fire: function() {
			var b = Array.prototype.slice.call(arguments),
				a = b.shift();
			DI.Array.forEach(this.subscribers()[a], function(c) {
				if (c) {
					c.apply(this, b)
				}
			})
		}
	});
	DI.provide("Event", DI.EventProvider);
	DI.provide("", {
		init: function(a) {
			a = DI.copy(a || {}, {
				logging: true
			});
			DI._apiKey = a.apiKey;
			if (!a.logging && window.location.toString().indexOf("di_debug=1") < 0) {
				DI._logging = false
			}
			if (DI._apiKey) {
				DI.Cookie.setEnabled(a.cookie);
				a.session = a.session || DI.Auth._receivedSession || DI.Cookie.load();
				DI.Auth.setSession(a.session, a.session ? "connected" : "unknown");
				if (a.status) {
					DI.getLoginStatus()
				}
			}
			var b = document.getElementById("diroot");
			if (b != null) {
				b.style.height = "29px";
				b.style.width = "100%";
				DI.api("/ui/user-infos", function(e) {
					var g = document.createElement("div");
					g.innerHTML = e.html;
					b.innerHTML = g.innerHTML;
					var f = document.getElementsByTagName("head")[0];
					var d = document.createElement("link");
					d.href = DI._domain.cdn + "/css/common/allopass.css";
					d.type = "text/css";
					d.rel = "stylesheet";
					f.appendChild(d);
					d = document.createElement("link");
					d.href = DI._domain.cdn + "/css/api/ui/user-infos.css";
					d.type = "text/css";
					d.rel = "stylesheet";
					f.appendChild(d);
					var c = document.createElement("script");
					c.type = "text/javascript";
					c.src = DI._domain.cdn + "/js/libs/allopass.js";
					f.appendChild(c);
					f.removeChild(c);
					var e = {
						session: DI._session,
						status: DI._userStatus
					};
					DI.Event.fire("auth.statusChange", e)
				})
			}
		}
	});

	// mettre ailleurs
	// window.setTimeout(function() {
	// 	if (window.diAsyncInit) {
	// 		diAsyncInit()
	// 	}
	// }, 0);


	DI.provide("QS", {
		encode: function(d, a, b) {
			a = a === undefined ? "&" : a;
			b = b === false ? function(e) {
				return e
			} : encodeURIComponent;
			var c = [];
			DI.Array.forEach(d, function(f, e) {
				if (f !== null && typeof f != "undefined") {
					c.push(b(e) + "=" + b(f))
				}
			});
			c.sort();
			return c.join(a)
		},
		decode: function(g) {
			var c = decodeURIComponent,
				f = {}, b = g.split("&"),
				a, e;
			for (a = 0; a < b.length; a++) {
				e = b[a].split("=", 2);
				if (e && e[0]) {
					var d = "";
					if (e[1]) {
						switch (e[1]) {
							case "true":
								d = true;
								break;
							case "false":
								d = false;
								break;
							default:
								d = c(e[1].replace(/\+/g, "%20"))
						}
					}
					f[c(e[0])] = d
				}
			}
			return f
		}
	});
	DI.provide("", {
		api: function() {
			DI.ApiServer.call.apply(DI.ApiServer, arguments)
		}
	});
	DI.provide("ApiServer", {
		METHODS: ["get", "post"],
		endpoint: DI._domain.endpoint,
		_callbacks: {},
		call: function() {
			var b = Array.prototype.slice.call(arguments),
				e = b.shift(),
				d = b.shift(),
				g, f, a;
			while (d) {
				var c = typeof d;
				if (c === "string" && !g) {
					g = d.toLowerCase()
				} else {
					if (c === "function" && !a) {
						a = d
					} else {
						if (c === "object" && !f) {
							f = d
						} else {
							DI.log("Invalid argument passed to DI.api(): " + d);
							return
						}
					}
				}
				d = b.shift()
			}
			g = g || "get";
			f = f || {};
			if (e[0] === "/") {
				e = e.substr(1)
			}
			if (DI.Array.indexOf(DI.ApiServer.METHODS, g) < 0) {
				DI.log("Invalid method passed to DI.api(): " + g);
				return
			}
			DI.ApiServer.oauthRequest(e, g, f, a)
		},
		oauthRequest: function(c, e, d, a) {
			if (DI.getSession) {
				var b = DI.getSession();
				if (b && b.access_token && !d.access_token) {
					d.access_token = b.access_token
				}
			}
			DI.ApiServer.jsonp(c, e, DI.JSON.flatten(d), a)
		},
		jsonp: function(e, h, f, a) {
			var d = DI.guid(),
				b = document.createElement("script");
			f.method = h;
			f.callback = "DI.ApiServer._callbacks." + d;
			var c = (DI.ApiServer.endpoint + e + (e.indexOf("?") > -1 ? "&" : "?") + DI.QS.encode(f));
			DI.log("URL called: " + c + " URL length: " + c.length);
			if (c.length > 2000) {
				throw new Error("JSONP only support a maximum of 2000 bytes of input.")
			}
			DI.ApiServer._callbacks[d] = function(g) {
				a && a(g);
				delete DI.ApiServer._callbacks[d];
				b.src = null;
				b.parentNode.removeChild(b)
			};
			b.src = c;
			document.getElementsByTagName("head")[0].appendChild(b)
		}
	});
	DI.provide("", {
		getLoginStatus: function(a) {
			if (a) {
				a({
					status: DI._userStatus,
					session: DI._session
				})
			}
		},
		getSession: function() {
			if (DI._session && "expires" in DI._session && new Date().getTime() > DI._session.expires * 1000) {
				DI.Auth.setSession(null, "notConnected")
			}
			return DI._session
		},
		login: function(h, b) {
			var g = typeof window.screenX != "undefined" ? window.screenX : window.screenLeft,
				e = typeof window.screenY != "undefined" ? window.screenY : window.screenTop,
				m = typeof window.outerWidth != "undefined" ? window.outerWidth : document.documentElement.clientWidth,
				k = typeof window.outerHeight != "undefined" ? window.outerHeight : (document.documentElement.clientHeight - 22),
				c = 600,
				l = 420,
				f = parseInt(g + ((m - c) / 2), 10),
				j = parseInt(e + ((k - l) / 2.5), 10),
				d = "width=" + c + ",height=" + l + ",left=" + f + ",top=" + j;
			var a = document.location.href.replace("#_=_", "");
			b = DI.copy(b || {}, {
				client_id: DI._apiKey,
				response_type: "token",
				display: "popup",
				scope: "",
				redirect_uri: a,
				state: "diauth_" + DI.guid()
			});
			if (b.display === "popup") {
				var i = window.open(DI.Auth.authorizeUrl + "?" + DI.QS.encode(b), "diauth", d);
				if (h) {
					DI.Auth._active[b.state] = {
						cb: h,
						win: i
					};
					DI.Auth._popupMonitor()
				}
			} else {
				location.href = DI.Auth.authorizeUrl + "?" + DI.QS.encode(b)
			}
		},
		logout: function(a) {
			DI.api("/logout", a);
			DI.Auth.setSession(null, "notConnected")
		}
	});
	DI.provide("Auth", {
		authorizeUrl: DI._domain.authorizeUrl,
		_active: {},
		_receivedSession: null,
		readFragment: function() {
			var b = window.location.hash.replace("%23", "#"),
				a = b.substr(b.lastIndexOf("#") + 1);
			if (a.indexOf("access_token=") >= 0 || a.indexOf("error=") >= 0) {
				var c = DI.QS.decode(a);
				if (window.name == "diauth" && window.opener && window.opener.DI.Auth.setSession && window.opener.name != "diauth") {
					document.documentElement.style.display = "none";
					window.opener.DI.Auth.recvSession(c)
				} else {
					if (c && ("state" in c) && c.state.indexOf("diauth_") == 0) {
						if ("access_token" in c) {
							DI.Auth._receivedSession = c
						}
						window.location.hash = b.substr(0, b.lastIndexOf("#"))
					}
				}
			}
		},
		recvSession: function(a) {
			if (!a) {
				DI.error("Received invalid session")
			}
			if ("error" in a) {
				DI.error("Received auth error `" + a.error + "': " + a.error_description)
			}
			if (!("state" in a)) {
				DI.error("Received a session with not `state' field");
				return
			}
			if (!(a.state in DI.Auth._active)) {
				DI.error("Received a session from an inactive window");
				return
			}
			DI.Auth._active[a.state].session = a
		},
		setSession: function(h, c) {
			var e = !DI._session && h,
				b = DI._session && !h,
				g = false,
				a = e || b || (DI._session && h && DI._session.access_token != h.access_token),
				f = c != DI._userStatus;
			if (h && "expires_in" in h) {
				h.expires = Math.round(new Date().getTime() / 1000) + parseInt(h.expires_in, 10);
				delete h.expires_in
			}
			var d = {
				session: h,
				status: c
			};
			DI._session = h;
			DI._userStatus = c;
			if (a && DI.Cookie && DI.Cookie.getEnabled()) {
				DI.Cookie.set(h)
			}
			if (f) {
				DI.Event.fire("auth.statusChange", d)
			}
			if (b || g) {
				DI.Event.fire("auth.logout", d)
			}
			if (e || g) {
				DI.Event.fire("auth.login", d)
			}
			if (a) {
				DI.Event.fire("auth.sessionChange", d)
			}
			return d
		},
		_popupMonitor: function() {
			for (var f in DI.Auth._active) {
				if ("win" in DI.Auth._active[f]) {
					try {
						if (DI.Auth._active[f].win.closed) {
							delete DI.Auth._active[f].win;
							DI.Auth.recvSession({
								error: "access_denied",
								error_description: "Client closed the window",
								state: f
							})
						}
					} catch (d) {}
				}
				if ("session" in DI.Auth._active[f]) {
					var a = DI.Auth._active[f];
					delete DI.Auth._active[f];
					var c = a.session;
					if ("access_token" in c) {
						DI.Auth.setSession(c, "connected")
					} else {
						DI.Auth.setSession(null, "notConnected")
					}
					if ("win" in a) {
						a.win.close()
					}
					if ("cb" in a) {
						a.cb({
							status: DI._userStatus,
							session: DI._session
						})
					}
				}
			}
			var b = false;
			for (var f in DI.Auth._active) {
				b = true;
				break
			}
			if (b && !DI.Auth._popupInterval) {
				DI.Auth._popupInterval = window.setInterval(DI.Auth._popupMonitor, 100)
			} else {
				if (!b && DI.Auth._popupInterval) {
					window.clearInterval(DI.Auth._popupInterval);
					DI.Auth._popupInterval = null
				}
			}
		}
	});
	DI.Auth.readFragment();

	return DI;
});