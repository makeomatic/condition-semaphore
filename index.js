// docs for semaphore ENV variables
// https://semaphoreci.com/docs/available-environment-variables.html

const semver = require('semver')
const SemanticReleaseError = require('@semantic-release/error')

async function verifyConditions (pluginConfig = {}, config = {}) {
  const { env } = process
  const { options = {} } = config

  if (env.SEMAPHORE !== 'true') {
    throw new SemanticReleaseError(
      'semantic-release didn’t run on Semaphore and therefore a new version won’t be published.\n' +
      'You can customize this behavior using "verifyConditions" plugins: git.io/sr-plugins',
      'ENOSEMAPHORE'
    )
  }

  if (env.hasOwnProperty('PULL_REQUEST_NUMBER')) {
    throw new SemanticReleaseError(
      'This test run was triggered by a pull request and therefore a new version won’t be published.',
      'EPULLREQUEST'
    )
  }

  if (options.branch === env.BRANCH_NAME) return null

  if (semver.valid(env.BRANCH_NAME)) {
    throw new SemanticReleaseError(
      'This test run was triggered by a git tag that was created by semantic-release itself.\n' +
      'Everything is okay. For log output of the actual publishing process look at the build that ran before this one.',
      'EGITTAG'
    )
  }

  throw new SemanticReleaseError(
    'This test run was triggered on the branch ' + env.BRANCH_NAME +
    ', while semantic-release is configured to only publish from ' +
    options.branch + '.\n' +
    'You can customize this behavior using the "branch" option: git.io/sr-options',
    'EBRANCHMISMATCH'
  )
}

module.exports = { verifyConditions }
