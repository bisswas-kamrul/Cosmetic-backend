const Subscriber = require("../Moddel/Subscriber");
async function deleteSubscriberContollar(req , res) {
     try {
        const { id } = req.params;
    
        const deletedData = await Subscriber.findByIdAndDelete(id);
    
        if (!deletedData) {
          return res.status(404).json({
            success: false,
            message: "Subscriber not found",
          });
        }
    
        res.status(200).json({
          success: true,
          message: "Subscriber deleted successfully",
        });
      } catch (error) {
        console.error(error);
    
        res.status(500).json({
          success: false,
          message: "Server Error",
        });
      }
}
module.exports = deleteSubscriberContollar