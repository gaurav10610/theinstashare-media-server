import { Injectable } from '@angular/core';
import { ServerConstants } from '../ServerConstants';
import { LoggerUtil } from '../logging/LoggerUtil';
import { ServerContextService } from '../context/server-context.service';
import { UserContext } from '../types/UserContext';
import { UserType } from '../types/enum/UserType';
import { BaseSignalingMessage } from '../types/signaling/BaseSignalingMessage';
import { AnswerSignalingMessage } from '../types/signaling/AnswerSignalingMessage';
import { CandidateSignalingMessage } from '../types/signaling/CandidateSignalingMessage';
import { OfferSignalingMessage } from '../types/signaling/OfferSignalingMessage';
import { ConnectionStatesType } from '../types/enum/ConnectionStatesType';
import { CoreServerUtilityService } from '../util/core-server-utility.service';
import { MediaChannelType } from '../types/enum/MediaChannelType';
import { SignalingMessageType } from '../types/enum/SignalingMessageType';

@Injectable({
  providedIn: 'root'
})
export class CoreWebrtcService {

  constructor(
    private serverContextService: ServerContextService,
    private coreServerUtilityService: CoreServerUtilityService
  ) { }

  /**
   * initializing a webrtc peer connection and store it user's webrtc connection
   *
   * @param username username of the user with whom connection has to be established
   *
   */
  rtcConnectionInit(username: String): Promise<Boolean> {
    return new Promise<Boolean>((resolve, reject) => {
      try {
        let initializedConnection: Boolean = false;
        const PeerConnection = RTCPeerConnection || webkitRTCPeerConnection;
        const userContext: UserContext = this.serverContextService.getUserContext(username);

        /**
         * 
         * @TODO Fix this flow afterwards  
         * 
         */
        if (userContext.webrtcConnectionState as ConnectionStatesType === ConnectionStatesType.NOT_CONNECTED) {
          initializedConnection = true;
          //initialize a new webrtc peer connection
          userContext.connection = new PeerConnection(ServerConstants.STUN_CONFIG);
        }
        resolve(initializedConnection);
      } catch (error) {
        LoggerUtil.log(error);
        reject('there is an error while initializing peer connection');
      }
    });
  }

  /**
   * this will handle the processing of any 'answer' type message received
   *
   * @param signalingMessage received signaling message
   *
   *  @TODO remove the Promise afterwards
   */
  handleAnswer(signalingMessage: AnswerSignalingMessage): Promise<void> {
    return new Promise<void>(async (resolve) => {
      const peerConnection: RTCPeerConnection = this.serverContextService.getUserContext(signalingMessage.from).connection;
      peerConnection.setRemoteDescription(new RTCSessionDescription(signalingMessage.answer));
      resolve();
    });
  }

  /**
   * this will handle the processing of any 'candidate' type message received
   *
   * @param signalingMessage received signaling message
   *
   * @TODO remove the Promise afterwards
   */
  handleCandidate(signalingMessage: CandidateSignalingMessage): Promise<void> {
    return new Promise<void>((resolve) => {
      const peerConnection: RTCPeerConnection = this.serverContextService.getUserContext(signalingMessage.from).connection;
      peerConnection.addIceCandidate(new RTCIceCandidate(signalingMessage.candidate));
      resolve();
    });
  }


  /**
   * this will generate appropriate answer on provided webrtc peer connection on
   * the basis of supplied media type
   *
   * @param offer received webrtc offer
   *
   * @param peerConnection webrtc peer connection for which answer has to be generated
   *
   * @param mediaChannel webrtc connection's media type for connection means the
   * type of media data that we will relay on this connection e.g 'text','video'
   * or 'audio'
   *
   * @return a promise with generated answer
   */
  generateAnswer(peerConnection: RTCPeerConnection, offer: RTCSessionDescriptionInit, mediaChannel: MediaChannelType) {
    return new Promise((resolve, reject) => {
      peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      peerConnection.createAnswer().then(async (newAnswer: RTCSessionDescriptionInit) => {

        /**
         * before setting local session description on webrtc peer connection, app
         * will modify the max bitrate that webrtc peer connection can use
         *
         */
        const maxBitrate: Number = this.coreServerUtilityService.getMaxBitrateForSdpModification(mediaChannel);
        const sdpMediaType: MediaChannelType = this.coreServerUtilityService.getMediaTypeForSdpModification(mediaChannel);
        const modifiedSdp: String = await this.setMediaBitrate(newAnswer.sdp, sdpMediaType, maxBitrate);
        const answer: RTCSessionDescription = new RTCSessionDescription({ type: 'answer', sdp: modifiedSdp.valueOf() });

        peerConnection.setLocalDescription(answer);
        resolve({
          answerPayload: {
            type: SignalingMessageType.ANSWER,
            answer: answer,
            channel: mediaChannel
          }
        });
      }).catch((error: any) => {
        LoggerUtil.log('there is an error while generating answer');
        reject(error);
      }); // Here ends create answer
    });
  }

  /**
   * this will open a data channel on supplied webrtc peer connection
   *
   * @param peerConnection webrtc peer connection on data channel has to be opened
   * 
   * @param channelId webrtc data channel id
   *
   * @return newly opened webrtc datachannel
   */
  openDataChannel(peerConnection: RTCPeerConnection, channelId: String): Promise<RTCDataChannel> {
    return new Promise((resolve, reject) => {
      try {
        if (peerConnection == null) {
          reject('peer connection is not yet initialized to open data channel');
        }
        const dataChannel: RTCDataChannel = peerConnection.createDataChannel(channelId.toString());
        dataChannel.onerror = (error: any) => {
          /**
           * 
           * @TODO handle it properly here
           */
          LoggerUtil.log(error);
        };
        resolve(dataChannel);
      } catch (error) {
        reject('opening datachannel failed');
      }
    });
  }

  /**
   * this is just cleanup subroutine for cleaning any webrtc peer connection
   *
   * @param peerConnection webrtc peer connection that needs to be cleaned
   *
   * @return a promise
   */
  cleanRTCPeerConnection(peerConnection: RTCPeerConnection): Promise<void> {
    return new Promise<void>((resolve) => {
      peerConnection.ondatachannel = null;
      peerConnection.ontrack = null;
      peerConnection.onicecandidate = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.onsignalingstatechange = null;
      peerConnection.onnegotiationneeded = null;
      peerConnection.close();
      resolve();
    });
  }

  /**
   * this is just cleanup subroutine for cleaning any webrtc data channel
   *
   * @param dataChannel webrtc data channel that needs to be reset
   *
   * @return a promise
   */
  cleanDataChannel(dataChannel: RTCDataChannel): Promise<void> {
    return new Promise<void>((resolve) => {
      dataChannel.onerror = null;
      dataChannel.onmessage = null;
      dataChannel.close();
      resolve();
    });
  }

  /**
   * this is a webrc sdp parsing logic to set the max bitrate that webrtc connection
   * can use
   *
   * @param sdp webrtc sdp that needed to be updated
   * @param media type of media for which bitrate has to be set i.e 'audio' or 'video'
   * @param bitrate max bitrate that to be set
   *
   * @return a promise with updated sdp
   */
  setMediaBitrate(sdp: String, media: String, bitrate: Number): Promise<String> {
    return new Promise((resolve) => {
      let lines = sdp.split('\n');
      let line = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf('m=' + media) === 0) {
          line = i;
          break;
        }
      }
      if (line === -1) {
        LoggerUtil.log('Could not find the m line for: ' + media);
        resolve(sdp);
      }
      LoggerUtil.log('Found the m line for: ' + media + ' at line: ' + line);
      line++;
      while (lines[line].indexOf('i=') === 0 || lines[line].indexOf('c=') === 0) {
        line++;
      }
      if (lines[line].indexOf("b") === 0) {
        //LoggerUtil.log('Replaced b line at line: ' + line);
        lines[line] = 'b=AS:' + bitrate;
        resolve(lines.join('\n'));
      }
      //LoggerUtil.log('Adding new b line before line: ' + line);
      let newLines = lines.slice(0, line);
      newLines.push('b=AS:' + bitrate);
      newLines = newLines.concat(lines.slice(line, lines.length));
      resolve(newLines.join('\n'));
    });
  }
}
