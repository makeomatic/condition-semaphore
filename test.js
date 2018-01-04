import test from 'ava'
import SemanticReleaseError from '@semantic-release/error'
import condition from './'

const envBackup = Object.assign({}, process.env)

test.beforeEach(() => {
  // Delete env variables in case they are on the machine running the tests
  delete process.env.SEMAPHORE
  delete process.env.PULL_REQUEST_NUMBER
  delete process.env.BRANCH_NAME
})

test.afterEach.always(() => {
  // Restore process.env
  process.env = envBackup
})

test.serial('only runs on semaphore', async (t) => {
  const err = await t.throws(condition(), SemanticReleaseError)
  t.is(err.code, 'ENOSEMAPHORE')
})

test.serial('not running on pull requests', async (t) => {
  process.env.SEMAPHORE = 'true'
  process.env.PULL_REQUEST_NUMBER = '1'

  const err = await t.throws(condition(), SemanticReleaseError)
  t.is(err.code, 'EPULLREQUEST')
})

test.serial('only running on specified branch', async (t) => {
  let err
  process.env.SEMAPHORE = 'true'
  process.env.BRANCH_NAME = 'master'

  await condition({}, { options: { branch: 'master' } })

  process.env.BRANCH_NAME = 'notmaster'

  err = await t.throws(
    condition({}, { options: { branch: 'master' } }),
    SemanticReleaseError
  )

  t.is(err.code, 'EBRANCHMISMATCH')

  process.env.BRANCH_NAME = 'master'

  err = await t.throws(
    condition({}, { options: { branch: 'notmaster' } }),
    SemanticReleaseError
  )

  t.is(err.code, 'EBRANCHMISMATCH')
})

test.serial('not running on tags', async (t) => {
  process.env.SEMAPHORE = 'true'
  process.env.BRANCH_NAME = 'v1.0.0'

  const err = await t.throws(condition(), SemanticReleaseError)
  t.is(err.code, 'EGITTAG')
})
