const catchAsync = (handlerFunc) => {
  return (req, res, next) => {
    // handlerFunc(req, res, next).catch(next);
    handlerFunc(req, res, next).catch((err) => next(err));
  };
};

module.exports = catchAsync;
