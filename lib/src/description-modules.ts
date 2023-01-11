export interface Module {
  module: string
  param: ModuleParams
}

export type ModuleParams = string | Record<string, string>

/**
 * A quick syntax to quickly embed rich data for identification for specific
 * modules within a central non-discriminatory data source. Ideally embedded
 * within a notes for description field in order to keep this info largely
 * hidden from view.
 */
const moduleRegex = new RegExp('{@([a-z]+):\\s*(.+)\\s*\\/}', 'g')

/**
 * Parses out all module references in a body of text.
 * @param body Larger body of work which contains a module.
 */
export function parseModule(body: string): Module[] {
  const modules: Module[] = []
  let entries
  while ((entries = moduleRegex.exec(body)) !== null) {
    const param = (() => {
      if (entries[2].startsWith('{')) {
        // It's JSON
        return JSON.parse(entries[2])
      }
      return entries[2]
    })()
    modules.push({
      module: entries[1],
      param,
    })
  }
  return modules
}

export function encodeModule(params: Module) {
  if (typeof params.param === 'string') {
    return `{@${params.module}: ${params.param} /}`
  }
  return `{@${params.module}: ${JSON.stringify(params.param)} /}`
}
