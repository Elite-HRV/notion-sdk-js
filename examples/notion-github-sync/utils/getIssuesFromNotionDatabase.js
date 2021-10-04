const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")
dotenv.config()
const notion = new Client({ auth: process.env.NOTION_KEY })

/**
 * Gets pages from the Notion database.
 *
 * @returns {Promise<Array<{ pageId: string, issueNumber: number }>>}
 */

module.exports = async function getIssuesFromNotionDatabase() {
  const pages = []
  let cursor = undefined
  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      start_cursor: cursor,
    })

    pages.push(...results)
    if (!next_cursor) {
      break
    }
    cursor = next_cursor
  }

  console.log(`${pages.length} issues successfully fetched.`)
  return pages.map(page => {
    return {
      pageId: page.id,
      issueNumber: page.properties["Issue Number"].number,
      data: page,
    }
  })
}
