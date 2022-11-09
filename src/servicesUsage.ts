import fs from 'fs';
import path from 'path';
import { createFileProcessor } from './processing';
import { StatisticsReporter } from './reporting/statisticsReporter';

function* walkSync(dir: string): Generator<string> {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        if (file.isDirectory()) {
            yield* walkSync(path.join(dir, file.name));
        } else {
            yield path.join(dir, file.name);
        }
    }
}

class ServicesUsage {
    private readonly pathToProjectRoot: string;
    constructor(pathToProjectRoot: string) {
        this.pathToProjectRoot = path.normalize(pathToProjectRoot);
    }
    findUsagesInSubPath(focusPath: string) {
        focusPath = path.normalize(focusPath);
        if (!focusPath.startsWith(this.pathToProjectRoot)) {
            throw new Error('focusPath must be inside project root');
        }
        const reporter = new StatisticsReporter();

        for (const filePath of walkSync(this.pathToProjectRoot)) {
            let normalizedPath = path.normalize(filePath);
            let partOfFocus = normalizedPath.startsWith(focusPath);
            let processor = createFileProcessor(filePath, partOfFocus);
            console.log(processor.type);
            let metaData = processor.process();
            reporter.add(metaData);
        }
        reporter.writeFiles();
    }
}

export { ServicesUsage };
