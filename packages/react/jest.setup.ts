import "@testing-library/jest-dom";

// Polyfill for TextEncoder and TextDecoder
import { TextEncoder, TextDecoder } from "util";

// Type assertion to resolve TypeScript compatibility issues
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;
