export default function responses(req, res, next) {
  res.sendSuccess = (data) => res.json({
    status: 'success',
    data: data
  });

  res.sendError = (error) => {
    res.json({
      status: 'error',
      error: error instanceof Error ? error.message : error
    });
    console.error(error);
  }

  next();
}
