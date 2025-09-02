/**
 * Schema Injector
 * 
 * This utility injects data values into a form builder schema.
 * It's a JavaScript implementation based on the PHP InjectDataToSchemaAction class.
 */

/**
 * Injects data values into a form builder schema
 * 
 * @param schema - The form schema to inject data into
 * @param data - Key-value pairs of data to inject
 * @returns The schema with injected data
 */
export function injectDataToSchema(schema: any[], data: Record<string, any>): any[] {
    try {
        if(typeof schema === 'string'){
            schema = JSON.parse(schema);
        }
    
    return schema.map(item => {
      if (data.hasOwnProperty(item.id)) {
        return assignData(item, data);
      }
      return item;
    });
    } catch (error) {
        return [{error: error as string}];
    }
  }
  
  /**
   * Assigns data to a schema item based on its type and format
   */
  function assignData(item: any, data: Record<string, any>, id?: string): any {
    // Use the provided id or extract it from the item's id
    id = id || (item.id ? item.id.split('.').pop() : '');
    const value = id ? (data[id] ?? null) : null;
    const type = item.type;
    const format = item.format ?? null;
  
    // Handle boolean/switch fields
    if (type === 'boolean' && format === 'switch') {
      item.s_value = item.selected = Boolean(value);
      return item;
    }
  
    // Handle items type (dropdown-list, etc.)
    if (type === 'items') {
      item.source = value?.source ?? item.source ?? 'custom';
      item.s_value = item.selected = getItemsData(item, value);
  
      // Add availability labels to sources if present
      if (item.sources) {
        item.sources = addInAvailableLabel(item.sources);
      }
  
      return item;
    }
  
    // Handle collection type (repeater fields)
    if (type === 'collection') {
      return getCollectionData(item, value);
    }
  
    // Handle string and other types
    //@ts-ignore
    item.s_value = item.value = getLingualValue(item, id, data);
    
    // Ensure s_value is at least null if undefined
    item.s_value ??= null;
  
    return item;
  }
  
  /**
   * Adds availability labels to source items
   */
  function addInAvailableLabel(sources: any[]): any[] {
    return sources.map(source => {
      source.label += sourceAvailability(source.key || null);
      return source;
    });
  }
  
  /**
   * Determines source availability label
   * Note: This is simplified from the PHP version since we don't have access to the same feature flags
   */
  function sourceAvailability(source: string | null): string {
    // In a real implementation, you would check feature flags here
    // For now, we'll return empty string (all features available)
    return '';
  }
  
  /**
   * Processes data for items type fields
   */
  function getItemsData(item: any, value: any): any {
    const source = item.source;
    
    // Handle variable list format
    if (item.format === 'variable-list') {
      return source === 'custom' 
        ? (value?.value ?? (value ?? ''))  // It's a URL
        : (value ? [value] : []);
    }
    
    // Handle custom source
    if (!value || source === 'custom') {
      return value;
    }
  
    // Handle manual source (options provided in schema)
    if (source === 'manual') {
      const valueToMatch = value[0]?.value ?? value;
      return item.options.filter((option: any) => option.value == valueToMatch);
    }
    
    // Handle array values
    if (!Array.isArray(value) || !value.some(v => typeof v === 'object')) {
      return value;
    }
  
    // If we already have formatted values with 'value' property, return as is
    if (value[0]?.value !== undefined) {
      return value;
    }
  
    // In the PHP version, this would fetch data from a source
    // For our JS implementation, we'll just return the value as is
    return value;
  }
  
  /**
   * Processes data for collection type fields
   */
  function getCollectionData(item: any, values: any[] | null): any {
    item.value = [];
  
    if (values === null) {
      return item;
    }
  
    values.forEach((value, index) => {
      item.value[index] = {};
      
      item.fields.forEach((field: any) => {
        const fieldId = field.id.split('.').pop() || '';
        const updatedField = assignData({ ...field }, value, fieldId);
        
        item.value[index][field.id] = updatedField.s_value;
        
        // Handle variable list source type
        const source = value[`${fieldId}__type`]?.[0]?.key 
          ?? updatedField.selected?.[0]?.source
          ?? updatedField.source
          ?? null;
          
        if (source && field.format === 'variable-list') {
          item.value[index][`${field.id}__type`] = source;
        }
      });
    });
  
    return item;
  }
  
  /**
   * Handles multilanguage values
   */
  function getLingualValue(item: any, id: string, data: Record<string, any> | null): any {
    const value = data?.[id] ?? null;
    const isMultiLanguage = item.multilanguage ?? false;
    
    // If already in translations format (array), return as is
    if (isMultiLanguage && !Array.isArray(value)) {
      // In the PHP version, this would extract translations from data
      // For our JS implementation, we'll create a simple object with the current language
      const currentLang = 'ar'; // Default to Arabic, could be made dynamic
      return { [currentLang]: value };
    }
  
    if (isMultiLanguage) {
      return Array.isArray(value) ? value : { ar: value };
    }
  
    // For non-multilanguage fields, extract the value from the language object if needed
    if (Array.isArray(value)) {
      return value;
    } else if (typeof value === 'object' && value !== null) {
      return (value as Record<string, any>)['ar'] ?? Object.values(value)[0];
    }
    return value;
  }
  