#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import readline from 'readline';

/**
 * Check if the twilight-bundles.json file exists in the current directory
 * @param {string} projectRoot - The project root directory
 * @returns {boolean} - True if the file exists
 */
function twilightBundlesExists(projectRoot) {
  const bundlePath = path.join(projectRoot, 'twilight-bundle.json');
  return fs.existsSync(bundlePath);
}

/**
 * Check if the starter-kit package is installed
 * @param {string} projectRoot - The project root directory
 * @returns {boolean} - True if the package is installed
 */
function starterKitInstalled(projectRoot) {
  try {
    // Check if the package is in node_modules
    const nodeModulesPath = path.join(projectRoot, 'node_modules', '@salla.sa', 'twilight-bundles-starter-kit');
    return fs.existsSync(nodeModulesPath);
  } catch (error) {
    return false;
  }
}

/**
 * Install the starter-kit package
 * @param {string} projectRoot - The project root directory
 * @returns {boolean} - True if installation was successful
 */
/**
 * Install the starter-kit package
 * @param {string} projectRoot - The project root directory
 * @returns {Promise<boolean>} - Promise resolving to true if installation was successful
 */
function installStarterKit(projectRoot) {
  return new Promise((resolve) => {
    try {
      console.log('📦 Installing @salla.sa/twilight-bundles-starter-kit...');
      
      // Check if pnpm exists on the system
      try {
        execSync('pnpm --version', { stdio: 'ignore' });
        console.log('📦 Using pnpm as package manager');
      } catch (e) {
        console.error('❌ pnpm is required but not installed');
        console.log('Please install pnpm globally using: npm install -g pnpm');
        resolve(false);
        return;
      }
      
      // Install the package using pnpm
      const installCommand = 'pnpm add @salla.sa/twilight-bundles-starter-kit@latest';
      
      console.log(`📦 Running: ${installCommand}`);
      console.log('⚠️ This may take a moment...');
      
      // Ask for confirmation before running the command
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('Do you want to continue with the installation? (y/n): ', (answer) => {
        rl.close();
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          try {
            execSync(installCommand, { stdio: 'inherit', cwd: projectRoot });
            console.log('✅ @salla.sa/twilight-bundles-starter-kit installed successfully');
            resolve(true);
          } catch (error) {
            console.error('❌ Failed to install @salla.sa/twilight-bundles-starter-kit:', error.message);
            resolve(false);
          }
        } else {
          console.log('❌ Installation cancelled');
          process.exit(0);
        }
      });
    } catch (error) {
      console.error('❌ Failed to install @salla.sa/twilight-bundles-starter-kit:', error.message);
      resolve(false);
    }
  });
}

/**
 * Copy files from starter-kit to the target directory
 * @param {string} projectRoot - The project root directory
 * @returns {boolean} - True if copy was successful
 */
function copyStarterKitFiles(projectRoot) {
  try {
    console.log('📋 Copying starter-kit files to your project...');
    
    // Get the path to the starter-kit package
    const starterKitPath = path.join(projectRoot, 'node_modules', '@salla.sa', 'twilight-bundles-starter-kit');
    
    // Files and directories to copy
    const itemsToCopy = [
      'src',
      'tsconfig.json',
      'twilight-bundle.json',
      'vite.config.ts',
      'README.md'
    ];
    
    // Copy each item
    for (const item of itemsToCopy) {
      const sourcePath = path.join(starterKitPath, item);
      const targetPath = path.join(projectRoot, item);
      
      // Skip if target already exists
      if (fs.existsSync(targetPath)) {
        console.log(`⚠️ ${item} already exists, skipping...`);
        continue;
      }
      
      // Copy directory recursively
      if (fs.statSync(sourcePath).isDirectory()) {
        copyDirectoryRecursive(sourcePath, targetPath);
      } else {
        // Copy file
        fs.copyFileSync(sourcePath, targetPath);
      }
      
      console.log(`✅ Copied ${item}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to copy starter-kit files:', error.message);
    return false;
  }
}

/**
 * Copy a directory recursively
 * @param {string} source - Source directory
 * @param {string} target - Target directory
 */
function copyDirectoryRecursive(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  // Get all items in the source directory
  const items = fs.readdirSync(source);
  
  // Copy each item
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    
    // Copy directory recursively or file directly
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

/**
 * Merge package.json from starter-kit with the current package.json
 * @param {string} projectRoot - The project root directory
 * @returns {boolean} - True if merge was successful
 */
function mergePackageJson(projectRoot) {
  try {
    console.log('🔄 Merging package.json...');
    
    // Get the path to the starter-kit package.json
    const starterKitPackageJsonPath = path.join(
      projectRoot, 
      'node_modules', 
      '@salla.sa', 
      'twilight-bundles-starter-kit', 
      'package.json'
    );
    
    // Get the path to the current package.json
    const currentPackageJsonPath = path.join(projectRoot, 'package.json');
    
    // Read the package.json files
    const starterKitPackageJson = JSON.parse(fs.readFileSync(starterKitPackageJsonPath, 'utf8'));
    const currentPackageJson = JSON.parse(fs.readFileSync(currentPackageJsonPath, 'utf8'));
    
    // Merge the package.json files
    const mergedPackageJson = {
      ...currentPackageJson,
      scripts: {
        ...starterKitPackageJson.scripts,
        ...currentPackageJson.scripts
      },
      dependencies: {
        ...currentPackageJson.dependencies,
        'lit': starterKitPackageJson.dependencies.lit || '^3.2.1',
        '@salla.sa/twilight-bundles': starterKitPackageJson.dependencies['@salla.sa/twilight-bundles'] || '^0.1.1'
      },
      devDependencies: {
        ...starterKitPackageJson.devDependencies,
        ...currentPackageJson.devDependencies
      }
    };
    
    // Write the merged package.json
    fs.writeFileSync(
      currentPackageJsonPath, 
      JSON.stringify(mergedPackageJson, null, 2)
    );
    
    console.log('✅ package.json merged successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to merge package.json:', error.message);
    return false;
  }
}

/**
 * Initialize a new Twilight Bundles project
 * @param {string} [projectRootArg] - Optional project root directory
 */
async function initTwilightBundles(projectRootArg) {
  // Get project root from arguments or default to current directory
  const projectRoot = projectRootArg || process.cwd();
  
  console.log('🚀 Initializing Salla Twilight Bundles Project 🚀\n');
  
  // Check if twilight-bundle.json already exists
  if (twilightBundlesExists(projectRoot)) {
    console.log('⚠️ This directory already contains a Twilight Bundles project (twilight-bundle.json exists)');
    console.log('If you want to start a new project, please create a new directory and run this command again.');
    return false;
  }
  
  // Check if starter-kit is installed
  let starterKitReady = starterKitInstalled(projectRoot);
  
  // Install starter-kit if not installed
  if (!starterKitReady) {
    starterKitReady = await installStarterKit(projectRoot);
    if (!starterKitReady) {
      return false;
    }
  }
  
  // Copy starter-kit files
  if (!copyStarterKitFiles(projectRoot)) {
    return false;
  }
  
  // Merge package.json
  if (!mergePackageJson(projectRoot)) {
    return false;
  }
  
  console.log('\n🎉 Twilight Bundles project initialized successfully!\n');
  console.log('Next steps:');
  console.log('1. Run "pnpm install" to install dependencies');
  console.log('2. Run "pnpm run dev" to start the development server');
  console.log('3. Create new components using "pnpm run create-component <component-name>"');
  
  return true;
}

// Parse command-line arguments and run the script
const args = process.argv.slice(2);
const projectRoot = args[0] || process.cwd(); // First argument is the project root, default to current directory

// Run the script with the parsed arguments
(async () => {
  try {
    await initTwilightBundles(projectRoot);
  } catch (error) {
    console.error('\n❌ An unexpected error occurred:', error.message);
    process.exit(1);
  }
})();
