import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Test2Component } from './test2.component';

@NgModule({
  declarations: [Test2Component],
  exports: [Test2Component],
  imports: [
    CommonModule
  ]
})
export class Test2Module { }
