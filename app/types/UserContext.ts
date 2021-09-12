import { UserType } from "./enum/UserType";

export interface UserContext {

    //registered username of the user
    username: String;

    //first connection timestamp
    firstConnectedAt: Date;

    //last connection timestamp
    lastConnectedAt: Date;

    //type of user
    userType: UserType;

    //user group - name of the user group
    userGroup?: String;
}