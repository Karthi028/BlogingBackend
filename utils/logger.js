const logger = (req, res, next) => {
    console.log("Request Url:", req.url);
    console.log("Request method:", req.method);
    console.log("Request body:", JSON.stringify(req.body));

    next();

}
module.exports = logger;