export function stdoutWrite(value: string) {
  const originalWrite = Object.getPrototypeOf(process.stdout).write
  originalWrite.call(process.stdout, value)
}
