import { Component, ModuleWithProviders } from '@angular/core';
import { ConnectionService } from 'ng-connection-service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'rasko-raja';
  status = 'ONLINE';
  isConnected = true;
  

  // constructor(private connectionService: ConnectionService) {
  //   this.connectionService.monitor().subscribe(isConnected => {
  //     this.isConnected = isConnected;
  //     if (this.isConnected) {
  //       this.status = "ONLINE";
  //       console.log("ONLINE")
  //     }
  //     else {
  //       this.status = "OFFLINE";
  //       console.log("OFFLINE")
  //     }
  //   })
  // }
}

