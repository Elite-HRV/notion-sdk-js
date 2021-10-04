module.exports = function getLabelsFromNotionTask(issue) {
  let labels = []
  if (issue.properties["Task type"].select) {
    labels.push(issue.properties["Task type"].select.name)
  }

  if (issue.properties.Priority.select) {
    labels.push(issue.properties.Priority.select.name)
  }

  return labels
}
