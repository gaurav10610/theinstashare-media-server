import { Injectable } from '@angular/core';
import { GroupContext } from '../types/GroupContext';
import { UserContext } from '../types/UserContext';

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
    return this.usersContext.has(username) ? this.usersContext.get(username) : null;
  }
}
