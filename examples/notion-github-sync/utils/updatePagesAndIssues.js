const _ = require("lodash")
const OPERATION_BATCH_SIZE = 10

const dotenv = require("dotenv")
const { Octokit } = require("octokit")
const { Client } = require("@notionhq/client")
dotenv.config()
const octokit = new Octokit({ auth: process.env.GITHUB_KEY })
const notion = new Client({ auth: process.env.NOTION_KEY })

const getPropertiesFromIssue = require("./getPropertiesFromIssue")
const getAssigneesFromNotionTask = require("./getAssigneesFromNotionTask")
const getLabelsFromNotionTask = require("./getLabelsFromNotionTask")

module.exports = async function updatePagesAndIssues(pagesToUpdate) {
  const indexVars = require("../index")
  const tasks = indexVars.tasks
  const columns = indexVars.columns
  const statusMap = indexVars.statusMap

  const pagesToUpdateChunks = _.chunk(pagesToUpdate, OPERATION_BATCH_SIZE)
  for (const pagesToUpdateBatch of pagesToUpdateChunks) {
    await Promise.all(
      pagesToUpdateBatch.map(async ({ pageId, card, ...issue }) => {
        const task = tasks.find(task => task.id == pageId)

        const updatNotion = false
        //   card &&
        //   (new Date(task.last_edited_time).getTime() <
        //     new Date(issue.updatedAt).getTime() ||
        //     new Date(task.last_edited_time).getTime() <
        //       new Date(card.data.updated_at).getTime())

        // if (updatNotion) {
        //   //update Notion
        //   try {
        //     await notion.pages.update({
        //       page_id: pageId,
        //       properties: getPropertiesFromIssue(issue),
        //     })
        //     console.log("task updated", issue.number)
        //   } catch (e) {
        //     console.log("error updating task " + issue.number, e)
        //   }
        // }

        //update Notion
        try {
          await notion.pages.update({
            page_id: pageId,
            properties: getPropertiesFromIssue(issue),
          })
          console.log("task updated", issue.number)
        } catch (e) {
          console.log("error updating task " + issue.number, e)
        }

        //update Github
        //update issue
        const labels = getLabelsFromNotionTask(task)
        let data = {
          owner: process.env.GITHUB_REPO_OWNER,
          repo: process.env.GITHUB_REPO_NAME,
          issue_number: issue.number,
          title: task.properties.Name.title[0].plain_text,
          body: "id: " + task.id + "\r\n url: " + task.url,
          labels: labels,
        }

        if (!updatNotion) {
          const asignees = getAssigneesFromNotionTask(task)
          data.assignees = asignees
        }

        try {
          await octokit.rest.issues.update(data)
          console.log("issue updated", issue.number)
        } catch (e) {
          console.log("error updating issue " + issue.number, e)
        }

        //update card
        if (!updatNotion) {
          if (task.properties["Github cardId"].number) {
            await octokit.rest.projects.moveCard({
              position: "top",
              column_id: task.properties.Status.select
                ? statusMap[task.properties.Status.select.id]
                  ? statusMap[task.properties.Status.select.id]
                  : columns.data[0].id
                : columns.data[0].id,
              card_id: task.properties["Github cardId"].number,
            })
          }
        }
      })
    )
    console.log(`Completed batch size: ${pagesToUpdateBatch.length}`)
  }
}
