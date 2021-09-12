import { LoggerUtil } from "../../logging/logger";
import { IpcMessageService } from "../../ipc/ipc.message.service";

export class GroupService {

    constructor(private ipcMessageService: IpcMessageService) {
        LoggerUtil.log('group service initialized...');
    }

    handleDummyRequest(req: any, res: any) {
        this.ipcMessageService.sendRendererProcessMessage({
            message: 'this is message from electron main process'
        });
        res.status(200).send({
            message: 'this api is working'
        });
    }
}