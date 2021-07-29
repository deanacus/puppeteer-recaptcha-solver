module.exports = (dateTimeSeparator = ' ') => {
  const now = new Date();
  const year = `${now.getFullYear()}`;
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const date = `${now.getDate()}`.padStart(2, '0');
  const hours = `${now.getHours()}`.padStart(2, '0');
  const mins = `${now.getMinutes()}`.padStart(2, '0');
  const seconds = `${now.getSeconds()}`.padStart(2, '0');

  return `[${year}-${month}-${date}${dateTimeSeparator}${hours}:${mins}:${seconds}]`;
};
