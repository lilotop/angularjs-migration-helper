import { Reporter } from './reporter';
import { Metadata } from '../processing/metadata';
import fs from 'fs';

class StatisticsRecord {
    constructor(
        public name: string,
        public injectionsInScope: number,
        public mentionsInScope: number
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
                record.injectionsInScope++;
                record.mentionsInScope += service.count;
            } else {
                record = new StatisticsRecord(service.name, 1, service.count);
                this.servicesInjectionsAndMentions[service.name] = record;
            }
        }
        this.dependenciesPerScopedFile[data.name] = new StatisticsRecord(
            data.name,
            injectionsInFile,
            mentionsInFile
        );
    }

    writeFiles(): void {
        // create csv file structures:
        // services_usage.csv:
        // name, injectionsInScope, mentionsInScope, inScope, filePath
        let servicesUsage =
            'name,injectionsInScope,mentionsInScope,inScope,filePath\r\n';
        // let records = Object.values();
        // console.log('records: ' + records.length);
        for (const recordName in this.servicesInjectionsAndMentions) {
            let record = this.servicesInjectionsAndMentions[recordName];
            let metadata = this.allMetadata[record.name];

            let partOfFocus = metadata ? metadata.partOfFocus : 'n/a';
            let filePath = metadata ? metadata.filePath : 'n/a';

            let line = `${record.name},${record.injectionsInScope},${record.mentionsInScope},${partOfFocus},${filePath}\r\n`;
            servicesUsage += line;
        }
        fs.writeFileSync('services_usage.csv', servicesUsage);
        console.log('Done.');

        // other files? maybe components with number of injections in each + number of mentions total in each component/drtv
    }
}

export { StatisticsReporter };
