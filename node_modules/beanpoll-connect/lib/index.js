exports.middleware = function(router) {
	return function(req, res, next) {
		router.
		request(req.path).
		query(req.query).
		filter({ method: req.method }).
		headers(req.headers).
		error(function(error) {
			if(error.code == 404) {
				return next();
			}
			res.send(error.stack);
		}).
		success(function(result) {
			res.send(result);
		}).
		pull().
		pipe(req);
	}
}