const { Octokit } = require("octokit")
const dotenv = require("dotenv")
dotenv.config()
const octokit = new Octokit({ auth: process.env.GITHUB_KEY })

module.exports = async function getIssueCard(pageId) {
  const indexVars = require("../index")
  const tasks = indexVars.tasks

  const page = tasks.find(task => task.id == pageId)

  if (page.properties["Github cardId"].number) {
    return await octokit.rest.projects.getCard({
      card_id: page.properties["Github cardId"].number,
    })
  } else {
    return undefined
  }
}
