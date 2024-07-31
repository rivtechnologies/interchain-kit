import { CosmosKitClient } from './../utils/client';
// Utility type to extract only methods
export type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

type FunctionPropertiesOnly<T> = Pick<T, FunctionPropertyNames<T>>;

// Type with only methods
export type CosmosKitClientMethods = FunctionPropertiesOnly<CosmosKitClient>;