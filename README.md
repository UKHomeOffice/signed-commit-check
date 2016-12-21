# Signed commit checker
This is a github integration for checking if all your commits are signed
There is a limitation in that it can with with **only 250 commits** between master and the branch, anything beyond that and it 'may' (according to github) throw an error.

## Installation
git checkout
Set a environment variable of `GITHUB_PRIVATEKEY` to your installation private key

```bash
GITHUB_PRIVATEKEY=`cat private.key` npm start
```
or
```bash
docker build -t signed-checker .
docker run -e GITHUB_PRIVATEKEY=`cat private.key` -p 8080:8080 signed-checker
```
You then need to make an installation that'll point at https://yourexternaladdress/github

I'll presume you can figure out a https endpoint above this service, which you really should.

## Roadmap
 - [ ] verify request is from github see req.headers['x-hub-signature'] and https://developer.github.com/webhooks/securing/#validating-payloads-from-github
 - [ ] verify request is from a known github ip address
 - [x] authenticate to github with integration JWT https://developer.github.com/early-access/integrations/authentication/
 - [x] set status of head commit to 'pending' https://developer.github.com/v3/repos/statuses/#create-a-status
 - [x] get difference between head commit and master^HEAD https://developer.github.com/v3/repos/commits/#compare-two-commits
 - [x] check all commits in difference are signed commit.verification.verified === true
 - [x] set status of head commit to success/failure https://developer.github.com/v3/repos/statuses/#create-a-status
 - [ ] reproduce everything for gitlab