"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const parse_name_1 = require("@schematics/angular/utility/parse-name");
const project_1 = require("@schematics/angular/utility/project");
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
        const title = options.path.split('/');
        options.title = title[title.length - 1];
        const sourceTemplates = schematics_1.url('./files/component');
        const sourceParametrizedTempalates = schematics_1.apply(sourceTemplates, [
            options.skipStories ? schematics_1.filter(path => !path.endsWith('.stories.ts')) : schematics_1.noop(),
            schematics_1.template(Object.assign({}, options, core_1.strings, { 'if-flat': (s) => options.flat ? '' : s })),
            schematics_1.move(parsedPath.path)
        ]);
        const rule = schematics_1.mergeWith(sourceParametrizedTempalates, schematics_1.MergeStrategy.AllowCreationConflict);
        return schematics_1.chain([
            schematics_1.externalSchematic('@schematics/angular', 'component', options),
            rule
        ]);
    };
}
exports.component = component;
//# sourceMappingURL=index.js.map