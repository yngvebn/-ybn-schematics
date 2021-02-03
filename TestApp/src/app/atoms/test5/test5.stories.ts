import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { Test5Component } from './test5.component';
import { Test5Module } from './test5.module';

export default {
    component: Test5Component,
    title: 'atoms/Test5',
    decorators: [
        moduleMetadata({
            imports: [Test5Module]
        })
    ]
} as Meta;

export const Test5: Story<Test5Component> = (props) => ({
    component: Test5Component,
    props
});