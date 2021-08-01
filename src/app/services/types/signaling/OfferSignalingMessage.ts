import { BaseSignalingMessage } from "./BaseSignalingMessage";

export interface OfferSignalingMessage extends BaseSignalingMessage {

    //offer session description
    offer: RTCSessionDescriptionInit
}