import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { TestComponent } from './test/test.component';
import { NoStoriesComponent } from './atoms/no-stories/no-stories.component';

@NgModule({
    declarations: [AppComponent, TestComponent, NoStoriesComponent],
    imports: [BrowserModule],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
