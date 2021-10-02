import { LoggerUtil } from "../../logging/logger";
import { IpcMessageService } from "../../ipc/ipc.message.service";
import { MediaServerContext } from "../../context/media.server.context";
import { UserContext } from "../../types/UserContext";
import { GroupContext } from "../../types/GroupContext";

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
        const username: String = req.params.username;
        if (username && this.mediaServerContext.usersContext.has(username)) {
            const userContext: UserContext = this.mediaServerContext.usersContext.get(username);
            res.status(200).send({
                username,
                userType: userContext.userType,
                userGroup: userContext.userGroup
            });
        } else {
            res.status(404).send({
                errors: [
                    {
                        message: "resource not found"
                    }
                ]
            });
        }
    }

    /**
     * enquire group information along with all active users
     * @param req 
     * @param res 
     */
    getGroupInfo(req: any, res: any) {
        const groupName: String = req.params.groupname;
        if (groupName && this.mediaServerContext.groupsContext.has(groupName)) {
            const groupContext: GroupContext = this.mediaServerContext.groupsContext.get(groupName);
            res.status(200).send(groupContext);
        } else {
            res.status(404).send({
                errors: [
                    {
                        message: "resource not found"
                    }
                ]
            });
        }
    }
}