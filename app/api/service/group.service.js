"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupService = void 0;
var logger_1 = require("../../logging/logger");
var GroupService = /** @class */ (function () {
    function GroupService(ipcMessageService, mediaServerContext) {
        this.ipcMessageService = ipcMessageService;
        this.mediaServerContext = mediaServerContext;
        logger_1.LoggerUtil.log('group service initialized...');
    }
    /**
     * enquire user info
     * @param req
     * @param res
     */
    GroupService.prototype.getUserInfo = function (req, res) {
    };
    /**
     * create a new group
     * @param req
     * @param res
     */
    GroupService.prototype.createGroup = function (req, res) {
    };
    /**
     * enquire group information along with all active users
     * @param req
     * @param res
     */
    GroupService.prototype.getGroupInfo = function (req, res) {
    };
    return GroupService;
}());
exports.GroupService = GroupService;
//# sourceMappingURL=group.service.js.map