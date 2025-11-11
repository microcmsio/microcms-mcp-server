export const FIELD_FORMATS_DESCRIPTION = `
  Create new content in microCMS and publish it immediately. 

  ## Important
  Ensure that the "content" you submit strictly adheres to the following specifications.
  In particular, take extra care when handling custom fields, as mistakes are common in their structure. 
  Read the instructions thoroughly and construct the data precisely as described.
  
  ## Field type specifications
  
  * Image fields require URLs from the same microCMS service (e.g., "https://images.microcms-assets.io/assets/xxx/yyy/sample.png"), only the URL string is required. 
  * Multiple image fields use array format. 
  * Rich editor fields expect HTML strings. 
  * Date fields use ISO 8601 format. 
  * Select fields use arrays. 
  * Content reference fields use contentId strings or arrays for multiple references, and you can get contentIds from microcms_get_list tool. 
  * Custom field exepect below struct:
  \`\`\`json
  <field Id in apiFields> {
    "fieldId": "<target custom field id in customFields>"
    "key1": "<value1>",
    "key2": "<value2>",
  }
  \`\`\`
  `;