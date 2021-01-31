import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Gpt3Component } from './gpt3/gpt3.component';

const routes: Routes = [
  {
    path: '', component:Gpt3Component
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
