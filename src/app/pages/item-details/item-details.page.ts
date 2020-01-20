import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../shared/services/storage.service';
import { MapService } from '../../shared/services/map.service';
import { TodosService } from '../../shared/services/todos.service';
import { PhotoService } from '../../shared/services/photo.service';
import { environment } from '../../../environments/environment';
import { DatabaseProvider } from '../../../providers/database/database';
import { Storage } from '@ionic/storage';
import { GoogleMap, GoogleMaps, GoogleMapOptions } from '@ionic-native/google-maps';
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

  constructor(
     private mapService: MapService,
     private databaseProvider: DatabaseProvider, 
     public storage: Storage, 
     public actionSheetController: ActionSheetController,  
     public todoService: TodosService, 
     public activatedRoute: ActivatedRoute, 
     private route: Router, 
     public photoService: PhotoService, 
     private camera: Camera,
     public storageService: StorageService,
     ) {
    this.activatedRoute.queryParams.subscribe(async (res) => {
      this.todo = JSON.parse(res.special);
      this.todoId = this.todo.id;

      const isConnect = await this.storageService.getConnect();
        try {
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
      } catch (e) {
        console.log(e.message);
      }
    });

    const isConnect =  this.storageService.getConnect();
      if (!isConnect) {
        this.isenabled = false;
      }
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
    if (this.todo.position === "" || this.todo.position === null || this.todo.position === '""') {
      this.mapService.getCurrentLocation().then(res => {
        console.log(res);
        this.todo.position = res;
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

      this.mapService.marker(this.todo.position, this.map);
    }
  }

  public updateTodo() {
    const isConnect = this.storageService.getConnect();
      try {
        if (isConnect) {
          this.todoService.todoList.next(this.todo);

          this.databaseProvider.updateAllTodo(this.todo).then(data => {
          });
          this.route.navigate(['/home']);
        } else {
          this.todoService.todoList.next(this.todo);
          this.route.navigate(['/home']);
        }
      } catch(e) {
        alert(e.message);
      }
  }

  public removePhoto(image) {
    let imageId = 0;
    for (let i = 0; i < this.images.length; i++) {
      if (this.images[i] == image) {
        imageId = this.images[i].id;
        this.images.splice(i, 1);
      }
    }
    this.photoService.deletePhoto(imageId, this.photoName)
      .subscribe(data => {
      }, error => {
        console.log(error);
      });
  }

  public toPreviousPage() {
    this.route.navigate(['/home']);
  }

}
