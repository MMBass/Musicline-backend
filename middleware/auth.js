const authService = require('../services/auth.service');

const paths = ['/second','/'];

module.exports = (req, res, next) => {
    if (paths.includes(req.path) && (req.header("x-access-token")) || req.query.accessToken) {
        const AT = req.query.accessToken || req.header("x-access-token");
        authService.validateAccess(AT, (err, result) => {
            if (result) {
                return next();
            }else if (err) {
                return next(err);
            }
        });
    } else {
        res.status(401).send({ message: 'Accsess denied' });
    }
}