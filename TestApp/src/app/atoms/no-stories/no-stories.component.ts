import { Component, OnInit } from '@angular/core';

/** Just a simple component to test the stories */
@Component({
  selector: 'app-no-stories',
  templateUrl: './no-stories.component.html',
  styleUrls: ['./no-stories.component.scss']
})
export class NoStoriesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
