import { FileInfo, SimpleFileTypes } from '../metadata';
import { FileProcessor } from '../fileProcessor';

class SimpleProcessor extends FileProcessor {
    get type(): string {
        switch (this.metaData.fileType) {
            case 'service':
                return this.metaData.inScope ? 'S' : 's';
            case 'controller':
                return 'T';
            default:
                throw new Error(
                    `Wrong type (${this.metaData.fileType}) for: ${this.metaData.filePath}`
                );
        }
    }

    constructor(
        fileContent: string,
        private name: string,
        fileType: SimpleFileTypes,
        fileInfo: FileInfo,
        funcNameOrServicesList: string | string[]
    ) {
        super(fileContent, {
            ...fileInfo,
            name: `${fileType}:${name}`,
            fileType,
            services: [],
        });
        if (typeof funcNameOrServicesList === 'string') {
            this.servicesList = this.getServicesListFromFunction(
                funcNameOrServicesList
            );
        } else {
            this.servicesList = funcNameOrServicesList;
        }
    }
}

export { SimpleProcessor };
