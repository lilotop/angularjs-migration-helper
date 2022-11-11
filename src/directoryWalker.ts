import path from 'path';
import { FileInfo } from './processing/metadata';
import fs from 'fs';

class DirectoryWalker {
    private readonly rootPath: string;
    private readonly scopePath: string;
    constructor(rootPath: string, scopePath: string) {
        this.rootPath = path.normalize(rootPath);
        this.scopePath = path.normalize(scopePath);
        if (!this.scopePath.startsWith(this.rootPath)) {
            throw new Error('scopePath must be inside project root');
        }
    }
    *walk(): Generator<FileInfo> {
        yield* this.walkSync(this.rootPath, false);
    }
    private isInScope(dirPath: string) {
        let normalizedPath = path.normalize(dirPath);
        return normalizedPath.startsWith(this.scopePath);
    }

    private *walkSync(dir: string, inScope: boolean): Generator<FileInfo> {
        inScope = inScope || this.isInScope(dir);
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
            if (file.isDirectory()) {
                yield* this.walkSync(path.join(dir, file.name), inScope);
            } else {
                yield { filePath: path.join(dir, file.name), inScope };
            }
        }
    }
}

export { DirectoryWalker };
