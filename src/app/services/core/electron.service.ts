import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ipcRenderer } from 'electron';
import { LoggerUtil } from '../logging/LoggerUtil';

@Injectable({
  providedIn: 'root'
})
export class NativeElectronService {

  //ipc renderer object
  ipcRenderer: typeof ipcRenderer;

  constructor(private electronService: ElectronService) {
    this.ipcRenderer = this.electronService.ipcRenderer;
  }

  /**
   * send message to electron main process
   * @param message 
   * 
   */
  public sendMainProcessMessage(message: any) {
    LoggerUtil.log(`sent message from renderer to main process: ${JSON.stringify(message)}`);
    this.ipcRenderer.send('ipcMessage', message);
  }

  /**
   * register listener for messages from main electron process
   * @param listener 
   */
  public registerMainProcessMessageListener(channel: String, listener: any) {
    this.ipcRenderer.on(channel.toString(), listener);
    LoggerUtil.log('registered listener for messages from electron main process');
  }
}
