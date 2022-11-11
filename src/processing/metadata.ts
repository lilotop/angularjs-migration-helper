type FileInfo = {
    filePath: string;
    inScope: boolean;
};

type UiObjFileTypes = 'component' | 'directive';
type SimpleFileTypes = 'service' | 'controller';
type SupportedFileTypes = UiObjFileTypes | SimpleFileTypes;
type AllFileTypes = SupportedFileTypes | 'unsupported';

type Metadata = FileInfo & {
    fileType: AllFileTypes;
    name: string;
    services: Array<{ name: string; count: number }>;
};

export {
    Metadata,
    FileInfo,
    UiObjFileTypes,
    SimpleFileTypes,
    SupportedFileTypes,
    AllFileTypes,
};
