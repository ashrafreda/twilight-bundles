// This file re-exports the Salla types from the core package
/// <reference path="../../../core/types/global.d.ts" />

// Add any additional Salla methods used in the starter-kit
declare global {
  interface Salla {
    success: (message: string) => void;
  }
}

export {};
