import { Injectable } from '@angular/core';
import { ServerConstants } from '../ServerConstants';
import { MediaChannelType } from '../types/enum/MediaChannelType';
import { UserContext } from '../types/UserContext';
import { ConnectionStatesType } from '../types/enum/ConnectionStatesType';

@Injectable({
  providedIn: 'root'
})
export class CoreServerUtilityService {

  constructor() { }

  /**
   * check if there is an open data channel with a user using it's provided webrtc
   * context
   *
   * @param webrtcContext user's webrtc context
   *
   */
  isDataChannelConnected(userContext: UserContext): Boolean {
    return userContext.dataChannelConnectionState as ConnectionStatesType === ConnectionStatesType.CONNECTING;
  }

  /**
   * check if dataChannel with a user is in connecting state using it's provided
   * webrtc context
   *
   * @param webrtcContext user's webrtc context
   *
   */
  isDataChannelConnecting(userContext: UserContext): Boolean {
    return userContext.dataChannelConnectionState as ConnectionStatesType === ConnectionStatesType.CONNECTING;
  }

  /**
   * to check whether the webrtc peer connection(send or receive peer) with the
   * provide user is in connected state the user who's username is passed as
   * an argument
   *
   * @param webrtcContext user's webrtc context
   *
   * @return a boolean result
   * 
   */
  isWebrtcConnectionConnected(userContext: UserContext): Boolean {
    return userContext.webrtcConnectionState as ConnectionStatesType === ConnectionStatesType.CONNECTED;
  }

  /**
   * check if webrtc connection with a user is in connecting state using it's provided
   * webrtc context
   *
   * @param webrtcContext user's webrtc context
   *
   */
  isWebrtcConnectionConnecting(userContext: UserContext): Boolean {
    return userContext.webrtcConnectionState as ConnectionStatesType === ConnectionStatesType.CONNECTING;
  }

  /**
   * delay implementatio
   * 
   * @param timeToSleep time in ms to sleep
   */
  delay(timeToSleep: Number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeToSleep.valueOf()));
  }

  /**
   * this will generate a unique identifier
   *
   * @return a promise containing a unique numberic identifier
   */
  generateIdentifier(): Promise<Number> {
    return new Promise<Number>((resolve) => {
      resolve(Date.now());
    });
  }

  /**
   * this will return a deep nested value
   *
   * @param object object in which value has to be checked
   *
   * @param levels rest of the property names
   *
   * @return value of deep nested property else undefined
   */
  getNestedValue(object: any, ...levels: any) {
    return levels.reduce((object: any, level: any) => object && object[level], object);
  }

  /**
   * this will return the media type for sdp modification so that app can apply 
   * max bitrate limit for a webrtc connection
   *  
   * @param channel: media type audio/video/text 
   * 
   */
  getMediaTypeForSdpModification(channel: String): String {
    if (channel === MediaChannelType.VIDEO || channel === MediaChannelType.SCREEN) {
      return MediaChannelType.VIDEO;
    } else if (channel === MediaChannelType.FILE || channel === MediaChannelType.TEXT) {
      return ServerConstants.APPLICATION;
    } else if (channel === MediaChannelType.AUDIO || channel === MediaChannelType.SOUND) {
      return MediaChannelType.AUDIO;
    }
  }

  /**
   * 
   * check if provided channel uses data channel
   * 
   * @param channel type of media i.e 'text', 'file' or 'remoteControl'
   */
  isDataChannel(channel: string): Boolean {
    return this.checkMember(channel, [MediaChannelType.TEXT, MediaChannelType.FILE]);
  }

  /**
   * 
   * check if provided channel uses data channel
   * 
   * @param channel type of media i.e 'audio', 'video' etc
   */
  isMediaChannel(channel: string): Boolean {
    return this.checkMember(channel, [MediaChannelType.VIDEO, MediaChannelType.AUDIO,
    MediaChannelType.SCREEN, MediaChannelType.SOUND]);
  }

  /**
   * this will check if a certain value is in the specified array or not
   * 
   * @param value value to check in the array
   * @param array array of values
   * @returns boolean specifying whether value exist in array or not
   * 
   */
  checkMember(value: any, array: any[]): Boolean {
    return array.indexOf(value) > -1;
  }
}
