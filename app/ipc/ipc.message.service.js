"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcMessageService = void 0;
var electron_1 = require("electron");
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