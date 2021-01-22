import { <%= classify(name) %>Component } from './<%= dasherize(name) %>.component';
import { moduleMetadata, Meta, Story } from '@storybook/angular';
<% if (hasModule) { %>import { <%= classify(name) %>Module } from './<%= dasherize(name) %>.module';<% } %>

export default {
    component: <%= classify(name) %>Component,
    title: '<%= title %>/<%= classify(name) %>',
    decorators: [
        moduleMetadata({
            <% if (hasModule) { %>imports: [<%= classify(name) %>Module]<% } %>
        })
    ]
} as Meta;

const Template: Story<<%= classify(name) %>Component> = (args: <%= classify(name) %>Component) => ({
    component: <%= classify(name) %>Component,
    props: args
});

export const <%= classify(name) %> = Template.bind({});
<%= classify(name) %>.props = {

}