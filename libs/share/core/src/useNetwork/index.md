---
category: Sensors
---

<script setup>
import Demo from './demo.vue'
</script>

# useNetwork

<FunctionInfo fn="useNetwork" :frontmatter="$frontmatter" package="Share - Core" />

Reactive [Network status](https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API). The Network Information API provides information about the system's connection in terms of general connection type (e.g., 'wifi', 'cellular', etc.). This can be used to select high definition content or low definition content based on the user's connection. The entire API consists of the addition of the NetworkInformation interface and a single property to the Navigator interface: Navigator.connection.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```js
import { useNetwork } from '@hungpvq/shared-core';

const { isOnline, offlineAt, downlink, downlinkMax, effectiveType, saveData, type } = useNetwork();

console.info(isOnline.value);
```

To use as an object, wrap it with `reactive()`

```js
import { reactive } from 'vue';

const network = reactive(useNetwork());

console.info(network.isOnline);
```
