const Contact = require("../Moddel/contactSchema");
async function deleteContactContollar (req ,res) {
     try {
    const { id } = req.params;

    const deletedData = await Contact.findByIdAndDelete(id);

    if (!deletedData) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
module.exports = deleteContactContollar