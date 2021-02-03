import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MyShinyAtomComponent } from './my-shiny-atom.component';

@NgModule({
  declarations: [MyShinyAtomComponent],
  exports: [],
  imports: [
    CommonModule
  ]
})
export class MyShinyAtomModule { }
