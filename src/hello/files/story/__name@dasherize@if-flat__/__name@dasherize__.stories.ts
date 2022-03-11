import { <%= componentName %> } from './<%= componentFilename %>';
import { moduleMetadata, Meta, StoryObj } from '@storybook/angular';
<% if (hasModule) { %>import { <%= moduleName %> } from './<%= moduleFilename %>';<% } %>

export default {
    title: '<%= classify(title) %>/<%= classify(name) %>',
    component: <%= componentName %>,
    decorators: [
        moduleMetadata({
            <% if (hasModule) { %>imports: [<%= moduleName %>]<% } %><% if (!hasModule) { %>declarations: [<%= componentName %>]<% } %>
        })
    ]
} as Meta<<%= componentName %>>;

export const <%= classify(name) %>: StoryObj<<%= componentName %>> = {
    args: {

    }
};