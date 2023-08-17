export function getErrorStack(error: Error) {
  try {
    const customErrorStack = String(error.stack).trim()
    return customErrorStack || ''
  } catch (err) {
    return error.stack || ''
  }
}

export function getFullErrorStack(error: Error) {
  try {
    const customErrorStack = String(error.stack).trim()
    return customErrorStack || ''
  } catch (err) {
    return error.stack || ''
  }
}
