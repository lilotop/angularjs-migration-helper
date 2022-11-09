import { FileInfo, UiObjFileTypes } from '../metadata';
import { FileProcessor } from '../fileProcessor';
import { MATCH_PATTERNS } from '../utils';

class UiObjProcessor extends FileProcessor {
    get type(): string {
        switch (this.metaData.fileType) {
            case 'directive':
                return 'D';
            case 'component':
                return 'C';
            default:
                throw new Error(
                    `Wrong type (${this.metaData.fileType}) for: ${this.metaData.filePath}`
                );
        }
    }
    private getControllerName() {
        let controller = this.fileContent.match(MATCH_PATTERNS.CONTROLLER_NAME);
        if (controller && controller[1]) {
            return controller[1];
        } else {
            return null; // some components don't have controllers (usually those with transclude)
        }
    }
    constructor(
        fileContent: string,
        private name: string,
        fileType: UiObjFileTypes,
        fileInfo: FileInfo
    ) {
        super(fileContent, {
            ...fileInfo,
            name: `${fileType}:${name}`,
            fileType,
            services: [],
        });
        let controllerName = this.getControllerName();
        if (controllerName) {
            this.servicesList =
                this.getServicesListFromFunction(controllerName);
        }
    }
} // components and directives

export { UiObjProcessor };
