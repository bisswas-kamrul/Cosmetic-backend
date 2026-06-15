const UserList = require("../Moddel/Usershema");
async function UserContollar (req ,res) {
     try {
    const user = await UserList.find({},"_id name lastName email"); // সব user আনবে
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = UserContollar