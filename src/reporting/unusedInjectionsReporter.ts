import { Reporter } from './reporter';
import { Metadata } from '../processing/metadata';
import fs from 'fs';
import { EOL } from 'os';

type UnusedInjectionsRecord = {
    filePath: string;
    unusedInjections: string[];
};

class UnusedInjectionsReporter implements Reporter {
    private filesWithUnusedInjections: UnusedInjectionsRecord[] = [];
    add(data: Metadata): void {
        if (data.partOfFocus) {
            let unusedInjections = [];
            for (const service of data.services) {
                if (service.count === 1) {
                    unusedInjections.push(service.name);
                }
            }
            if (unusedInjections.length > 0) {
                this.filesWithUnusedInjections.push({
                    filePath: data.filePath,
                    unusedInjections,
                });
            }
        }
    }

    writeFiles(): void {
        this.filesWithUnusedInjections.sort((a, b) => {
            return b.unusedInjections.length - a.unusedInjections.length;
        });
        let fileContent = '';
        function addLine(line: string) {
            fileContent += `${line}${EOL}`;
        }
        addLine('# Report for unused injections in scoped files');
        addLine('> _Report is sorted, files with more unused services first._');
        if (this.filesWithUnusedInjections.length > 0) {
            for (const record of this.filesWithUnusedInjections) {
                addLine(`### ${record.filePath.replace(/\\/g, '/')}`);
                for (const serviceName of record.unusedInjections) {
                    addLine(` - ${serviceName}`);
                }
            }
        } else {
            addLine('## - None found, good job! -');
        }
        fs.writeFileSync('unused_injections.md', fileContent);
    }
}

export { UnusedInjectionsReporter };
