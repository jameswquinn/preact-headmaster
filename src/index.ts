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
