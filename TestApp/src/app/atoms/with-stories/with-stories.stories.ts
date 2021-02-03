import { WithStoriesComponent } from './with-stories.component';
import { moduleMetadata, Meta, Story } from '@storybook/angular';


export default {
    component: WithStoriesComponent,
    title: 'Atoms/WithStories',
    decorators: [
        moduleMetadata({
            declarations: [WithStoriesComponent]
        })
    ]
} as Meta;

export const WithStories: Story<WithStoriesComponent> = (props) => ({
    component: WithStoriesComponent,
    props
});