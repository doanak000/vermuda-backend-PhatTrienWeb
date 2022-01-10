export const MappStringArrToSqlInClause = (arr: string[]) => {
  let inClause = `(`;
  if (arr.length > 0) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === arr[arr.length - 1]) {
        inClause += `'${arr[i]}')`;
      } else {
        inClause += `'${arr[i]}', `;
      }
    }
    return inClause;
  } else return `('')`;
};
