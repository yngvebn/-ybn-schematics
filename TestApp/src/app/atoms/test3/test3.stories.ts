import { Test3Component } from './test3.component';
import { moduleMetadata, Meta, Story } from '@storybook/angular';
import { Test3Module } from './test3.module';

export default {
    component: Test3Component,
    title: 'atoms/Test3',
    decorators: [
        moduleMetadata({
            imports: [Test3Module]
        })
    ]
} as Meta;

export const Test3 = (props) => ({
    props
});