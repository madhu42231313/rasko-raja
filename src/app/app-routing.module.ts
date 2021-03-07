import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Gpt3Component } from './gpt3/gpt3.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '', component:Gpt3Component
  },
  {
    path: 'home', component: HomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
