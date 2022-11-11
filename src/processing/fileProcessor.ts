import { Metadata } from './metadata';
import { getInjectedServicesFromString } from './utils';

abstract class FileProcessor {
    /**
     * @return a single letter denoting the type
     * s - service not in scope
     * S - service in scope
     * D - directive in scope
     * C - component in scope
     * . - unprocessed file (components/directives outside of scope and other unsupported files)
     */
    abstract get type(): string;

    process(): Metadata {
        for (const serviceName of this.servicesList) {
            this.metaData.services.push({
                name: `service:${serviceName}`,
                count: this.getServiceCount(serviceName),
            });
        }
        return this.metaData;
    }

    protected servicesList: string[] = [];

    protected getServicesListFromFunction(functionName: string): string[] {
        let regEx = new RegExp(
            `function ${functionName}\\s*\\(\\s*([^)]*)\\s*\\)`
        );
        let res = this.fileContent.match(regEx);
        let servicesListAsString = res && res[1];
        if (servicesListAsString) {
            return getInjectedServicesFromString(servicesListAsString);
        }
        return [];
    }
    protected getServiceCount(serviceName: string) {
        let escaper = serviceName.startsWith('$') ? '\\' : '';
        let regEx = new RegExp(`[^\\w.]${escaper}${serviceName}[^\\w:]`, 'g');
        let res = this.fileContent.match(regEx);
        if (!res) {
            throw new Error(
                `Logic error! cannot find ${serviceName} although it should exist in: ${this.metaData.filePath}`
            );
        }
        return res.length;
    }

    protected constructor(
        protected fileContent: string,
        protected metaData: Metadata
    ) {}
}

export { FileProcessor };
