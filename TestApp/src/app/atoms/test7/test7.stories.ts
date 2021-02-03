import { Test7Component } from './test7.component';
import { moduleMetadata, Meta, Story } from '@storybook/angular';
import { Test7Module } from './test7.module';

export default {
    component: Test7Component,
    title: 'atoms/Test7',
    decorators: [
        moduleMetadata({
            imports: [Test7Module]
        })
    ]
} as Meta;

export const Test7: Story<Test7Component> = (props) => ({
    component: Test7Component,
    props
});