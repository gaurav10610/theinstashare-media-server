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
        var username = req.params.username;
        if (username && this.mediaServerContext.usersContext.has(username)) {
            var userContext = this.mediaServerContext.usersContext.get(username);
            res.status(200).send({
                username: username,
                userType: userContext.userType,
                userGroup: userContext.userGroup
            });
        }
        else {
            res.status(404).send({
                errors: [
                    {
                        message: "resource not found"
                    }
                ]
            });
        }
    };
    /**
     * enquire group information along with all active users
     * @param req
     * @param res
     */
    GroupService.prototype.getGroupInfo = function (req, res) {
        var groupName = req.params.groupname;
        if (groupName && this.mediaServerContext.groupsContext.has(groupName)) {
            var groupContext = this.mediaServerContext.groupsContext.get(groupName);
            res.status(200).send(groupContext);
        }
        else {
            res.status(404).send({
                errors: [
                    {
                        message: "resource not found"
                    }
                ]
            });
        }
    };
    return GroupService;
}());
exports.GroupService = GroupService;
//# sourceMappingURL=group.service.js.map