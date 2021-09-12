import { IpcMainEvent, ipcMain } from "electron";
import { LoggerUtil } from "../src/app/services/logging/LoggerUtil";

export class MainProcessMessageService {

    /**
     * initialize ipc messaging mechanism
     */
    public init() {
        ipcMain.on('ipcMessage', this.onRendererProcessMessage.bind(this));
    }

    /**
     * handle messages received from electron main process
     * @param event 
     * @param args 
     */
    onRendererProcessMessage(event: IpcMainEvent, args: any) {
        LoggerUtil.log(`received message from electron main process: ${args}`);
    }
}