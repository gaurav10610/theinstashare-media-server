import { IpcMainEvent, ipcMain, BrowserWindow } from "electron";
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