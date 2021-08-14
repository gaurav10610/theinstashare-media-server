import { Injectable } from '@angular/core';
import { ServerContextService } from '../context/server-context.service';
import { LoggerUtil } from '../logging/LoggerUtil';
import { ServerConstants } from '../ServerConstants';
import { ConnectionStatesType } from '../types/enum/ConnectionStatesType';
import { UserType } from '../types/enum/UserType';
import { OfferSignalingMessage } from '../types/signaling/OfferSignalingMessage';
import { UserContext } from '../types/UserContext';
import { CoreWebrtcService } from './core-webrtc.service';
import { CallbackContext } from '../types/CallbackContext';
import { SignalingMessageType } from '../types/enum/SignalingMessageType';
import { CandidateSignalingMessage } from '../types/signaling/CandidateSignalingMessage';
import { MediaChannelType } from '../types/enum/MediaChannelType';
import { CoreDataChannelService } from '../data-channel/core-data-channel.service';
import { WebRTCEventType } from '../../services/types/enum/WebRTCEventType';
import { WebRTCEventSignalingMessage } from '../types/signaling/WebRTCEventSignalingMessage';
import { CoreServerUtilityService } from '../util/core-server-utility.service';
import { DataChannelMessageStatusType } from '../types/enum/DataChannelMessageStatusType';
import { AnswerSignalingMessage } from '../types/signaling/AnswerSignalingMessage';
import { BaseDataChannelMessage } from '../types/datachannel/BaseDataChannelMessage';
import { AcknowledgementDataChannelMessage } from '../types/datachannel/AcknowledgementDataChannelMessage';
import { UserGroupService } from '../user-group/user-group.service';

@Injectable({
    providedIn: 'root'
})
export class MediaServerWebrtcService {

    constructor(
        private serverContextService: ServerContextService,
        private coreWebrtcService: CoreWebrtcService,
        private coreDataChannelService: CoreDataChannelService,
        private coreServerUtilityService: CoreServerUtilityService,
        private userGroupService: UserGroupService
    ) { }

    /**
     * 
     * on router function from app component
     */
    onRouterMessageFunction: any;

    /**
     * 
     * this will setup a webrtc connection with provided user
     * 
     * @param username username of the user with whom webrtc connection have to be established
     * 
     *  @param offerMessage this is an optional offer signaling message
     */
    setUpWebrtcConnection(username: String, offerSignalingMessage?: OfferSignalingMessage) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                LoggerUtil.log('setting up new webrtc connection');
                const userType: UserType = offerSignalingMessage ? offerSignalingMessage.userType : UserType.P2P_USER;
                const userGroup: String = offerSignalingMessage ? offerSignalingMessage.userGroup : undefined;

                let userContext: UserContext;
                /**
                 * 
                 * initialize webrtc context if not yet initialized
                 */
                if (this.serverContextService.getUserContext(username) === undefined) {
                    userContext = this.serverContextService.initializeUserContext(username, userType, userGroup);
                }

                if (userContext.webrtcConnectionState as ConnectionStatesType === ConnectionStatesType.NOT_CONNECTED) {
                    /**
                     * 
                     * initialize webrtc peer connection
                     */
                    const initializedConnection: Boolean = await this.coreWebrtcService.rtcConnectionInit(username);

                    /**
                     * 
                     * update webrtc connection state to connecting so that not other flow can update it further
                     */
                    userContext.webrtcConnectionState = ConnectionStatesType.CONNECTING;
                    const peerConnection: RTCPeerConnection = userContext.connection;

                    /**
                     * 
                     * register webrtc connection if new webrtc conection has been initialized
                     */
                    if (initializedConnection) {
                        this.registerWebrtcEventListeners(peerConnection, username);
                    }

                    /**
                     * 
                     * create the offer for the peer connection and send it to other peer
                     */
                    if (offerSignalingMessage === undefined) {
                        peerConnection.createOffer().then((offer: RTCSessionDescriptionInit) => {
                            peerConnection.setLocalDescription(offer);

                            const offerSignalingPayload: OfferSignalingMessage = {
                                from: this.serverContextService.servername,
                                to: username,
                                channel: MediaChannelType.CONNECTION,
                                type: SignalingMessageType.OFFER,
                                offer: offer,
                                renegotiate: false
                            }
                            /**
                             * 
                             * send the offer payload
                             */
                            this.coreDataChannelService.sendPayload(offerSignalingPayload);

                        }).catch((error) => {
                            LoggerUtil.log(error);
                            reject('There is an error while generating offer on peer connection');
                        });
                    } else {
                        peerConnection.setRemoteDescription(new RTCSessionDescription(offerSignalingMessage.offer));
                        peerConnection.createAnswer().then((answer: RTCSessionDescriptionInit) => {
                            peerConnection.setLocalDescription(answer);
                            const answerSignalingPayload: AnswerSignalingMessage = {
                                from: this.serverContextService.servername,
                                to: username,
                                channel: MediaChannelType.CONNECTION,
                                type: SignalingMessageType.ANSWER,
                                answer: answer
                            }
                            /**
                             * 
                             * send the answer payload
                             */
                            this.coreDataChannelService.sendPayload(answerSignalingPayload);
                        }).catch((error) => {
                            LoggerUtil.log('there is an error while generating answer');
                            reject(error);
                        }); // Here ends create answer
                    }
                } else {
                    /**
                     * 
                     * already in connecting/connected state so do nothing here
                     */
                }
            } catch (e) {
                LoggerUtil.log(e);
                reject('there is an exception occured while establishing connection with ' + username);
            }
        });
    }

    /**
     * this will register all the necessary webrtc and data channel event listeners
     * on a peer connection for a particular channel.
     *
     *
     * @param peerConnection webrtc connection on which the handler is to be registered
     *
     * @param userToChat username of the user with whom connection has to be established
     *
     */
    registerWebrtcEventListeners(peerConnection: RTCPeerConnection, userToChat: String) {
        return new Promise<void>((resolve, reject) => {
            LoggerUtil.log('registering webrtc events on webrtc connection for ' + userToChat);
            try {


                /**
                 * 
                 * process onnegotiationneeded event here
                 * 
                 * @TODO handle this event
                 */
                peerConnection.onnegotiationneeded = async (event) => {
                    LoggerUtil.log(userToChat + ' webrtc connection needs renegotiation');
                };

                /**
                 * 
                 * process onsignalingstatechange event here
                 * 
                 */
                peerConnection.onsignalingstatechange = () => {
                    LoggerUtil.log(userToChat + ' webrtc connection signaling state: ' + peerConnection.signalingState);
                    const userContext: UserContext = this.serverContextService.getUserContext(userToChat);
                    switch (peerConnection.signalingState) {

                        /**
                         * 
                         * There is no ongoing exchange of offer and answer underway. This may mean that the RTCPeerConnection 
                         * object is new, in which case both the localDescription and remoteDescription are null; it may also mean 
                         * that negotiation is complete and a connection has been established.
                         * 
                         */
                        case 'stable':
                            /**
                             * 
                             * make the connection status as 'connected' in the user's webrtc context
                             * 
                             */
                            userContext.webrtcConnectionState = ConnectionStatesType.CONNECTED;

                            /**
                             * 
                             * execute all the callback functions wih provided callback context
                             * 
                             */
                            while (!userContext.webrtcOnConnectQueue.isEmpty()) {
                                const callback: CallbackContext = <CallbackContext>userContext.webrtcOnConnectQueue.dequeue();
                                try {
                                    callback.callbackFunction(callback.callbackContext);
                                } catch (e) {
                                    LoggerUtil.log(e);
                                }
                            }
                            break;
                    }
                };

                /**
                 * 
                 * process connection state change event here
                 */
                peerConnection.onconnectionstatechange = async () => {
                    LoggerUtil.log(userToChat + ' webrtc connection state change: ' + peerConnection.connectionState);

                    const userContext: UserContext = this.serverContextService.getUserContext(userToChat);

                    switch (peerConnection.connectionState) {
                        case 'disconnected':

                            // handle the webrtc disconnection here 
                            await this.webrtcConnectionDisconnectHandler(userToChat);
                            break;

                        case 'connected':

                            // make the connection status as 'connected' in the user's webrtc context
                            userContext.webrtcConnectionState = ConnectionStatesType.CONNECTED;
                    }
                }

                /**
                 * handle ice candidate event
                 *
                 * compose the 'candidate' type signaling message using the generated
                 * candidate and send it to the other user
                 *
                 * @property isSender will notify receiver of this message that, message
                 * is sent by a sender webrtc connection and is meant for recieve webrtc
                 * connection
                 *
                 */
                peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
                    if (event.candidate) {
                        const iceCandidatePayload: CandidateSignalingMessage = {
                            type: SignalingMessageType.CANDIDATE,
                            candidate: event.candidate,
                            from: this.serverContextService.servername,
                            to: userToChat,
                            channel: MediaChannelType.CONNECTION
                        };
                        this.coreDataChannelService.sendPayload(iceCandidatePayload);
                    }
                }

                // register data channel related event handlers
                this.registerDataChannelEvents(peerConnection, userToChat);

                // register media track related event handlers
                this.registerMediaTrackEvents(peerConnection, userToChat);
                resolve();
            } catch (error) {
                LoggerUtil.log('there is an error while registering events on peer connection');
                reject(error);
            }
        });
    }

    /**
     * this will add media track related event listeners on webrtc peer connection
     *
     * @param peerConnection webrtc peer connection on which event handler has to be registered
     *
     * @param userToChat username of the user with whom connection has to be established
     *
     */
    registerMediaTrackEvents(peerConnection: RTCPeerConnection, userToChat: String) {
        peerConnection.ontrack = async (event: RTCTrackEvent) => {
            let channel: MediaChannelType;
            const userContext: UserContext = this.serverContextService.getUserContext(userToChat);

            /**
             * 
             * derive the channel here
             * 
             * @TODO refactor it afterwards as we add more media types support here
             * 
             */
            if (event.track.kind === MediaChannelType.AUDIO) {
                channel = MediaChannelType.AUDIO;
                userContext.audioTrack = event.track;
            } else {
                channel = MediaChannelType.VIDEO;
                userContext.videoTrack = event.track;
            }
            LoggerUtil.log(channel + ' stream track received');

            /**
             * 
             * send remote track received event message to other peer 
             */
            const remoteTrackEvent: WebRTCEventSignalingMessage = {
                type: SignalingMessageType.WEBRTC_EVENT,
                channel: channel,
                event: WebRTCEventType.REMOTE_TRACK_RECEIVED,
                from: this.serverContextService.servername,
                to: userToChat
            }
            this.coreDataChannelService.sendPayload(remoteTrackEvent);
            /**
             * 
             * remove the timeout cleanup job
             * 
             * @TODO implemet appropriate logic here
             */
        }
    }

    /**
     * this will add data channel reltaed event listeners on webrtc peer connection
     *
     * @param peerConnection webrtc peer connection on which the data channel
     * handler has to be registered
     *
     * @param userToChat username of the user with whom connection has to be established
     *
     */
    registerDataChannelEvents(peerConnection: RTCPeerConnection, userToChat: String) {
        peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
            /**
             * when a remote data channel is received then set it in user's webrtc context
             *
             */
            const dataChannel: RTCDataChannel = event.channel;
            const channel: MediaChannelType = dataChannel.label as MediaChannelType;
            LoggerUtil.log(channel + ' data channel has been received');
            const userContext: UserContext = this.serverContextService.getUserContext(userToChat);
            userContext.dataChannel = dataChannel;

            /**
             * register onmessage listener on received data channel
             *
             */
            dataChannel.onmessage = (messageEvent: MessageEvent) => {
                this.onDataChannelMessage(messageEvent.data);
            }

            LoggerUtil.log('message listener registered on received ' + channel + ' data channel with: ' + userToChat);

            /**
             * if this data channel is meant for sending text messages then register
             * an onopen listner also which will send any queued text messages
             *
             */
            dataChannel.onopen = () => {
                LoggerUtil.log(channel + ' data channel has been opened with: ' + userToChat);

                /**
                 * 
                 * send channel open webrtc event message to other peer 
                 */
                const dataChannelWebrtcEvent: WebRTCEventSignalingMessage = {
                    type: SignalingMessageType.WEBRTC_EVENT,
                    channel: channel,
                    event: WebRTCEventType.CHANNEL_OPEN,
                    from: this.serverContextService.servername,
                    to: userToChat
                }
                this.coreDataChannelService.sendPayload(dataChannelWebrtcEvent);
                userContext.dataChannelConnectionState = ConnectionStatesType.CONNECTED;

                if (channel as MediaChannelType === MediaChannelType.TEXT) {
                    this.sendQueuedMessagesOnChannel(userToChat);
                }
            }

            // data channel error event handler
            dataChannel.onerror = (event: RTCErrorEvent) => {
                LoggerUtil.log('error occured on ' + channel + ' data channel with: ' + userToChat);
                LoggerUtil.log(event.error);
            }

            // data channel close event
            dataChannel.onclose = (event: Event) => {
                LoggerUtil.log(channel + ' data channel with ' + userToChat + ' has been closed');
            }
        }
    }

    /**
     * this will send all the queued messages to a user over via an data channel
     * for that user
     *
     * @param username username of the user whose queued messages has to be sent
     */
    sendQueuedMessagesOnChannel(username: String) {
        const userContext: UserContext = this.serverContextService.getUserContext(username);
        const dataChannel: RTCDataChannel = userContext.dataChannel;

        /**
         * iterate message queue and send all the messages via data channel
         */
        while (!userContext.msgQueue.isEmpty()) {
            dataChannel.send(JSON.stringify(userContext.msgQueue.dequeue()));
        }
    }

    /**
     * this is onmessage event handler for data channel
     *
     * @param jsonMessage message received via webrtc datachannel
     * 
     */
    async onDataChannelMessage(jsonMessage: string) {
        LoggerUtil.log('message received on data channel : ' + jsonMessage);
        const message: any = JSON.parse(jsonMessage);
        LoggerUtil.log(this.serverContextService.getUserContext(message.from));
        switch (message.type) {

            // handle signaling messages
            case MediaChannelType.SIGNALING:
                this.onRouterMessageFunction(message.message);
                break;

            // handle received text data messages
            case MediaChannelType.TEXT:
                this.userGroupService.handleGroupTextMessage(message);
                /**
                 * 
                 * @TODO fix it afterwards
                 */
                // this.sendMessageAcknowledgement(message,
                //     DataChannelMessageStatusType.SEEN, MediaChannelType.TEXT);
                break;

            default:
                LoggerUtil.log('unknown data channel message');
        }
    }

    /**
     * this will send an acknowledgement for a received message along with a status
     * like 'seen' or 'delivered'
     *
     * @param message received message
     *
     * @param messageStatus status of the message
     *
     * @param channel media type for the data channel i.e the type of data being
     * relayed on this data channel
     *
     */
    async sendMessageAcknowledgement(message: BaseDataChannelMessage, messageStatus: DataChannelMessageStatusType, channel: MediaChannelType) {
        const ackId: Number = await this.coreServerUtilityService.generateIdentifier();
        const acknowledgementMessage: AcknowledgementDataChannelMessage = {
            id: ackId,
            status: messageStatus,
            username: this.serverContextService.servername,
            type: MediaChannelType.MESSAGE_ACKNOWLEDGEMENT,
            time: new Date().getTime(),
            messageType: message.type,
            messageId: message.id,
            to: message.username,
            from: this.serverContextService.servername,
            message: MediaChannelType.MESSAGE_ACKNOWLEDGEMENT // not used anywhere
        }
        const isAckSent: Boolean = await this.coreDataChannelService.sendMessageOnDataChannel(acknowledgementMessage, channel);

        if (isAckSent && message.id) {
            LoggerUtil.log('acknowledgement sent for message with id: ' + message.id + ' from '
                + message.username);
        } else {
            LoggerUtil.log('error while sending acknowledgement for: ' + JSON.stringify(message));
        }
    }

    /**
     * this will handle any webrtc peer connection's disconnect state event
     *
     * @param username username of the user with whom this connection was connected
     * @TODO implement it afterwards
     * @return a promise
     * 
     */
    webrtcConnectionDisconnectHandler(username: String) {
        return new Promise<void>((resolve) => {
            const userContext: UserContext = this.serverContextService.getUserContext(username);
            if (userContext) {
                this.serverContextService.usersContext.delete(username);
                this.coreWebrtcService.cleanDataChannel(userContext.dataChannel);
                this.coreWebrtcService.cleanRTCPeerConnection(userContext.connection);

                // handle disconnection of a user if he/she is member of a group
                if (userContext.userGroup) {
                }
            }
            resolve();
        });
    }

    /**
     * 
     * this will handle the disconnection of a group member
     * 
     * @param userGroup group name of the disconnected user
     * @param username username of the disconnected user
     * @returns a void promise
     */
    groupMemberDisconnectionHandler(userGroup: String, username: String): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                LoggerUtil.log('handling group member disconnection for group: ' + userGroup + ' and username: ' + username);

                /**
                 * @TODO handle group member disconnection here
                 * 
                 */
                resolve();
            } catch (error) {
                LoggerUtil.log('error encountered while handling group member disconnection: ' + username);
                reject(error)
            }
        });
    }
}