"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const astUtils = require("@schematics/angular/utility/ast-utils");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const project_1 = require("@schematics/angular/utility/project");
const path = require("path");
const ts = require("typescript");
function getClassDeclaration(tree, p, filename) {
    const fullPath = path.join(p, filename);
    const componentFile = tree.read(fullPath);
    if (!componentFile)
        return;
    const vfs = core_1.virtualFs.fileBufferToString(componentFile);
    const source = ts.createSourceFile(fullPath, vfs, ts.ScriptTarget.Latest, true);
    if (!source)
        return;
    const classDeclarations = astUtils.findNodes(source, ts.SyntaxKind.ClassDeclaration);
    if (classDeclarations.length === 0)
        return;
    if (classDeclarations.length > 1)
        return;
    const classDeclaration = classDeclarations[0];
    const identifiers = classDeclaration.getChildren().filter(ts.isIdentifier).map(node => node.getText());
    return identifiers[0];
}
function getModuleExports(source) {
    const result = ast_utils_1.getDecoratorMetadata(source, 'NgModule', '@angular/core');
    const node = result[0];
    const matchingProperties = ast_utils_1.getMetadataField(node, 'exports');
    if (!matchingProperties) {
        return [];
    }
    const assignment = matchingProperties[0];
    if (!assignment || assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return [];
    }
    const arrLiteral = assignment.initializer;
    return arrLiteral.elements
        // .filter(el => el.kind === ts.SyntaxKind.CallExpression)
        .map(el => el.getText());
}
function moduleHasExportedComponent(tree, dir, moduleFilename, component) {
    const parsedModulePath = path.join(dir, moduleFilename);
    const moduleFileData = tree.read(parsedModulePath);
    if (moduleFileData) {
        const vfs = core_1.virtualFs.fileBufferToString(moduleFileData);
        const source = ts.createSourceFile(parsedModulePath, vfs, ts.ScriptTarget.Latest, true);
        const exports = getModuleExports(source);
        return exports.includes(component);
    }
    return false;
}
exports.moduleHasExportedComponent = moduleHasExportedComponent;
function story(options) {
    return (tree, _context) => {
        const workspaceConfigBuffer = tree.read('angular.json');
        if (workspaceConfigBuffer) {
            const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
            const projectName = options.project || workspaceConfig.defaultProject;
            const project = workspaceConfig.projects[projectName];
            const schematics = project.schematics && project.schematics['@schematics/angular:module'];
            if (options.path === undefined && project) {
                options.path = project_1.buildDefaultPath(project);
            }
            options.sourceRoot = `/${project.sourceRoot}/${project.prefix}`;
            options = Object.assign({}, options, schematics);
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
        const sourceTemplates = schematics_1.url('./files/story');
        const sourceParametrizedTempalates = schematics_1.apply(sourceTemplates, [
            options.mdx ? schematics_1.filter(path => !path.endsWith('.stories.ts')) : schematics_1.noop(),
            !options.mdx ? schematics_1.filter(path => !path.endsWith('.stories.mdx')) : schematics_1.noop(),
            options.skipStories ? schematics_1.filter(path => !path.endsWith('.stories.ts')) : schematics_1.noop(),
            schematics_1.template(Object.assign({}, options, core_1.strings, { 'if-flat': (s) => options.flat ? '' : s })),
            schematics_1.move(options.path)
        ]);
        const rule = schematics_1.mergeWith(sourceParametrizedTempalates, schematics_1.MergeStrategy.AllowCreationConflict);
        return schematics_1.chain([
            rule
        ]);
    };
}
exports.story = story;
function atom(options) {
    return (tree, _context) => {
        const workspaceConfigBuffer = tree.read('angular.json');
        let atomSchematics = {};
        if (workspaceConfigBuffer) {
            const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
            const projectName = options.project || workspaceConfig.defaultProject;
            const project = workspaceConfig.projects[projectName];
            const schematics = project.schematics && project.schematics['@schematics/angular:module'];
            atomSchematics = project.schematics && project.schematics['@ybn-schematics/atom'];
            if (options.path === undefined && project) {
                options.path = project_1.buildDefaultPath(project);
            }
            options.sourceRoot = `/${project.sourceRoot}/${project.prefix}`;
            options = Object.assign({}, options, schematics);
        }
        const componentOptions = Object.assign({}, options, { skipImport: true, hasModule: true }, atomSchematics);
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        options.moduleName = `${options.name}Module`;
        options.moduleFilename = `${core_1.strings.dasherize(options.name)}.module`;
        const sourceTemplates = schematics_1.url('./files/module');
        const sourceParametrizedTempalates = schematics_1.apply(sourceTemplates, [
            schematics_1.template(Object.assign({}, options, core_1.strings, { 'if-flat': (s) => options.flat ? '' : s })),
            schematics_1.move(parsedPath.path)
        ]);
        const rule = schematics_1.mergeWith(sourceParametrizedTempalates, schematics_1.MergeStrategy.AllowCreationConflict);
        return schematics_1.chain([
            rule,
            component(componentOptions)
        ]);
    };
}
exports.atom = atom;
function component(options) {
    return (tree, _context) => {
        const workspaceConfigBuffer = tree.read('angular.json');
        if (workspaceConfigBuffer) {
            const workspaceConfig = JSON.parse(workspaceConfigBuffer.toString());
            const projectName = options.project || workspaceConfig.defaultProject;
            const project = workspaceConfig.projects[projectName];
            const schematics = project.schematics && project.schematics['@schematics/angular:component'];
            if (options.path === undefined && project) {
                options.path = project_1.buildDefaultPath(project);
            }
            options.sourceRoot = `/${project.sourceRoot}/${project.prefix}`;
            options = Object.assign({}, options, schematics);
        }
        const parsedPath = parse_name_1.parseName(options.path, options.name);
        options.name = parsedPath.name;
        options.path = parsedPath.path;
        options.componentName = `${options.name}Component`;
        options.componentFilename = `${core_1.strings.dasherize(options.name)}.component`;
        const sourceTemplates = schematics_1.url('./files/component');
        const sourceParametrizedTempalates = schematics_1.apply(sourceTemplates, [
            schematics_1.template(Object.assign({}, options, core_1.strings, { 'if-flat': (s) => options.flat ? '' : s })),
            schematics_1.move(parsedPath.path)
        ]);
        const rule = schematics_1.mergeWith(sourceParametrizedTempalates, schematics_1.MergeStrategy.AllowCreationConflict);
        return schematics_1.chain([
            schematics_1.externalSchematic('@schematics/angular', 'component', options),
            story(options),
            rule
        ]);
    };
}
exports.component = component;
//# sourceMappingURL=index.js.map