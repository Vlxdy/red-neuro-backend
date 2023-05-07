export function stdoutWrite(value: string) {
  process.stdout.write(value)
  // const originalWrite = Object.getPrototypeOf(process.stdout).write
  // originalWrite.call(process.stdout, value)
}
