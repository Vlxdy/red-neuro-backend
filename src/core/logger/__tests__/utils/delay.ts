export async function delay(time = 1000) {
  process.stdout.write('\x1b[90m[delay] (-_-) zzz...\x1b[0m\n')
  return new Promise((resolve) => setTimeout(resolve, time))
}
