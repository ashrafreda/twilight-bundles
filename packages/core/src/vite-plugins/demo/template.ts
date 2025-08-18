const bundlesUrl = process.env.TWILIGHT_BUNDLES_URL || 'https://cdn.salla.network/js/twilight-bundles/latest/twilight-bundles.js';
let formBuilderMockUrl = process.env.TWILIGHT_FORM_BUILDER_MOCK_BASE_URL ||  'https://salla.design';
formBuilderMockUrl = formBuilderMockUrl.replace(/\/$/, '') + '/api/v1/form-builder-mock';

export interface DemoTemplateOptions {
  grid: {
    columns: string;
    gap: string;
    minWidth: string;
  };
  css: string;
  js: string;
  formbuilder:{
    languages:string[],
    defaultLanguage:'ar' | 'en' | string,
  }
}

function htmlSafeString(str: string) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

export function createDemoHTML(
    components: Array<{name:string,path:string,url:string,schema:string}>,
    options: DemoTemplateOptions
) {
  const translations = {
    ar: {
      toggleTheme: 'تغيير المظهر',
      toggleLang: 'English',
      dir: 'rtl',
      lang: 'ar',
      title: 'حزم العناصر',
      noSettings: 'لا توجد إعدادات لهذا العنصر',
      addSettings: 'إضافة إعدادات لهذا العنصر',
      saveSettings: 'حفظ التغييرات',
    },
    en: {
      toggleTheme: 'Toggle Theme',
      toggleLang: 'Arabic',
      dir: 'ltr',
      lang: 'en',
      title: 'Twilight Bundles',
      noSettings: 'No settings for this component',
      addSettings: 'Add settings for this component',
      saveSettings: 'Save changes',
    }
  };

  const formbuilderAssets = [
    'https://cdn.assets.salla.network/prod/admin/cp/assets/css/icons/sallaicons/style.css?v0.21-languages2',
    'https://cdn.assets.salla.network/prod/admin/vendor/form-builder/form-builder.a58a1e74d158c6a9cd3aeffe2feb6674.css',
    'https://cdn.assets.salla.network/prod/admin/vendor/theme-dashboard/form-builder-theme.198b7a49c2f8cc9bae22de21569b1f42.css'
  ];

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${translations.ar.title}</title>
    <script>
    localStorage.setItem('FormBuilder::debugger', 1);
    window.customComponents = ${JSON.stringify(components.map(component => component.url))};
    window.customComponentsSchema = ${JSON.stringify(Object.fromEntries(components.map(component => [component.name, component.schema])))};
    function schemaForComponent(componentName){
    if(localStorage.getItem('form-builder::'+componentName)){
      return htmlSafeString(localStorage.getItem('form-builder::'+componentName));
    }
      
      return htmlSafeString(window.customComponentsSchema[componentName]);
    }
    function getComponentData(componentName){
      return htmlSafeString(localStorage.getItem('form-builder::data_' + componentName));
    }
    function htmlSafeString(str) {
        return str?.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')||'';
    }
    
    function renderComponent(componentName, existingComponent){
        if(Salla.storage.get('hidden-salla-components', []).includes(componentName)){
            return;
        }
        const tempDom = document.createElement('div');
        const config = getComponentData(componentName);
        tempDom.innerHTML=\`<div class="component-card" data-component="\${componentName}">
            <div class="component-card-header">
                <h2>
                    <i class="sicon-tag"></i>
                    \${componentName}
                </h2>
                <div class="component-card-actions">
                    <button class="component-visibility-btn" aria-label="Toggle visibility" 
                        onclick="hideComponent('\${componentName}')" 
                        title="Hide component">
                            <i class="sicon-eye"></i>
                        </button>
                        <button class="component-settings-btn" aria-label="Open settings"
                        data-component="\${componentName}"
                        data-schema="\${config}">
                            <i class="sicon-settings"></i>
                        </button>
                    </div>
                </div>
                <salla-custom-component \${config?'config="'+config+'"':''} component-name="\${componentName}"></salla-custom-component>
            </div>
        </div>\`;
        tempDom.querySelector('.component-settings-btn').addEventListener('click', () => openDrawer(componentName));
        const grid = document.getElementById('componentsGrid');
        existingComponent
          ? grid.insertBefore(tempDom.firstElementChild, existingComponent.nextSibling)
          : grid.appendChild(tempDom.firstElementChild);
        tempDom.remove();
    }
        function reRenderComponent(componentName){
          const existingComponent = document.querySelector('.component-card[data-component="' + componentName + '"]');
          renderComponent(componentName, existingComponent);
          existingComponent.remove();
        }

    
    // Save component visibility to localStorage
    function hideComponent(componentName) {
      const hiddenComponents = Salla.storage.get('hidden-salla-components', []);
      if(!hiddenComponents?.includes(componentName)){
        hiddenComponents.push(componentName);
      }
      Salla.storage.set('hidden-salla-components', hiddenComponents);
      document.querySelector('.component-card[data-component="' + componentName + '"]')?.remove();
    }

    function showComponent(componentName) {
      let hiddenComponents = Salla.storage.get('hidden-salla-components', []);
      if(hiddenComponents.includes(componentName)){
        hiddenComponents = hiddenComponents.filter(component => component !== componentName);
      }
      Salla.storage.set('hidden-salla-components', hiddenComponents);
      renderComponent(componentName);
    }
    
    function toggleComponentVisibility(element) {
      const componentName = element.value;
      element.checked = Salla.storage.get('hidden-salla-components', []).includes(componentName);
      element.checked ?showComponent(componentName) : hideComponent(componentName);
    }
    // Get the updated gap value from localStorage
    function getSavedGrid() {
        return Salla.storage.get('salla_demo_grid', {
        columns: '${options.grid.columns}',
        gap: '${options.grid.gap}',
        minWidth: '${options.grid.minWidth}'
        });
    }
    function getSavedLanguages(){
        return Salla.storage.get('salla_demo_formbuilder', {
        languages: ${JSON.stringify(options.formbuilder.languages)},
        defaultLanguage: ${JSON.stringify(options.formbuilder.defaultLanguage)}
        });
    }

    // ==================== BEGIN SETTINGS DRAWER ====================
    function openSettingsDrawer(){
      const settingsDrawer = document.getElementById('settingsDrawer');
      if(!settingsDrawer){
        return;
      }
      settingsDrawer.classList.add('active');
      
      drawerOverlay?.classList.add('active');
      document.body.style.overflow = 'hidden';

      if(settingsDrawer.is_rendered){
        return;
      }
      settingsDrawer.is_rendered = true;
      
      // Set current visibility state for components
      settingsDrawer.querySelectorAll('.visibility-checkbox')
      .forEach(checkbox => checkbox.checked = !Salla.storage.get('hidden-salla-components', []).includes(checkbox.value));
      
      // Set current grid settings
      const savedGrid = getSavedGrid();
      
      // Set grid columns preset
      const gridPresetBtns = document.querySelectorAll('.grid-preset-btn');
      let activePresetFound = false;
      
      gridPresetBtns.forEach(btn => {
        btn.classList.remove('active');
        const columns = btn.getAttribute('data-columns');
        
        if (columns === savedGrid.columns) {
          btn.classList.add('active');
          activePresetFound = true;
        }
      });
      
      // If no preset matches, activate custom option
      if (!activePresetFound) {
        const customBtn = document.querySelector('.grid-preset-btn[data-columns="custom"]');
        customBtn?.classList.add('active');
        
        // Store the current value as custom value
        const gridColumnsInput = document.getElementById('gridColumns');
        if (gridColumnsInput) {
          gridColumnsInput.setAttribute('data-custom-value', savedGrid.columns);
          gridColumnsInput.readOnly = false;
        }
      }
      
      // Initialize grid columns input
      const gridColumnsInput = document.getElementById('gridColumns');
      if (gridColumnsInput) {
        // Initialize with saved value
        gridColumnsInput.value = savedGrid.columns;
        gridColumnsInput.addEventListener('input', () => {
          // Store custom value when user edits
          const customPreset = document.querySelector('.grid-preset-btn[data-columns="custom"]');
          if (customPreset && customPreset.classList.contains('active')) {
            gridColumnsInput.setAttribute('data-custom-value', gridColumnsInput.value);
          }
          // Apply settings immediately for live update
          applySettings();
        });
      }
        const gridGapInput = document.getElementById('gridGapValue');
        const gridGapUnitInput = document.getElementById('gridGapUnit');
      if(gridGapInput && savedGrid.gap){
        gridGapInput.value = savedGrid.gap.match(/[\\d\\.]+/)?.[0];
        gridGapUnitInput.value = savedGrid.gap.match(/[a-z%]+/)?.[0];
      }
      // Add event listeners to grid gap inputs for live updates
      gridGapInput?.addEventListener('input', () => {
        const gridGapValue = gridGapInput?.value || '1';
        const gridGapUnit = gridGapUnitInput?.value || 'rem';
        const gridGap = gridGapValue + gridGapUnit;
        
        // Update the gap in real-time
        const grid = document.getElementById('componentsGrid');
        if (grid) {
          grid.style.gap = gridGap;
        }

        const savedGrid = getSavedGrid();
        
        
        Salla.storage.set('salla_demo_grid', {...savedGrid, gap: gridGap});
      });
      
      gridGapUnitInput?.addEventListener('change', () => {
        const gridGapValue = gridGapInput.value || '1';
        const gridGapUnit = gridGapUnitInput.value || 'rem';
        const gridGap = gridGapValue + gridGapUnit;
        
        // Update the gap in real-time
        const grid = document.getElementById('componentsGrid');
        if (grid) {
          grid.style.gap = gridGap;
        }
        
        Salla.storage.set('salla_demo_grid', {...getSavedGrid(), gap: gridGap});
      });
      
      document.getElementById('customCSS')?.addEventListener('input', debounce(() => {
        applySettings();
      }, 500));
      
      document.getElementById('customJS')?.addEventListener('input', debounce(() => {
        applySettings();
      }, 500));
      
      document.getElementById('formbuilderLanguages')?.addEventListener('change', () => applySettings());
      document.getElementById('formbuilderDefaultLang')?.addEventListener('change', () => applySettings());
      
      
      // Set current custom CSS and JS
      const customCSS = document.getElementById('customCSS');
      const customJS = document.getElementById('customJS');
      
      if (customCSS && customJS) {
        customCSS.value = Salla.storage.get('salla_demo_custom_css', '${options.css?.replace(/'/g, "\\'") || ''}');
        customJS.value = Salla.storage.get('salla_demo_custom_js', '${options.js?.replace(/'/g, "\\'") || ''}');
      }
      
      // Set current formbuilder settings
      const savedFormbuilder = getSavedLanguages();
      
      // Set language checkboxes
      document.querySelectorAll('#formbuilderLanguages option').forEach(option => option.selected = savedFormbuilder.languages.includes(option.value));
      
      document.getElementById('formbuilderDefaultLang').value = savedFormbuilder.defaultLanguage;
    }
    // ==================== END SETTINGS DRAWER ====================
    
    function parseValueAndUnit(cssValue) {
      const match = cssValue.match(/^([\d.]+)([a-z%]*)$/);
      if (match) {
        return [match[1], match[2] || 'px']; // Default to px if no unit
      }
      return ['0', 'px']; // Default fallback
    }
    
    // Helper function to set selected option in a select element
    function setSelectedUnit(selectElement, unit) {
      for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value === unit) {
          selectElement.selectedIndex = i;
          break;
        }
      }
    }

    function getGridColumns() {
      const gridColumnsInput = document.getElementById('gridColumns');
      return gridColumnsInput?.value || '${options.grid.columns}';
    }
    
    function updateGridBasedOnItemCount() {
      const grid = document.getElementById('componentsGrid');
      if (!grid) return;
      
      const gridItems = grid.querySelectorAll(':scope > *');
      
      if (gridItems.length <= 2) {
        // For 1-2 items, use auto-fit with full width
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(0, 1fr))';
        // Reset all items grid-column property
        gridItems.forEach(item => item.style.gridColumn = '');
      } else {
        // For 3+ items, use 3 columns with first item spanning all columns
        grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        // Reset all items first
        gridItems.forEach(item => item.style.gridColumn = '');
        // Make first item span 3 columns
        if (gridItems[0]) gridItems[0].style.gridColumn = 'span 3';
      }
    }
    
    function applySettings() {
      const activePreset = document.querySelector('.grid-preset-btn.active');
      const grid = document.getElementById('componentsGrid');
      if (!grid) return;
      
      // Apply special auto-fill behavior if selected
      if (activePreset && activePreset.getAttribute('data-columns') === 'auto-fill') {
        updateGridBasedOnItemCount();
      } else {
        // Apply normal grid columns
        const gridColumns = getGridColumns();
        grid.style.gridTemplateColumns = gridColumns;
        // Reset all items grid-column property
        const gridItems = grid.querySelectorAll(':scope > *');
        gridItems.forEach(item => item.style.gridColumn = '');
      }
      
      // Get grid gap with unit
      const gridGapValue = document.getElementById('gridGapValue')?.value || '1';
      const gridGapUnit = document.getElementById('gridGapUnit')?.value || 'rem';
      const gridGap = gridGapValue + gridGapUnit;
      
      // Apply grid gap
      if (grid) {
        grid.style.gap = gridGap;
        
        // Ensure grid gap is saved in localStorage
        const savedGrid = Salla.storage.get('salla_demo_grid', {
          columns: grid.style.gridTemplateColumns || '${options.grid.columns}',
          gap: '${options.grid.gap}',
          minWidth: '${options.grid.minWidth}'
        });
        
        // Update only the gap property
        Salla.storage.set('salla_demo_grid', {
          columns: savedGrid.columns,
          gap: gridGap,
          minWidth: savedGrid.minWidth
        });
      }
      
      // Apply custom CSS
      const customCSS = document.getElementById('customCSS')?.value || '';
      let customCSSElement = document.getElementById('custom-css-element');
      if (!customCSSElement) {
        customCSSElement = document.createElement('style');
        customCSSElement.id = 'custom-css-element';
        document.head.appendChild(customCSSElement);
      }
      customCSSElement.textContent = customCSS;
      
      // Apply custom JS
      const customJS = document.getElementById('customJS')?.value || '';
      try {
        if (customJS) {
          eval(customJS);
        }
      } catch (error) {
        console.error('Error executing custom JS:', error);
      }
      
      // Save settings to localStorage
      Salla.storage.set('salla_demo_grid', {
        columns: activePreset && activePreset.getAttribute('data-columns') === 'auto-fill' ? 'auto-fill' : getGridColumns(),
        gap: gridGap,
        minWidth: '${options.grid.minWidth}' // Use backend value only
      });
      
      Salla.storage.set('salla_demo_custom_css', customCSS);
      Salla.storage.set('salla_demo_custom_js', customJS);
      
      // Get selected languages from multi-select
      const formbuilderLanguagesSelect = document.getElementById('formbuilderLanguages');
      const selectedLanguages = Array.from(formbuilderLanguagesSelect?.selectedOptions || []).map(option => option.value);
      
      // Ensure at least one language is selected
      if (selectedLanguages.length === 0) {
        selectedLanguages.push('ar'); // Default to English if nothing selected
      }
      
      // Get default language
      const formbuilderDefaultLang = document.getElementById('formbuilderDefaultLang')?.value || '${options.formbuilder.defaultLanguage}';
      
      // Ensure default language is in the selected languages
      if (!selectedLanguages.includes(formbuilderDefaultLang)) {
        selectedLanguages.push(formbuilderDefaultLang);
        // Also select it in the UI
        const option = Array.from(formbuilderLanguagesSelect?.options || []).find(opt => opt.value === formbuilderDefaultLang);
        if (option) option.selected = true;
      }
      
      // Save formbuilder settings
      Salla.storage.set('salla_demo_formbuilder', {
        languages: selectedLanguages,
        defaultLanguage: formbuilderDefaultLang
      });
      
      // Reset component settings drawer on form-builder changes
      resetComponentSettings();
    }

    window.addEventListener('FormBuilder::form-builder-3::request-success',async ({detail:payload}) => {
      const ignoredKeys = ['static-', '$','twilight-bundles-component-name'];
      const data = Object.fromEntries(
        Object.entries(payload).filter(([key]) => !ignoredKeys.some(ignoredKey=>key.startsWith(ignoredKey)))
      );
      const componentName = payload['twilight-bundles-component-name'];
      Salla.storage.set('form-builder::data_' + componentName, data);
      if (componentName && window.customComponentsSchema && window.customComponentsSchema[componentName]) {
        // Inject the data into the schema
        const schema = window.customComponentsSchema[componentName];
        await fetch('${formBuilderMockUrl}/schema-injector', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ schema, data }),
        }).then(res=>res.json())
        .then(data=>Salla.storage.set('form-builder::'+componentName, data))
        .then(()=>reRenderComponent(componentName))
        .then(()=>closeDrawer())
        .catch(err=>console.error('Error injecting data into schema:', err));
      }
    });
    </script>
    <link rel="icon" type="image/png" media="(prefers-color-scheme: light)" href="https://cdn.salla.network/images/logo/logo-square.png" />
    <link rel="icon" type="image/png" media="(prefers-color-scheme: dark)" href="https://cdn.salla.network/images/logo/logo-light-square.png" />
    <script type="module" src="https://cdn.salla.network/js/twilight/latest/twilight.esm.js" async></script>
    <script type="module" src="${bundlesUrl}" demo-mode defer></script>
    <link rel="stylesheet" href="https://cdn.salla.network/fonts/pingarlt.css">
    <link rel="stylesheet" href="https://cdn.salla.network/fonts/sallaicons.css?v=2.0.5">
    
    <!-- Preload form builder resources for faster loading -->
    
    <style>
      :root {
        --font-main: "PingARLT";
        --color-primary-50: rgb(186, 243, 230);  /* #BAF3E6 */
        --color-primary-100: rgb(120, 232, 206); /* #78E8CE */
        --color-primary-900: rgb(0, 73, 86);     /* #004956 */
        --color-primary: rgb(0, 78, 92);
      }

      :root[data-theme="dark"] {
        --bg-primary: #1E1E1E;
        --bg-secondary: #2A2A2A;
        --text-primary: #FFFFFF;
        --text-secondary: #9CA3AF;
        --border-color: #333333;
        --color-primary: #1d1e20;
        --component-title: #baf3e5;
      }

      :root[data-theme="light"] {
        --bg-primary: #FFFFFF;
        --bg-secondary: #F8F9FA;
        --text-primary: #1E1E1E;
        --text-secondary: #4B5563;
        --border-color: #E5E7EB;
        --component-title: #004e5c;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: var(--font-main);
      }

      body {
        min-height: 100vh;
        background-color: var(--bg-secondary);
      }

      header {
        background-color: var(--color-primary);
        padding: 0.75rem 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 0.75rem;
      }

      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .logo-container {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .logo {
        height: 40px;
      }

      .logo img {
        height: 100%;
        width: auto;
      }

      .title {
        color: white;
        font-size: 1.25rem;
        font-weight: 500;
        margin: 0;
      }

      .actions {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .actions button {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        transition: color 0.2s ease;
        font-size: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .actions button:hover {
        color: rgb(var(--color-primary-100));
      }

      .theme-icon {
        transition: transform 0.3s ease;
      }

      [data-theme="dark"] .theme-icon.moon {
        display: none;
      }

      [data-theme="light"] .theme-icon.sun {
        display: none;
      }

      .lang-icon {
        transition: transform 0.3s ease;
      }

      [dir="rtl"] .lang-icon {
        transform: scaleX(-1);
      }

      .lang-code {
        font-size: 0.875rem;
        font-weight: 500;
        text-transform: uppercase;
      }

      main {
        padding: 1.5rem 0;
      }

      .components-grid {
        display: grid;
        grid-template-columns: ${options.grid.columns};
        gap: ${options.grid.gap};
        margin-top: 0;
      }

      @media (max-width: ${options.grid.minWidth}) {
        .components-grid {
          grid-template-columns: 1fr;
        }
      }

      .component-card {
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 0.75rem;
      }

      .component-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .component-card-header h2 {
        color: var(--component-title);
        font-size: 1.125rem;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .component-card-header h2 i {
        font-size: 1.25rem;
      }

      .component-card-actions {
        display: flex;
        gap: 0.5rem;
      }
      
      .component-visibility-btn,
      .component-settings-btn {
        background: transparent;
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .component-visibility-btn:hover,
      .component-settings-btn:hover {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
      }
      
      .component-card.hidden {
        opacity: 0.5;
        position: relative;
      }
      
      .component-card.hidden::after {
        content: "Hidden";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.1);
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--text-secondary);
        z-index: 10;
      }

      /* Drawer styles */
      .drawer-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .drawer-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      .drawer {
        position: fixed;
        top: 0;
        bottom: 0;
        background-color: var(--bg-primary);
        width: 400px;
        max-width: 100%;
        z-index: 1000;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
        overflow-y: auto;
        opacity: 0;
        visibility: hidden;
      }
      #settingsDrawer {
        width: 500px;
      }
      .drawer.active {
        opacity: 1;
        visibility: visible;
      }

      [dir="ltr"] .drawer {
        right: 0;
        transform: translateX(100%);
      }

      [dir="rtl"] .drawer {
        left: 0;
        transform: translateX(-100%);
      }

      .drawer.active {
        transform: translateX(0);
      }

      .drawer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid var(--border-color);
        background-color: var(--bg-secondary);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .drawer-header h3 {
        margin: 0;
        color: var(--text-primary);
        flex: 1;
        font-size: 1.25rem;
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      
      .drawer-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .drawer-close,
      .drawer-reset {
        background-color: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        cursor: pointer;
        font-size: 1.25rem;
        color: var(--text-secondary);
        padding: 0.5rem;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      
      .drawer-close:hover,
      .drawer-reset:hover {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .drawer-close:active,
      .drawer-reset:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      
      .drawer-reset {
        color: var(--color-primary);
      }
      
      .drawer-close {
        color: var(--color-danger, var(--text-secondary));
      }

      .drawer-content {
        padding: 1rem;
      }
      
      /* Filter drawer styles */
      .filter-actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      
      .btn {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      
      .btn-primary {
        background-color: var(--color-primary-100);
        color: var(--color-primary-900);
      }
      
      .btn-primary:hover {
        background-color: var(--color-primary-50);
      }
      
      .btn-secondary {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
      }
      
      .btn-secondary:hover {
        background-color: var(--bg-primary);
      }
      
      .component-visibility-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        overflow-y: auto;
      }
      
      .visibility-item {
        padding: 0.5rem;
        border-radius: 4px;
        transition: background-color 0.2s ease;
      }
      
      .visibility-item:hover {
        background-color: var(--bg-secondary);
      }
      
      .visibility-item label {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        cursor: pointer;
        color: var(--text-primary);
      }
      
      .visibility-checkbox {
        width: 1.25rem;
        height: 1.25rem;
        cursor: pointer;
      }
      
      /* Settings drawer styles */
      .settings-tabs {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      
      .settings-tab-headers {
        display: flex;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 1rem;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      
      .settings-tab-btn {
        padding: 0.75rem 1rem;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        color: var(--text-secondary);
        cursor: pointer;
        font-weight: 500;
        white-space: nowrap;
        transition: all 0.2s ease;
      }
      
      .settings-tab-btn:hover {
        color: var(--text-primary);
      }
      
      .settings-tab-btn.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }
      
      .settings-tab-content {
        display: none;
        animation: fadeIn 0.3s ease;
      }
      
      .settings-tab-content.active {
        display: block;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .settings-section-title {
        margin: 0 0 0.5rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
      }
      
      .settings-section-desc {
        margin: 0 0 1.5rem;
        font-size: 0.9rem;
        color: var(--text-secondary);
      }
      
      .settings-form-group {
        margin-bottom: 1.25rem;
      }
      
      .settings-form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: var(--text-primary);
      }
      
      .settings-input,
      .settings-textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        font-family: inherit;
        font-size: 0.9rem;
        transition: border-color 0.2s ease;
      }
      
      .settings-input:focus,
      .settings-textarea:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px var(--color-primary-50);
      }
      
      .settings-textarea {
        resize: vertical;
        min-height: 100px;
        direction: ltr;
        font-family: monospace;
        color: #888;
      }
      
      .settings-form-group small {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.8rem;
        color: var(--text-secondary);
      }
      
      .settings-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
      }
      
      /* Language selection styles */
      .settings-languages-container {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--bg-primary);
      }
      
      .settings-languages-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        gap: 0.5rem;
        padding: 0.75rem;
      }
      
      .settings-language-item {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .settings-language-item:hover {
        background-color: var(--bg-secondary);
      }
      
      .settings-language-item input {
        margin: 0;
      }
      
      .settings-language-item span {
        font-size: 0.85rem;
      }
      
      /* Grid presets styles */
      .grid-columns-presets {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      
      .grid-preset-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 40px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--bg-primary);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .grid-preset-btn:hover {
        background-color: var(--bg-secondary);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }
      
      .grid-preset-btn.active {
        border-color: var(--color-primary);
        background-color: var(--color-primary-50);
      }
      
      .grid-preset-icon {
        font-size: 1.25rem;
        color: var(--text-primary);
        letter-spacing: -2px;
      }
      
      .custom-grid-columns-container {
        margin-top: 0.75rem;
      }
      
      /* Input with unit styles */
      .settings-input-with-unit {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      
      .settings-input-number {
        flex: 1;
      }
      
      .settings-input-unit {
        width: 80px;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        font-family: inherit;
        font-size: 0.9rem;
      }
    </style>
  </head>
  <body>
    <header>
      <div class="container">
        <div class="header-content">
          <div class="logo-container">
            <div class="logo">
              <img src="https://cdn.salla.network/images/logo/logo-light-wide.png" alt="Salla">
            </div>
            <h1 class="title" id="pageTitle">${translations.ar.title}</h1>
          </div>
          <div class="actions">
            <button id="toggleSettings" title="Settings" onclick="openSettingsDrawer()" class="sicon-settings"></button>
            <button id="toggleTheme" title="Toggle theme">
              <i class="theme-icon moon sicon-moon"></i>
              <i class="theme-icon sun sicon-lightbulb"></i>
            </button>
            <button id="toggleLang" title="Toggle language">
              <i class="lang-icon sicon-world"></i>
              <span class="lang-code">EN</span>
            </button>
          </div>
        </div>
      </div>
    </header>
    <main>
      <div class="container">
        <div class="components-grid" id="componentsGrid"></div>
      </div>
    </main>
    
    <!-- Drawer overlay -->
    <div class="drawer-overlay" id="drawerOverlay"></div>
    
    <!-- Component settings drawer -->
    <div id="componentDrawer" class="drawer">
      <div class="drawer-header">
        <h3 class="drawer-title">Component Settings</h3>
        <div class="drawer-actions">
          <button id="resetForm" class="drawer-reset" title="Reset to default">
            <i class="sicon-rotate"></i>
          </button>
          <button id="closeDrawer" class="drawer-close">
            <i class="sicon-cancel"></i>
          </button>
        </div>
      </div>
      <div class="drawer-content">
        <div id="formContainer"></div>
      </div>
    </div>
    
    <!-- Settings drawer -->
    <div id="settingsDrawer" class="drawer">
      <div class="drawer-header">
        <h3>Demo Settings</h3>
        <div class="drawer-actions">
          <button class="drawer-close" onclick="closeDrawer()">
            <i class="sicon-cancel"></i>
          </button>
        </div>
      </div>
      <div class="drawer-content">
        <div class="settings-tabs">
          <div class="settings-tab-headers">
            <button class="settings-tab-btn active" data-tab="components">Components</button>
            <button class="settings-tab-btn" data-tab="grid">Grid</button>
            <button class="settings-tab-btn" data-tab="custom-code">Custom Code</button>
            <button class="settings-tab-btn" data-tab="formbuilder">Form Builder</button>
          </div>
          
          <!-- Components Tab -->
          <div class="settings-tab-content active" id="components-tab">
            <h4 class="settings-section-title">Component Visibility</h4>
            <p class="settings-section-desc">Select which components to display in the demo</p>
            
            <div class="component-visibility-list">
              ${components.map(component => `
                <div class="visibility-item">
                  <label>
                    <input type="checkbox"
                    name="component-visibility"
                    class="visibility-checkbox" 
                    value="${component.name}"
                    onchange="toggleComponentVisibility(this)">
                    <span>${component.name}</span>
                  </label>
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Grid Tab -->
          <div class="settings-tab-content" id="grid-tab">
            <h4 class="settings-section-title">Grid Settings</h4>
            <p class="settings-section-desc">Customize the component grid layout</p>
            
            <div class="settings-form-group">
              <label for="gridColumnsPreset">Grid Columns Layout</label>
              <div class="grid-columns-presets">
                <button type="button" class="grid-preset-btn" data-columns="repeat(1, 1fr)" title="1 column">
                  <span class="grid-preset-icon sicon-inbox-multi"></span>
                </button>
                <button type="button" class="grid-preset-btn" data-columns="repeat(2, 1fr)" title="2 columns">
                  <span class="grid-preset-icon sicon-layout-grid"></span>
                </button>
                <button type="button" class="grid-preset-btn" data-columns="repeat(3, 1fr)" title="3 columns">
                  <span class="grid-preset-icon sicon-grid"></span>
                </button>
                <button type="button" class="grid-preset-btn" data-columns="repeat(4, 1fr)" title="4 columns">
                  <span class="grid-preset-icon">▮▮▮▮</span>
                </button>
                <button type="button" class="grid-preset-btn" data-columns="auto-fill" title="Auto-fill">
                  <span class="grid-preset-icon sicon-window-layout"></span>
                </button>
                <button type="button" class="grid-preset-btn grid-preset-custom" data-columns="custom" title="Custom">
                  <span class="grid-preset-icon sicon-settings"></span>
                </button>
              </div>
              <div id="customGridColumnsContainer" class="custom-grid-columns-container">
                <input type="text" id="gridColumns" dir="ltr" class="settings-input" placeholder="repeat(3, 1fr)" value="${options.grid.columns}" data-custom-value="${options.grid.columns}">
                <small>CSS grid-template-columns value</small>
              </div>
            </div>
            
            <div class="settings-form-group">
              <label for="gridGap">Grid Gap</label>
              <div class="settings-input-with-unit">
                <input type="number" id="gridGapValue" class="settings-input settings-input-number" placeholder="1" step="0.1" min="0">
                <select id="gridGapUnit" class="settings-input-unit">
                  <option value="px">px</option>
                  <option value="rem">rem</option>
                  <option value="em">em</option>
                  <option value="%">%</option>
                </select>
              </div>
              <small>Space between grid items</small>
            </div>
            
            <!-- Min Width Breakpoint is now handled by backend only -->
          </div>
          
          <!-- Custom Code Tab -->
          <div class="settings-tab-content" id="custom-code-tab">
            <h4 class="settings-section-title">Custom Code</h4>
            <p class="settings-section-desc">Add custom CSS and JavaScript</p>
            
            <div class="settings-form-group">
              <label for="customCSS">Custom CSS</label>
              <textarea id="customCSS" dir="ltr" class="settings-textarea" rows="6" placeholder="/* Add your custom CSS here */">${options.css || ''}</textarea>
            </div>
            
            <div class="settings-form-group">
              <label for="customJS">Custom JavaScript</label>
              <textarea id="customJS" dir="ltr" class="settings-textarea" rows="6" placeholder="// Add your custom JavaScript here">${options.js || ''}</textarea>
            </div>
          </div>
          
          <!-- Form Builder Tab -->
          <div class="settings-tab-content" id="formbuilder-tab">
            <h4 class="settings-section-title">Form Builder Settings</h4>
            <p class="settings-section-desc">Configure form builder options</p>
            
            <div class="settings-form-group">
              <label for="formbuilderLanguages">Languages</label>
              <select id="formbuilderLanguages" class="settings-input" multiple>
                ${['ar','en','bg','cs','da','de','el','es','et','fa','fi','fr','ga','he','hi','hr','hu','hy','ind','it','ja','ko','lv','mt','nl','pl','pt','ro','ru','sl','sq','sv','tl','tr','uk','ur','zh','bn'].map(lang => `
                  <option value="${lang}" ${options.formbuilder.languages.includes(lang) ? 'selected' : ''}>${lang}</option>
                `).join('')}
              </select>
            </div>
            
            <div class="settings-form-group">
              <label for="formbuilderDefaultLang">Default Language</label>
              <select id="formbuilderDefaultLang" class="settings-input">
                ${['ar','en','bg','cs','da','de','el','es','et','fa','fi','fr','ga','he','hi','hr','hu','hy','ind','it','ja','ko','lv','mt','nl','pl','pt','ro','ru','sl','sq','sv','tl','tr','uk','ur','zh','bn'].map(lang => `
                  <option value="${lang}" ${options.formbuilder.defaultLanguage === lang ? 'selected' : ''}>${lang}</option>
                `).join('')}
              </select>
              <small>Default language for the form builder</small>
            </div>
          </div>
        </div>
        
        <!-- Footer removed as requested -->
      </div>
    </div>
    
    <script>
      const translations = ${JSON.stringify(translations)};
      const toggleTheme = document.getElementById('toggleTheme');
      const toggleLang = document.getElementById('toggleLang');
      
      // Simple debounce function to prevent too many updates
      function debounce(func, wait) {
        let timeout;
        return function(...args) {
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(this, args), wait);
        };
      }
      
      // Get stored preferences or use defaults
      let currentLang = localStorage.getItem('salla_demo_lang') || 'ar';
      let currentTheme = localStorage.getItem('salla_demo_theme') || 'light';

      function __demoTrans(key){
        return translations[currentLang][key];
      }
      // Function to update language
      function updateLanguage(lang) {
        currentLang = lang;
        const dir = currentLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('lang', currentLang);
        document.documentElement.setAttribute('dir', dir);
        localStorage.setItem('salla_demo_lang', currentLang);
        
        // Update language code and title
        const langCode = toggleLang.querySelector('.lang-code');
        const pageTitle = document.getElementById('pageTitle');
        langCode.textContent = currentLang === 'ar' ? 'EN' : 'AR';
        pageTitle.textContent = __demoTrans('title');
      }

      // Function to update theme
      function updateTheme(theme) {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('salla_demo_theme', currentTheme);
      }

      // Initialize with stored or default values
      updateLanguage(currentLang);
      updateTheme(currentTheme);
      

      function initSettings(){
        // Initialize grid settings from localStorage
        const savedGrid = getSavedGrid();
        
        const grid = document.getElementById('componentsGrid');
        if (grid) {
            // Apply grid settings immediately
            if (savedGrid.columns === 'auto-fill') {
                // Apply special auto-fill behavior
                updateGridBasedOnItemCount();
            } else {
                // Apply normal grid columns
                grid.style.gridTemplateColumns = savedGrid.columns;
            }
            grid.style.gap = savedGrid.gap;
        }
        
        // Initialize grid gap inputs with saved values
        const gapMatch = savedGrid.gap.match(/([\d.]+)([a-z%]+)/);
        if (gapMatch && document.getElementById('gridGapValue') && document.getElementById('gridGapUnit')) {
            const [_, gapValue, gapUnit] = gapMatch;
            document.getElementById('gridGapValue').value = gapValue;
            document.getElementById('gridGapUnit').value = gapUnit;
        }
        
        // Initialize grid preset buttons based on saved columns
        const gridColumnsInput = document.getElementById('gridColumns');
        if (gridColumnsInput) {
            gridColumnsInput.value = savedGrid.columns;
            
            // Set the active preset button
            document.querySelectorAll('.grid-preset-btn').forEach(btn => {
                const columns = btn.getAttribute('data-columns');
                if (columns === savedGrid.columns || 
                    (columns === 'auto-fill' && savedGrid.columns === 'auto-fill') || 
                    (columns === 'custom' && !['1', '2', '3', '4', 'auto-fill'].includes(savedGrid.columns))) {
                    
                    // Remove active class from all buttons
                    document.querySelectorAll('.grid-preset-btn').forEach(b => b.classList.remove('active'));
                    // Add active class to this button
                    btn.classList.add('active');
                    
                    // Handle custom preset
                    if (columns === 'custom') {
                        gridColumnsInput.readOnly = false;
                        gridColumnsInput.setAttribute('data-custom-value', savedGrid.columns);
                    } else {
                        gridColumnsInput.readOnly = true;
                    }
                }
            });
        }
        
        // Apply custom CSS if saved
        const savedCSS = Salla.storage.get('salla_demo_custom_css', '');
        if (savedCSS) {
            const customCSSElement = document.createElement('style');
            customCSSElement.id = 'custom-css-element';
            customCSSElement.textContent = savedCSS;
            document.head.appendChild(customCSSElement);
        }
        
        // Apply custom JS if saved
        const savedJS = Salla.storage.get('salla_demo_custom_js', '');
        if (savedJS) {
            try {
            eval(savedJS);
            } catch (error) {
            console.error('Error executing custom JS:', error);
            }
        }
      }
      // Event listeners for theme and language toggles
      toggleTheme.addEventListener('click', () => {
        updateTheme(currentTheme === 'light' ? 'dark' : 'light');
      });

      toggleLang.addEventListener('click', () => {
        updateLanguage(currentLang === 'ar' ? 'en' : 'ar');
      });
      
      // Settings tabs functionality
      document.querySelectorAll('.settings-tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
          const tabId = tab.getAttribute('data-tab');
          if (!tabId) return;
          
          // Update active tab
          document.querySelectorAll('.settings-tab-btn').forEach(t => {
            t.classList.remove('active');
          });
          tab.classList.add('active');
          
          // Update active content
          document.querySelectorAll('.settings-tab-content').forEach(content => {
            content.classList.remove('active');
          });
          document.getElementById(tabId + '-tab')?.classList.add('active');
          
          // Apply settings immediately when switching tabs
          applySettings();
        });
      });
      
      // Grid preset buttons functionality
      document.querySelectorAll('.grid-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          // Remove active class from all buttons
          document.querySelectorAll('.grid-preset-btn').forEach(b => b.classList.remove('active'));
          // Add active class to clicked button
          btn.classList.add('active');
          
          const columns = btn.getAttribute('data-columns');
          const gridColumns = document.getElementById('gridColumns');
          
          if (gridColumns) {
            // If custom preset, enable input and set to custom value
            if (columns === 'custom') {
              gridColumns.readOnly = false;
              gridColumns.value = gridColumns.getAttribute('data-custom-value') || 'repeat(auto-fill, minmax(300px, 1fr))';
            } 
            // If auto-fill preset, disable input and set special value
            else if (columns === 'auto-fill') {
              gridColumns.readOnly = true;
              gridColumns.value = 'auto-fill';
            }
            // For other presets, disable input and set preset value
            else {
              gridColumns.readOnly = true;
              gridColumns.value = columns;
            }
          }
          
          // Apply settings immediately
          applySettings();
          });
        });
      
      // Drawer functionality
      const componentDrawer = document.getElementById('componentDrawer');
      const settingsDrawer = document.getElementById('settingsDrawer');
      const drawerOverlay = document.getElementById('drawerOverlay');
      const drawerClose = componentDrawer?.querySelector('.drawer-close');
      const drawerReset = componentDrawer?.querySelector('.drawer-reset');
      const drawerTitle = componentDrawer?.querySelector('.drawer-title');
      const drawerContent = componentDrawer?.querySelector('.drawer-content');
      
      // Function to open component drawer
      function openDrawer(componentName) {
        // Inject form builder script if it's not loaded yet
        if (!document.getElementById('form-builder-3-script')) {
          const script = document.createElement('script');
          script.id = 'form-builder-3-script';
          script.src = 'https://cdn.assets.salla.network/themes/default/temporary/form-builder-3.js';
          script.async = true;
          document.head.appendChild(script);
        }
        
        if (drawerTitle) drawerTitle.textContent = componentName;
        componentDrawer?.classList.add('active');
        drawerOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
        if(componentDrawer && componentDrawer.currentComponent === componentName){
            return;
        }
        if (componentDrawer) componentDrawer.currentComponent = componentName;
        const schema = schemaForComponent(componentName);

        if(!schema){
            return drawerContent.innerHTML = \`
            <div style="padding: 2rem; text-align: center; color: #666;">
                <div style="margin-bottom: 1rem;">
                  <i class="sicon-info" style="font-size: 3rem; color: #2377CD;"></i>
                </div>
                <h3 style="margin-bottom: 1rem; font-weight: 500;">\${__demoTrans('noSettings')}</h3>
                <p>\${__demoTrans('addSettings')}</p>
                <a href="/twilight-bundle.json" target="_blank">twilight-bundle.json</a>
              </div>
            \`;
        }
        const savedFormbuilder = getSavedLanguages();
        drawerContent.innerHTML = \`
            <form-builder-3
             form-key="form-builder-3"
             form-data='\${schema}'
             save-url="${formBuilderMockUrl}"
             sources-url="${formBuilderMockUrl}/sources"
             upload-url="${formBuilderMockUrl}/uploader"
             direction="v"
             button="start"
             css-url="${formbuilderAssets.join(',')}"
             language-list="\${savedFormbuilder.languages.join(',')}"
             default-language="\${savedFormbuilder.defaultLanguage}"
             submit-label="\${__demoTrans('saveSettings')}"></form-builder-3>
        \`;
      }
      
      // Function to close drawer
      function closeDrawer() {
        document.querySelectorAll('.drawer.active').forEach(element => element.classList.remove('active'));
        drawerOverlay?.classList.remove('active');
        document.body.style.overflow = '';
      }
      
      function resetComponentSettings() {
        // Reset any component settings that need to be updated when form-builder settings change
        // Find all form-builder components and reset them
        const formComponents = document.querySelectorAll('[data-component-type="form-builder"]');
        formComponents.forEach(component => {
          // Trigger a reset or re-render for the component
          component.classList.add('settings-updated');
          setTimeout(() => {
            component.classList.remove('settings-updated');
          }, 1000);
        });
        
        // Trigger custom event for components to listen to
        document.dispatchEvent(new CustomEvent('formbuilder-settings-changed', {
          detail: {
            timestamp: new Date().getTime()
          }
        }));
        
        // Close the component drawer if it's open
        const componentDrawer = document.getElementById('componentDrawer');
        if (componentDrawer?.classList.contains('active')) {
          componentDrawer.classList.remove('active');
          document.getElementById('drawerOverlay')?.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
      
      // Function to reset settings and reload page
      function resetSettings() {
        if (componentDrawer && componentDrawer.currentComponent) {
          localStorage.removeItem('form-builder::' + componentDrawer.currentComponent);
          localStorage.removeItem('form-builder::data_' + componentDrawer.currentComponent);
          reRenderComponent(componentDrawer.currentComponent);
        }
      }
    
      
      // Add event listeners for drawer close and reset
      drawerClose.addEventListener('click', closeDrawer);
      drawerOverlay.addEventListener('click', closeDrawer);
      drawerReset.addEventListener('click', resetSettings);
      (async () => {
        async function waitForCondition(callback, timeout, interval) {
        const start = Date.now();

        while (Date.now() - start < timeout) {
            if (callback()) {
            return true;
            }
            console.log('waiting for window.Salla.onReady...'+(Date.now() - start));
            await new Promise((resolve) => setTimeout(resolve, interval));
        }

        return false;
        }
        await waitForCondition(()=>window.Salla && window.Salla.onReady, 10000, 50);
        await window.Salla.onReady();
        Salla.lang.setLocale(currentLang);  
        const hiddenComponents = Salla.storage.get('hidden-salla-components', []);
        Object.keys(window.customComponentsSchema || {}).forEach(name => renderComponent(name));
        initSettings();
        })();

    </script>
    <style>${options.css}</style>
    <script>${options.js}</script>
  </body>
</html>`
}
