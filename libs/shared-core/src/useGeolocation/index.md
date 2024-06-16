---
category: Sensors
---

<script setup>
import Demo from './demo.vue'
</script>

# useGeolocation

<FunctionInfo :frontmatter="$frontmatter" package="Share - Core" fn="useGeolocation" />

Reactive [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API). It allows the user to provide their location to web applications if they so desire. For privacy reasons, the user is asked for permission to report location information.

## Demo

<DemoContainer>
  <Demo />
</DemoContainer>

## Usage

```js
import { useGeolocation } from '@hungpvq/shared-core';

const { coords, locatedAt, error, resume, pause } = useGeolocation();
```

| State     | Type                                                                          | Description                                                              |
| --------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| coords    | [`Coordinates`](https://developer.mozilla.org/en-US/docs/Web/API/Coordinates) | information about the position retrieved like the latitude and longitude |
| locatedAt | `Date`                                                                        | The time of the last geolocation call                                    |
| error     | `string`                                                                      | An error message in case geolocation API fails.                          |
| resume    | `function`                                                                    | Control function to resume updating geolocation                          |
| pause     | `function`                                                                    | Control function to pause updating geolocation                           |

## Config

`useGeolocation` function takes [PositionOptions](https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions) object as an optional parameter.
