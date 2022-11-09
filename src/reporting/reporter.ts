import { Metadata } from '../processing/metadata';

interface Reporter {
    add(data: Metadata): void;
    writeFiles(): void;
}

export { Reporter };
