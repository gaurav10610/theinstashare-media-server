import { UserType } from "./enum/UserType";

export interface UserContextType {

    //registered username of the user
    username: String;

    //webrtc connection of the user
    connection: RTCPeerConnection;

    //audio track of the user
    audioTrack: MediaStreamTrack;

    //video track of the user
    videoTrack: MediaStreamTrack;

    //data channel
    dataChannel: RTCDataChannel;

    //first connection timestamp
    firstConnectedAt: Date;

    //last connection timestamp
    lastConnectedAt: Date;

    //type of user
    userType: UserType;

    //user group - name of the user group
    userGroup: String;
}