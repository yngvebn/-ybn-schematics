import { NoStoriesComponent } from './no-stories.component';
import { moduleMetadata, Meta, Story } from '@storybook/angular';


export default {
    component: NoStoriesComponent,
    title: 'NoStories/NoStories',
    decorators: [
        moduleMetadata({
            declarations: [NoStoriesComponent]
        })
    ]
} as Meta;

export const NoStories: Story<NoStoriesComponent> = (props) => ({
    component: NoStoriesComponent,
    props
});