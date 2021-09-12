import { LoggerUtil } from '../../logging/logger';
import { GroupService } from '../service/group.service';
import { ServerConstants } from '../../constants/server.main.constants';
import { environment } from '../../environments/environment.dev';

export class GroupController {

    constructor(private groupService: GroupService) {
        this.init();
    }

    /**
     * initialize everything here
     */
    async init() {
        try {
            const express = require('express');
            const bodyParser = require('body-parser');

            const app = express();
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({
                extended: true
            }));

            //To resolve CORS related issues
            app.use(function (req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers",
                    "Origin, X-Requested-With, Content-Type, Accept");
                next();
            });

            /**
             * register all handlers
             */
            this.registerHandlers(app);

            if (environment.production) {
                LoggerUtil.log(`starting api server with ssl support`);
                const https = require('https');
                const apiServerOptions: any = await this.readServerCertificates('../../ssl/new');

                //Prod mode supporting ssl
                https.createServer(apiServerOptions, app).listen(ServerConstants.EXPRESS_PORT);
            } else {
                LoggerUtil.log(`starting api server without ssl support`);
                const http = require('http');

                //When testing locally
                http.createServer(app).listen(ServerConstants.EXPRESS_PORT);
            }
            LoggerUtil.log(`theinstashare api server started at port: ${ServerConstants.EXPRESS_PORT}`);

        } catch (error) {
            LoggerUtil.log('error occured while initializing group controller');
            LoggerUtil.log(error);
            throw error;
        }
        LoggerUtil.log('group controller initialized...');
    }

    /**
     * register all api endpoint handlers with express
     * 
     * @param app instance of express
     */
    private registerHandlers(app: any) {
        app.get(`${ServerConstants.API_BASE_URL}dummy`, this.groupService.handleDummyRequest.bind(this.groupService));
    }

    /**
     * read server certificate and key
     * @param  path : path of the directory where certificates are stored
     */
    readServerCertificates(path: String): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const fs = require('fs');
                resolve({
                    key: fs.readFileSync(path + 'private.key', 'utf8'),
                    cert: fs.readFileSync(path + 'certificate.crt', 'utf8')
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}