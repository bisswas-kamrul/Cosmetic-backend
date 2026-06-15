const UserList = require("../Moddel/Usershema");

async function UserDeleteContollar(req, res) {
  try {
    const id = req.params.id;

    await UserList.findByIdAndDelete(id);

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Delete failed",
    });
  }
}

module.exports = UserDeleteContollar;