export interface Config {
  serviceDomain: string;
  apiKey: string;
}

export function parseConfig(): Config {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  let serviceDomain: string | undefined;
  let apiKey: string | undefined;
  
  const serviceDomainIndex = args.indexOf('--service-domain');
  if (serviceDomainIndex !== -1 && serviceDomainIndex + 1 < args.length) {
    serviceDomain = args[serviceDomainIndex + 1];
  }
  
  const apiKeyIndex = args.indexOf('--api-key');
  if (apiKeyIndex !== -1 && apiKeyIndex + 1 < args.length) {
    apiKey = args[apiKeyIndex + 1];
  }
  
  // Fallback to environment variables if not provided via command line
  serviceDomain = serviceDomain || process.env.MICROCMS_SERVICE_DOMAIN;
  apiKey = apiKey || process.env.MICROCMS_API_KEY;
  
  if (!serviceDomain || !apiKey) {
    throw new Error(
      'microCMS credentials are required. Provide them via:\n' +
      '  Command line: --service-domain <domain> --api-key <key>\n' +
      '  Environment variables: MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY'
    );
  }
  
  return {
    serviceDomain,
    apiKey,
  };
}