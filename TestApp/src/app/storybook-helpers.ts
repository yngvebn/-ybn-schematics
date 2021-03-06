import { action, HandlerFunction } from '@storybook/addon-actions';
import { ArgTypes } from '@storybook/addons';

export interface ArgsTplParts {
    actions: { [prop: string]: HandlerFunction }
    tplfragment: string
}

export function addSource(storyFn) {
    storyFn.parameters = {
        ...storyFn.parameters,
        docs: {
            source: {
                code: createTpl(storyFn)
            }
        }
    }
}

export function createTpl(storyFn) {
    const story = storyFn(storyFn.args);
    const selector: string = story.component.__annotations__[0].selector;
    const inputs: string[] = [];
    const outputs: string[] = [];
    const umappedOutputs: string[] = [];
    let componentProps = story.component.__prop__metadata__;
    let proto = story.component.prototype.__proto__;
    while (proto.constructor.__prop__metadata__) {
        componentProps = {
            ...componentProps,
            ...proto.constructor.__prop__metadata__
        };
        proto = proto.constructor.prototype.__proto__;
    }
    for (const key in componentProps) {
        if (
            Object.getPrototypeOf(componentProps[key][0]).ngMetadataName === 'Input' &&
            story.props.hasOwnProperty(key)
        ) {
            inputs.push(key);
        } else if (
            Object.getPrototypeOf(componentProps[key][0]).ngMetadataName === 'Output' &&
            story.props.hasOwnProperty(key)
        ) {
            outputs.push(key);
        } else if (
            Object.getPrototypeOf(componentProps[key][0]).ngMetadataName === 'Output' &&
            !story.props.hasOwnProperty(key)
        ) {
            umappedOutputs.push(key);
        }
    }
    const inputStr: string = inputs.map(input => `[${input}]="${storyFn.args[input]}"`).join(' ');
    const outputStr: string = [...outputs, ...umappedOutputs]
        .map(output => `(${output})="${output}($event)"`)
        .join(' ');
    const template = `<${selector} ${inputStr} ${outputStr.trim()}></${selector}>`;
    return template;
}
/**
 * This is an attempt at simplifying the use of auto-generated args in stories
 * defined with `template`, since Angular doesn't have a way to simply use a
 * spread operator syntax.
 *
 * @experimental
 */
export function argsToTplParts(args: any, argTypes: ArgTypes): ArgsTplParts {
    // console.log({ args, argTypes })
    const parts: ArgsTplParts = {
        actions: {},
        tplfragment: ''
    }

    Object.keys(argTypes).forEach(k => {
        // Inputs
        if (
            // Is in the inputs category
            argTypes[k].table.category === 'inputs' &&
            // Needs a control to be able to change from auto-generated args.
            argTypes[k]?.hasOwnProperty('control') &&
            // Assuming the arg might not be in props if there isn't an arg value.
            args.hasOwnProperty(k)
        ) {
            parts.tplfragment += `[${k}]="${k}" `
        }

        // Outputs
        if (
            // Is in the outputs category
            argTypes[k]?.table?.category === 'outputs'
        ) {
            parts.tplfragment += `(${k})="${k}($event)" `
            parts.actions[k] = action(k)
        }
    })

    return parts
}
