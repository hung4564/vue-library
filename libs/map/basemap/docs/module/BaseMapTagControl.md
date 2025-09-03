## BaseMap Tag Control

#### Props

<!--@include: ../../core/module/props.md-->

and

| Prop             | Description   | Type     | Required | Default Value     |
| ---------------- | ------------- | -------- | -------- | ----------------- |
| `defaultBaseMap` |               | `string` | `fasle`  | `Open Street Map` |
| `baseMaps`       | BaseMapItem[] | `array`  | `fasle`  | ``                |

#### Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

#### Events

| Event            | Payload   | Description                |
| ---------------- | --------- | -------------------------- |
| `basemap-change` | `Basemap` | Fired when basemap changes |
