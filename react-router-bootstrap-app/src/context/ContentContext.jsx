// src/context/ContentContext.js
import { createContext } from 'react';

// Always provide a default shape to avoid undefined access
export const ContentContext = createContext({ content: {}, setContent: () => {} });
