const dotenv = require("dotenv")
dotenv.config()
const { Client } = require("@notionhq/client")
const notion = new Client({ auth: process.env.NOTION_KEY })

module.exports = function addIssueNumberIntoNotionTask(pageId, number, cardId) {
  return notion.pages.update({
    page_id: pageId,
    properties: {
      "Issue Number": { number },
      "Github cardId": { number: cardId },
    },
  })
}
