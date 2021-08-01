import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ElectronService } from 'ngx-electron';
import { SignalingMessageType } from './services/contracts/enum/SignalingMessageType';
import { BaseSignalingMessageType } from './services/contracts/signaling/BaseSignalingMessageType';
import { LoggerUtil } from './services/logging/LoggerUtil';
import { ServerConstants } from './services/ServerConstants';
import { SignalingService } from './services/signaling/signaling.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private translate: TranslateService,
    private electronService: ElectronService,
    private signalingService: SignalingService
  ) {
    this.translate.setDefaultLang('en');
    LoggerUtil.log(this.electronService.isElectronApp ? 'this is an electron application' : 'this is a web application');

    const eventsConfig = {
      onopen: this.onRouterConnect.bind(this),
      onreconnect: this.onRouterConnect.bind(this),
      onmessage: this.onRouterMessage.bind(this)
    };
    this.signalingService.registerEventListeners(eventsConfig);
  }

  /*
   * handler to handle connection open event with server
   */
  onRouterConnect() {
    this.signalingService.registerOnSignalingServer(ServerConstants.SERVER_NAME, true);
  }

  /**
 * handler to handle messages received via server or via webrtc datachannel
 *
 *
 * while sending any message to other user app gives first priority to existing
 * datachannel between two users to exchange any messages(see the existing
 * supported message types below) between them if it found one else it will
 * send the messages to other user via signaling server only
 *
 *
 * @param signalingMessage received signaling message
 *
 */
  async onRouterMessage(signalingMessage: BaseSignalingMessageType) {
    try {
      LoggerUtil.log('received message via ' + signalingMessage.via + ': ' + JSON.stringify(signalingMessage));
      switch (signalingMessage.type) {
        case SignalingMessageType.REGISTER:
          await this.handleRegister(signalingMessage);
          break;

        case SignalingMessageType.OFFER:
          //await this.consumeWebrtcOffer(signalingMessage);
          break;

        case SignalingMessageType.ANSWER:
          //await this.coreWebrtcService.handleAnswer(signalingMessage);
          break;

        case SignalingMessageType.CANDIDATE:
          //await this.coreWebrtcService.handleCandidate(signalingMessage);
          break;

        case SignalingMessageType.DISCONNECT:
          // this.handleDisconnectionRequest(signalingMessage);
          break;

        default:
          LoggerUtil.log('received unknown signaling message with type: ' + signalingMessage.type);
      }
    } catch (err) {
      LoggerUtil.log('error occured while handling received signaling message');
      LoggerUtil.log(err);
    }
  }

  /**
 * handle to handle received messages of type 'register'
 * 
 * @param signalingMessage received signaling message
 * 
 */
  handleRegister(signalingMessage: any) {
    return new Promise<void>((resolve) => {
      if (signalingMessage.success) {

        /**
         * this is the case when user was successfully able to register with
         * the server
         *
         * received 'register' type message will have a boolean 'success'
         * property as a user registration status
         *
         * a. set the registered status property within signaling service
         */
        this.signalingService.isRegistered = signalingMessage.success;

        /**
         * 
         * onopen event handler won't be needed after user is registered as even
         * in the disconnect cases we will manage reconnect handler only
         * 
         */
        this.signalingService.signalingRouter.off('connect');

      } else {
        LoggerUtil.log('registration with signaling server server failed for some reason');
      }
      resolve();
    });
  }
}
