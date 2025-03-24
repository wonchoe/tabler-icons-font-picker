# 🌟 TablerPicker - SVG Icon Picker

<img src="/assets/tabler.jpg" width="400px" alt="TablerPicker Preview">

**TablerPicker** is a lightweight, customizable JavaScript library that allows users to select SVG icons from organized categories. Ideal for CMS, form builders, admin panels, or any web application where icon selection is needed.

<h2>🔗 Live Demo</h2>

<p align="center">
  👉 <a href="https://wonchoe.github.io/tabler-icons-font-picker/" target="_blank">
    <strong>Click here to try the demo</strong>
  </a>
</p>
---

## 🚀 Features

- 📁 Category support
- 🔎 Icon search
- 🌀 Lazy loading for performance
- 🛠 Fully customizable (dimensions, direction, category filtering)
- 🧠 Supports data attributes (`data-selected-icon`, `data-details`)
- 🧩 Supports custom icon sets via JSON or JS object
- 📌 Default category selection
- 💥 Auto-destroy when container is removed
- 🧼 Manual `destroy()` method to clean up

---

## 🔧 Basic Usage

### 📦 Setup

```html
<!-- Include the script -->
<script src="./tablerClass.js"></script>

<!-- The container element -->
<div id="iconInput"></div>

<!-- Initialize the picker -->
<script>
  const input = document.getElementById('iconInput');

  TablerPicker.create({
    el: input,
    popupWidth: 400,
    popupHeight: 500,
    direction: 'down',
    ignoreList: [
      'Extensions', 'Version control', 'Charts', 'Development',
      'Arrows', 'Computers', 'Electrical', 'Database', 'Text',
      'Devices', 'Media', 'Math', 'Design', 'Badges', 'Logic',
      'Document', 'Photography', 'Currencies'
    ],
    defaultCategory: 'UI', // ⬅️ Load a preferred category by default
    onPick: (icon) => {
      console.log('✅ Picked icon:', icon);
      // icon = { file, path, fullUrl, ref }
    }
  });
</script>
```

---

## 🧩 Using `jsonObject` instead of `jsonUrl`

You can pass your own icon data directly as a JavaScript object:

```js
const myIcons = {
  baseUrl: '/icons/',
  categories: {
    UI: [
      { file: 'menu.svg', path: 'ui/menu.svg' },
      { file: 'close.svg', path: 'ui/close.svg' }
    ],
    Social: [
      { file: 'facebook.svg', path: 'social/facebook.svg' }
    ]
  }
};

TablerPicker.create({
  el: document.getElementById('iconInput'),
  jsonObject: myIcons,
  defaultCategory: 'UI',
  onPick: (icon) => {
    console.log('Icon picked:', icon);
  }
});
```

No `fetch()` required — fast and fully customizable.

---

## ⚙️ Parameters

| Parameter         | Type       | Default         | Description |
|------------------|------------|------------------|-------------|
| `el`             | HTMLElement| —                | Required. The DOM element to attach the picker to |
| `onPick`         | Function   | —                | Callback fired when an icon is picked |
| `popupWidth`     | Number     | `300`            | Popup width in pixels |
| `popupHeight`    | Number     | `300`            | Popup height in pixels |
| `direction`      | String     | `'down'`         | Direction of popup (`'up'`, `'down'`, `'left'`, `'right'`) |
| `buttonWidth`    | String     | `'max-content'`  | Width of the main button |
| `ignoreList`     | Array      | `[]`             | List of category names to hide from the picker |
| `jsonUrl`        | String     | —                | Path to a custom JSON file with icons |
| `jsonObject`     | Object     | —                | Provide a JS object instead of a remote JSON file |
| `defaultCategory`| String     | `first available`| Specify which category to show and use by default |

---

## 🔄 Destroying the Picker

You can manually destroy a picker instance to clean up DOM and memory:

```js
const picker = TablerPicker.create({...});
...
picker.destroy();
```

Or let it auto-destroy when its container is removed from the DOM (default behavior).

---

## 🧠 Using with `dataset` attributes

You can pre-select or dynamically change icons using the `data-selected-icon` attribute:

```js
const input = document.getElementById('iconInput');
input.dataset.selectedIcon = 'outline.alarm.svg';
```

This will:
- Select the icon named `alarm.svg`
- From the category `outline`
- Automatically render the icon on the button
- Update the full metadata in `dataset.details`

### Example `dataset.details` value:

```html
data-details='{
  "icon": "send-2.svg",
  "path": "outline/send-2.svg",
  "ref": "Communication.send-2.svg"
}'
data-selected-icon="Communication.send-2.svg"
```

This includes:
- `icon`: The filename
- `path`: Path relative to the icon base
- `ref`: Full reference in the format `Category.filename.svg`

---

## ✏️ Custom Icons Support

You can fully replace the icon set with your own:
- Replace the contents of `icon-categories.json` with your custom categories and icon paths
- Or provide a full JS object via `jsonObject`
- Store your SVGs locally or use a CDN
- Update the `baseUrl` field inside the JSON or object

```json
{
  "baseUrl": "./icons",
  "categories": {
    "MyIcons": [
      { "file": "rocket.svg", "path": "my-icons/rocket.svg" }
    ]
  }
}
```

This makes it possible to turn TablerPicker into your **own custom icon library**.

---

## 🧾 License

MIT — use, modify and share freely 🚀  
Icons belong to their respective author Tabler. Attribution is appreciated.

---

Crafted with ❤️ for frontend devs.
