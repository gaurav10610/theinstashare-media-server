import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoggerUtil } from '../logging/LoggerUtil';
import { ApiService } from '../api/api.service';
import { ServerConstants } from '../ServerConstants';
import * as io from '../../../assets/js/socket.io.js';

@Injectable({
  providedIn: 'root'
})
export class SignalingService {

  constructor(
    private apiService: ApiService
  ) {
    this.signalingRouter = io(environment.rtc_api_endpoint_base);
  }

  /* 
   * registered flag that will keep track whether user
   * is registered with signaling server or not
   */
  isRegistered: Boolean = false;

  /*
   * for now it's a websocket connection to the signaling server
   */
  signalingRouter: any;

  /**
   * Sending signaling message to signaling server
   * @param  message : message payload to be sent
   */
  sendPayload(message: any) {
    this.signalingRouter.send(message);
    LoggerUtil.log('sent payload via signaling server ' + JSON.stringify(message));
  }

  /**
   * This will register all the event listeners on the message router for signaling.
   * @param eventsConfig : config for event handler function those needs to be
   * registered on signaling router registered.
   */
  registerEventListeners(eventsConfig: any) {

    this.signalingRouter.on('message', eventsConfig.onmessage);
    if (eventsConfig.onopen) {
      this.signalingRouter.on('connect', eventsConfig.onopen);
    } else {
      this.signalingRouter.on('connect', this.onRouterConnect);
    }

    /* disconnect listener */
    if (eventsConfig.onclose) {
      this.signalingRouter.on('disconnect', eventsConfig.onclose);
    } else {
      this.signalingRouter.on('disconnect', this.onRouterClose);
    }

    if (eventsConfig.onreconnect) {
      this.signalingRouter.on('reconnect', eventsConfig.onreconnect);
    }
  }

  /*
   * Handler to handle signaling server connection open event
   */
  onRouterConnect() {
    LoggerUtil.log('connection established with signaling server.');
  }

  /**
   * Handler to handle signaling server connection close event
   */
  onRouterClose() {
    this.isRegistered = false;
    LoggerUtil.log('diconnected from signaling server.');
  }

  /**
   * Registering a user on signaling server
   * @param username :username for signaling server to register with
   * @param validateUser: whether to validate user or not
   */
  async registerOnSignalingServer(username: String, validateUser: Boolean): Promise<void> {
    return new Promise(async (resolve) => {
      if (validateUser) {
        const isNotValid = await this.validateUserName(username);
        if (isNotValid) {
          LoggerUtil.log('registration with signaling server fails');
        } else {
          this.registerUser(username);
        }
      } else {
        this.registerUser(username);
      }
      resolve();
    });
  }

  /**
   * this will send a de-regiter message to signaling server 
   * 
   * @param username username of the user
   */
  async deRegisterOnSignalingServer(username: string) {
    /**
     * send de-register message to server to notify that user has opted to
     * logout
     */
    this.sendPayload({
      type: ServerConstants.DEREGISTER,
      from: username,
      to: username
    });
    this.isRegistered = false;
  }

  /**
   * this will validate the username for empty string and whether it is already
   * taken by someone
   * @param  username :username of the user to be validated
   * @return promise
   */
  validateUserName(username: String) {
    return new Promise(async (resolve, reject) => {
      try {
        if (username && username !== '') {
          const data: any = await this.apiService.get('status/' + username).toPromise();
          resolve(data.status);
        } else {
          resolve(true);
        }
      } catch (e) {
        LoggerUtil.log(e);
        reject();
      }
    });
  }

  /**
   * This will send resister message to signaling server
   * @param  username : username to register
   * @return
   */
  private registerUser(username: String) {
    this.sendPayload({
      type: ServerConstants.REGISTER,
      from: username,
      to: username,
      socketId: this.signalingRouter.id,
      via: 'signaling server'
    });
  }

}
