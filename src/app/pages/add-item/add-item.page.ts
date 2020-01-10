import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TodosService } from '../../shared/services/todos.service';
import { Storage } from '@ionic/storage';
import { MapService } from '../../shared/services/map.service';
import { Todo } from '../../shared/models/todo.model';
import { Photo } from '../../shared/models/photo.model';
import { PhotoService } from '../../shared/services/photo.service';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
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
  public image: string;
  public todo: Todo = {
    title: '',
    description: '',
    isDone: false,
    user_id: null,
    position: ''
  };
  public photos: Photo[] = [];
  public isConnect = true;
  public isEnabled: boolean;

  constructor(
    private mapService: MapService,
    private databaseProvider: DatabaseProvider,
    private camera: Camera,
    private route: Router,
    public todoService: TodosService,
    public storage: Storage,
    public actionSheetController: ActionSheetController,
    public network: Network,
    public photoService: PhotoService
  ) {

    this.storage.get('isConnect').then(async (isConnect) => {
      if (isConnect === false) {
        this.isEnabled=false;
        console.log(this.isEnabled);
      }
      else {
        this.isEnabled=true;
        console.log(this.isEnabled);
      }
    })
    
  }

  ngOnInit() {
    this.loadMap();
  }

  private loadMap() {

    LocationService.getMyLocation().then((myLocation: MyLocation) => {

      let mapOptions: GoogleMapOptions = {
        camera: {
          target: myLocation.latLng,
          zoom: 15
        }
      };

      this.map = GoogleMaps.create('map_canvas', mapOptions);

      this.todo.position = JSON.parse(myLocation.latLng.toString());
      
      this.mapService.marker(this.todo.position, this.map).then(res => {
        const mymarker = res;
        mymarker.on(GoogleMapsEvent.MARKER_DRAG_END).subscribe(() => {
          this.markerlatlong = mymarker.getPosition();
          this.todo.position = this.markerlatlong;
        });
      });
    });

  }

  private openCam(sourceType) {

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
      this.todoService.uploadImage(formData).subscribe((res: Photo) => {
        this.photos.push(res);
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

  public toPreviousPage() {
    this.route.navigate(['/home']);
  }

  public async addTodo() {
    if (Object.keys(this.todo).length != 0) {
      const val = await this.storage.get('USER_ID');
      this.storage.get('isConnect').then(async (isConnect) => {
        if (isConnect === true) {
          await this.storage.get('USER_ID').then((val) => {
            this.todo.user_id = val;
          });
          const data = await this.todoService.createTodo(this.todo, this.photos);
          this.todoService.todoList.next(data);
          this.databaseProvider.addTodo(data).then(data => {
              this.todo.id = data;
              }, error => {
                console.log(error);
              });
              alert("Disconnect!"); 
          this.todo.user_id = val;       
          }
          else {
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
    this.route.navigate(['/home']);
  }

}