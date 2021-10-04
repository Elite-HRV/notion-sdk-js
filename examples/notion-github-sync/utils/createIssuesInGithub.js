const { Octokit } = require("octokit")
const dotenv = require("dotenv")
dotenv.config()
const octokit = new Octokit({ auth: process.env.GITHUB_KEY })

module.exports = async function createIssuesInGithub(tasks) {
  const addIssueNumberIntoNotionTask = require("./addIssueNumberIntoNotionTask")
  const indexVars = require("../index")
  const statusMap = indexVars.statusMap

  tasks.forEach(async task => {
    const asignees = getAssigneesFromNotionTask(task)
    const labels = getLabelsFromNotionTask(task)

    try {
      const issueResult = await octokit.rest.issues.create({
        owner: process.env.GITHUB_REPO_OWNER,
        repo: process.env.GITHUB_REPO_NAME,
        title: task.properties.Name.title[0].plain_text,
        body: "id: " + task.id + "\r\n url: " + task.url,
        assignees: asignees,
        labels: labels,
      })
      console.log("created issue", issueResult)
    } catch (e) {
      console.log("error creating issue", e)
    }

    try {
      const cardResult = await octokit.rest.projects.createCard({
        column_id: task.properties.Status.select
          ? statusMap[task.properties.Status.select.id]
            ? statusMap[task.properties.Status.select.id]
            : columns[0].id
          : columns[0].id,
        content_id: issueResult.data.id, //1011468002,
        content_type: "Issue",
      })
      console.log("created card", cardResult)
    } catch (e) {
      console.log("erro creating card", e)
    }

    await addIssueNumberIntoNotionTask(
      task.id,
      issueResult.data.number,
      cardResult.data.id
    )
  })
}
