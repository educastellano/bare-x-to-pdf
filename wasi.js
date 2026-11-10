let binding = require.addon()

exports.binding = Object.fromEntries(
  Object.entries(binding).map(([name, value]) => [
    name,
    typeof value === 'function' ? wrap(name) : value
  ])
)

function wrap(name) {
  return function (...args) {
    if (binding === null) {
      binding = require.addon()
    }

    try {
      return binding[name](...args)
    } catch (err) {
      if (err instanceof WebAssembly.RuntimeError) {
        for (const url in require.cache) {
          if (require.cache[url].exports === binding) {
            delete require.cache[url]
          }
        }
        binding = null
      }
      throw err
    }
  }
}
