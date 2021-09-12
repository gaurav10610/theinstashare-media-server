import { LoggerUtil } from "../../logging/logger";
import { IpcMessageService } from "../../ipc/ipc.message.service";
import { MediaServerContext } from "../../context/media.server.context";

export class GroupService {

    constructor(
        private ipcMessageService: IpcMessageService,
        private mediaServerContext: MediaServerContext
    ) {
        LoggerUtil.log('group service initialized...');
    }

    /**
     * enquire user info
     * @param req 
     * @param res 
     */
    getUserInfo(req: any, res: any) {

    }

    /**
     * create a new group
     * @param req 
     * @param res 
     */
    createGroup(req: any, res: any) {

    }

    /**
     * enquire group information along with all active users
     * @param req 
     * @param res 
     */
    getGroupInfo(req: any, res: any) {

    }
}