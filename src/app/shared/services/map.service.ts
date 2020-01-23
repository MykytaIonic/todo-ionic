import { Injectable } from '@angular/core';
import {
    GoogleMaps,
    GoogleMap,
    GoogleMapsEvent,
    GoogleMapOptions,
    Marker,
    LocationService,
    MyLocation,
  } from '@ionic-native/google-maps';
  import { Todo } from '../../shared/models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class MapService {
    public map: GoogleMap;
    public markerlatlong;
    public todo: Todo = {
        title: '',
        description: '',
        isDone: false,
        user_id: null,
        position: '',
    };
  constructor() {
   }

  async getCurrentLocation(): Promise<Object> {
    LocationService.getMyLocation().then((myLocation: MyLocation) => {

        let mapOptions: GoogleMapOptions = {
          camera: {
            target: myLocation.latLng,
            zoom: 15
          }
        };
  
        this.map = GoogleMaps.create('map_canvas', mapOptions);
  
        let mymarker: Marker = this.map.addMarkerSync({
          title: 'Ionic',
          icon: 'blue',
          animation: 'DROP',
          draggable: true,
          position: {
            lat: myLocation.latLng.lat,
            lng: myLocation.latLng.lng
          }
        });
        mymarker.on(GoogleMapsEvent.MARKER_DRAG_END).subscribe(() => {
          this.markerlatlong = mymarker.getPosition();
          this.todo.position = this.markerlatlong;
        });
      });
     return this.todo.position;
  }

  async marker(todoPosition: string, map): Promise<Marker> {

      let mymarker: Marker = map.addMarkerSync({
        title: 'Ionic',
        icon: 'blue',
        animation: 'DROP',
        draggable: true,
        position: todoPosition,
      }).then(res => {
        const mymarker = res;
        mymarker.on(GoogleMapsEvent.MARKER_DRAG_END).subscribe(() => {
          this.markerlatlong = mymarker.getPosition();
          this.todo.position = this.markerlatlong;
        });
      });

      return mymarker; 
  }
}