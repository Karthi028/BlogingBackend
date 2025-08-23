const Authcontroller = {
    register:async (req,res)=>{
        try {
           res.json({message:"Success"}) 
        } catch (error) {
            res.status(500).json({message:"Error registering the User",error:error.message})
        }

    }
}

module.exports = Authcontroller;