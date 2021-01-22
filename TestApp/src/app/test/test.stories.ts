import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { addSource } from '../storybook-helpers';
import { TestComponent } from './test.component';

export default {
    component: TestComponent,
    title: 'Test/Test',
    decorators: [
        moduleMetadata({}),
        (storyFn, other) => {
            const story = (<any>storyFn)({
                parameters: 'hello world'
            });
            other.parameters = {
                ...other.docs,
                docs: {
                    source: { code: 'Hello there!' }
                }
            }
            return {
                ...story
            }
        }
    ],
    parameters: { actions: { argTypesRegex: '^on.*' } },

} as Meta;

const Template: Story<TestComponent> = (args: TestComponent) => ({
    component: TestComponent,
    props: args
});

export const Test = Template.bind({});
Test.args = {
    text: 'Hello world'
}

// console.log(Default(Default.args));
addSource(Test);