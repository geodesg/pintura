/**
 * JSGI Middleware that catches JavaScript errors and converts them to responses
 * with appropriate HTTP status codes and messages
 */
var METHOD_HAS_BODY = require("./methods").METHOD_HAS_BODY,
	DatabaseError = require("perstore/errors").DatabaseError,
	AccessError = require("perstore/errors").AccessError,
	MethodNotAllowedError = require("perstore/errors").MethodNotAllowedError,
	print = require("promised-io/process").print,
	when = require("promised-io/promise").when;

exports.ErrorHandler = function(nextApp){
	return function(request){
		try{
			return when(nextApp(request), function(response){
				return response;
			}, errorHandler);
		}catch(e){
			return errorHandler(e);
		}
		function errorHandler(e){
			var status = 500;
			var headers = {};
			if(e instanceof AccessError){
				if(request.remoteUser){
					if(e instanceof MethodNotAllowedError){
						status = 405;
						var methods = [];
						var method = request.method.toLowerCase();
						// TODO: call getMethods on the store to discover the methods
						for(var i in request.store){
							if(i in METHOD_HAS_BODY && i !== method){
								methods.push(i.toUpperCase());
							}
						}
						headers.allowed = methods.join(", ");
					}
					else{
						status = 403;
					}
				}
				else{
					status = 401;
					// this is intentionally in a format that browsers don't understand to avoid
					// the dreaded browser authentication dialog
					headers["www-authenticate"] = "JSON-RPC; Basic";
				}
			}else if(e instanceof DatabaseError){
				if(e.code == 2){
					status = 404;
				}
				else if(e.code == 3){
					status = 412;
				}
			}else if(e.name.substring(0, e.name.length - 5) in errorMap){
				status = errorMap[e.name.substring(0, e.name.length - 5)];
			}else if(e.status){
				status = e.status;
			}
			if(status !== 404){
				print(String(e.stack || (e.rhinoException && e.rhinoException.printStackTrace()) || (e.name + ": " + e.message)));
			}
			return {
				status: status,
				headers: headers,
				body: e.name + ": " + e.message
			};

		}
	};
};
var errorMap = {
	"Type": 403,
	"Range": 416,
	"URI": 400,
	"Meh": 701, // following the standard HTTP status codes at https://github.com/joho/7XX-rfc
	"Unpossible": 720,
	"KnownUnknowns": 721,
	"UnknownUnknowns": 722,
	"Tricky": 723,
	"ThisLineShouldBeUnreachable": 724,
	"ItWorksOnMyMachine": 725,
	"ItsAFeatureNotABug": 726,
	"Compiling": 741,
	"AKittenDies": 742,
	"IThoughtIKnewRegularExpressions": 743,
	"YUNOWriteIntegrationTests": 744,
	"IDontAlwaysTestMyCodeButWhenIDoIDoItInProduction": 745,
	"MissedBallmerPeak": 746,
	"ConfoundedByPonies": 748,
	"ReservedForChuckNorris": 749,
	"SyntaxError":703,
	"Hungover": 761,
	"Stoned": 762,
	"OverCaffeinated": 763,
	"UnderCaffeinated": 764,
	"JSConf": 765,
	"Sober": 766,
	"Drunk": 767,
	"CachedForTooLong": 771,
	"NotCachedLongEnough": 772,
	"NotCachedAtAll": 773,
	"WhyWasThisCached?": 774,
	"ErrorOnTheException": 776,
	"Coincidence": 777,
	"OffByOneError": 778,
	"OffByTooManyToCountError": 779,
	"SomebodyElsesProblemOperations": 781,
	"SomebodyElsesProblemQA": 782,
	"SomebodyElsesProblemItWasACustomerRequestHonestly": 783,
	"SomebodyElsesProblemManagementObviously": 784,
	"TPSCoverSheetNotAttached": 785
};