export function sortByDesc(a, b, prop) {
  if (a[prop] < b[prop]) return 1;
  if (a[prop] > b[prop]) return -1;
  return 0;
};

export function sortByAsc(a, b, prop): any {
  if (a[prop] > b[prop]) return 1;
  if (a[prop] < b[prop]) return -1;
  return 0;
}
