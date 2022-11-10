import { Reporter } from './reporter';
import { Metadata } from '../processing/metadata';
import fs from 'fs';
import { EOL } from 'os';

class StatisticsRecord {
    constructor(
        public name: string,
        public injections: number,
        public mentions: number
    ) {}
}

class StatisticsReporter implements Reporter {
    private servicesInjectionsAndMentions: Record<string, StatisticsRecord> =
        {};
    private allMetadata: Record<string, Metadata> = {};
    private dependenciesPerScopedFile: Record<string, StatisticsRecord> = {};

    add(data: Metadata): void {
        this.allMetadata[data.name] = data;
        switch (data.fileType) {
            case 'service':
                if (data.partOfFocus) {
                    this.processServices(data);
                }
                break;
            case 'component':
            case 'directive':
            case 'controller':
                this.processServices(data);
                break;
            default:
                break;
        }
    }

    private processServices(data: Metadata) {
        let injectionsInFile = 0;
        let mentionsInFile = 0;
        for (const service of data.services) {
            injectionsInFile++;
            mentionsInFile += service.count;
            let record = this.servicesInjectionsAndMentions[service.name];
            if (record) {
                record.injections++;
                record.mentions += service.count;
            } else {
                record = new StatisticsRecord(service.name, 1, service.count);
                this.servicesInjectionsAndMentions[service.name] = record;
            }
        }
        if (data.partOfFocus) {
            this.dependenciesPerScopedFile[data.name] = new StatisticsRecord(
                data.name,
                injectionsInFile,
                mentionsInFile
            );
        }
    }

    writeFiles(): void {
        let servicesUsage = `name,injectionsInScope,mentionsInScope,inScope,filePath${EOL}`;
        for (const recordName in this.servicesInjectionsAndMentions) {
            let record = this.servicesInjectionsAndMentions[recordName];
            let metadata = this.allMetadata[record.name];

            let partOfFocus = metadata ? metadata.partOfFocus : 'n/a';
            let filePath = metadata ? metadata.filePath : 'n/a';

            let line = `${record.name},${record.injections},${record.mentions},${partOfFocus},${filePath}${EOL}`;
            servicesUsage += line;
        }
        fs.writeFileSync('services_usage.csv', servicesUsage);

        // other files? maybe components with number of injections in each + number of mentions total in each component/drtv
        let dependenciesPerScopedFile = `name,serviceInjections,mentionsOfServices,filePath${EOL}`;
        for (const recordName in this.dependenciesPerScopedFile) {
            let record = this.dependenciesPerScopedFile[recordName];
            let metadata = this.allMetadata[record.name];
            let line = `${record.name},${record.injections},${record.mentions},${metadata.filePath}${EOL}`;
            dependenciesPerScopedFile += line;
        }
        fs.writeFileSync('dependencies_count.csv', dependenciesPerScopedFile);
    }
}

export { StatisticsReporter };
