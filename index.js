'use strict'
const app = require('express')()
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cert = process.env.GITHUB_PRIVATEKEY
const GitHubApi = require('github')
const PORT = 8080
const statusContext = 'Signed commit check'
const statusPending = 'pending'
const statusSuccess = 'success'
const statusFailure = 'failure'

app.use(bodyParser.json())

app.post('/github', function (req, res) {
  if (req.headers['x-github-event'] !== 'push' | req.body.ref === `refs/heads/${req.body.repository.default_branch}`) {
    return res.send('not for us')
  }

  const token = jwt.sign({iss: 891}, cert, {algorithm: 'RS256', expiresIn: '2 minutes'})

  const github = new GitHubApi({
    Promise: require('bluebird'),
    timeout: 5000
  })

  github.authenticate({
    type: 'integration',
    token: token
  })

  const installationId = req.body.installation.id
  const headCommit = req.body.head_commit.id
  const repo = req.body.repository.name
  const owner = req.body.repository.owner.name
  const baseBranch = req.body.repository.default_branch

  return github.integrations.createInstallationToken({installation_id: installationId})
    .then(token =>
      github.authenticate({
        type: 'token',
        token: token.token
      })
    )
    .then(() =>
      github.repos.createStatus({
        owner: owner,
        repo: repo,
        sha: headCommit,
        context: statusContext,
        state: statusPending
      })
    )
    .then(() =>
      github.repos.compareCommits({
        owner: owner,
        repo: repo,
        base: baseBranch,
        head: headCommit,
        headers: {
          Accept: 'application/vnd.github.cryptographer-preview'
        }
      })
    )
    .then(difference => difference.commits)
    .filter(commit => !commit.commit.verification || !commit.commit.verification.verified)
    .then(unsignedcommits =>
      github.repos.createStatus({
        owner: owner,
        repo: repo,
        sha: headCommit,
        context: statusContext,
        state: (unsignedcommits.length === 0 ? statusSuccess : statusFailure)
      })
    )
    .then(() => res.send('done'))
})

app.listen(PORT)
