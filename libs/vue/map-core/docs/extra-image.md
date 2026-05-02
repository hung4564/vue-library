# Extra Image

## Usage

```ts
import { useMapImage } from '@hungpvq/vue-map-core';
```

## imageStore

```ts
import { useMapImage } from '@hungpvq/vue-map-core';
const imageHandle = useMapImage()
imageHandle.addImage(
  mapId: string,
  key: string,
  image_url: string,
  option: any = {}
): Promise<void>
```

---

## How to Use Store & Hook

### 1. Using the Store (`useMapImage`)

The `useMapImage` store provides methods to manage images for each map instance via `mapId`.

**Import:**

```ts
import { useMapImage } from '@hungpvq/vue-map-core';
```

**API:**

```ts
const imageHandle = useMapImage();

imageHandle.addImage(
  mapId: string,
  key: string,
  image_url: string,
  option: any = {}
): Promise<void>
```

**Example:**

```ts
const imageHandle = useMapImage();
await imageHandle.addImage('map1', 'custom-marker', 'https://example.com/marker.png', { pixelRatio: 2 });
```

### 2. Using the Hook (`useMapImages`)

The `useMapImages` hook provides a reactive way to work with all images of a specific map.

**Import:**

```ts
import { useMapImages } from '@hungpvq/vue-map-core';
```

**Usage:**

```ts
const { images, reload, toDataURL } = useMapImages(mapId);

// `images` is a reactive object containing all images of the map
// `reload()` can be called to refresh the image list
// `toDataURL(id, imageData)` converts an image to a data URL
```

**Example:**

```ts
import { useMapImages } from '@hungpvq/vue-map-core';

const { images, reload, toDataURL } = useMapImages('map1');

// Access all images
console.info(images.value);

// Reload images when needed
reload();

// Convert an image to data URL
const dataUrl = toDataURL('custom-marker', images.value['custom-marker']);
```

**Explanation:**

- `useMapImage(mapId)` provides methods to add images to a map.
- `useMapImages(mapId)` gives you a reactive list of all images and utility methods for image handling.

---

#### Summary

- Use `useMapImage` for direct store operations (add images to a map).
- Use `useMapImages` for reactive image handling in components (list, reload, convert images).
