import { SignalingMessageType } from '../enum/SignalingMessageType';

export interface BaseSignalingMessageType {
    //username of the sender
    from: String;

    //username of the recipient
    to: String;

    //type of the signaling message
    type: SignalingMessageType;

    /**
     * this will specify whether the signaling message is 
     * routed/received via signaling router or via webrtc data channel
     * 
     */
    via: String;
}