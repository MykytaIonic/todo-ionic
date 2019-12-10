import { AuthGuardService } from './shared/services/auth-guard.service'
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: './pages/login/login.module#LoginPageModule',
  },
  {
    path: 'inside',
    loadChildren: './pages/inside/inside.module#InsidePageModule',
    canActivate: [AuthGuardService],
  },
  { path: 'add-item', loadChildren: './pages/add-item/add-item.module#AddItemPageModule', canActivate: [AuthGuardService], },
  { path: 'item-details', loadChildren: './pages/item-details/item-details.module#ItemDetailsPageModule', canActivate: [AuthGuardService], },
  { path: 'register', loadChildren: './pages/register/register.module#RegisterPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
