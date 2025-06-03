export function parseConfig() {
    const args = process.argv.slice(2);
    // Parse command line arguments
    let serviceDomain;
    let apiKey;
    const serviceIdIndex = args.indexOf('--service-id');
    if (serviceIdIndex !== -1 && serviceIdIndex + 1 < args.length) {
        serviceDomain = args[serviceIdIndex + 1];
    }
    const apiKeyIndex = args.indexOf('--api-key');
    if (apiKeyIndex !== -1 && apiKeyIndex + 1 < args.length) {
        apiKey = args[apiKeyIndex + 1];
    }
    // Fallback to environment variables if not provided via command line
    serviceDomain = serviceDomain || process.env.MICROCMS_SERVICE_ID;
    apiKey = apiKey || process.env.MICROCMS_API_KEY;
    if (!serviceDomain || !apiKey) {
        throw new Error('microCMS credentials are required. Provide them via:\n' +
            '  Command line: --service-id <service-id> --api-key <key>\n' +
            '  Environment variables: MICROCMS_SERVICE_ID and MICROCMS_API_KEY');
    }
    return {
        serviceDomain,
        apiKey,
    };
}
//# sourceMappingURL=config.js.map