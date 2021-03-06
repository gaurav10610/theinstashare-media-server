import { Injectable } from '@angular/core';
import { ConnectionStatesType } from '../types/enum/ConnectionStatesType';
import { UserType } from '../types/enum/UserType';
import { GroupContext } from '../types/GroupContext';
import { UserContext } from '../types/UserContext';
import { QueueStorage } from '../util/QueueStorage';

@Injectable({
  providedIn: 'root'
})
export class ServerContextService {

  constructor() {
    //initialization
    this.servername = 'media-server';
    this.usersContext = new Map<String, UserContext>();
    this.groupsContext = new Map<String, GroupContext>();
  }

  //username assigned to media server for registering on signaling server
  servername: String;

  //users context 
  usersContext: Map<String, UserContext>;

  //groups context
  groupsContext: Map<String, GroupContext>;

  /**
    * this will return the userContext
    * 
    * @param username: username of the user
    */
  getUserContext(username: String): UserContext {
    return this.usersContext.get(username);
  }

  /**
   * this will return the userContext
   * 
   * @param userGroup: userGroup of the user
   */
  getGroupContext(userGroup: String): GroupContext {
    return this.groupsContext.get(userGroup);
  }

  /**
   * 
   * initialize user context here
   *  
   * @param username 
   * @param userType
   * @param userGroup
   */
  initializeUserContext(username: String, userType: UserType, userGroup: String): UserContext {
    this.usersContext.set(username, {
      username: username,
      connection: null,
      audioTrack: null,
      videoTrack: null,
      dataChannel: null,
      firstConnectedAt: new Date(),
      lastConnectedAt: new Date(),
      userType: userType,
      userGroup: userGroup,
      webrtcConnectionState: ConnectionStatesType.NOT_CONNECTED,
      dataChannelConnectionState: ConnectionStatesType.NOT_CONNECTED,
      webrtcOnConnectQueue: new QueueStorage(),
      msgQueue: new QueueStorage()
    });
    return this.usersContext.get(username);
  }

  /**
   * initialize group context here
   * 
   * @param userGroup name of the group
   * @param createdBy username of the user who created the group
   * 
   * @returns context of newly created group
   * 
   */
  initializeGroupContext(groupName: String, createdBy: String): GroupContext {
    this.groupsContext.set(groupName, {
      groupName: groupName,
      createdAt: new Date(),
      createdBy: createdBy,
      groupAdmin: createdBy,
      groupMembers: new Map<String, Boolean>(),
      lastUsedAt: null
    });
    return this.groupsContext.get(groupName);
  }
}
