import type { AppConfig, ServiceConfig, SingleServiceConfig, MultiServiceConfig } from './types.js';

export type { AppConfig, ServiceConfig, SingleServiceConfig, MultiServiceConfig };

/**
 * Parse and validate service configuration from environment variables or command line arguments.
 * 
 * Supports two modes:
 * 1. Single service mode (legacy): MICROCMS_SERVICE_ID + MICROCMS_API_KEY
 * 2. Multi service mode: MICROCMS_SERVICES (JSON array)
 * 
 * If MICROCMS_SERVICES is set, it takes priority over the legacy single service config.
 */
export function parseConfig(): AppConfig {
  // Check for multi-service configuration first (takes priority)
  const servicesJson = process.env.MICROCMS_SERVICES;
  if (servicesJson) {
    return parseMultiServiceConfig(servicesJson);
  }

  // Fall back to single service configuration (legacy)
  return parseSingleServiceConfig();
}

/**
 * Parse multi-service configuration from JSON string
 */
function parseMultiServiceConfig(jsonString: string): MultiServiceConfig {
  let services: ServiceConfig[];
  
  try {
    services = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(
      'Invalid MICROCMS_SERVICES JSON format.\n' +
      'Expected format: [{"id": "service-id", "apiKey": "api-key"}, ...]\n' +
      `Parse error: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  if (!Array.isArray(services)) {
    throw new Error(
      'MICROCMS_SERVICES must be a JSON array.\n' +
      'Expected format: [{"id": "service-id", "apiKey": "api-key"}, ...]'
    );
  }

  if (services.length === 0) {
    throw new Error('MICROCMS_SERVICES array cannot be empty.');
  }

  // Validate each service configuration
  const seenIds = new Set<string>();
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    
    if (!service || typeof service !== 'object') {
      throw new Error(`MICROCMS_SERVICES[${i}]: Invalid service configuration.`);
    }

    if (!service.id || typeof service.id !== 'string') {
      throw new Error(`MICROCMS_SERVICES[${i}]: Missing or invalid "id" field.`);
    }

    if (!service.apiKey || typeof service.apiKey !== 'string') {
      throw new Error(`MICROCMS_SERVICES[${i}]: Missing or invalid "apiKey" field.`);
    }

    if (seenIds.has(service.id)) {
      throw new Error(`MICROCMS_SERVICES: Duplicate service id "${service.id}".`);
    }
    seenIds.add(service.id);
  }

  return {
    mode: 'multi',
    services,
  };
}

/**
 * Parse single service configuration from environment variables or command line arguments (legacy mode)
 */
function parseSingleServiceConfig(): SingleServiceConfig {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  let serviceDomain: string | undefined;
  let apiKey: string | undefined;
  
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
    throw new Error(
      'microCMS credentials are required. Provide them via:\n' +
      '  Single service mode:\n' +
      '    Command line: --service-id <service-id> --api-key <key>\n' +
      '    Environment variables: MICROCMS_SERVICE_ID and MICROCMS_API_KEY\n' +
      '  Multi service mode:\n' +
      '    Environment variable: MICROCMS_SERVICES (JSON array)\n' +
      '    Example: MICROCMS_SERVICES=\'[{"id":"blog","apiKey":"xxx"}]\''
    );
  }
  
  return {
    mode: 'single',
    serviceDomain,
    apiKey,
  };
}

// Legacy exports for backward compatibility
export interface Config {
  serviceDomain: string;
  apiKey: string;
}

/**
 * @deprecated Use parseConfig() instead. This function is kept for backward compatibility.
 */
export function parseLegacyConfig(): Config {
  const config = parseConfig();
  
  if (config.mode === 'single') {
    return {
      serviceDomain: config.serviceDomain,
      apiKey: config.apiKey,
    };
  }
  
  // For multi-service mode, return the first service as default
  // This maintains backward compatibility but logs a warning
  const firstService = config.services[0];
  console.error(
    'Warning: parseLegacyConfig() called in multi-service mode. ' +
    `Using first service "${firstService.id}" as default.`
  );
  
  return {
    serviceDomain: firstService.id,
    apiKey: firstService.apiKey,
  };
}
