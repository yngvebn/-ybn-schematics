import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Test3Component } from './test3.component';

@NgModule({
  declarations: [Test3Component],
  exports: [Test3Component],
  imports: [
    CommonModule
  ]
})
export class Test3Module { }
