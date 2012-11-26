var step = require("step");


exports.require = ["./models", "stripe.events", "stripe.init", "auth"];
exports.plugin = function(models, stripeEvents, stripe, auth) {

	var Customer = models.Customer,
	Account      = auth.Account;


	stripeEvents.on("charge.succeeded", function(data) {
			
		console.log(data);
		step(
			function() {}
		);
	});

	stripeEvents.on("customer.created", function(data) {

		console.log("creating customer for %s", data.object.email);

		var on = outcome.error(function(err) {
			console.error(err.stack);
		});

		step(
			function() {

				if(!data.object.email) return on()

				Account.findOne({ email: data.object.email }, this);
			},
			on.success(function(account) {

				//no account? register one!
				if(!account) {
					account = new Account({ email: data.object.email, password: crc32(String(Math.random())) });

					//emit the new account so it can be handled. E.g: sending out invite to given person asking to signup ~ generating a password
					stripeEvents.emit("account.created", account); 
					account.save();

					console.warn("account with email %s doesn't exist! creating.", account.email);
				}

				this.account = account;

				Customer.findOne({ owner: account._id }, this);
			}),
			on.success(function(customer) {

				//more than one customer under the same email shouldn't happen... 
				if(customer) {
					stripe.customers.del(data.object.id, function(){ });
					// stripe.customers.update(data.object.id, { card: })
					return on(new Error("customer already exists for " + this.account.email + ", deleting stripe customer"));
				}

				//new customer! 
				customer = new Customer({ _id: data.object.id, owner: this.account._id });

				//add the account as an owner so they have access to the features
				this.account.ownItem(customer);

				//add the customer!
				customer.save(this);
			}),
			on.success(function() {
				console.log("customer for %s created successfully", this.account.email);
			})
		);
	});


	stripe.customers.create({
		card: {
			number: "4242424242424242",
			exp_month: "04",
			exp_year: "2020",
			cvc: 999,
			name: "craig"
		},
		email: "craig.j.condon@gmail.com"
	}, function(err, cust){
		// console.log(cust)


		/*stripe.charges.create({
			customer: cust.id,
			amount: 2000,
			currency: "usd"
		}, function(err, charge) {
			// console.log(charge)
		})*/
	});

	return Customer;
}