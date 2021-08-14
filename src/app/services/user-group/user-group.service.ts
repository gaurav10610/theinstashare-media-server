import { Injectable } from "@angular/core";
import { ServerContextService } from "../context/server-context.service";
import { CoreDataChannelService } from "../data-channel/core-data-channel.service";
import { LoggerUtil } from "../logging/LoggerUtil";
import { BaseDataChannelMessage } from "../types/datachannel/BaseDataChannelMessage";
import { MediaChannelType } from "../types/enum/MediaChannelType";
import { GroupContext } from "../types/GroupContext";
import { BaseSignalingMessage } from "../types/signaling/BaseSignalingMessage";
import { UserContext } from "../types/UserContext";

@Injectable({
    providedIn: 'root'
})
export class UserGroupService {

    constructor(
        private serverContextService: ServerContextService,
        private coreDataChannelService: CoreDataChannelService
    ) { }

    /**
     * handle message on received on data channel of a group member user
     * 
     * @param message message received on data channel 
     * 
     */
    handleGroupTextMessage(message: BaseDataChannelMessage) {
        const userContext: UserContext = this.serverContextService.getUserContext(message.username);
        if (userContext.userGroup) {
            const groupContext: GroupContext = this.serverContextService.getGroupContext(userContext.userGroup);
            LoggerUtil.log(groupContext);

            // iterate all users from the group and 
            groupContext.groupMembers.forEach((status, username) => {
                if (status && username !== message.from) {
                    // update recipient to send this message to other users in the group
                    message.to = username;
                    /**
                     * 
                     * @TODO refactor it afterwards
                     * 
                     */
                    message.username = 'media-server';
                    message.from = 'media-server';
                    this.coreDataChannelService.sendMessageOnDataChannel(message, message.type);
                }
            });
        }
    }

    /**
     * 
     * handle signaling message for creating a user group
     * @param siganlingMessage message received via signaling router
     * 
     */
    handleCreateGroup(signalingMessage: BaseSignalingMessage): void {
        LoggerUtil.log('handling request for creating user group: ' + signalingMessage.userGroup);
        this.serverContextService.initializeGroupContext(signalingMessage.userGroup, signalingMessage.from);
    }

    /**
     * handle siganling message for registering a user in a user group
     * 
     * @param siganlingMessage message received via signaling router 
     * 
     */
    handleUserGroupRegistration(signalingMessage: BaseSignalingMessage): void {
        LoggerUtil.log('handling request for registering ' + signalingMessage.from + ' in ' + signalingMessage.userGroup);
        if (this.serverContextService.usersContext.has(signalingMessage.from)) {
            /**
             * if user have an active connection with media server then
             * 
             * 1. add user in corresponding group context
             * 
             * 2. set user group name in user's context as well
             */
            this.serverContextService.groupsContext.get(signalingMessage.userGroup)
                .groupMembers.set(signalingMessage.from, true);
            this.serverContextService.getUserContext(signalingMessage.from).userGroup = signalingMessage.userGroup;
        } else {
            LoggerUtil.log('user ' + signalingMessage.from + ' can not be added in group ' + signalingMessage.userGroup
                + ' as user does not have an active connection with the media server');
        }
    }
}