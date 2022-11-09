import { FileInfo, Metadata } from '../metadata';
import { FileProcessor } from '../fileProcessor';

/**
 * components and directives which are not part of scope
 */
class NullProcessor extends FileProcessor {
    get type(): string {
        return '.';
    }
    constructor(fileContent: string, fileInfo: FileInfo) {
        super(fileContent, {
            ...fileInfo,
            name: '',
            fileType: 'unsupported',
            services: [],
        });
    }

    process(): Metadata {
        return this.metaData;
    }
}

export { NullProcessor };
