async function profileController(req, res) {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = profileController;