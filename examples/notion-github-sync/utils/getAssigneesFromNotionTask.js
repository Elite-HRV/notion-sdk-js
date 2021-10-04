module.exports = function getAssigneesFromNotionTask(issue) {
  const indexVars = require("../index")
  const assigneeMap = indexVars.assigneeMap
  let asignees = []

  issue.properties.Assignee.people.forEach(person => {
    if (assigneeMap[person.id]) {
      asignees.push(assigneeMap[person.id])
    }
  })

  return asignees
}
