const CetagoryList = require ("../Moddel/CategoryShema")
async function categoryGetContollar(req ,res) {
     const cetagorget = await CetagoryList.find({});
     return res.json({
      messages: "dubleceat cetagory",
      data:cetagorget
    });
}
module.exports = categoryGetContollar