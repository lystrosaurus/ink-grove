import { buildContent } from './build-content.mjs'
import { buildSeeds } from './build-seeds.mjs'

const args = process.argv.slice(2)
if (args.some((argument) => argument !== '--check')) {
  console.error('Usage: node scripts/build-all.mjs [--check]')
  process.exitCode = 1
} else {
  try {
    const options = { checkOnly: args.includes('--check') }
    await buildContent(options)
    const seeds = await buildSeeds(options)
    console.log(
      `${options.checkOnly ? 'Validated' : 'Built'} ${seeds.seeds.length} seeds in ${seeds.layers.length} regions.`,
    )
  } catch (error) {
    console.error(`Content build failed: ${error.message}`)
    process.exitCode = 1
  }
}
