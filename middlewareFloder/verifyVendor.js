const Vendor = (req, res, next) => {
  if (req.user.role !== "vendor" && req.user.role !== "admin") {
    return res.status(403).json({
      message: "Vendor access only",
    });
  }

  if (req.user.role === "vendor" && req.user.status !== "active") {
    return res.status(403).json({
      message: "Vendor account is not active",
    });
  }

  next();
};

module.exports = Vendor;
