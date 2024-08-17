# Preact Headmaster

Preact Headmaster is a lightweight and efficient head management library for Preact applications, inspired by React Helmet. It allows you to easily manage your document head, including title, meta tags, and other HTML head elements.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [API Reference](#api-reference)
4. [Project Setup](#project-setup)
5. [Full Source Code](#full-source-code)
6. [Building and Publishing](#building-and-publishing)

## Installation

```bash
npm install preact-headmaster
```

or

```bash
yarn add preact-headmaster
```

## Usage

Import the `Headmaster` component in your Preact application:

```jsx
import { h } from 'preact';
import { Headmaster } from 'preact-headmaster';

function App() {
  return (
    <div>
      <Headmaster>
        <title>My Awesome App</title>
        <meta name="description" content="This is my awesome Preact app" />
      </Headmaster>
      {/* Your app content */}
    </div>
  );
}
```

## API Reference

### `<Headmaster>`

The main component for managing head elements.

Props:

- `title`: (string) Sets the document title
- `base`: (object) Sets the base tag
- `meta`: (array of objects) Sets meta tags
- `link`: (array of objects) Sets link tags
- `style`: (array of objects) Sets style tags
- `script`: (array of objects) Sets script tags
- `noscript`: (array of objects) Sets noscript tags
- `htmlAttributes`: (object) Sets attributes on the `<html>` tag
- `bodyAttributes`: (object) Sets attributes on the `<body>` tag

### `useHeadmaster(headmasterData: HeadmasterProps): { rerender: () => void }`

A custom hook for using Headmaster functionality in functional components.

### `renderServerHeadmaster(): string`

A function for server-side rendering of Headmaster elements.

## Project Setup

To set up the Preact Headmaster project, follow these steps:

1. Create a new directory and initialize a new npm project:

```bash
mkdir preact-headmaster
cd preact-headmaster
npm init -y
```

2. Install necessary dependencies:

```bash
npm install --save-dev vite @preact/preset-vite typescript @types/node
```

3. Create the following project structure:

```
preact-headmaster/
├── src/
│   └── index.ts
├── dist/
├── tsconfig.json
├── vite.config.ts
└── package.json
```

4. Configure TypeScript (tsconfig.json):

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "jsxImportSource": "preact",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

5. Configure Vite (vite.config.ts):

```typescript
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';
import pkg from './package.json';

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PreactHeadmaster',
      fileName: (format) => `preact-headmaster.${format}.js`
    },
    rollupOptions: {
      external: [...Object.keys(pkg.peerDependencies || {})],
      output: {
        globals: {
          preact: 'preact'
        }
      }
    }
  }
});
```

6. Update package.json:

```json
{
  "name": "preact-headmaster",
  "version": "1.0.0",
  "description": "A lightweight and efficient head management library for Preact applications",
  "main": "dist/preact-headmaster.umd.js",
  "module": "dist/preact-headmaster.es.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "keywords": ["preact", "head", "management", "seo"],
  "author": "Your Name",
  "license": "MIT",
  "peerDependencies": {
    "preact": "^10.0.0"
  },
  "devDependencies": {
    "@preact/preset-vite": "^2.5.0",
    "@types/node": "^18.15.11",
    "typescript": "^5.0.4",
    "vite": "^4.3.1"
  }
}
```

## Full Source Code

Place the following code in `src/index.ts`:

```typescript
import { h, VNode } from 'preact';
import { useEffect, useState, useRef } from 'preact/hooks';

export interface HeadmasterProps {
  title?: string;
  base?: BaseTagAttributes;
  meta?: MetaTagAttributes[];
  link?: LinkTagAttributes[];
  style?: StyleTagAttributes[];
  script?: ScriptTagAttributes[];
  noscript?: NoscriptTagAttributes[];
  htmlAttributes?: Record<string, string>;
  bodyAttributes?: Record<string, string>;
  children?: VNode | VNode[];
}

interface BaseTagAttributes { href?: string; target?: string }
interface MetaTagAttributes { name?: string; property?: string; content?: string; [key: string]: string | undefined }
interface LinkTagAttributes { rel?: string; href?: string; [key: string]: string | undefined }
interface StyleTagAttributes { type?: string; [key: string]: string | undefined }
interface ScriptTagAttributes { type?: string; src?: string; async?: boolean; defer?: boolean; [key: string]: string | boolean | undefined }
interface NoscriptTagAttributes { [key: string]: string | undefined }

const VALID_TAG_NAMES = ['base', 'meta', 'link', 'style', 'script', 'noscript'];

let serverHeadmasterData: HeadmasterProps = {};

const isServer = typeof window === 'undefined';

const createOrUpdateElement = (tagName: string, attributes: Record<string, any>, innerHTML?: string): HTMLElement => {
  const element = document.head.querySelector(`${tagName}[data-headmaster]`) || document.createElement(tagName);
  element.setAttribute('data-headmaster', '');
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, String(value));
    }
  });

  if (innerHTML !== undefined) {
    element.innerHTML = innerHTML;
  }

  return element;
};

export const useHeadmaster = (headmasterData: HeadmasterProps): { rerender: () => void } => {
  const [, setUpdate] = useState(0);
  const prevHeadmasterDataRef = useRef<HeadmasterProps>({});

  useEffect(() => {
    if (isServer) {
      serverHeadmasterData = { ...serverHeadmasterData, ...headmasterData };
      return;
    }

    const elements: HTMLElement[] = [];
    const prevHeadmasterData = prevHeadmasterDataRef.current;

    if (headmasterData.title !== prevHeadmasterData.title) {
      document.title = headmasterData.title || '';
    }

    if (headmasterData.htmlAttributes !== prevHeadmasterData.htmlAttributes) {
      Object.entries(headmasterData.htmlAttributes || {}).forEach(([key, value]) => {
        document.documentElement.setAttribute(key, value);
      });
    }

    if (headmasterData.bodyAttributes !== prevHeadmasterData.bodyAttributes) {
      Object.entries(headmasterData.bodyAttributes || {}).forEach(([key, value]) => {
        document.body.setAttribute(key, value);
      });
    }

    VALID_TAG_NAMES.forEach((tagName) => {
      const currentAttributes = headmasterData[tagName as keyof HeadmasterProps];
      const prevAttributes = prevHeadmasterData[tagName as keyof HeadmasterProps];

      if (currentAttributes !== prevAttributes) {
        if (Array.isArray(currentAttributes)) {
          currentAttributes.forEach((attributes: Record<string, any>) => {
            const element = createOrUpdateElement(tagName, attributes);
            document.head.appendChild(element);
            elements.push(element);
          });
        } else if (typeof currentAttributes === 'object' && currentAttributes !== null) {
          const element = createOrUpdateElement(tagName, currentAttributes);
          document.head.appendChild(element);
          elements.push(element);
        }
      }
    });

    prevHeadmasterDataRef.current = headmasterData;

    return () => {
      elements.forEach((element) => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    };
  }, [headmasterData]);

  return {
    rerender: () => setUpdate((prev) => prev + 1),
  };
};

export const Headmaster = ({ children, ...props }: HeadmasterProps): VNode | null => {
  useHeadmaster(props);
  return children as VNode | null;
};

export const renderServerHeadmaster = (): string => {
  if (!isServer) {
    throw new Error('renderServerHeadmaster should only be called on the server side');
  }

  let headmasterString = '';

  if (serverHeadmasterData.title) {
    headmasterString += `<title>${serverHeadmasterData.title}</title>`;
  }

  VALID_TAG_NAMES.forEach((tagName) => {
    const attributes = serverHeadmasterData[tagName as keyof HeadmasterProps];
    if (Array.isArray(attributes)) {
      attributes.forEach((attrs: Record<string, any>) => {
        headmasterString += `<${tagName} ${Object.entries(attrs)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ')} />`;
      });
    } else if (typeof attributes === 'object' && attributes !== null) {
      headmasterString += `<${tagName} ${Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ')} />`;
    }
  });

  return headmasterString;
};
```

## Building and Publishing

To build and prepare the package for npm:

1. Build the package:

```bash
npm run build
```

2. Create a `.npmignore` file to exclude unnecessary files from the npm package:

```
src
tsconfig.json
vite.config.ts
.gitignore
```

3. Prepare the package for publication:

```bash
npm pack
```

4. If everything looks good, publish the package:

```bash
npm publish
```

Note: Before publishing, make sure to:
1. Update the version in package.json
2. Login to npm using `npm login`
3. Have the necessary permissions to publish under the package name

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
