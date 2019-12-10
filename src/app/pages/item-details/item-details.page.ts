import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TodosService } from '../../shared/services/todos.service';
import { PhotoService } from '../../shared/services/photo.service';
import { environment } from '../../../environments/environment';
import { DatabaseProvider } from '../../../providers/database/database';
import { Storage } from '@ionic/storage';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  Marker,
  LocationService,
  MyLocation,
} from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Photo } from '../../shared/models/photo.model';
import { ActionSheetController } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.page.html',
  styleUrls: ['./item-details.page.scss'],
})
export class ItemDetailsPage implements OnInit {

  public map: GoogleMap;
  public markerlatlong;
  public todo;
  public todoId;
  public image: any
  public images = [];
  public photoName;
  public photos: Photo[] = [];
  public path;
  private url = environment.url;
  public isenabled: boolean = true;

  constructor(private databaseProvider: DatabaseProvider, public storage: Storage, public actionSheetController: ActionSheetController, private httpClient: HttpClient, private geolocation: Geolocation, public todoService: TodosService, public activatedRoute: ActivatedRoute, private route: Router, public photoService: PhotoService, private camera: Camera) {
    this.activatedRoute.queryParams.subscribe((res) => {
      this.todo = JSON.parse(res.special);
      this.todoId = this.todo.id;

      this.storage.get('isConnect').then(async (isConnect) => {
        if (isConnect === true) {
          this.photoService.getPhoto(this.todoId).subscribe(res => {
            for (let i = 0; i < res.length; i++) {
              this.path = `${this.url}/photos/${res[i].name}`;
              this.photoName = res[i].name;
              this.images.unshift({
                id: res[i].id,
                photo: this.path,
                namePhoto: res[i].name
              });
            }
          });
        }
      });
    });

    this.storage.get('isConnect').then(async (isConnect) => {
      if (isConnect === false) {
        this.isenabled = false;
      }
    })
  }

  ngOnInit() {
    this.loadMap();
  }

  private updatePhoto(sourceType) {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      sourceType: sourceType,
    }

    this.camera.getPicture(options).then((imageData) => {
      this.image = 'data:image/jpeg;base64,' + imageData;
      const imgBlob = this.photoService.b64toBlob(this.image);
      const formData = new FormData();
      formData.append('image', imgBlob);
      this.todoService.updateImage(formData, this.todoId).subscribe((res) => {
      })
    }, (err) => {
      alert("error " + JSON.stringify(err))
    });

  }

  public async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Select Image source",
      buttons: [{
        text: 'Load from Library',
        handler: () => {
          this.updatePhoto(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.updatePhoto(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  }

  private loadMap() {

    LocationService.getMyLocation().then((myLocation: MyLocation) => {
      if (this.todo.position === "" || this.todo.position === null) {
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

  public updateTodo() {
    this.storage.get('isConnect').then(async (isConnect) => {
      if (isConnect === true) {
        this.httpClient.put(`${this.url}/todos/update/${this.todo.id}`, this.todo)
          .subscribe(data => {
            this.todoService.todoList.next(this.todo);
          }, error => {
            console.log(error);
          });
        this.databaseProvider.updateAllTodo(this.todo).then(data => {
        }, error => {
          console.log(error);
        });
        this.route.navigate(['/inside']);
      }
      else if (isConnect === false) {
        debugger;
        this.databaseProvider.updateTodoOffline(this.todo).then(data => {
          console.log(data);
        }, error => {
          console.log(error);
        });
        this.todoService.todoList.next(this.todo);
        this.route.navigate(['/inside']);
      }
    })
  }

  public removePhoto(image) {
    let imageId = 0;
    for (let i = 0; i < this.images.length; i++) {
      if (this.images[i] == image) {
        imageId = this.images[i].id;
        this.images.splice(i, 1);
      }
    }
    this.httpClient.post(`${this.url}/todos/photo/delete/${imageId}`, {
      name: this.photoName,
    })
      .subscribe(data => {
      }, error => {
        console.log(error);
      });
  }

  public toPreviousPage() {
    this.route.navigate(['/inside']);
  }

}
