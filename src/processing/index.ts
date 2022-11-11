import fs from 'fs';
import { FileInfo } from './metadata';
import { MATCH_PATTERNS, getInjectedServicesFromString } from './utils';
import { FileProcessor } from './fileProcessor';
import { SimpleProcessor } from './implementations/simpleProcessor';
import { NullProcessor } from './implementations/nullProcessor';
import { UiObjProcessor } from './implementations/uiObjProcessor';

function createFileProcessor(fileInfo: FileInfo): FileProcessor {
    // read the file's content
    const buffer = fs.readFileSync(fileInfo.filePath);
    let fileContent = buffer.toString();

    // remove all comments to avoid wrong counts
    fileContent = fileContent.replace(
        MATCH_PATTERNS.COMMENTS_EXTRACTOR,
        '/* COMMENT_REMOVED */'
    );

    // decide on the type, services first, as they are read anyway
    let res;

    // service with func name
    res = fileContent.match(MATCH_PATTERNS.SERVICE_WITH_NAMED_FUNCTION);
    if (res && res[1] && res[2]) {
        let name = res[1];
        let funcName = res[2];
        return new SimpleProcessor(
            fileContent,
            name,
            'service',
            fileInfo,
            funcName
        );
    }

    // service with anonymous function
    res = fileContent.match(MATCH_PATTERNS.SERVICE_WITH_ANONYMOUS_FUNCTION);
    if (res && res[1]) {
        let name = res[1];
        let servicesInjectionList = getInjectedServicesFromString(res[2]);
        return new SimpleProcessor(
            fileContent,
            name,
            'service',
            fileInfo,
            servicesInjectionList
        );
    }

    // component, directive or controller (.ctrl.js file) in scope
    if (fileInfo.inScope) {
        res = fileContent.match(
            MATCH_PATTERNS.DRV_OR_COMP_WITH_NAMED_CONTROLLER
        );
        if (res && res[1] && res[2]) {
            let fileType = res[1] as 'component' | 'directive';
            let name = res[2];
            return new UiObjProcessor(fileContent, name, fileType, fileInfo);
        }

        // controller

        // controller with func name
        res = fileContent.match(MATCH_PATTERNS.CTRL_WITH_NAMED_FUNCTION);
        if (res && res[1] && res[2]) {
            let name = res[1];
            let funcName = res[2];
            return new SimpleProcessor(
                fileContent,
                name,
                'controller',
                fileInfo,
                funcName
            );
        }

        // controller with anonymous function
        res = fileContent.match(MATCH_PATTERNS.CTRL_WITH_ANONYMOUS_FUNCTION);
        if (res && res[1]) {
            let name = res[1];
            let servicesInjectionList = getInjectedServicesFromString(res[2]);
            return new SimpleProcessor(
                fileContent,
                name,
                'controller',
                fileInfo,
                servicesInjectionList
            );
        }
    }

    // anything else is ignored
    return new NullProcessor(fileContent, fileInfo);
}

export { createFileProcessor };
