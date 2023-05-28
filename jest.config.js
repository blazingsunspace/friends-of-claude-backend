import { pathsToModuleNameMapper } from 'ts-jest/utils'
import { compilerOptions } from './tsconfig'
/** @type {import('ts-jest').JestConfigWithTsJest} */
export const preset = 'ts-jest'
export const testEnvironment = 'node'
export const modulePaths = [compilerOptions.baseUrl]
export const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths)
