# Preact Headmaster

Preact Headmaster is a lightweight and efficient head management library for Preact applications, inspired by React Helmet. It allows you to easily manage your document head, including title, meta tags, and other HTML head elements.

## Installation

```bash
npm install preact-headmaster
```

or

```bash
yarn add preact-headmaster
```

## Usage

```jsx
import { h } from 'preact';
import { Headmaster } from 'preact-headmaster';

function App() {
  return (
    <div>
      <Headmaster>
        <title>My Awesome App</title>
        <meta name="description" content="This is my awesome Preact app" />
        <link rel="canonical" href="https://myapp.com" />
      </Headmaster>
      <h1>Welcome to My App</h1>
    </div>
  );
}
```

## Features

- Declarative head management
- Support for all valid HTML head tags
- Server-side rendering support
- TypeScript support
- Lightweight and optimized for Preact

## API

### `<Headmaster>`

The main component for managing head elements.

```jsx
<Headmaster
  title="Page Title"
  meta={[{ name: "description", content: "Page description" }]}
  link={[{ rel: "canonical", href: "https://myapp.com" }]}
  // ... other head elements
>
  {/* Optional child elements */}
</Headmaster>
```

### `useHeadmaster()`

A hook for using Headmaster in functional components.

```jsx
import { useHeadmaster } from 'preact-headmaster';

function MyComponent() {
  useHeadmaster({
    title: 'My Page',
    meta: [{ name: 'description', content: 'Page description' }],
  });

  return <div>Page content</div>;
}
```

### `renderServerHeadmaster()`

A function for server-side rendering.

```jsx
import { renderServerHeadmaster } from 'preact-headmaster';

// In your server-side rendering logic
const headContent = renderServerHeadmaster();
```

## Server-Side Rendering

Preact Headmaster supports server-side rendering out of the box. Use the `renderServerHeadmaster()` function in your server-side code to generate the necessary head content.

## TypeScript Support

Preact Headmaster includes TypeScript definitions for improved developer experience and type safety.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgements

Inspired by [React Helmet](https://github.com/nfl/react-helmet) and adapted for Preact.
