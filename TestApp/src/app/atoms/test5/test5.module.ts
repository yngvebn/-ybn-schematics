import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Test5Component } from './test5.component';

@NgModule({
  declarations: [Test5Component],
  exports: [Test5Component],
  imports: [
    CommonModule
  ]
})
export class Test5Module { }
