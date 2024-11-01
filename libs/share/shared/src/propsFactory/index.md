---
category: Reactivity
---

# toValue

<FunctionInfo fn="propsFactory" />
propsFactory

## Usage

```ts
import { propsFactory } from '@hungpvq/shared';
const makeProps = propsFactory({
  foo: String,
})
defineComponent({
  props: {
    ...makeProps({
      foo: 'a',
    }),
  },
  setup (props) {
    // would be "string | undefined", now "string" because a default has been provided
    props.foo
  },
}
```
