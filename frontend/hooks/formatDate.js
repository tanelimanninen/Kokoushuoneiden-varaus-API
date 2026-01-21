function formatDate(dateString) {
  return new Date(dateString).toLocaleString("fi-FI");
}

export { formatDate };