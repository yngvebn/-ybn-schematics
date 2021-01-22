import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

/** Test component */
@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
    @Input() public text: string;
    @Output() public onSomething = new EventEmitter<string>();
    constructor() { }

    ngOnInit(): void {
    }

}
