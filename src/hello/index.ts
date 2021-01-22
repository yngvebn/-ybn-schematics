import { strings } from '@angular-devkit/core';
import { apply, chain, externalSchematic, filter, MergeStrategy, mergeWith, move, noop, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project';

export function atom(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const workspaceConfigBuffer = tree.read('angular.json');
        let atomSchematics = {};
        if (workspaceConfigBuffer) {
            const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
            const projectName = options.project || workspaceConfig.defaultProject;
            const project = workspaceConfig.projects[projectName];
            const schematics = project.schematics && project.schematics['@schematics/angular:module'];
            atomSchematics = project.schematics && project.schematics['@ybn-schematics/atom'];

            if (options.path === undefined && project) {
                options.path = buildDefaultPath(project);
            }

            options.sourceRoot = `/${project.sourceRoot}/${project.prefix}`;
            options = {
                ...options,
                ...schematics
            }
        }


        const componentOptions = {
            ...options,
            skipImport: true,
            hasModule: true,
            ...atomSchematics
        }
        const parsedPath = parseName(options.path, options.name);
        const sourceTemplates = url('./files/module');
        const sourceParametrizedTempalates = apply(sourceTemplates, [
            template({
                ...options,
                ...strings,
                'if-flat': (s: any) => options.flat ? '' : s
            }),
            move(parsedPath.path)
        ]);
        const rule = mergeWith(sourceParametrizedTempalates, MergeStrategy.AllowCreationConflict);

        return chain([
            rule,
            component(componentOptions)
        ])
    }
}

export function component(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const workspaceConfigBuffer = tree.read('angular.json');
        if (workspaceConfigBuffer) {
            const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
            const projectName = options.project || workspaceConfig.defaultProject;
            const project = workspaceConfig.projects[projectName];
            const schematics = project.schematics && project.schematics['@schematics/angular:component'];
            if (options.path === undefined && project) {
                options.path = buildDefaultPath(project);
            }

            options.sourceRoot = `/${project.sourceRoot}/${project.prefix}`;
            options = {
                ...options,
                ...schematics
            }
        }

        const parsedPath = parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        const title = options.path.split('/');
        options.title = title[title.length - 1];
        const sourceTemplates = url('./files/component');
        const sourceParametrizedTempalates = apply(sourceTemplates, [
            options.skipStories ? filter(path => !path.endsWith('.stories.ts')) : noop(),
            template({
                ...options,
                ...strings,
                'if-flat': (s: any) => options.flat ? '' : s
            }),
            move(parsedPath.path)
        ]);
        const rule = mergeWith(sourceParametrizedTempalates, MergeStrategy.AllowCreationConflict);
        return chain([
            externalSchematic('@schematics/angular', 'component', options),
            rule
        ])
    };
}
