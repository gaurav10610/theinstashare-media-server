import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ElectronService } from 'ngx-electron';
import { SignalingMessageType } from './services/types/enum/SignalingMessageType';
import { LoggerUtil } from './services/logging/LoggerUtil';
import { ServerConstants } from './services/ServerConstants';
import { SignalingService } from './services/signaling/signaling.service';
import { BaseSignalingMessage } from './services/types/signaling/BaseSignalingMessage';
import { AnswerSignalingMessage } from './services/types/signaling/AnswerSignalingMessage';
import { CandidateSignalingMessage } from './services/types/signaling/CandidateSignalingMessage';
import { OfferSignalingMessage } from './services/types/signaling/OfferSignalingMessage';
import { RegisterSignalingMessage } from './services/types/signaling/RegisterSignalingMessage';
import { CoreWebrtcService } from './services/webrtc/core-webrtc.service';
import { MediaServerWebrtcService } from './services/webrtc/media-server-webrtc.service';
import { MediaChannelType } from './services/types/enum/MediaChannelType';
import { WebRTCEventType } from './services/types/enum/WebRTCEventType';
import { WebRTCEventSignalingMessage } from './services/types/signaling/WebRTCEventSignalingMessage';
import { ServerContextService } from './services/context/server-context.service';
import { UserContext } from './services/types/UserContext';
import { ConnectionStatesType } from './services/types/enum/ConnectionStatesType';
import { CoreDataChannelService } from './services/data-channel/core-data-channel.service';
import { UserGroupService } from './services/user-group/user-group.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private translate: TranslateService,
    private electronService: ElectronService,
    private signalingService: SignalingService,
    private coreWebrtcService: CoreWebrtcService,
    private mediaServerWebrtcService: MediaServerWebrtcService,
    private serverContextService: ServerContextService,
    private coreDataChannelService: CoreDataChannelService,
    private userGroupService: UserGroupService
  ) {
    this.translate.setDefaultLang('en');
    LoggerUtil.log(this.electronService.isElectronApp ? 'this is an electron application' : 'this is a web application');
  }

  ngOnInit(): void {
    const eventsConfig = {
      onopen: this.onRouterConnect.bind(this),
      onreconnect: this.onRouterConnect.bind(this),
      onmessage: this.onRouterMessage.bind(this)
    };
    this.signalingService.registerEventListeners(eventsConfig);

    /**
     * this is being done just to reuse some code available in this component
     * within webrtc service
     *
     */
    this.mediaServerWebrtcService.onRouterMessageFunction = this.onRouterMessage.bind(this);
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
   * while sending any message to other user app gives first priority to existing
   * datachannel between two users to exchange any messages(see the existing
   * supported message types below) between them if it found one else it will
   * send the messages to other user via signaling server only
   *
   * @param signalingMessage received signaling message
   *
   */
  async onRouterMessage(signalingMessage: any) {
    try {
      LoggerUtil.log('received message via ' + (signalingMessage.via ? signalingMessage.via : 'signaling router')
        + ': ' + JSON.stringify(signalingMessage));

      switch (signalingMessage.type) {
        case SignalingMessageType.REGISTER:
          await this.handleRegister(<RegisterSignalingMessage>signalingMessage);
          break;

        case SignalingMessageType.CREATE_GROUP:
          this.userGroupService.handleCreateGroup(signalingMessage);
          break;

          case SignalingMessageType.REGISTER_USER_IN_GROUP:
            this.userGroupService.handleUserGroupRegistration(signalingMessage);
            break;

        case SignalingMessageType.OFFER:
          await this.consumeWebrtcOffer(<OfferSignalingMessage>signalingMessage);
          break;

        case SignalingMessageType.ANSWER:
          await this.coreWebrtcService.handleAnswer(<AnswerSignalingMessage>signalingMessage);
          break;

        case SignalingMessageType.CANDIDATE:
          await this.coreWebrtcService.handleCandidate(<CandidateSignalingMessage>signalingMessage);
          break;

        case SignalingMessageType.DISCONNECT:
          // this.handleDisconnectionRequest(signalingMessage);
          break;

        case SignalingMessageType.WEBRTC_EVENT:
          this.handleWebrtcEvent(signalingMessage);
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
  handleRegister(signalingMessage: RegisterSignalingMessage) {
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

  /**
   * this will process received messages of type 'offer'
   *
   * @param signalingMessage: received signaling message
   */
  async consumeWebrtcOffer(signalingMessage: OfferSignalingMessage): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      try {
        /**
          * 
          * if this offer message is for renegotiating an already established connection
          * 
          */
        if (signalingMessage.renegotiate) {

          const peerConnection: RTCPeerConnection = this.serverContextService.getUserContext(signalingMessage.from).connection;

          if (signalingMessage.seekReturnTracks) {
            /**
             * 
             * @TODO handle offer for media tracks here
             */
          } else {
            /**
             * handle the received webrtc offer 'sdp', set the remote description and
             * generate the answer sebsequently for sending it to the other user
             *
             * 'answerContainer' will contain the generated answer sdp and few other
             * properties which app utilizes to compose an answer signaling message
             * to be sent to other user
             *
             */
            const answerContainer: any = await this.coreWebrtcService
              .generateAnswer(peerConnection, signalingMessage.offer, signalingMessage.channel);

            /**
             * send the composed 'answer' signaling message to the other user from whom
             * we've received the offer message
             *
             */
            const answerSignalingPayload: AnswerSignalingMessage = {
              type: SignalingMessageType.ANSWER,
              answer: answerContainer.answerPayload.answer,
              channel: answerContainer.answerPayload.channel,
              from: this.serverContextService.servername,
              to: signalingMessage.from
            }
            this.coreDataChannelService.sendPayload(answerSignalingPayload);
          }
        } else {

          /**
           * 
           * this will setup a new webrtc connection 
           */
          this.mediaServerWebrtcService.setUpWebrtcConnection(signalingMessage.from, signalingMessage);
        }
        resolve();
      } catch (e) {
        LoggerUtil.log('there is an error while consuming webrtc offer received from ' + signalingMessage.from);
        reject(e);
      }
    });
  }

  /**
   * 
   * this will handle webrtc events 
   * 
   * @param signalingMessage received signaling message 
   * 
   */
  handleWebrtcEvent(signalingMessage: WebRTCEventSignalingMessage) {
    LoggerUtil.log('handling webrtc event: ' + signalingMessage.event);
    const userContext: UserContext = this.serverContextService.getUserContext(signalingMessage.from);
    switch (signalingMessage.event) {

      /**
       * 
       * webrtc data channel open event received from remote user's end
       */
      case WebRTCEventType.CHANNEL_OPEN:
        LoggerUtil.log(signalingMessage.channel + ' data channel has been opened with user: ' + signalingMessage.from);
        userContext.dataChannelConnectionState = ConnectionStatesType.CONNECTED;
        switch (signalingMessage.channel) {

          case MediaChannelType.TEXT:
            this.mediaServerWebrtcService.sendQueuedMessagesOnChannel(signalingMessage.from);
            break;
        }
        break;

      case WebRTCEventType.REMOTE_TRACK_RECEIVED:

        /**
         * 'screen' & 'sound' media streaming is one-way so remove the timeout cleanup job once media stream
         *  track is received on the other end
         * 
         * @TODO implement it afterwards 
         * 
         */
        break;

      default:
        LoggerUtil.log('unknown webrtc event signaling message received')
    }
  }
}
