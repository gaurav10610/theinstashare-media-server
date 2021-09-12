"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerConstants = void 0;
/**
 * This contains all global constants of Peer-Talk
 *
 **/
var ServerConstants = /** @class */ (function () {
    function ServerConstants() {
    }
    ServerConstants.SERVER_NAME = 'media-server';
    ServerConstants.EXPRESS_PORT = 9696;
    ServerConstants.API_BASE_URL = "/instashare/media-server/";
    ServerConstants.DATACHANNEL = 'dataChannel';
    ServerConstants.WEBRTC_EVENTS = {
        CHANNEL_OPEN: 'channelOpen',
        REMOTE_TRACK_RECEIVED: 'remoteTrack'
    };
    // User's chatMessages
    ServerConstants.CHAT_MESSAGES = 'chatMessages';
    // User's message queue
    ServerConstants.MESSAGE_QUEUE = 'msgQueue';
    ServerConstants.FILE_QUEUE = 'fileQueue';
    ServerConstants.WEBRTC_ON_CONNECT_QUEUE = 'webrtcOnConnectQueue';
    // OFFER constant
    ServerConstants.OFFER = 'offer';
    // ANSWER constant
    ServerConstants.ANSWER = 'answer';
    // CANDIDATE constant
    ServerConstants.CANDIDATE = 'candidate';
    // REGISTER constant
    ServerConstants.REGISTER = 'register';
    // DEREGISTER constant
    ServerConstants.DEREGISTER = 'deregister';
    // CALL_REQUEST constant
    ServerConstants.CALL_REQUEST = 'callRequest';
    ServerConstants.INVITE = 'invite';
    ServerConstants.REMOTE_CONTROL = 'remoteControl';
    ServerConstants.CHANNEL = 'channel';
    ServerConstants.DISCONNECT = 'disconnect';
    ServerConstants.RECONNECT = 'reconnect';
    ServerConstants.REMOTE_ACCESS_REQUEST = 'remoteAccess';
    ServerConstants.ACCEPT = 'accept';
    ServerConstants.DECLINE = 'decline';
    ServerConstants.TRACK = 'track';
    ServerConstants.STREAM = 'stream';
    ServerConstants.TRACK_SENDER = 'trackSender';
    ServerConstants.MODAL_TEXT = 'modalText';
    ServerConstants.SIGNALING = 'signal';
    ServerConstants.MESSAGE_ACKNOWLEDGEMENT = 'msgack';
    ServerConstants.RECURRING_JOB_ID = 'job-id';
    ServerConstants.LAST_USED = 'last-used';
    ServerConstants.SENDER = 'sender';
    ServerConstants.RECEIVER = 'receiver';
    ServerConstants.WEBRTC_EVENT = 'rtcEvent';
    // TEXT constant
    ServerConstants.TEXT = 'text';
    ServerConstants.FILE = 'file';
    //file start event identifier
    ServerConstants.FILE_START = 'file-start';
    //file end event identifier
    ServerConstants.FILE_END = 'file-end';
    // VIDEO channel constant
    ServerConstants.VIDEO = 'video';
    // AUDIO channel constant
    ServerConstants.AUDIO = 'audio';
    // SCREEN channel constant
    ServerConstants.SCREEN = 'screen';
    ServerConstants.SOUND = 'sound';
    ServerConstants.IMAGE = 'image';
    ServerConstants.STOP_VIDEO = 'stop-video';
    ServerConstants.STOP_AUDIO = 'stop-audio';
    ServerConstants.STOP_SCREEN = 'stop-screen';
    ServerConstants.STOP_SOUND = 'stop-sound';
    // Session variable that holds username
    ServerConstants.STORAGE_USER = 'webrtc';
    ServerConstants.USERNAME = 'username';
    ServerConstants.USER_ACTIVE_STATUS = 'user';
    // RTC server constant
    ServerConstants.RTC_SERVER = 'rtc_server';
    ServerConstants.MEDIA_CONTEXT = 'mediaContext';
    ServerConstants.CONNECTION = 'connection';
    ServerConstants.CONNECTION_STATE = 'connectionState';
    // Signaling RTC constant
    ServerConstants.SIGNALING_RTC = 'signaling_rtc';
    ServerConstants.CONNECTION_TIMEOUT = 15000;
    ServerConstants.ERROR_FLAG_TIMEOUT = 5000;
    ServerConstants.DATACHANNEL_IDLE_THRESHOLD = 30000;
    ServerConstants.IDLE_CONN_CLEAN_UP_JOB_TIME = 30000;
    ServerConstants.APPLICATION = 'application';
    ServerConstants.TIMEOUT_JOB = 'timeout_job';
    /* User status constants*/
    ServerConstants.USER_STATUSES = {
        BUSY: 'busy',
        AVAILABLE: 'available',
        OFFLINE: 'offline'
    };
    //This will contains the max bitrates for webrtc connections
    ServerConstants.MEDIA_BITRATES = {
        VIDEO: 1000,
        SCREEN: 3000,
        FILE: 100000,
        DATA: 1000,
        REMOTE_CONTROL: 3000,
        AUDIO: 500,
        SOUND: 1000
    };
    ServerConstants.VIDEO_CONSTRAINTS = {
        audio: false,
        video: {
            // width: { max: 1920 },
            // height: { max: 1080 },
            frameRate: { max: 30 }
        }
    };
    ServerConstants.MOBILE_CONSTRAINTS = {
        audio: false,
        video: {
            facingMode: 'user',
            // width: { max: 1920 },
            // height: { max: 1080 },
            frameRate: { max: 30 }
        }
    };
    ServerConstants.AUDIO_CONSTRAINTS = {
        audio: {
            channelCount: 2,
            echoCancellation: true,
            noiseSuppression: true
        },
        video: false
    };
    ServerConstants.SCREEN_SHARING_CONSTRAINTS = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                maxFrameRate: 30
            }
        }
    };
    ServerConstants.WEB_SCREEN_SHARING_CONSTRAINTS = {
        video: {
            cursor: "always"
        },
        audio: false
    };
    ServerConstants.SYSTEM_SOUND_CONSTRAINTS = {
        audio: {
            mandatory: {
                chromeMediaSource: 'desktop'
            }
        },
        video: {
            mandatory: {
                chromeMediaSource: 'desktop'
            }
        }
    };
    // STUN Config to instantiate webrtc peer connection
    ServerConstants.STUN_CONFIG = {
        iceServers: [
            {
                urls: 'stun:stun.l.google.com:19302'
            },
            {
                urls: 'stun:numb.viagenie.ca:3478'
            },
            {
                urls: 'turn:numb.viagenie.ca:3478',
                credential: 'sharepro@012',
                username: 'ironman0693@gmail.com'
            }
        ]
    };
    ServerConstants.CONTENT_TYPE = 'contentType';
    ServerConstants.CONTENT_ID = 'contentId';
    ServerConstants.FILE_NAME = 'fileName';
    ServerConstants.SUPPORTED_IMAGE_FORMATS = ['apng', 'bmp', 'gif', 'x-icon', 'jpeg', 'png', 'svg+xml', 'webp'];
    ServerConstants.SUPPORTED_VIDEO_FORMATS = ['mp4'];
    ServerConstants.SUPPORTED_AUDIO_FORMATS = ['mp3'];
    ServerConstants.VIDEO_START = 100;
    ServerConstants.VIDEO_STOP = 101;
    ServerConstants.AUDIO_START = 110;
    ServerConstants.AUDIO_STOP = 111;
    ServerConstants.CHUNK_SIZE = 7000;
    ServerConstants.CHUNK_TYPE = {
        START: 1,
        INTERMEDIATE: 2,
        END: 3,
        WHOLE: 4,
    };
    ServerConstants.DATACHANNEL_BUFFER_THRESHOLD = 65535;
    ServerConstants.DATACHANNEL_FILE_SEND_TIMEOUT = 50;
    ServerConstants.CALL_DISCONNECT_POPUP_TIMEOUT = 3000;
    ServerConstants.POPUP_TYPE = {
        INVITE: 'invite',
        DECLINE: 'decline',
        ACCEPT: 'accept',
        RECONNECT: 'reconnect',
        CONNECT: 'connect',
        CONNECTING: 'connecting',
        UNABLE_TO_CONNECT: 'noconnect',
        DISCONNECT: 'disconnect',
        DISCONNECTING: 'disconnecting',
        WARNING: 'warning',
        CONNECTION_TIMEOUT: 'timeout'
    };
    ServerConstants.CHAT_MESSAGE_STATUS = {
        DELIVERED: 'delivered',
        SEEN: 'seen',
        SENT: 'sent',
        NOT_APPLICABLE: 'na' //if message is not a received message
    };
    ServerConstants.API_ENDPOINTS = {
        GET_ALL_ACTIVE_USERS: 'active/users'
    };
    ServerConstants.MOUSE_BUTTONS_MAP = {
        0: 'left',
        1: 'middle',
        2: 'right'
    };
    ServerConstants.REMOTE_ACCESS_HANDLER_IDS = {
        WHEEL: 'wheel',
        MOUSE_MOVE: 'mousemove',
        MODIFIER_KEY_DOWN: 'modifierKeyDown',
        KEY_DOWN: 'keyDown',
        PASTE: 'paste',
        COPY: 'copy',
        DOUBLE_CLICK_MOUSE_DOWN: 'doubleClickMouseDown',
        MOUSE_DOWN: 'mouseDown',
        MOUSE_UP: 'mouseUp',
        SELECT: 'select'
    };
    ServerConstants.CONNECTION_STATES = {
        CONNECTING: 'connecting',
        CONNECTED: 'connected',
        NOT_CONNECTED: 'notconnected',
        CLEANING: 'cleaning'
    };
    return ServerConstants;
}());
exports.ServerConstants = ServerConstants;
//# sourceMappingURL=server.main.constants.js.map