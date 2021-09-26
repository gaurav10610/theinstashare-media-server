"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupController = void 0;
var logger_1 = require("../../logging/logger");
var server_main_constants_1 = require("../../constants/server.main.constants");
var environment_1 = require("../../environments/environment");
var GroupController = /** @class */ (function () {
    function GroupController(groupService) {
        this.groupService = groupService;
        this.init();
    }
    /**
     * initialize everything here
     */
    GroupController.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var express, bodyParser, app, https, apiServerOptions, http, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        express = require('express');
                        bodyParser = require('body-parser');
                        app = express();
                        app.use(bodyParser.json());
                        app.use(bodyParser.urlencoded({
                            extended: true
                        }));
                        //To resolve CORS related issues
                        app.use(function (req, res, next) {
                            res.header("Access-Control-Allow-Origin", "*");
                            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                            next();
                        });
                        /**
                         * register all handlers
                         */
                        this.registerHandlers(app);
                        if (!environment_1.environment.production) return [3 /*break*/, 2];
                        logger_1.LoggerUtil.log("starting api server with ssl support");
                        https = require('https');
                        return [4 /*yield*/, this.readServerCertificates('../../ssl/new')];
                    case 1:
                        apiServerOptions = _a.sent();
                        //Prod mode supporting ssl
                        https.createServer(apiServerOptions, app).listen(server_main_constants_1.ServerConstants.EXPRESS_PORT);
                        return [3 /*break*/, 3];
                    case 2:
                        logger_1.LoggerUtil.log("starting api server without ssl support");
                        http = require('http');
                        //When testing locally
                        http.createServer(app).listen(server_main_constants_1.ServerConstants.EXPRESS_PORT);
                        _a.label = 3;
                    case 3:
                        logger_1.LoggerUtil.log("theinstashare api server started at port: " + server_main_constants_1.ServerConstants.EXPRESS_PORT);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        logger_1.LoggerUtil.log('error occured while initializing group controller');
                        logger_1.LoggerUtil.log(error_1);
                        throw error_1;
                    case 5:
                        logger_1.LoggerUtil.log('group controller initialized...');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * register all api endpoint handlers with express
     *
     * @param app instance of express
     */
    GroupController.prototype.registerHandlers = function (app) {
        app.get(server_main_constants_1.ServerConstants.API_BASE_URL + "user", this.groupService.getUserInfo.bind(this.groupService));
        app.get(server_main_constants_1.ServerConstants.API_BASE_URL + "group", this.groupService.getUserInfo.bind(this.groupService));
        app.post(server_main_constants_1.ServerConstants.API_BASE_URL + "group", this.groupService.createGroup.bind(this.groupService));
    };
    /**
     * read server certificate and key
     * @param  path : path of the directory where certificates are stored
     */
    GroupController.prototype.readServerCertificates = function (path) {
        return new Promise(function (resolve, reject) {
            try {
                var fs = require('fs');
                resolve({
                    key: fs.readFileSync(path + 'private.key', 'utf8'),
                    cert: fs.readFileSync(path + 'certificate.crt', 'utf8')
                });
            }
            catch (error) {
                reject(error);
            }
        });
    };
    return GroupController;
}());
exports.GroupController = GroupController;
//# sourceMappingURL=group.controller.js.map