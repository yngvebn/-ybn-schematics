import { strings, virtualFs } from '@angular-devkit/core';
import { apply, chain, externalSchematic, filter, MergeStrategy, mergeWith, move, noop, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import * as astUtils from '@schematics/angular/utility/ast-utils';
import { getDecoratorMetadata, getMetadataField } from '@schematics/angular/utility/ast-utils';
import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project';
import * as path from 'path';
import * as ts from 'typescript';

function getClassDeclaration(tree: Tree, p: string, filename: string): string | undefined {
    const fullPath = path.join(p, filename);
    const componentFile = tree.read(fullPath);
    if (!componentFile) return;
    const vfs = virtualFs.fileBufferToString(componentFile);
    const source = ts.createSourceFile(fullPath, vfs, ts.ScriptTarget.Latest, true);
    if (!source) return;
    const classDeclarations = astUtils.findNodes(source, ts.SyntaxKind.ClassDeclaration);

    if (classDeclarations.length === 0) return;
    if (classDeclarations.length > 1) return;
    const classDeclaration = classDeclarations[0];

    const identifiers = classDeclaration.getChildren().filter(ts.isIdentifier).map(node => node.getText());
    return identifiers[0]


}

function getModuleExports(source: ts.SourceFile): string[] {
    const result = getDecoratorMetadata(source, 'NgModule', '@angular/core') as ts.Node[];
    const node = result[0] as ts.ObjectLiteralExpression;
    const matchingProperties = getMetadataField(node, 'exports');

    if (!matchingProperties) {
        return [];
    }

    const assignment = matchingProperties[0] as ts.PropertyAssignment;

    if (!assignment || assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return [];
    }

    const arrLiteral = assignment.initializer as ts.ArrayLiteralExpression;

    return arrLiteral.elements
        // .filter(el => el.kind === ts.SyntaxKind.CallExpression)
        .map(el => (el as ts.Identifier).getText());
}

export function moduleHasExportedComponent(tree: Tree, dir: string, moduleFilename: string, component: string): boolean {
    const parsedModulePath = path.join(dir, moduleFilename);
    const moduleFileData = tree.read(parsedModulePath);
    if (moduleFileData) {
        const vfs = virtualFs.fileBufferToString(moduleFileData);
        const source = ts.createSourceFile(parsedModulePath, vfs, ts.ScriptTarget.Latest, true);
        const exports = getModuleExports(source);
        return exports.includes(component);
    }
    return false;
}

export function story(options: any): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const workspaceConfigBuffer = tree.read('angular.json');
        if (workspaceConfigBuffer) {
            const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
            const projectName = options.project || workspaceConfig.defaultProject;
            const project = workspaceConfig.projects[projectName];
            const schematics = project.schematics && project.schematics['@schematics/angular:module'];
            if (options.path === undefined && project) {
                options.path = buildDefaultPath(project);
            }

            options.sourceRoot = `/${project.sourceRoot}/${project.prefix}`;
            options = {
                ...options,
                ...schematics
            }
        }


        const title = options.path.split('/');
        options.title = title[title.length - 1];
        const data = tree.getDir(options.path);
        const componentRegex = /(.*?)\.component\.ts$/g;
        var component = data.subfiles.find(f => !!componentRegex.exec(f));
        console.log(options);
        if (component && !options.componentFilename) {
            const componentName = getClassDeclaration(tree, options.path, component);
            if (!componentName) {
                console.log(`Unable to find component in ${component}`);
                return;
            }
            options.componentName = componentName;
            options.componentFilename = component.replace(/\.ts$/, '');
        }
        const moduleRegex = new RegExp(`(.*)\.module\.ts$`);
        var module = data.subfiles
            .filter(f => !!moduleRegex.exec(f))
            .find(module => moduleHasExportedComponent(tree, options.path, module, options.componentName));

        if (module && !options.moduleFilename) {
            options.moduleFilename = module.replace(/\.ts$/, '');
            options.moduleName = getClassDeclaration(tree, options.path, module);
        }

        options.hasModule = !!options.moduleName;

        options.name = options.componentName.replace(/Component/g, '');



        const sourceTemplates = url('./files/story');
        const sourceParametrizedTempalates = apply(sourceTemplates, [
            options.mdx ? filter(path => !path.endsWith('.stories.ts')) : noop(),
            !options.mdx ? filter(path => !path.endsWith('.stories.mdx')) : noop(),
            options.skipStories ? filter(path => !path.endsWith('.stories.ts')) : noop(),
            template({
                ...options,
                ...strings,
                'if-flat': (s: any) => options.flat ? '' : s
            }),
            move(options.path)
        ]);
        const rule = mergeWith(sourceParametrizedTempalates, MergeStrategy.AllowCreationConflict);

        return chain([
            rule
        ])
    }
}


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
        options.moduleName = `${options.name}Module`;
        options.moduleFilename = `${strings.dasherize(options.name)}.module`
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
        options.componentName = `${options.name}Component`;
        options.componentFilename = `${strings.dasherize(options.name)}.component`

        const sourceTemplates = url('./files/component');
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
            externalSchematic('@schematics/angular', 'component', options),
            story(options),
            rule
        ])
    };
}
