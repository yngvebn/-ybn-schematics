import { Test2Component } from './test2.component';
import { moduleMetadata, Meta, Story } from '@storybook/angular';
import { Test2Module } from './test2.module';

export default {
    component: Test2Component,
    title: 'atoms/Test2',
    decorators: [
        moduleMetadata({
            imports: [Test2Module]
        })
    ]
} as Meta;

export const Test2 = (props) => ({
    props
});