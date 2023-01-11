const sanitize = (str: string) => {
  return str.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, ' ')
}

export default sanitize
