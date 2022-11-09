const MATCH_PATTERNS = {
    COMMENTS_EXTRACTOR: /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm,
    INJECTION_LIST_EXTRACTOR: /([$\w]+)/g,
    SERVICE_WITH_NAMED_FUNCTION: /\.service\(['"](\w+)['"]\s*,\s*(\w+)\s*\)/,
    SERVICE_WITH_ANONYMOUS_FUNCTION:
        /\.service\(['"](\w+)['"]\s*,\s*function\s*\(\s*([^)]*)\s*\)/,
    DRV_OR_COMP_WITH_NAMED_CONTROLLER: /\.(directive|component)\(['"](\w+)['"]/,
    CONTROLLER_NAME: /controller\s*:\s*(\w+)/,
    CTRL_WITH_NAMED_FUNCTION: /\.controller\(['"](\w+)['"]\s*,\s*(\w+)\s*\)/,
    CTRL_WITH_ANONYMOUS_FUNCTION:
        /\.controller\(['"](\w+)['"]\s*,\s*function\s*\(\s*([^)]*)\s*\)/,
};

function getInjectedServicesFromString(
    servicesInjectionListAsString: string
): string[] {
    return (
        servicesInjectionListAsString?.match(
            MATCH_PATTERNS.INJECTION_LIST_EXTRACTOR
        ) || []
    );
}

export { MATCH_PATTERNS, getInjectedServicesFromString };
