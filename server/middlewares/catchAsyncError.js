// export const catchAsyncErrors = (theFunction) => {
//   return (req, res, next) => {
//     Promise.resolve(theFunction(req, res, next)).catch(next);
//   };
// };

export const catchAsyncErrors = (theFunc) => (req, res, next) => {
  Promise.resolve(theFunc(req, res, next)).catch((err) => {
    console.error("🔥 BACKEND ERROR:", err); // LOG CHÍNH
    next(err);
  });
};
