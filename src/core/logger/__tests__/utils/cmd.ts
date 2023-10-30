import { exec } from 'child_process'

export async function cmd(command: string, executePath: string) {
  await new Promise((resolve, reject) => {
    // process.stdout.write(`[cmd] ${command}\n`)
    exec(command, { cwd: executePath }, (error, stdout, stderr) => {
      // process.stdout.write(`${stdout}\n`)
      if (error !== null) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}
