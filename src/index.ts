import { DirectoryWalker } from './directoryWalker';
import { StatisticsReporter } from './reporting/statisticsReporter';
import { UnusedInjectionsReporter } from './reporting/unusedInjectionsReporter';
import { createFileProcessor } from './processing';

const args = process.argv.slice(2);

if (args.length !== 2) {
    console.log('Usage: node build/index.js projectRoot scopeDirectory');
    console.log(
        'Note that scopeDirectory must be inside the projectRoot (must start with same string)'
    );
}

const projectRoot = args[0];
const scopeDirectory = args[1];

// let servicesUsage = new ServicesUsage(projectRoot);
// servicesUsage.findUsagesInSubPath(scopeDirectory);

const dirWalker = new DirectoryWalker(projectRoot, scopeDirectory);
const reporters = [new StatisticsReporter(), new UnusedInjectionsReporter()];
const fileStats: Record<string, number> = {
    C: 0,
    T: 0,
    D: 0,
    S: 0,
    s: 0,
    '.': 0,
};
console.time('Done in');
console.log(`Analyzing scope: ${scopeDirectory}`);
console.log(`As part of project located in: ${projectRoot}`);
console.log();
console.log('Legend:');
console.log('    C/T/D - Component/Controller/Directive - in scope');
console.log('    S - service in scope');
console.log('    s - service out of scope');
console.log('    . - unprocessed file (either unsupported or out of scope)');
console.log();

for (const fileInfo of dirWalker.walk()) {
    let processor = createFileProcessor(fileInfo);
    fileStats[processor.type]++;
    process.stdout.write(processor.type);
    let metaData = processor.process();
    for (const reporter of reporters) {
        reporter.add(metaData);
    }
}
console.log();
console.log('Analysis done.');
for (const key in fileStats) {
    console.log(`${key} - ${fileStats[key]} files processed.`);
}
console.log(`Generating report files in: ${process.cwd()}`);
for (const reporter of reporters) {
    reporter.writeFiles();
}
console.log('Done.');
console.timeEnd('Done in');
