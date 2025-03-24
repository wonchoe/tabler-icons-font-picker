/**
 * TablerPicker - SVG Icon Picker with Category Support
 * 
 * @author Oleksii Semeniuk
 * @github https://github.com/wonchoe/tabler-icons-font-picker
 * @license MIT
 * @version 1.0.0
 */
 
(function (global) {
    class TablerPicker {
      static create(options) {
        return new TablerPicker(options);
      }
  
      constructor({ el, onPick, popupWidth = 300, popupHeight = 500, direction = 'down', buttonWidth, ignoreList = [], jsonUrl = null, jsonObject = null, defaultCategory = null }) {
        this.container = el;
        this.onPick = onPick;
        this.popupWidth = popupWidth;
        this.popupHeight = popupHeight;
        this.direction = direction;
        this.buttonWidth = buttonWidth;
        this.ignoreList = ignoreList;
        this.panel = null;
        this.baseUrl = '';
        this.categories = {};
        this.filteredIcons = [];
        this.selectEl = null;
        this.iconsLoaded = false;
        this.jsonUrl = jsonUrl;
        this.jsonObject = jsonObject;
        this.defaultCategory = defaultCategory;
  
        this._createStyles();
        this._createStructure();
        this._attachEvents();
        this._loadIcons();
        this._observeSelectedIcon();
        this._observeContainerRemoval();
      }
  
      _observeContainerRemoval() {
        this._removalObserver = new MutationObserver(() => {
          if (!document.body.contains(this.container)) {
            this.destroy();
          }
        });
        this._removalObserver.observe(document.body, { childList: true, subtree: true });
      }
  
      destroy() {
        if (this.buttonWrapper && this.buttonWrapper.parentNode) {
          this.buttonWrapper.remove();
        }
        if (this._removalObserver) {
          this._removalObserver.disconnect();
        }
        if (this._mutationObserver) {
          this._mutationObserver.disconnect();
        }
        document.removeEventListener('click', this._boundClickHandler);
  
        this.container = null;
        this.panel = null;
        this.button = null;
        this.buttonWrapper = null;
        this.selectEl = null;
        this.filteredIcons = [];
        this.categories = {};
        this.iconsLoaded = false;
      }
  
      _getBasePath() {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
          if (script.src.includes('tablerClass.js')) {
            return script.src.substring(0, script.src.lastIndexOf('/') + 1);
          }
        }
        return './';
      }
  
      _createStyles() {
        const style = document.createElement('style');
        style.textContent = `
          .icon-picker-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            max-height: 230px;
            overflow-y: auto;
            padding: 10px;
          }
          .icon-picker-grid img {
            width: 40px;
            height: 40px;
            padding: 8px;
            border-radius: 4px;
            transition: box-shadow 0.2s, border 0.2s, background 0.2s;
          }
          .icon-picker-grid img:hover {
            background: rgba(0, 0, 0, 0.04);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
          .icon-picker-button {
            display: flex;
            align-items: center;
            padding: 5px 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
            background: #FAFBFC;
            width: var(--icon-picker-btn-width, max-content);
            position: relative;
          }
          .icon-picker-button:hover {
            background: #F3F4F6;
          }
          .icon-picker-button img {
            width: 24px;
            height: 24px;
            margin-right: 8px;
          }
          .icon-picker-button span {
            flex-grow: 1;
            text-align: left;
          }
          .icon-picker-panel {
            display: none;
            position: absolute;
            width: var(--icon-picker-width, 300px);
            max-height: var(--icon-picker-height, 300px);
            overflow-y: auto;
            background: white;
            padding: 8px;
            border-radius: 4px;
            box-shadow: 0px 2px 6px rgba(0,0,0,0.1);
            z-index: 1000;
          }
          .icon-picker-panel input,
          .icon-picker-panel select {
            width: 100%;
            margin-bottom: 8px;
            padding: 6px 8px;
            border-radius: 4px;
            border: 1px solid #ccc;
          }
        `;
        document.head.appendChild(style);
      }
  
      _createStructure() {
        this.buttonWrapper = document.createElement('div');
        this.buttonWrapper.style.position = 'relative';
        this.buttonWrapper.style.display = 'inline-block';
        this.container.appendChild(this.buttonWrapper);
  
        this._createButton();
        this._createPanel();
        this.buttonWrapper.appendChild(this.button);
        this.buttonWrapper.appendChild(this.panel);
      }
  
      _createButton() {
        this.button = document.createElement('div');
        this.button.className = 'icon-picker-button';
        this.button.style.setProperty('--icon-picker-btn-width', this.buttonWidth || 'max-content');
        this.button.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!this.iconsLoaded) return;
          const isVisible = window.getComputedStyle(this.panel).display !== 'none';
          this.panel.style.display = isVisible ? 'none' : 'block';
        });
  
        this.iconImg = document.createElement('img');
        this.titleSpan = document.createElement('span');
        this.button.appendChild(this.iconImg);
        this.button.appendChild(this.titleSpan);
  
        this._updateIcon();
      }
  
      _createPanel() {
        const panel = document.createElement('div');
        panel.className = 'icon-picker-panel';
        panel.style.setProperty('--icon-picker-width', this.popupWidth + 'px');
        panel.style.setProperty('--icon-picker-height', this.popupHeight + 'px');
  
        switch (this.direction) {
          case 'right':
            panel.style.left = '100%';
            panel.style.top = '0';
            panel.style.marginLeft = '8px';
            break;
          case 'left':
            panel.style.right = '100%';
            panel.style.top = '0';
            panel.style.marginRight = '8px';
            break;
          case 'up':
            panel.style.bottom = '100%';
            panel.style.left = '0';
            panel.style.marginBottom = '8px';
            break;
          case 'down':
          default:
            panel.style.top = '100%';
            panel.style.left = '0';
            panel.style.marginTop = '8px';
            break;
        }
  
        this.panel = panel;
      }
  
      _updateIcon() {
        const details = this.container.dataset.details;
        let iconName = this.container.dataset.selectedIcon || '';
  
        if (iconName.includes('.')) {
          const parts = iconName.split('.');
          const category = parts[0];
          iconName = parts.slice(1).join('.');
        } else if (details) {
          try {
            const parsed = JSON.parse(details);
            if (parsed.icon) iconName = parsed.icon;
          } catch (e) {}
        }
  
        const icon = this._getIconByName(iconName);
        if (icon) {
          this.iconImg.src = this.baseUrl + icon.path;
          this.titleSpan.textContent = icon.file.replace('.svg', '');
        }
      }
  
      _getDefaultIcon() {
        const fallbackCategory = Object.keys(this.categories)[0];
        const category = this.defaultCategory && this.categories[this.defaultCategory] ? this.defaultCategory : fallbackCategory;
        const firstIcon = this.categories[category]?.[0];
  
        if (category && firstIcon) {
          return {
            icon: firstIcon.file,
            path: firstIcon.path,
            ref: `${category}.${firstIcon.file}`
          };
        }
  
        return {
          icon: '',
          path: '',
          ref: ''
        };
      }
  
  
      _getIconByName(name) {
        const allIcons = Object.values(this.categories).flat();
        return allIcons.find(icon => icon.file === name);
      }
  
      _observeSelectedIcon() {
        const observer = new MutationObserver(() => this._updateIcon());
        observer.observe(this.container, { attributes: true, attributeFilter: ['data-selected-icon', 'data-details'] });
      }
  
      _attachEvents() {
        document.addEventListener('click', (e) => {
          if (!this.panel.contains(e.target) && !this.button.contains(e.target)) {
            this.panel.style.display = 'none';
          }
        });
      }
  
      _loadIcons() {
        if (this.jsonObject) {
          this._applyIconData(this.jsonObject);
        } else {
          const urlToFetch = this.jsonUrl || (this._getBasePath() + 'icon-categories.json');
          fetch(urlToFetch)
            .then(res => res.json())
            .then(data => this._applyIconData(data))
            .catch(err => {
              this.panel.innerHTML = '<p style="color:red">Failed to load icons</p>';
              console.error('Icon Picker Error:', err);
            });
        }
      }

      _applyIconData(data) {
        this.baseUrl = data.baseUrl?.endsWith('/') ? data.baseUrl : (data.baseUrl || '') + '/';
        this.categories = data.categories || {};
        this._filterIgnoredCategories();
        this._buildCategorySelector();
        this._preloadDefaultCategory();
        this.iconsLoaded = true;
  
        if (!this.container.dataset.details && !this.container.dataset.selectedIcon) {
          const def = this._getDefaultIcon();
          this.container.dataset.details = JSON.stringify(def);
          this.container.dataset.selectedIcon = def.ref;
        }
  
        this._updateIcon();
      }      
  
      _filterIgnoredCategories() {
        for (const category of this.ignoreList) {
          delete this.categories[category];
        }
      }
  
      _preloadDefaultCategory() {
        const fallbackCategory = Object.keys(this.categories)[0];
        const preloadCategory = this.defaultCategory && this.categories[this.defaultCategory] ? this.defaultCategory : fallbackCategory;
        if (preloadCategory) {
          this._renderCategoryIcons(preloadCategory);
          if (this.selectEl) {
            this.selectEl.value = preloadCategory;
          }
        }
      }

      _attachEvents() {
        this._boundClickHandler = (e) => {
          if (!this.panel.contains(e.target) && !this.button.contains(e.target)) {
            this.panel.style.display = 'none';
          }
        };
        document.addEventListener('click', this._boundClickHandler);
      }      
  
      _buildCategorySelector() {
        this.panel.innerHTML = '';
  
        const search = document.createElement('input');
        search.type = 'text';
        search.placeholder = 'Search icons...';
        this.panel.appendChild(search);
  
        const select = document.createElement('select');
        this.selectEl = select;
  
        const defaultOption = document.createElement('option');
        defaultOption.textContent = '-- Choose Category --';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);
  
        for (const category in this.categories) {
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          select.appendChild(option);
        }
  
        select.addEventListener('change', () => {
          search.value = '';
          this._renderCategoryIcons(select.value);
        });
  
        search.addEventListener('input', () => {
          const val = search.value.toLowerCase();
          const allIcons = Object.values(this.categories).flat();
          const filtered = allIcons.filter(icon =>
            icon.file.toLowerCase().includes(val)
          );
          this._renderIcons(filtered);
        });
  
        this.panel.appendChild(select);
        this.gridContainer = document.createElement('div');
        this.panel.appendChild(this.gridContainer);
      }
  
      _renderCategoryIcons(category) {
        if (!category) return;
        this.filteredIcons = this.categories[category];
        this._renderIcons(this.filteredIcons, category);
      }
  
      _renderIcons(icons, category = null) {
        this.gridContainer.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'icon-picker-grid';
  
        const batchSize = 50;
        let loadedCount = 0;
  
        const loadMore = () => {
          const slice = icons.slice(loadedCount, loadedCount + batchSize);
          slice.forEach(icon => {
            const img = document.createElement('img');
            img.src = this.baseUrl + icon.path;
            img.title = icon.file;
            img.style.cursor = 'pointer';
  
            img.addEventListener('click', () => {
              const iconCategory = category || this._findCategoryByIcon(icon);
              const details = {
                icon: icon.file,
                path: icon.path,
                ref: iconCategory ? `${iconCategory}.${icon.file}` : icon.file
              };
              this.container.dataset.selectedIcon = details.ref;
              this.container.dataset.details = JSON.stringify(details);
              this.panel.style.display = 'none';
              if (typeof this.onPick === 'function') {
                this.onPick({
                  ...icon,
                  fullUrl: this.baseUrl + icon.path,
                  ref: details.ref
                });
              }
              console.log('Selected icon:', details);
            });
  
            grid.appendChild(img);
          });
          loadedCount += slice.length;
        };
  
        grid.addEventListener('scroll', () => {
          if (grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 10) {
            loadMore();
          }
        });
  
        loadMore();
        this.gridContainer.appendChild(grid);
      }
  
      _findCategoryByIcon(icon) {
        for (const category in this.categories) {
          if (this.categories[category].some(i => i.file === icon.file)) {
            return category;
          }
        }
        return null;
      }
    }
  
    global.TablerPicker = TablerPicker;
  })(window);
  