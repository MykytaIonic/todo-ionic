import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TodosService } from '../../services/todos.service';
import { AuthService } from '../../services/auth.service';
import { Storage } from '@ionic/storage';
import { Todo } from '../models/todo.model';
import { environment } from '../../../environments/environment';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  Marker,
  Environment,
  LocationService,
  MyLocation,
  LatLng,
} from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation/ngx';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.page.html',
  styleUrls: ['./add-item.page.scss'],
})
export class AddItemPage implements OnInit {

  public map: GoogleMap;
  public title: string;
  public markerlatlong;
  private description: string;
  public todo: Todo = {
    title: '',
    description: '',
    isDone: false,
    user_id: null,
    position: ''
  };
  url = environment.url;

  constructor(
    public todoService: TodosService,
    private route: Router,
    private httpClient: HttpClient,
    private authService: AuthService,
    public storage: Storage,
    private geolocation: Geolocation,
  ) {
  }

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {

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

  }

  toPreviousPage() {
    this.route.navigate(['/inside']);
  }

  addTodo() {
    if (Object.keys(this.todo).length != 0) {
      this.storage.get('USER_ID').then((val) => {
        this.todo.user_id = val;
    });
      this.httpClient.post(`${this.url}/todos/create`, this.todo)
        .subscribe(data => {
          this.todoService.todoList.next(data);
        }, error => {
          console.log(error);
        });
    }
    this.route.navigate(['/inside']);
  }

}
