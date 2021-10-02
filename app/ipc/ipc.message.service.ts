import { IpcMainEvent, ipcMain, BrowserWindow } from "electron";
import { SignalingMessageType } from "../../src/app/services/types/enum/SignalingMessageType";
import { MediaServerContext } from "../context/media.server.context";
import { LoggerUtil } from "../logging/logger";

export class IpcMessageService {

    constructor(
        private window: BrowserWindow,
        private mediaServerContext: MediaServerContext
    ) {
        LoggerUtil.log('initialized ipc mechanism in electron main process');
        this.init();
    }

    /**
     * initialize ipc messaging mechanism
     */
    init() {
        ipcMain.on('ipcMessage', this.onRendererProcessMessage.bind(this));
    }

    /**
     * handle messages received from electron main process
     * @param event 
     * @param args 
     */
    onRendererProcessMessage(event: IpcMainEvent, args: any) {
        LoggerUtil.log(`received message from electron renderer process: ${JSON.stringify(args)}`);
        switch (args.type) {
            case SignalingMessageType.REGISTER_USER_IN_GROUP:
                this.mediaServerContext.getUserContext(args.from).userGroup = args.userGroup;
                this.mediaServerContext.groupsContext.get(args.userGroup)
                    .groupMembers.set(args.from, true);
                break;

            case SignalingMessageType.CREATE_GROUP:
                this.mediaServerContext.initializeGroupContext(args.userGroup, args.from);
                break;

            case SignalingMessageType.USER:
                if (args.connected) {
                    this.mediaServerContext.initializeUserContext(args.username, args.userType, args.userGroup);
                } else {
                    this.mediaServerContext.groupsContext.get(args.userGroup)
                        .groupMembers.delete(args.username);
                    this.mediaServerContext.usersContext.delete(args.username);
                }
                break;

            default:
                LoggerUtil.log('unknown message type received from renderer process');
        }
    }

    /**
     * send message to electron renderer process
     * @param message 
     * 
     */
    sendRendererProcessMessage(message: any) {
        LoggerUtil.log(`sent message from main to renderer process: ${JSON.stringify(message)}`);
        this.window.webContents.send('ipcMessage', message);
    }
}