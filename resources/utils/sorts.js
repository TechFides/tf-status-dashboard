export const sortAscByProperty = function (property, a, b) {
  return a[property] > b[property] ? 1
    : a[property] === b[property] ? 0 : -1;
};

export const sortDesByProperty = function (property, a, b) {
  return a[property] < b[property] ? 1
    : a[property] === b[property] ? 0 : -1;
};
