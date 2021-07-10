import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ElectronService } from 'ngx-electron';
import { LoggerUtil } from './services/logging/LoggerUtil';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private translate: TranslateService,
    private electronService: ElectronService
  ) {
    this.translate.setDefaultLang('en');
    LoggerUtil.log(this.electronService.isElectronApp ? 'this is an electron application' : 'this is a web application');
  }
}
