const Contact = require("../Moddel/contactSchema.js");
async function contactGetContollar(req, res) {
  try {
    const contact = await Contact.find();
    res.send({
      message: "Show contact List",
      data:contact
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Server Error",
    });
  }
}
module.exports = contactGetContollar;
