const admin = (req, res, next) => {
  try {

    if (!req.user) {
      return res.status(401).json({
        message: "No user found",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin only access",
      });
    }

    next();

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = admin;