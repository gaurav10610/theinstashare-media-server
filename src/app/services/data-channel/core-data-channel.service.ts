import { Injectable } from '@angular/core';
import { ServerConstants } from '../ServerConstants';
import { ServerContextService } from '../context/server-context.service';
import { LoggerUtil } from '../logging/LoggerUtil';
import { SignalingService } from '../signaling/signaling.service';
import { BaseSignalingMessage } from '../types/signaling/BaseSignalingMessage';
import { CoreServerUtilityService } from '../util/core-server-utility.service';
import { MediaChannelType } from '../types/enum/MediaChannelType';
import { UserContext } from '../types/UserContext';
import { SignalingMessageType } from '../types/enum/SignalingMessageType';
import { BaseDataChannelMessage } from '../types/datachannel/BaseDataChannelMessage';

@Injectable({
  providedIn: 'root'
})
export class CoreDataChannelService {

  constructor(
    private serverContextService: ServerContextService,
    private coreServerUtilService: CoreServerUtilityService,
    private signalingService: SignalingService,
  ) { }

  /**
   * this will send the signaling message on the dataChannel if found open else
   * send it via signaling server i.e socket server
   *
   * @param signalingMessage json signaling message payload nedded to be sent
   */
  sendPayload(signalingMessage: BaseSignalingMessage) {
    const userContext: UserContext = this.serverContextService.getUserContext(signalingMessage.to);

    /**
     * if there is already an open data channel b/w users then send signaling
     * payload via data channel only by wrapping whole message in a top container
     * and adding a 'via' property in top container so that data channel on the
     * other can know that this message is a signaling payload
     *
     * 
     * @TODO see if this can be removed
     */
    if (this.coreServerUtilService.isDataChannelConnected(userContext)) {
      signalingMessage.via = ServerConstants.DATACHANNEL;
      this.sendMessageOnDataChannel({
        id: MediaChannelType.SIGNALING + '-' + this.coreServerUtilService.generateIdentifier(),
        from: signalingMessage.from,
        to: signalingMessage.to,
        type: MediaChannelType.SIGNALING,
        message: signalingMessage,
        username: signalingMessage.from
      }, MediaChannelType.TEXT);
    } else {

      /**
       * if there is no open data channel found then just route/send message via
       * signaling server
       *
       */
      signalingMessage.via = 'signaling server';
      this.signalingService.sendPayload(signalingMessage);
    }
  }

  /**
   * this will send a json message via data channel of specified channel
   * 
   * @param jsonMessage message that needs to be sent via data channel
   * 
   * @param channel webrtc connection's media type for connection means the
   * type of media data that we will relay on this connection e.g 'text','video'
   * or 'audio'
   * 
   */
  sendMessageOnDataChannel(jsonMessage: BaseDataChannelMessage, channel: MediaChannelType): Promise<Boolean> {
    return new Promise((resolve) => {
      try {
        const userContext: UserContext = this.serverContextService.getUserContext(jsonMessage.to);
        userContext.dataChannel.send(JSON.stringify(jsonMessage));
      } catch (e) {
        LoggerUtil.log('error occured while sending following message via data channel');
        LoggerUtil.log(JSON.stringify(jsonMessage));
        resolve(false);
      }
      LoggerUtil.log('sent payload via data channel : ' + JSON.stringify(jsonMessage));
      resolve(true);
    });
  }
}
