import { Component, OnInit } from '@angular/core';
import { InsidePage } from '../inside/inside.page';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TodosService } from '../../services/todos.service';
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
  selector: 'app-item-details',
  templateUrl: './item-details.page.html',
  styleUrls: ['./item-details.page.scss'],
})
export class ItemDetailsPage implements OnInit {

  public map: GoogleMap;
  public markerlatlong;
  public todo;
  url = environment.url;

  constructor(private httpClient: HttpClient, private geolocation: Geolocation, public todoService: TodosService, public activatedRoute : ActivatedRoute, private route: Router) {
    this.activatedRoute.queryParams.subscribe((res)=>{
          this.todo = JSON.parse(res.special);
    });
  }

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {

    LocationService.getMyLocation().then((myLocation: MyLocation) => {
      if (this.todo.position === "") {
        let mapOptions: GoogleMapOptions = {
          camera: {
            target: myLocation.latLng,
            zoom: 15
          }
        };
        this.map = GoogleMaps.create('map_canvas', mapOptions);
      }
      else {
        let mapOptions: GoogleMapOptions = {
          camera: {
            target: this.todo.position,
            zoom: 15
          }
        };

      this.map = GoogleMaps.create('map_canvas', mapOptions);

      let mymarker: Marker = this.map.addMarkerSync({
        title: 'Ionic',
        icon: 'blue',
        animation: 'DROP',
        draggable: true,
        position: this.todo.position
      });
      mymarker.on(GoogleMapsEvent.MARKER_DRAG_END).subscribe(() => {
        this.markerlatlong = mymarker.getPosition();
        this.todo.position = this.markerlatlong;
      });
      }
  });

  }

  updateTodo() {
    this.httpClient.put(`${this.url}/todos/update/${this.todo.id}`, this.todo)
    .subscribe(data => {
      this.todoService.todoList.next(this.todo);
        }, error => {
          console.log(error);
        });
    this.route.navigate(['/inside']);
  }

  toPreviousPage() {
    this.route.navigate(['/inside']);
  }

}
