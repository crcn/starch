module.exports = function(email) {
	
	//make sure people can't game the sys by doing something like email+hash@gmail.com
	return email.replace(/(\+[^\@]+\@)/, "@");
}