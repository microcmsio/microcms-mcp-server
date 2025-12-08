/**
 * Test script to debug getServiceInfo function
 * 
 * Usage:
 *   # With .env file (recommended)
 *   pnpm run debug:service-info
 * 
 *   # With arguments (single service)
 *   npx tsx scripts/test-service-info.ts <serviceId> <apiKey>
 * 
 *   # With environment variables
 *   MICROCMS_SERVICE_ID=xxx MICROCMS_API_KEY=yyy npx tsx scripts/test-service-info.ts
 *   MICROCMS_SERVICES='[{"id":"xxx","apiKey":"yyy"}]' npx tsx scripts/test-service-info.ts
 */

interface ServiceConfig {
  id: string;
  apiKey: string;
}

async function fetchServiceInfo(serviceId: string, apiKey: string) {
  const url = `https://${serviceId}.microcms-management.io/api/v1/service`;
  console.log(`\n📡 Fetching: ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MICROCMS-API-KEY': apiKey,
    },
  });

  console.log(`   Status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`   ❌ Error: ${errorText}`);
    return null;
  }

  const data = await response.json();
  return data;
}

async function testSingleService(serviceId: string, apiKey: string) {
  console.log(`\n🔍 Testing service: ${serviceId}`);
  console.log('─'.repeat(50));

  const data = await fetchServiceInfo(serviceId, apiKey);
  
  if (data) {
    console.log('\n📋 Response JSON:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n✅ Field check:');
    console.log(`   serviceName: "${data.serviceName}"`);
    console.log(`   serviceId: "${data.serviceId}"`);
    console.log(`   All keys: ${Object.keys(data).join(', ')}`);
  }
  
  return data;
}

async function testMultiService(services: ServiceConfig[]) {
  console.log(`\n🔧 Multi-service mode detected: ${services.length} service(s)`);
  
  const results: Record<string, any> = {};
  
  for (const service of services) {
    const data = await testSingleService(service.id, service.apiKey);
    results[service.id] = data;
  }
  
  console.log('\n' + '═'.repeat(50));
  console.log('📊 Summary:');
  console.log('═'.repeat(50));
  
  for (const [serviceId, data] of Object.entries(results)) {
    if (data) {
      console.log(`   ${serviceId} → serviceName: "${data.serviceName}"`);
    } else {
      console.log(`   ${serviceId} → ❌ Failed to fetch`);
    }
  }
}

async function main() {
  console.log('🚀 microCMS Service Info Debug Tool');
  console.log('═'.repeat(50));

  // Check for command line arguments first
  const serviceIdArg = process.argv[2];
  const apiKeyArg = process.argv[3];

  if (serviceIdArg && apiKeyArg) {
    await testSingleService(serviceIdArg, apiKeyArg);
    return;
  }

  // Check for MICROCMS_SERVICES (multi-service mode)
  const servicesJson = process.env.MICROCMS_SERVICES;
  if (servicesJson) {
    try {
      const services: ServiceConfig[] = JSON.parse(servicesJson);
      if (Array.isArray(services) && services.length > 0) {
        await testMultiService(services);
        return;
      }
    } catch (error) {
      console.error('❌ Failed to parse MICROCMS_SERVICES:', error);
    }
  }

  // Check for single service env vars
  const serviceId = process.env.MICROCMS_SERVICE_ID;
  const apiKey = process.env.MICROCMS_API_KEY;

  if (serviceId && apiKey) {
    await testSingleService(serviceId, apiKey);
    return;
  }

  // No configuration found
  console.error('\n❌ No configuration found!');
  console.error('\nUsage:');
  console.error('  1. Set MICROCMS_SERVICES in .env file and run: pnpm run debug:service-info');
  console.error('  2. Set MICROCMS_SERVICE_ID and MICROCMS_API_KEY in .env file');
  console.error('  3. Run with arguments: npx tsx scripts/test-service-info.ts <serviceId> <apiKey>');
  process.exit(1);
}

main().catch(console.error);
