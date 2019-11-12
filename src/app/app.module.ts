
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Storage, IonicStorageModule } from '@ionic/storage';

import { Facebook } from '@ionic-native/facebook/ngx';
import { InterceptorProvider } from 'src/providers/interceptor/interceptor';
import { GooglePlus } from '@ionic-native/google-plus/ngx';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

export function jwtOptionsFactory(storage) {
return {
  tokenGetter: () => {
    return storage.get('access_token');
  },
  whitelistedDomains: ['localhost:3000']
}
}

@NgModule({
declarations: [AppComponent],
entryComponents: [],
imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
  HttpClientModule,
  IonicStorageModule.forRoot(),
],
providers: [
  StatusBar,
  SplashScreen,
  { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  Facebook,
  GooglePlus,
  Geolocation,
  Camera,
  { provide: HTTP_INTERCEPTORS, useClass: InterceptorProvider, multi: true }
],
bootstrap: [AppComponent]
})
export class AppModule {}
