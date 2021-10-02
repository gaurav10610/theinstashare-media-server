"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcMessageService = void 0;
var electron_1 = require("electron");
var SignalingMessageType_1 = require("../../src/app/services/types/enum/SignalingMessageType");
var logger_1 = require("../logging/logger");
var IpcMessageService = /** @class */ (function () {
    function IpcMessageService(window, mediaServerContext) {
        this.window = window;
        this.mediaServerContext = mediaServerContext;
        logger_1.LoggerUtil.log('initialized ipc mechanism in electron main process');
        this.init();
    }
    /**
     * initialize ipc messaging mechanism
     */
    IpcMessageService.prototype.init = function () {
        electron_1.ipcMain.on('ipcMessage', this.onRendererProcessMessage.bind(this));
    };
    /**
     * handle messages received from electron main process
     * @param event
     * @param args
     */
    IpcMessageService.prototype.onRendererProcessMessage = function (event, args) {
        logger_1.LoggerUtil.log("received message from electron renderer process: " + JSON.stringify(args));
        switch (args.type) {
            case SignalingMessageType_1.SignalingMessageType.REGISTER_USER_IN_GROUP:
                this.mediaServerContext.getUserContext(args.from).userGroup = args.userGroup;
                this.mediaServerContext.groupsContext.get(args.userGroup)
                    .groupMembers.set(args.from, true);
                break;
            case SignalingMessageType_1.SignalingMessageType.CREATE_GROUP:
                this.mediaServerContext.initializeGroupContext(args.userGroup, args.from);
                break;
            case SignalingMessageType_1.SignalingMessageType.USER:
                if (args.connected) {
                    this.mediaServerContext.initializeUserContext(args.username, args.userType, args.userGroup);
                }
                else {
                    this.mediaServerContext.groupsContext.get(args.userGroup)
                        .groupMembers.delete(args.username);
                    this.mediaServerContext.usersContext.delete(args.username);
                }
                break;
            default:
                logger_1.LoggerUtil.log('unknown message type received from renderer process');
        }
    };
    /**
     * send message to electron renderer process
     * @param message
     *
     */
    IpcMessageService.prototype.sendRendererProcessMessage = function (message) {
        logger_1.LoggerUtil.log("sent message from main to renderer process: " + JSON.stringify(message));
        this.window.webContents.send('ipcMessage', message);
    };
    return IpcMessageService;
}());
exports.IpcMessageService = IpcMessageService;
//# sourceMappingURL=ipc.message.service.js.map