exports.testConfigure = require("./jsgi/configure");
exports.testSecurity = require("./security");
exports.testJSGIMiddleware = require("./jsgi/index");

if (require.main === module)
    require("patr/runner").run(exports);

