import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TodosService } from '../../services/todos.service';
import { Storage } from '@ionic/storage';
import { Todo } from '../models/todo.model';
import { Photo } from '../models/photo.model';
import { environment } from '../../../environments/environment';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  Marker,
  LocationService,
  MyLocation,
} from '@ionic-native/google-maps';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ActionSheetController } from '@ionic/angular';
import { DatabaseProvider } from '../../../providers/database/database';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-add-item',
  templateUrl: './add-item.page.html',
  styleUrls: ['./add-item.page.scss'],
})
export class AddItemPage implements OnInit {

  public map: GoogleMap;
  public title: string;
  public markerlatlong;
  public image: any;
  public todo: Todo = {
    title: '',
    description: '',
    isDone: false,
    user_id: null,
    position: ''
  };
  public photos: Photo[] = [];
  public url = environment.url;
  public isConnect = true;
  public isenabled:boolean = true;

  constructor(
    private databaseProvider: DatabaseProvider,
    private httpClient: HttpClient,
    private route: Router,
    public todoService: TodosService,
    public storage: Storage,
    public actionSheetController: ActionSheetController,
    private camera: Camera,
    public network: Network
  ) {

    this.storage.get('isConnect').then(async (isConnect) => {
      if (isConnect === false) {
        this.isenabled=false;
      }})
    
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

  openCam(sourceType) {

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
      this.todoService.uploadImage(formData).subscribe((res: Photo) => {
        this.photos.push(res);
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
          this.openCam(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Use Camera',
        handler: () => {
          this.openCam(this.camera.PictureSourceType.CAMERA);
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

  toPreviousPage() {
    this.route.navigate(['/inside']);
  }

  async addTodo() {
    if (Object.keys(this.todo).length != 0) {
      this.storage.get('isConnect').then(async (isConnect) => {
        if (isConnect === true) {
          this.storage.get('USER_ID').then((val) => {
            this.todo.user_id = val;
          });
          this.httpClient.post(`${this.url}/todos/create`, {
            todo: this.todo, 
            photos: this.photos
          })
            .subscribe(data => {
              this.todoService.todoList.next(data);
              this.databaseProvider.addTodo(data).then(data => {
                this.todo.id = data;
              }, error => {
                console.log(error);
              });
              alert("Disconnect!");     
            }, error => {
              console.log(error);
            });

          const val = await this.storage.get('USER_ID')
          this.todo.user_id = val;       
          }
          else if (isConnect === false) {
            const val = await this.storage.get('USER_ID')
            this.todo.user_id = val;
       
            this.databaseProvider.addTodo(this.todo).then(data => {
              this.todo.id = data;
            }, error => {
              console.log(error);
            });
            this.todoService.todoList.next(this.todo);
            alert("Disconnect!");
          }
      })
    }
    this.route.navigate(['/inside']);
  }

}
