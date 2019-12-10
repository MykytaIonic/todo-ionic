import { Component } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './shared/services/auth.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { OfflineService } from './shared/services/offline.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  public isConnect = true;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    public storage: Storage,
    private router: Router,
    public network: Network,
    public offlineService: OfflineService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.authService.authenticationState.subscribe(state => {
        if (state) {
          this.router.navigate(['inside']);
        } else {
          this.router.navigate(['login']);
        }
      });

      this.network.onConnect().subscribe(() => {
        this.isConnect = true;
        this.storage.set('isConnect', true);
        this.offlineService.addOffline();
        this.offlineService.deleteOffline();
        this.offlineService.updateOffline();
        console.log("Connect!");
      });

    });
  }
}
