import { Component, OnInit } from '@angular/core';
import { InsidePage } from '../inside/inside.page';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NavigationExtras } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TodosService } from '../../services/todos.service';
import { PhotoService } from '../../services/photo.service';
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
import { Photo } from '../models/photo.model';
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
  url = environment.url;

  constructor(public actionSheetController: ActionSheetController, private httpClient: HttpClient, private geolocation: Geolocation, public todoService: TodosService, public activatedRoute : ActivatedRoute, private route: Router, public photoService: PhotoService, private camera: Camera) {
    this.activatedRoute.queryParams.subscribe((res)=>{
          this.todo = JSON.parse(res.special);
          this.todoId = this.todo.id;

          this.photoService.getPhoto(this.todoId).subscribe(res => {
            for (let i=0; i < res.length; i++) {
               this.path = `${this.url}/photos/${res[i].name}`;
               this.photoName = res[i].name;
               this.images.unshift({
                 id: res[i].id,
                 photo: this.path,
                 namePhoto: res[i].name
                });
            }
            console.log(res);
          });
    });
  }

  ngOnInit() {
    this.loadMap();
  }

  updatePhoto(sourceType) {
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
      const imgBlob = this.b64toBlob(this.image);
      const formData = new FormData();
      formData.append('image', imgBlob);
      this.todoService.updateImage(formData, this.todoId).subscribe((res) => {
        //this.photos.push(res);
      })
    }, (err) => {
      alert("error " + JSON.stringify(err))
    });

  }

  public b64toBlob(dataURI) {

    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
}


  async selectImage() {
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

  removePhoto(image) {
    let imageId = 0;
    for (let i = 0; i < this.images.length; i++) {
      if (this.images[i] == image) {
        imageId = this.images[i].id;
        this.images.splice(i, 1);
      }
    }
    debugger;
    this.httpClient.post(`${this.url}/todos/photo/delete/${imageId}`, {
      name: this.photoName,
    })
      .subscribe(data => {
      }, error => {
        console.log(error);
      });
  }

  toPreviousPage() {
    this.route.navigate(['/inside']);
  }

}
