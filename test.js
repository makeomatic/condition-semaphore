var test = require('tap').test
var SRError = require('@semantic-release/error')

var condition = require('./')

test('raise errors in semaphore environment', function (t) {
  t.test('only runs on semaphore', function (tt) {
    tt.plan(2)

    condition({}, {env: {}}, function (err) {
      tt.ok(err instanceof SRError)
      tt.is(err.code, 'ENOSEMAPHORE')
    })
  })

  t.test('not running on pull requests', function (tt) {
    tt.plan(2)
    condition({}, {
      env: {
        SEMAPHORE: 'true',
        PULL_REQUEST_NUMBER: '1'
      }
    }, function (err) {
      tt.ok(err instanceof SRError)
      tt.is(err.code, 'EPULLREQUEST')
    })
  })

  t.test('only running on specified branch', function (tt) {
    tt.plan(5)

    condition({}, {
      env: {
        SEMAPHORE: 'true',
        BRANCH_NAME: 'master'
      },
      options: {
        branch: 'master'
      }
    }, function (err) {
      tt.is(err, null)
    })

    condition({}, {
      env: {
        SEMAPHORE: 'true',
        BRANCH_NAME: 'notmaster'
      },
      options: {
        branch: 'master'
      }
    }, function (err) {
      tt.ok(err instanceof SRError)
      tt.is(err.code, 'EBRANCHMISMATCH')
    })

    condition({}, {
      env: {
        SEMAPHORE: 'true',
        BRANCH_NAME: 'master'
      },
      options: {
        branch: 'foo'
      }
    }, function (err) {
      tt.ok(err instanceof SRError)
      tt.is(err.code, 'EBRANCHMISMATCH')
    })
  })

  t.test('not running on tags', function (tt) {
    tt.plan(2)
    condition({}, {
      env: {
        SEMAPHORE: 'true',
        BRANCH_NAME: 'v1.0.0'
      },
      options: {}
    }, function (err) {
      tt.ok(err instanceof SRError)
      tt.is(err.code, 'EGITTAG')
    })
  })

  t.end()
})
