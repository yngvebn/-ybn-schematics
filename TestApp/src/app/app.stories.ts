import { AppComponent } from './app.component';
import { moduleMetadata, Meta, Story } from '@storybook/angular';


export default {
    component: AppComponent,
    title: 'App/App',
    decorators: [
        moduleMetadata({
            declarations: [AppComponent]
        })
    ]
} as Meta;

export const App: Story<AppComponent> = (props) => ({
    component: AppComponent,
    props
});