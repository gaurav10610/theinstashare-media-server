import { MediaChannelType } from "./enum/MediaChannelType";
import { SignalingMessageType } from "./enum/SignalingMessageType";

export interface BaseDataChannelMessage {

    //optional id for message acknowledgments
    id?: String;
    
    //username of the sender
    from: String;

    //username of the recipient
    to: String;

    //type of the signaling message
    type: MediaChannelType;

    message: any;

    username?: String;
}