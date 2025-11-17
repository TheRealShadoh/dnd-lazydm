import type { MDXComponents } from 'mdx/types'
import { MDXComponents as CustomMDXComponents } from './src/components/mdx/MDXComponents'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...CustomMDXComponents,
  }
}
