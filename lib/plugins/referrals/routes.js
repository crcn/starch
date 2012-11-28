var dust = require("dustjs-linkedin"),
step = require("step"),
outcome = require("outcome"),
seq = require("seq"),
fs = require("fs"),
vine = require("vine"),
sprintf = require("sprintf").sprintf;

exports.require = ["auth", "plugin-express", "emailer", "./models/referral"];
exports.plugin = function(auth, httpServer, emailer, Referral, loader) {

	var domain = loader.params("domain"),
	serviceName = loader.params("serviceName"),
	Account = auth.Account;

	eval(dust.compile(fs.readFileSync(loader.params("http.inviteEmailTpl"), "utf8"), "inviteEmailTpl"));

	Account.prototype.inviteAccount = function(email, next) {
		var on = outcome.error(next),
		InvitedAccount = this.model("referrals"),
		self = this;

		step(
			function() {
				console.log("find email %s", email);
				Account.findOne({ email: email }, this);
			},
			on.success(function(account) {
				if(account) return new Error(sprintf("%s already has an account", email));
				console.log("account doesn't exist, finding referral");

				Referral.findOne({ key: email }, this);
			}),
			on.success(function(referral) {
				if(referral) return new Error(sprintf("%s has already been invited by someone else", email));

				console.log("referral doesn't exist, parsing invite template");
				this.referral = referral = new Referral({ key: email, invitedBy: self._id });
				referral.save(this);
			}),
			on.success(function(referral) {
				dust.render("inviteEmailTpl", { url: "http://" + domain + "/referrals/" + referral._id + "?src=email" }, this);
			}),
			on.success(function(tpl) {
				var next = this;

				Referral.emit("sent", this.referral, email);

				emailer.send({
					to: email,
					subject: "You've been invited to check out " + serviceName,
					htmlBody: tpl
				}, function(err) {
					if(err) console.error(err)
					next();
				});
			}),
			next
		);
	}

	function checkReferral(req, res, next) {
		Referral.findOne({ _id: req.params.referral }, function(err, referral) {
			req.referral = referral;
			if(!referral) return res.redirect("/");
			next();
		});
	}

	httpServer.get("/referrals/:referral", checkReferral, function(req, res, next) {

		res.render("referral_signup", {
			referralId: req.params.referral,
			src: req.query.src
		});
		
	});

	httpServer.post("/referrals/:referral", checkReferral, function(req, res, next) {

		Account.signup(req.body, function(err, account) {
			if(err) return res.render("referral_signup", vine.error(err).data);
			req.referral.addAccount(account);
			res.redirect("/login");
		});
		
	});


	httpServer.get("/invite", auth.middleware.authCheckpoint, function(req, res) {
		res.render("invite", {
			account: req.account._id
		});
	});


	httpServer.post("/invite", auth.middleware.authCheckpoint, function(req, res) {

		var emails = String(req.body.emails).split(/[\n,]+/g),
		result = vine.api();

		step(
			function() {
				seq(emails).seqEach(function(email) {
					var next = this;
					req.account.inviteAccount(email, function(err) {
						if(err) {
							console.error(err);
							emails.splice(email.indexOf(email), 1);
							result.error(err);
							return;
						}

						result.success(sprintf("%s has been invited", email));
					})
				}).seq(this);
			},
			function() {
				res.render("invite", result.data);
			}
		);

		res.render("invite", {
			account: req.account._id
		});
	});

}