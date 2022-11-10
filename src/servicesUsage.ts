import fs from 'fs';
import path from 'path';
import { createFileProcessor } from './processing';
import { StatisticsReporter } from './reporting/statisticsReporter';
import { UnusedInjectionsReporter } from './reporting/unusedInjectionsReporter';

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
        const reporters = [
            new StatisticsReporter(),
            new UnusedInjectionsReporter(),
        ];
        console.time('Done in');
        console.log(`Analyzing scope: ${focusPath}`);
        console.log(`As part of project located in: ${this.pathToProjectRoot}`);
        console.log();
        console.log('Legend:');
        console.log(
            '    C/T/D/S - Component/Controller/Directive/Service - in scope'
        );
        console.log('    s - service out of scope');
        console.log(
            '    . - unprocessed file (either unsupported or out of scope)'
        );
        console.log();
        for (const filePath of walkSync(this.pathToProjectRoot)) {
            let normalizedPath = path.normalize(filePath);
            let partOfFocus = normalizedPath.startsWith(focusPath);
            let processor = createFileProcessor(filePath, partOfFocus);
            process.stdout.write(processor.type);
            let metaData = processor.process();
            for (const reporter of reporters) {
                reporter.add(metaData);
            }
        }
        console.log();
        console.log('Analysis done.');
        console.log(`Generating report files in: ${process.cwd()}`);
        for (const reporter of reporters) {
            reporter.writeFiles();
        }
        console.log('Done.');
        console.timeEnd('Done in');
    }
}

export { ServicesUsage };
