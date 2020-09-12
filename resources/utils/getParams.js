export const getActiveParams = () => {
  return {
    params: {
      isActive: true,
    },
  };
};

export const getDateParams = function (date = new Date()) {
  return {
    params: {
      month: date.getMonth(),
      year: date.getFullYear(),
    },
  };
};
