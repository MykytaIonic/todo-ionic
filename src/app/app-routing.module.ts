import { AuthGuardService } from './services/auth-guard.service'
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    //path: 'inside',
    //loadChildren: './pages/inside/inside.module#InsidePageModule',
    //canActivate: [AuthGuardService]
    path: 'login',
    loadChildren: './pages/login/login.module#LoginPageModule',
  },
  { path: 'inside', loadChildren: './pages/inside/inside.module#InsidePageModule' },
  { path: 'add-item', loadChildren: './pages/add-item/add-item.module#AddItemPageModule' },
  { path: 'item-details', loadChildren: './pages/item-details/item-details.module#ItemDetailsPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
