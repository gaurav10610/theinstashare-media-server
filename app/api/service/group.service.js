"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupService = void 0;
var logger_1 = require("../../logging/logger");
var GroupService = /** @class */ (function () {
    function GroupService(ipcMessageService) {
        this.ipcMessageService = ipcMessageService;
        logger_1.LoggerUtil.log('group service initialized...');
    }
    GroupService.prototype.handleDummyRequest = function (req, res) {
        this.ipcMessageService.sendRendererProcessMessage({
            message: 'this is message from electron main process'
        });
        res.status(200).send({
            message: 'this api is working'
        });
    };
    return GroupService;
}());
exports.GroupService = GroupService;
//# sourceMappingURL=group.service.js.map