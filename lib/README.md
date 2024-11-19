# Standard Types Library

You can install the underlying types to use the standard objects in your own
applications:

```
npm install --save @fleker/standard-feeds
```


From there, you can import various objects with their respective functions

```typescript
import {Todo, todoToString, toString} from '@fleker/standard-feeds'
const todo = {
  summary: 'Clean the gutters',
  // ...
}

console.log(todoToString(todo)) // Prints one TODO
console.log(toString('My Todo List', {
  todo: [todo],
  events: undefined
})) // Prints all TODOs, Events, and more (once added)
```

It supports
- VCALENDAR
  - VEVENT
  - VTODO
- RSS
- Description Modules

## Description Modules

For projects that may benefit from an extensions system, and where you are able
to add arbitrary strings somewhere, you may want to use description modules.
They simply are used in order to embed information that a given extension may want to refer to later on, a simple service ID, URL, or JSON object.

For example, I may have a VTODO service that pulls in issues from GitHub. I can
add a description module at the bottom of the TODO description to point to the
GitHub extension.

```
Also add a README
#github #documentation
{@github: https://github.com/Fleker/chipyard-viewer/issues/10 /}
```

Then, in my GitHub service, I can parse the module and its params and do
whatever custom logic makes sense for my application.

This is especially useful in cases where you don't control the data source. For
example, a feed of events are going to be in a VEVENT format. There isn't an
opportunity for custom fields. As such, you can embed additional data into the
description of the event. This won't have any effect on loading the data into
external applications, but your application can make special use of it.

### Syntax

The syntax is meant to be straightforward and largely readable while being
distinct enough to not be accidentally produced:

```
{@
```

This is the start of embedded module data.

```
github
```

This is the module ID. For your application, you'll want to have some kind of
global store of unique IDs to prevent duplicate modules. You can point to some
kind of map with whatever custom callbacks or param parsers you want.

```
:
```

The colon separates the module ID from the module params.

```
https://github.com/Fleker/chipyard-viewer/issues/10
```

The other side of the module ID are the params. This should be either a
single string (a unique platform ID, URL, or other identifying value) or a
stringified JSON object.

The type depends on your application and what data you want to embed close to
the data source.

```
 /}
```

These two characters close the embedding.

### Usage

While the tools don't limit the number of embeddings, you may want to consider
how that would work in your application.

**Note**: Currently you should trim the `param` to ensure no whitespace leads
to matching issues.

```typescript
import { encodeModule, parseModule } from './module-parser';

// Take our tasks from Google Tasks, map the embedding ID to the Google Task internal ID
const existingTasks: Record<string, string> = {}
for (const gtask of gtasks) {
  const parsedModules = parseModule(gtask.notes ?? '')
  const usesThisModule = parsedModules.find(x => x.module === key)
  if (usesThisModule) {
    existingTasks[module.getUid(usesThisModule.param).trim()] = gtask.id!
  }
}

// Encode the description with the embedding
const tags = `#${mtask.moduleId} ${mtask.categories?.map(c => `#${c}`)}`
const encoding = encodeModule({module: mtask.moduleId, param: mtask.moduleParams})
const notes = `${mtask.description}\n${tags}\n${encoding}`
```
