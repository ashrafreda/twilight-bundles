#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import readline from 'readline';

/**
 * Validates if a string is in kebab-case
 * @param {string} str - String to validate
 * @returns {boolean} - True if string is in kebab-case
 */
function isKebabCase(str) {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(str);
}

/**
 * Capitalizes the first letter of each word in a kebab-case string
 * @param {string} str - Kebab-case string
 * @returns {string} - Title case string
 */
function kebabToTitleCase(str) {
  return str.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitalizes the first letter of each word in a kebab-case string and removes spaces
 * @param {string} str - Kebab-case string
 * @returns {string} - PascalCase string
 */
function kebabToPascalCase(str) {
  return str.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

/**
 * Checks if a component with the given name already exists
 * @param {string} componentName - Name of the component to check
 * @param {string} projectRoot - Root directory of the project
 * @returns {boolean} - True if component already exists
 */
function componentExists(componentName, projectRoot) {
  const componentsDir = path.join(projectRoot, 'src', 'components');
  const componentDir = path.join(componentsDir, componentName);
  return fs.existsSync(componentDir);
}

/**
 * Checks if a component with the given name exists in twilight-bundle.json
 * @param {string} componentName - Name of the component to check
 * @param {string} projectRoot - Root directory of the project
 * @returns {boolean} - True if component already exists in twilight-bundle.json
 */
function componentExistsInBundle(componentName, projectRoot) {
  const bundlePath = path.join(projectRoot, 'twilight-bundle.json');
  
  if (!fs.existsSync(bundlePath)) {
    return false;
  }
  
  const bundleContent = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  
  if (!bundleContent.components || !Array.isArray(bundleContent.components)) {
    return false;
  }
  
  return bundleContent.components.some(component => component.name === componentName);
}

/**
 * Creates a new component
 * @param {string} componentName - Name of the component to create
 * @param {string} projectRoot - Root directory of the project
 */
function createComponent(componentName, projectRoot) {
  const componentsDir = path.join(projectRoot, 'src', 'components');
  const componentDir = path.join(componentsDir, componentName);
  
  // Create component directory
  fs.mkdirSync(componentDir, { recursive: true });
  
  // Create component index.ts file
  const className = kebabToPascalCase(componentName);
  const indexContent = `import { css, html, LitElement } from "lit";
import { property } from "lit/decorators.js";

export default class ${className} extends LitElement {
  @property({ type: Object })
  config?: Record<string, any>;

  static styles = css\`
    :host {
      display: block;
    }
    .${componentName} {
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .${componentName}-title {
      font-weight: 500;
      color: #2c3e50;
      margin: 0 0 1rem;
    }
    .${componentName}-content {
      color: #666;
    }
  \`;

  render() {
    return html\`
      <div class="${componentName}">
        <h3 class="${componentName}-title">\${this.config?.title || '${kebabToTitleCase(componentName)}'}</h3>
        <div class="${componentName}-content">
          \${this.config?.content || 'This is a new ${kebabToTitleCase(componentName)} component'}
        </div>
      </div>
    \`;
  }
}
`;

  fs.writeFileSync(path.join(componentDir, 'index.ts'), indexContent);

  console.log(`✅ Component files created at ${componentDir}`);
}

/**
 * Updates the twilight-bundle.json file with the new component
 * @param {string} componentName - Name of the component to add
 * @param {string} projectRoot - Root directory of the project
 */
function updateBundleJson(componentName, projectRoot) {
  const bundlePath = path.join(projectRoot, 'twilight-bundle.json');
  
  if (!fs.existsSync(bundlePath)) {
    console.error('❌ twilight-bundle.json not found');
    return false;
  }
  
  const bundleContent = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
  
  if (!bundleContent.components || !Array.isArray(bundleContent.components)) {
    bundleContent.components = [];
  }
  
  // Create new component definition
  const componentTitle = kebabToTitleCase(componentName);
  const componentDefinition = {
    "title": componentTitle,
    "icon": "sicon-layout-grid",
    "name": componentName,
    "key": uuidv4(),
    "image": "https://cdn.salla.network/images/themes/default/placeholder.jpg",
    "fields": [
      {
        "id": "title",
        "icon": "sicon-format-text-alt",
        "type": "string",
        "label": "Title",
        "format": "text",
        "required": true,
        "placeholder": "Enter component title...",
        "value": componentTitle
      },
      {
        "id": "content",
        "icon": "sicon-paragraph",
        "type": "string",
        "label": "Content",
        "format": "textarea",
        "required": false,
        "placeholder": "Enter component content...",
        "value": `This is a new ${componentTitle} component`
      }
    ]
  };
  
  // Add the new component definition
  bundleContent.components.push(componentDefinition);
  
  // Write the updated content back to the file
  fs.writeFileSync(bundlePath, JSON.stringify(bundleContent, null, 4));
  
  console.log(`✅ Component added to twilight-bundle.json`);
  return true;
}

/**
 * Main function to create a new component
 * @param {string} [componentNameArg] - Optional component name from command line
 * @param {string} [projectRootArg] - Optional project root directory
 */
function createNewComponent(componentNameArg, projectRootArg) {
  // Get project root from arguments or default to current directory
  const projectRoot = projectRootArg || process.cwd();
  
  console.log('🧩 Salla Twilight Component Generator 🧩\n');
  
  // If component name is provided as argument, use it directly
  if (componentNameArg) {
    processComponentName(componentNameArg, projectRoot);
    return;
  }
  
  // Otherwise, prompt for component name
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Enter the component name (in kebab-case, e.g., "my-component"): ', (componentName) => {
    processComponentName(componentName, projectRoot);
    rl.close();
  });
}

/**
 * Process the component name, validate it, and create the component
 * @param {string} componentName - The component name to process
 * @param {string} projectRoot - The project root directory
 */
function processComponentName(componentName, projectRoot) {
  // Validate component name
  if (!componentName) {
    console.error('❌ Component name is required');
    return false;
  }
  
  if (!isKebabCase(componentName)) {
    console.error('❌ Component name must be in kebab-case (e.g., "my-component")');
    return false;
  }
  
  // Check if component already exists
  if (componentExists(componentName, projectRoot)) {
    console.error(`❌ Component "${componentName}" already exists`);
    return false;
  }
  
  // Check if component already exists in twilight-bundle.json
  if (componentExistsInBundle(componentName, projectRoot)) {
    console.error(`❌ Component "${componentName}" already exists in twilight-bundle.json`);
    return false;
  }
  
  // Create component
  createComponent(componentName, projectRoot);
  
  // Update twilight-bundle.json
  updateBundleJson(componentName, projectRoot);
  
  console.log(`\n🎉 Component "${componentName}" created successfully!\n`);
  console.log(`Next steps:`);
  console.log(`1. Run "pnpm run dev" to see your component in action`);
  console.log(`2. Edit the component files in src/components/${componentName}/`);
  console.log(`3. Customize the component definition in twilight-bundle.json`);
  
  return true;
}

// Parse command-line arguments and run the script
const args = process.argv.slice(2);
const componentName = args[0]; // First argument is the component name
const projectRoot = process.cwd(); // Use current directory as project root

// Run the script with the parsed arguments
createNewComponent(componentName, projectRoot);
