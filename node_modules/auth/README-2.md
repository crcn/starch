### TODO

- ability to invite people, and grant permissions upon signup (trigger)
- ability to have a beta process where only invited people are granted access 
- timer that allows you to grant privileges for collections


### Example

```javascript

var mdblite = require("mongodblite"),
step = require("step");

//initialize the authenticator
var auth = require("auth").init({
	connection: mdblite.db(new mdblite.drivers.Memory()),
	fields: {
		email: {
			assignTo: "username",
			test: "email"
		},
		password: {
			test: "test",
			hash: function(password) {
				return password; //hash it here
			}
		},
		fullName: {
			optional: true
		}
	}
});


var credits = {
	username: "me@gmail.com",
	password: "myPass"
};


step(

	/**
	 */
	
	function() {
		auth.signup(credits, this);
	},

	/**
	 */

	function(err, user) {
		user.getToken(this);
	},


	/**
	 */

	function(err, session) {
		//do something with session
	}

);



```


### Sharing sessions

user accounts can be shared. Here's an example:

```javascript
//same connection code as above

step(
	function(err, user) {
		user.grantPermission(user2, ["GET:friends:myFriendId"], this);
	},
	function(err, data) {
		console.log(data.token.scopes); //contains access to user scope

		auth.sandbox("GET:friends:myFriendId").login(token, function(err, data) {

			console.log(data.access); //{ profiles: ['user1', 'user2' ], collections: { friends: 'myFriendId' }}
		});
	}
}
);
``` 



### API

#### auth.signup(options, onSignup)

signs a user up

#### auth.login(options, onLogin)

logs a user in

- options 
	- `token`    - the session token for logging in
	- `username` - the username of the user
	- `password` - the password of the user
	- `data`     - additional data for the scope

#### user.grantPermissions(user, permisions, onToken)

grants target user permissions

#### user.createToken(permissions, onToken)

creates a new token with the given permissions. This is useful for giving access to a user's account with a limited scope.

#### user.getToken(onSession)

returns the user's main login token

#### user.remove()

removes a user

#### token.regenerateToken(onGenerateToken)

regenerates the token's public key

#### token.remove()

removes a token
