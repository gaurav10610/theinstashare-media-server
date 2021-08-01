import { Injectable } from '@angular/core';
import { GroupContextType } from '../contracts/GroupContextType';
import { UserContextType } from '../contracts/UserContextType';

@Injectable({
  providedIn: 'root'
})
export class ServerContextService {

  constructor() {
    //initialization
    this.servername = 'media-server';
    this.usersContext = new Map<String, UserContextType>();
    this.groupsContext = new Map<String, GroupContextType>();
  }

  //username assigned to media server for registering on signaling server
  servername: String;

  //users context 
  usersContext: Map<String, UserContextType>;

  //groups context
  groupsContext: Map<String, GroupContextType>;
}
