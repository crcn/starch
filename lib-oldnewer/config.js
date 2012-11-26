var moment = require("moment");

module.exports = {
	"default": {
		"mongo": {
			host: "localhost",
			database: "starch-test"
		},
		"http": {
			port: 8080
		},
		"stripe": {
			apiKey: "He4jSn4IlulOTkr1ttGF7F8phzvXDTtb",
			promotions: [
				{
					type: "coupon",
					plan: "charge",
					id: "early_bird_charge",
					percentage: 25,
					endDate: moment("12-25-2012")._d
				},
				{
					type: "coupon",
					plan: "subscription",
					id: "early_bird_monthly",
					percentage: 25,
					endDate: moment("12-25-2012")._d
				},
				{
					type: "referal",
					plan: "charge",
					id: "charge_referal",
					count: 1,
					item: {
						time: { $inc: 30 }
					}
				}
			],
			plans: [
				{
					displayNome: "Tap",
					id: "charge",
					type: "charge",
					item: {
						time: 400 //minutes
					},
					amount: 10.00,
				},
				{
					displayName: "Plus",
					id: "plus",
					type: "subscription",
					item: {
						time: -1 //unlimited
					},
					amount: 40.00
				}
			]
		}
	}
};