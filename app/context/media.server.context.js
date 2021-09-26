"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaServerContext = void 0;
var MediaServerContext = /** @class */ (function () {
    function MediaServerContext() {
        //initialization
        this.servername = 'media-server';
        this.usersContext = new Map();
        this.groupsContext = new Map();
    }
    /**
      * this will return the userContext
      *
      * @param username: username of the user
      */
    MediaServerContext.prototype.getUserContext = function (username) {
        return this.usersContext.get(username);
    };
    /**
     * this will return the userContext
     *
     * @param userGroup: userGroup of the user
     */
    MediaServerContext.prototype.getGroupContext = function (userGroup) {
        return this.groupsContext.get(userGroup);
    };
    /**
     *
     * initialize user context here
     *
     * @param username
     * @param userType
     * @param userGroup
     */
    MediaServerContext.prototype.initializeUserContext = function (username, userType, userGroup) {
        this.usersContext.set(username, {
            username: username,
            firstConnectedAt: new Date(),
            lastConnectedAt: new Date(),
            userType: userType,
            userGroup: userGroup
        });
        return this.usersContext.get(username);
    };
    /**
     * initialize group context here
     *
     * @param userGroup name of the group
     * @param createdBy username of the user who created the group
     *
     * @returns context of newly created group
     *
     */
    MediaServerContext.prototype.initializeGroupContext = function (groupName, createdBy) {
        this.groupsContext.set(groupName, {
            groupName: groupName,
            createdAt: new Date(),
            createdBy: createdBy,
            groupAdmin: createdBy,
            groupMembers: new Map(),
            lastUsedAt: null
        });
        return this.groupsContext.get(groupName);
    };
    return MediaServerContext;
}());
exports.MediaServerContext = MediaServerContext;
//# sourceMappingURL=media.server.context.js.map