var step = require("step"),
vine = require("vine"),
reqOutcome = require("./reqOutcome");

exports.plugin = function(httpServer, emailer, auth, loader) {

	var Account = auth.Account;

	function getToken(req, res, account, render) {
		account.getMainToken(function(err, token) {
			if(err) return res.render(render, {
				error: err.message
			});

			req.session.token = token.key;
			res.redirect(req.query.redirect_to || loader.params("http.loginRedirect") || "/");
		});
	}


	

	httpServer.get("/login", function(req, res) {
		res.render("login", {
			redirect_to: req.query.redirect_to
		});
	});

	httpServer.post("/login", function(req, res) {
		Account.login(req.body, reqOutcome(req, res, "login").success(function(acc) {
			getToken(req, res, acc, "login");
		}));
	});

	httpServer.get("/signup", function(req, res) {
		res.render("signup");
	});


	httpServer.post("/signup", function(req, res) {
		var acc = new Account(req.body);
		acc.save(reqOutcome(req, res, "signup").success(function(acc) {
			getToken(req, res, acc, "signup");
		}));
	});


	require("./lostPassword").plugin(Account, auth.LostPassword, httpServer, emailer, loader);
}